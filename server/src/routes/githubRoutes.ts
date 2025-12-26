import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { getGitHubService } from '../services/sartthi/githubService';
import { authenticate } from '../middleware/auth';
import {
    linkRepoToProject,
    unlinkRepoFromProject,
    updateRepoSettings,
    linkPrToTask,
    createIssueFromTask,
    getRecentCommits
} from '../controllers/githubController';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Get user's repositories
router.get('/repos', apiLimiter, async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const githubService = getGitHubService();
        const accountId = req.query.accountId as string;
        const repos = await githubService.getRepositories(String(userId), accountId);

        res.json({
            success: true,
            data: repos
        });
    } catch (error: any) {
        console.error('Error fetching GitHub repos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch repositories',
            error: error.message
        });
    }
});

// Get pull requests for a repo
router.get('/repos/:owner/:repo/pulls', apiLimiter, async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { owner, repo } = req.params;
        const accountId = req.query.accountId as string;

        const githubService = getGitHubService();
        const prs = await githubService.getPullRequests(String(userId), String(owner), String(repo), accountId);

        res.json({
            success: true,
            data: prs
        });
    } catch (error: any) {
        console.error('Error fetching GitHub PRs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pull requests',
            error: error.message
        });
    }
});



// Project Integration Routes
router.post('/projects/:projectId/link-repo', apiLimiter, linkRepoToProject);
router.delete('/projects/:projectId/unlink-repo/:repoId', apiLimiter, unlinkRepoFromProject);
router.put('/projects/:projectId/repos/:repoId/settings', apiLimiter, updateRepoSettings);

// Task Integration Routes
router.post('/tasks/:taskId/link-pr', apiLimiter, linkPrToTask);
router.post('/tasks/:taskId/create-issue', apiLimiter, createIssueFromTask);

// Team Collaboration Routes
router.get('/commits', apiLimiter, getRecentCommits);

export default router;
