import express from 'express';
import { getNotionService } from '../services/sartthi/notionService';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.post('/search', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const accountId = req.query.accountId as string;
        const { query } = req.body;

        const notionService = getNotionService();
        const data = await notionService.search(userId, query, accountId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
