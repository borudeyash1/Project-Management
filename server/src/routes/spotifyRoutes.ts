import express from 'express';
import { getSpotifyService } from '../services/sartthi/spotifyService';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.get('/me', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const accountId = req.query.accountId as string;

        const spotifyService = getSpotifyService();
        const data = await spotifyService.getMe(userId, accountId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const accountId = req.query.accountId as string;
        const { query } = req.query;

        const spotifyService = getSpotifyService();
        const data = await spotifyService.searchTracks(userId, query as string, accountId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
