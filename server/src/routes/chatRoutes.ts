import express, { Request, Response } from 'express';
import { chatService } from '../services/chatService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ===== SERVER ROUTES =====

// Create server
router.post('/servers', async (req: Request, res: Response) => {
    try {
        const { name, workspaceId, icon, description } = req.body;
        const userId = (req as any).user._id.toString();

        const server = await chatService.createServer({
            name,
            workspaceId,
            ownerId: userId,
            icon,
            description
        });

        res.status(201).json({ success: true, data: server });
    } catch (error: any) {
        console.error('[Chat] Create server error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get servers by workspace
router.get('/servers', async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({ success: false, message: 'Workspace ID required' });
        }

        const servers = await chatService.getServersByWorkspace(workspaceId as string);
        return res.json({ success: true, data: servers });
    } catch (error: any) {
        console.error('[Chat] Get servers error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

import discordService from '../services/sartthi/discordService';

// ...

// Get all servers for current user (REAL DISCORD)
router.get('/servers/user/all', async (req: Request, res: Response) => {
    try {
        // In a real app, we'd check if the user has connected their Discord account
        // and use their specific access token.
        // For this implementation, we use the Bot's guilds (as requested/implied for a workspace integration)

        if (!discordService.isConnected()) {
            return res.status(503).json({ success: false, message: 'Discord Bot not connected' });
        }

        const servers = await discordService.getGuilds();
        return res.json({ success: true, data: servers });
    } catch (error: any) {
        console.error('[Chat] Get user servers error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Get server by ID
router.get('/servers/:id', async (req: Request, res: Response) => {
    try {
        const server = await chatService.getServerById(req.params.id!);

        if (!server) {
            return res.status(404).json({ success: false, message: 'Server not found' });
        }

        return res.json({ success: true, data: server });
    } catch (error: any) {
        console.error('[Chat] Get server error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Add member to server
router.post('/servers/:id/members', async (req: Request, res: Response) => {
    try {
        const { userId, role } = req.body;
        const server = await chatService.addMemberToServer(req.params.id!, userId, role);
        return res.json({ success: true, data: server });
    } catch (error: any) {
        console.error('[Chat] Add member error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Remove member from server
router.delete('/servers/:id/members/:userId', async (req: Request, res: Response) => {
    try {
        const removedBy = (req as any).user._id.toString();
        const server = await chatService.removeMemberFromServer(
            req.params.id!,
            req.params.userId!,
            removedBy
        );
        return res.json({ success: true, data: server });
    } catch (error: any) {
        console.error('[Chat] Remove member error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Delete server
router.delete('/servers/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id.toString();
        await chatService.deleteServer(req.params.id!, userId);
        return res.json({ success: true, message: 'Server deleted successfully' });
    } catch (error: any) {
        console.error('[Chat] Delete server error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ===== CHANNEL ROUTES =====

// Create channel
router.post('/servers/:serverId/channels', async (req: Request, res: Response) => {
    try {
        const { name, type, category, topic } = req.body;
        const channel = await chatService.createChannel({
            serverId: req.params.serverId!,
            name,
            type,
            category,
            topic
        });
        return res.status(201).json({ success: true, data: channel });
    } catch (error: any) {
        console.error('[Chat] Create channel error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Get channels by server (REAL DISCORD)
router.get('/servers/:serverId/channels', async (req: Request, res: Response) => {
    try {
        const channels = await discordService.getChannels(req.params.serverId!);
        return res.json({ success: true, data: channels });
    } catch (error: any) {
        console.error('[Chat] Get channels error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Delete channel
router.delete('/channels/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id.toString();
        await chatService.deleteChannel(req.params.id!, userId);
        return res.json({ success: true, message: 'Channel deleted successfully' });
    } catch (error: any) {
        console.error('[Chat] Delete channel error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ===== MESSAGE ROUTES (REAL DISCORD) =====

// Get messages for a channel
router.get('/channels/:channelId/messages', async (req: Request, res: Response) => {
    try {
        const messages = await discordService.getMessages(req.params.channelId!);
        return res.json({ success: true, data: messages });
    } catch (error: any) {
        console.error('[Chat] Get messages error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Send message
router.post('/channels/:channelId/messages', async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        const msg = await discordService.sendMessage(req.params.channelId!, content);
        return res.status(201).json({ success: true, data: msg });
    } catch (error: any) {
        console.error('[Chat] Send message error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Delete message
router.delete('/channels/:channelId/messages/:messageId', async (req: Request, res: Response) => {
    try {
        await discordService.deleteMessage(req.params.channelId!, req.params.messageId!);
        return res.json({ success: true, message: 'Message deleted' });
    } catch (error: any) {
        console.error('[Chat] Delete message error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Get Guild Members
router.get('/servers/:serverId/members', async (req: Request, res: Response) => {
    try {
        const members = await discordService.getMembers(req.params.serverId!);
        return res.json({ success: true, data: members });
    } catch (error: any) {
        console.error('[Chat] Get members error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Kick Member
router.post('/servers/:serverId/kick', async (req: Request, res: Response) => {
    try {
        const { userId, reason } = req.body;
        await discordService.kickMember(req.params.serverId!, userId, reason);
        return res.json({ success: true, message: 'Member kicked' });
    } catch (error: any) {
        console.error('[Chat] Kick member error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Ban Member
router.post('/servers/:serverId/ban', async (req: Request, res: Response) => {
    try {
        const { userId, reason } = req.body;
        await discordService.banMember(req.params.serverId!, userId, reason);
        return res.json({ success: true, message: 'Member banned' });
    } catch (error: any) {
        console.error('[Chat] Ban member error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ===== MESSAGE ROUTES =====

// Get channel messages
router.get('/channels/:id/messages', async (req: Request, res: Response) => {
    try {
        const { limit, before } = req.query;
        const messages = await chatService.getChannelMessages(
            req.params.id!,
            limit ? parseInt(limit as string) : 50,
            before as string
        );
        return res.json({ success: true, data: messages });
    } catch (error: any) {
        console.error('[Chat] Get messages error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Send message
router.post('/channels/:id/messages', async (req: Request, res: Response) => {
    try {
        const { content, attachments, mentions, replyTo } = req.body;
        const userId = (req as any).user._id.toString();

        // Get channel to find serverId
        const ChatChannel = require('../models/ChatChannel').default;
        const channel = await ChatChannel.findById(req.params.id!);

        if (!channel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }

        const message = await chatService.sendMessage({
            channelId: req.params.id!,
            serverId: channel.serverId.toString(),
            authorId: userId,
            content,
            attachments,
            mentions,
            replyTo
        });

        return res.status(201).json({ success: true, data: message });
    } catch (error: any) {
        console.error('[Chat] Send message error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Edit message
router.patch('/messages/:id', async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        const userId = (req as any).user._id.toString();
        const message = await chatService.editMessage(req.params.id!, userId, content);
        return res.json({ success: true, data: message });
    } catch (error: any) {
        console.error('[Chat] Edit message error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Delete message
router.delete('/messages/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id.toString();
        await chatService.deleteMessage(req.params.id!, userId);
        return res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error: any) {
        console.error('[Chat] Delete message error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ===== DIRECT MESSAGE ROUTES =====

// Get user's DM conversations
router.get('/dms', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id.toString();
        const dms = await chatService.getDirectMessages(userId);
        res.json({ success: true, data: dms });
    } catch (error: any) {
        console.error('[Chat] Get DMs error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get DM conversation by ID
router.get('/dms/:id', async (req: Request, res: Response) => {
    try {
        const dm = await chatService.getDirectMessageById(req.params.id!);

        if (!dm) {
            return res.status(404).json({ success: false, message: 'DM not found' });
        }

        return res.json({ success: true, data: dm });
    } catch (error: any) {
        console.error('[Chat] Get DM error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Send direct message
router.post('/dms', async (req: Request, res: Response) => {
    try {
        const { participants, content, attachments } = req.body;
        const userId = (req as any).user._id.toString();

        // Ensure current user is in participants
        if (!participants.includes(userId)) {
            participants.push(userId);
        }

        const dm = await chatService.sendDirectMessage({
            participants,
            authorId: userId,
            content,
            attachments
        });

        res.status(201).json({ success: true, data: dm });
    } catch (error: any) {
        console.error('[Chat] Send DM error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
