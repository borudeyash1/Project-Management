import express from 'express';
import { getZoomService } from '../services/sartthi/zoomService';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.post('/meetings', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const accountId = req.query.accountId as string;
        const { topic, startTime, duration } = req.body;

        const zoomService = getZoomService();
        const meeting = await zoomService.createMeeting(userId, topic, startTime, duration, accountId);
        res.json({ success: true, data: meeting });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
