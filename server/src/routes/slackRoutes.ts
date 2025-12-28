import express from 'express';
import { getSlackService } from '../services/sartthi/slackService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/slack/channels
router.get('/channels', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const slackService = getSlackService();
        const accountId = req.query.accountId as string;
        const channels = await slackService.getChannels(userId, accountId);
        return res.json({ success: true, data: channels });
    } catch (error: any) {
        console.error('Get Slack channels error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/slack/channels/:channelId/messages - Get channel history
router.get('/channels/:channelId/messages', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const channelId = req.params.channelId;
        const slackService = getSlackService();
        const accountId = req.query.accountId as string;

        const history = await slackService.getChannelHistory(userId, channelId, 50, accountId);
        return res.json({ success: true, data: history.messages });
    } catch (error: any) {
        console.error('Get Slack messages error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/slack/channels/:channelId/messages - Post a message
router.post('/channels/:channelId/messages', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const channelId = req.params.channelId;
        const { text } = req.body;
        const slackService = getSlackService();
        const accountId = req.query.accountId as string;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Message text is required' });
        }

        const result = await slackService.postMessage(userId, channelId, text, undefined, accountId);
        return res.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Post Slack message error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
