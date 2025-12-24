import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { getGitHubService } from '../services/sartthi/githubService';

const router = express.Router();

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Get user's repositories
router.get('/repos', apiLimiter, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const githubService = getGitHubService();
        const repos = await githubService.getRepositories(String(userId));

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
        const userId = (req as any).user.id;
        const { owner, repo } = req.params;

        const githubService = getGitHubService();
        const prs = await githubService.getPullRequests(String(userId), String(owner), String(repo));

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

export default router;
