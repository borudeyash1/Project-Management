import express from 'express';
import { getFigmaService } from '../services/sartthi/figmaService';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.get('/me', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const accountId = req.query.accountId as string;
        const figmaService = getFigmaService();
        const data = await figmaService.getMe(userId, accountId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/teams/:teamId/projects', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const accountId = req.query.accountId as string;
        const { teamId } = req.params;
        const figmaService = getFigmaService();
        const data = await figmaService.getTeamProjects(userId, teamId, accountId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/projects/:projectId/files', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const accountId = req.query.accountId as string;
        const { projectId } = req.params;
        const figmaService = getFigmaService();
        const data = await figmaService.getProjectFiles(userId, projectId, accountId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
