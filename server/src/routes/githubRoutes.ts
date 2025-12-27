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

// NOTE: Do NOT apply authentication globally here
// Webhooks need to be accessible without authentication
// Authentication is applied to individual routes below

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Get user's repositories (PROTECTED)
router.get('/repos', authenticate, apiLimiter, async (req, res) => {
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

// Get pull requests for a repo (PROTECTED)
router.get('/repos/:owner/:repo/pulls', authenticate, apiLimiter, async (req, res) => {
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



// Project Integration Routes (PROTECTED)
router.post('/projects/:projectId/link-repo', authenticate, apiLimiter, linkRepoToProject);
router.delete('/projects/:projectId/unlink-repo/:repoId', authenticate, apiLimiter, unlinkRepoFromProject);
router.put('/projects/:projectId/repos/:repoId/settings', authenticate, apiLimiter, updateRepoSettings);

// Task Integration Routes (PROTECTED)
router.post('/tasks/:taskId/link-pr', authenticate, apiLimiter, linkPrToTask);
router.post('/tasks/:taskId/create-issue', authenticate, apiLimiter, createIssueFromTask);

// Team Collaboration Routes (PROTECTED)
router.get('/commits', authenticate, apiLimiter, getRecentCommits);

export default router;
