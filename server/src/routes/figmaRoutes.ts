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

// Workspace-centric design management routes
import * as figmaController from '../controllers/figmaController';

// Workspace design library
router.get('/workspace/:workspaceId/designs', figmaController.getWorkspaceDesigns);
router.post('/workspace/:workspaceId/designs', figmaController.uploadFigmaFile);

// Project designs
router.get('/workspace/:workspaceId/project/:projectId/designs', figmaController.getProjectDesigns);

// Client designs
router.get('/workspace/:workspaceId/client/:clientId/designs', figmaController.getClientDesigns);

// Design management
router.put('/designs/:designId/status', figmaController.updateDesignStatus);
router.delete('/designs/:designId', figmaController.deleteDesign);

// Approval workflow
router.post('/designs/:designId/frames/:frameId/approve', figmaController.approveDesign);
router.get('/workspace/:workspaceId/designs/pending-approvals', figmaController.getPendingApprovals);

// Comments
router.post('/designs/:designId/frames/:frameId/comments', figmaController.addComment);

export default router;
