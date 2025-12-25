import express from 'express';
import { getOnedriveService } from '../services/sartthi/onedriveService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Middleware to check authentication
router.use(authenticate);

// GET /api/onedrive/files?folderId=...&accountId=...
router.get('/files', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const folderId = (req.query.folderId as string) || 'root';
        const accountId = req.query.accountId as string;

        const onedriveService = getOnedriveService();
        const files = await onedriveService.listFiles(userId, folderId, accountId);

        res.json({ success: true, data: files });
    } catch (error: any) {
        console.error('Get OneDrive files error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/onedrive/link
router.post('/link', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { itemId, accountId } = req.body;

        if (!itemId) {
            res.status(400).json({ success: false, message: 'Item ID is required' });
            return;
        }

        const onedriveService = getOnedriveService();
        const linkData = await onedriveService.getShareLink(userId, itemId, accountId);

        res.json({ success: true, data: linkData });
    } catch (error: any) {
        console.error('Get OneDrive link error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
