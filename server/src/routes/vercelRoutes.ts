import express from 'express';
import { getVercelService } from '../services/sartthi/vercelService';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.get('/projects', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const accountId = req.query.accountId as string;

        const vercelService = getVercelService();
        const data = await vercelService.listProjects(userId, accountId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
