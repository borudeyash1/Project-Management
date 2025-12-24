import express from 'express';
import { getDropboxService } from '../services/sartthi/dropboxService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Middleware to check authentication
router.use(authenticate);

// GET /api/dropbox/files?path=/folder&accountId=...
router.get('/files', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const path = (req.query.path as string) || '';
        const accountId = req.query.accountId as string;

        const dropboxService = getDropboxService();
        const files = await dropboxService.listFiles(userId, path, accountId);

        res.json({ success: true, data: files });
    } catch (error: any) {
        console.error('Get Dropbox files error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/dropbox/link
router.post('/link', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { path, accountId } = req.body;

        if (!path) {
            res.status(400).json({ success: false, message: 'Path is required' });
            return;
        }

        const dropboxService = getDropboxService();
        const linkData = await dropboxService.getTemporaryLink(userId, path, accountId);

        res.json({ success: true, data: linkData });
    } catch (error: any) {
        console.error('Get Dropbox link error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
