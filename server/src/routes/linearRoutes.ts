import express from 'express';
import { getLinearService } from '../services/sartthi/linearService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/linear/teams
router.get('/teams', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const linearService = getLinearService();
        const accountId = req.query.accountId as string;

        console.log('[Linear API] Fetching teams for user:', userId);
        const teams = await linearService.getTeams(userId, accountId);
        console.log('[Linear API] Found teams:', teams.length);

        return res.json({ success: true, data: teams });
    } catch (error: any) {
        console.error('Get Linear teams error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/linear/teams/:teamId/issues
router.get('/teams/:teamId/issues', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { teamId } = req.params;
        const linearService = getLinearService();
        const accountId = req.query.accountId as string;

        console.log('[Linear API] Fetching issues for team:', teamId);
        const issues = await linearService.getIssues(userId, teamId, accountId);
        console.log('[Linear API] Found issues:', issues.length);

        return res.json({ success: true, data: issues });
    } catch (error: any) {
        console.error('Get Linear issues error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/linear/issues (all issues)
router.get('/issues', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const linearService = getLinearService();
        const accountId = req.query.accountId as string;

        console.log('[Linear API] Fetching all issues');
        const issues = await linearService.getIssues(userId, undefined, accountId);
        console.log('[Linear API] Found issues:', issues.length);

        return res.json({ success: true, data: issues });
    } catch (error: any) {
        console.error('Get Linear issues error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/linear/issues/:issueId
router.get('/issues/:issueId', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { issueId } = req.params;
        const linearService = getLinearService();
        const accountId = req.query.accountId as string;

        console.log('[Linear API] Fetching issue:', issueId);
        const issue = await linearService.getIssue(userId, issueId, accountId);

        return res.json({ success: true, data: issue });
    } catch (error: any) {
        console.error('Get Linear issue error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/linear/teams/:teamId/projects
router.get('/teams/:teamId/projects', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { teamId } = req.params;
        const linearService = getLinearService();
        const accountId = req.query.accountId as string;

        console.log('[Linear API] Fetching projects for team:', teamId);
        const projects = await linearService.getProjects(userId, teamId, accountId);
        console.log('[Linear API] Found projects:', projects.length);

        return res.json({ success: true, data: projects });
    } catch (error: any) {
        console.error('Get Linear projects error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/linear/teams/:teamId/states
router.get('/teams/:teamId/states', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { teamId } = req.params;
        const linearService = getLinearService();
        const accountId = req.query.accountId as string;

        console.log('[Linear API] Fetching workflow states for team:', teamId);
        const states = await linearService.getWorkflowStates(userId, teamId, accountId);
        console.log('[Linear API] Found states:', states.length);

        return res.json({ success: true, data: states });
    } catch (error: any) {
        console.error('Get Linear workflow states error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/linear/teams/:teamId/issues
router.post('/teams/:teamId/issues', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { teamId } = req.params;
        const linearService = getLinearService();
        const accountId = req.query.accountId as string;

        console.log('[Linear API] Creating issue for team:', teamId);
        const issue = await linearService.createIssue(userId, teamId, req.body, accountId);
        console.log('[Linear API] Created issue:', issue.identifier);

        return res.json({ success: true, data: issue });
    } catch (error: any) {
        console.error('Create Linear issue error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/linear/issues/:issueId
router.put('/issues/:issueId', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { issueId } = req.params;
        const linearService = getLinearService();
        const accountId = req.query.accountId as string;

        console.log('[Linear API] Updating issue:', issueId);
        const issue = await linearService.updateIssue(userId, issueId, req.body, accountId);
        console.log('[Linear API] Updated issue:', issue.identifier);

        return res.json({ success: true, data: issue });
    } catch (error: any) {
        console.error('Update Linear issue error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
