import express from 'express';
import { getSlackService } from '../services/sartthi/slackService';

const router = express.Router();

// GET /api/slack/channels
router.get('/channels', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const slackService = getSlackService();
        const channels = await slackService.getChannels(userId);
        res.json({ success: true, data: channels });
    } catch (error: any) {
        console.error('Get Slack channels error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
