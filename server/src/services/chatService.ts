import ChatServer from '../models/ChatServer';
import ChatChannel from '../models/ChatChannel';
import ChatMessage from '../models/ChatMessage';
import DirectMessage from '../models/DirectMessage';
import mongoose from 'mongoose';
import { getIO } from '../socket/chatSocket';

export const chatService = {
    // ===== SERVER MANAGEMENT =====

    async createServer(data: {
        name: string;
        workspaceId: string;
        ownerId: string;
        icon?: string;
        description?: string;
    }) {
        const server = new ChatServer({
            name: data.name,
            workspaceId: data.workspaceId,
            ownerId: data.ownerId,
            icon: data.icon,
            description: data.description,
            members: [{
                userId: data.ownerId,
                role: 'owner',
                joinedAt: new Date()
            }]
        });

        await server.save();

        // Create default "general" channel
        const generalChannel = await this.createChannel({
            serverId: (server._id as any).toString(),
            name: 'general',
            type: 'text'
        });

        server.channels.push(generalChannel._id as any);
        await server.save();

        return server;
    },

    async getServersByWorkspace(workspaceId: string) {
        return await ChatServer.find({ workspaceId })
            .populate('ownerId', 'username email profilePicture')
            .populate('members.userId', 'username email profilePicture')
            .sort({ createdAt: -1 });
    },

    async getServersByUser(userId: string) {
        return await ChatServer.find({ 'members.userId': userId })
            .populate('ownerId', 'username email profilePicture')
            .populate('members.userId', 'username email profilePicture')
            .sort({ createdAt: -1 });
    },

    async getServerById(serverId: string) {
        return await ChatServer.findById(serverId)
            .populate('ownerId', 'username email profilePicture')
            .populate('members.userId', 'username email profilePicture')
            .populate('channels');
    },

    async addMemberToServer(serverId: string, userId: string, role: 'admin' | 'member' = 'member') {
        const server = await ChatServer.findById(serverId);
        if (!server) throw new Error('Server not found');

        // Check if user is already a member
        const existingMember = server.members.find(m => m.userId.toString() === userId);
        if (existingMember) throw new Error('User is already a member');

        server.members.push({
            userId: new mongoose.Types.ObjectId(userId),
            role,
            joinedAt: new Date()
        });

        await server.save();
        return server;
    },

    async removeMemberFromServer(serverId: string, userId: string, removedBy: string) {
        const server = await ChatServer.findById(serverId);
        if (!server) throw new Error('Server not found');

        // Check if remover is owner or admin
        const remover = server.members.find(m => m.userId.toString() === removedBy);
        if (!remover || (remover.role !== 'owner' && remover.role !== 'admin')) {
            throw new Error('Unauthorized to remove members');
        }

        // Cannot remove owner
        const memberToRemove = server.members.find(m => m.userId.toString() === userId);
        if (memberToRemove?.role === 'owner') {
            throw new Error('Cannot remove server owner');
        }

        server.members = server.members.filter(m => m.userId.toString() !== userId);
        await server.save();
        return server;
    },

    async deleteServer(serverId: string, userId: string) {
        const server = await ChatServer.findById(serverId);
        if (!server) throw new Error('Server not found');

        // Only owner can delete
        if (server.ownerId.toString() !== userId) {
            throw new Error('Only server owner can delete the server');
        }

        // Delete all channels and messages
        await ChatChannel.deleteMany({ serverId });
        await ChatMessage.deleteMany({ serverId });
        await ChatServer.findByIdAndDelete(serverId);

        return { success: true };
    },

    // ===== CHANNEL MANAGEMENT =====

    async createChannel(data: {
        serverId: string;
        name: string;
        type: 'text' | 'voice' | 'announcement';
        category?: string;
        topic?: string;
    }) {
        const channel = new ChatChannel({
            serverId: data.serverId,
            name: data.name,
            type: data.type,
            category: data.category,
            topic: data.topic,
            position: 0,
            permissions: {
                viewChannel: [],
                sendMessages: [],
                manageMessages: []
            }
        });

        await channel.save();

        // Add channel to server
        await ChatServer.findByIdAndUpdate(data.serverId, {
            $push: { channels: channel._id }
        });

        return channel;
    },

    async getChannelsByServer(serverId: string) {
        return await ChatChannel.find({ serverId }).sort({ position: 1, createdAt: 1 });
    },

    async deleteChannel(channelId: string, userId: string) {
        const channel = await ChatChannel.findById(channelId);
        if (!channel) throw new Error('Channel not found');

        const server = await ChatServer.findById(channel.serverId);
        if (!server) throw new Error('Server not found');

        // Check if user is owner or admin
        const member = server.members.find(m => m.userId.toString() === userId);
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            throw new Error('Unauthorized to delete channel');
        }

        // Delete all messages in channel
        await ChatMessage.deleteMany({ channelId });

        // Remove channel from server
        await ChatServer.findByIdAndUpdate(channel.serverId, {
            $pull: { channels: channelId }
        });

        await ChatChannel.findByIdAndDelete(channelId);
        return { success: true };
    },

    // ===== MESSAGE MANAGEMENT =====

    async sendMessage(data: {
        channelId: string;
        serverId: string;
        authorId: string;
        content: string;
        attachments?: any[];
        mentions?: string[];
        replyTo?: string;
    }) {
        const message = new ChatMessage({
            channelId: data.channelId,
            serverId: data.serverId,
            authorId: data.authorId,
            content: data.content,
            attachments: data.attachments || [],
            mentions: data.mentions || [],
            replyTo: data.replyTo,
            reactions: [],
            isPinned: false,
            isEdited: false
        });

        await message.save();

        // Populate author info
        await message.populate('authorId', 'username email profilePicture');

        // Emit to channel via Socket.IO
        const io = getIO();
        if (io) {
            io.to(`channel:${data.channelId}`).emit('message:new', message);
        }

        return message;
    },

    async getChannelMessages(channelId: string, limit: number = 50, before?: string) {
        const query: any = { channelId };

        if (before) {
            query._id = { $lt: before };
        }

        return await ChatMessage.find(query)
            .populate('authorId', 'username email profilePicture')
            .sort({ createdAt: -1 })
            .limit(limit);
    },

    async editMessage(messageId: string, userId: string, newContent: string) {
        const message = await ChatMessage.findById(messageId);
        if (!message) throw new Error('Message not found');

        if (message.authorId.toString() !== userId) {
            throw new Error('Unauthorized to edit this message');
        }

        message.content = newContent;
        message.isEdited = true;
        await message.save();

        // Emit update via Socket.IO
        const io = getIO();
        if (io) {
            io.to(`channel:${message.channelId}`).emit('message:edit', message);
        }

        return message;
    },

    async deleteMessage(messageId: string, userId: string) {
        const message = await ChatMessage.findById(messageId);
        if (!message) throw new Error('Message not found');

        // Check if user is author or has manage permissions
        const server = await ChatServer.findById(message.serverId);
        const member = server?.members.find(m => m.userId.toString() === userId);

        const isAuthor = message.authorId.toString() === userId;
        const isAdmin = member && (member.role === 'owner' || member.role === 'admin');

        if (!isAuthor && !isAdmin) {
            throw new Error('Unauthorized to delete this message');
        }

        await ChatMessage.findByIdAndDelete(messageId);

        // Emit delete via Socket.IO
        const io = getIO();
        if (io) {
            io.to(`channel:${message.channelId}`).emit('message:delete', { messageId });
        }

        return { success: true };
    },

    // ===== DIRECT MESSAGES =====

    async sendDirectMessage(data: {
        participants: string[];
        authorId: string;
        content: string;
        attachments?: any[];
    }) {
        // Find existing DM conversation
        let dm = await DirectMessage.findOne({
            participants: { $all: data.participants, $size: data.participants.length }
        });

        const newMessage = {
            authorId: new mongoose.Types.ObjectId(data.authorId),
            content: data.content,
            attachments: data.attachments || [],
            createdAt: new Date()
        };

        if (!dm) {
            // Create new DM conversation
            dm = new DirectMessage({
                participants: data.participants,
                messages: [newMessage],
                lastMessage: new Date()
            });
        } else {
            // Add message to existing conversation
            dm.messages.push(newMessage);
            dm.lastMessage = new Date();
        }

        await dm.save();

        // Emit to participants via Socket.IO
        const io = getIO();
        if (io) {
            data.participants.forEach(participantId => {
                io.to(`user:${participantId}`).emit('dm:new', {
                    dmId: dm!._id,
                    message: newMessage
                });
            });
        }

        return dm;
    },

    async getDirectMessages(userId: string) {
        return await DirectMessage.find({
            participants: userId
        })
            .populate('participants', 'username email profilePicture')
            .sort({ lastMessage: -1 });
    },

    async getDirectMessageById(dmId: string) {
        return await DirectMessage.findById(dmId)
            .populate('participants', 'username email profilePicture')
            .populate('messages.authorId', 'username email profilePicture');
    }
};
