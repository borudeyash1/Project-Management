import express from 'express';
import { getSlackService } from '../services/sartthi/slackService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/slack/channels
router.get('/channels', async (req, res) => {
    {
        try {
            const userId = (req as any).user._id;
            const slackService = getSlackService();
            const accountId = req.query.accountId as string;
            const channels = await slackService.getChannels(userId, accountId);
            res.json({ success: true, data: channels });
        } catch (error: any) {
            console.error('Get Slack channels error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    });

export default router;
