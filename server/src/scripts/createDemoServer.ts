import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Models
import ChatServer from '../models/ChatServer';
import ChatChannel from '../models/ChatChannel';
import ChatMessage from '../models/ChatMessage';
import User from '../models/User';
import Workspace from '../models/Workspace';

// Load env vars
// When running from server root with ts-node
dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not defined in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const createDemoServer = async () => {
    await connectDB();

    try {
        // Check if any servers exist
        const serverCount = await ChatServer.countDocuments();
        if (serverCount > 0) {
            console.log('Servers already exist. Skipping demo creation.');
            const servers = await ChatServer.find({});
            console.log('Existing servers counts:', servers.length);
            process.exit(0);
        }

        // Specific Workspace ID from user URL
        const TARGET_WORKSPACE_ID = '694d7287f5b9f1deb2ecf3c6';

        // Get the workspace
        const workspace = await Workspace.findById(TARGET_WORKSPACE_ID);
        if (!workspace) {
            console.error(`Target workspace ${TARGET_WORKSPACE_ID} not found.`);
            // Fallback to finding any workspace
            const anyWorkspace = await Workspace.findOne({});
            if (!anyWorkspace) {
                console.error('No workspaces found at all.');
                process.exit(1);
            }
            console.log(`Using fallback workspace: ${anyWorkspace.name}`);
        }

        const workspaceToUse = workspace || await Workspace.findOne({});

        if (!workspaceToUse) {
            console.error('No workspaces found.');
            process.exit(1);
        }

        // Get the owner of the workspace to be the server owner
        // Assuming members array has user field
        const ownerMember = workspaceToUse.members.find((m: any) => m.role === 'owner') || workspaceToUse.members[0];

        if (!ownerMember) {
            console.error('No members found in workspace.');
            process.exit(1);
        }

        const user = await User.findById(ownerMember.user);

        if (!user) {
            console.error('Could not find user for workspace member.');
            process.exit(1);
        }

        console.log(`Creating demo server for user: ${user.username} (${user._id}) in workspace: ${workspaceToUse.name}`);

        // Create Server
        const server = await ChatServer.create({
            name: 'Sartthi Community',
            ownerId: user._id,
            workspaceId: workspaceToUse._id,
            members: [{ userId: user._id, role: 'owner' }],
            channels: []
        });

        console.log(`Created server: ${server.name} (${server._id})`);

        // Create Channels
        const channelsData = [
            { name: 'general', type: 'text', topic: 'General discussion' },
            { name: 'announcements', type: 'announcement', topic: 'Important updates' },
            { name: 'random', type: 'text', topic: 'Random chatter' },
            { name: 'voice-lounge', type: 'voice' }
        ];

        const createdChannels = [];
        for (const ch of channelsData) {
            const channel = await ChatChannel.create({
                serverId: server._id,
                name: ch.name,
                type: ch.type,
                topic: ch.topic,
                members: [user._id] // Private channels logic can be expanded later
            });
            createdChannels.push(channel);
            console.log(`Created channel: ${channel.name}`);
        }

        // Update Server with channels
        server.channels = createdChannels.map(c => c._id) as any;
        await server.save();

        // Add Welcome Message
        const generalChannel = createdChannels.find(c => c.name === 'general');
        if (generalChannel) {
            await ChatMessage.create({
                channelId: generalChannel._id,
                serverId: server._id,
                authorId: user._id,
                content: 'Welcome to the Sartthi Community server! 🚀 This is a demo server to verify the chat system.'
            });
            console.log('Added welcome message');
        }

        console.log('Demo server created successfully!');
    } catch (error) {
        console.error('Error creating demo server:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

createDemoServer();
