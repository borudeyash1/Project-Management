import express, { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { ConnectedAccount } from '../models/ConnectedAccount';
import { authenticate } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const BASE_URL = process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || 'https://sartthi.com')
    : 'http://localhost:5000'; // Backend URL

// --- GitHub Integration ---

router.get('/connect-github', authenticate, (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const state = jwt.sign({ userId, service: 'github' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        const redirectUri = `${BASE_URL}/api/sartthi-integrations/connect-github/callback`;
        const scope = 'repo read:user user:email';

        const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

        res.redirect(url);
    } catch (error) {
        console.error('GitHub Connect Error:', error);
        res.status(500).json({ message: 'Failed to initiate GitHub auth' });
    }
});

router.get('/connect-github/callback', async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            throw new Error('Missing code or state');
        }

        const decoded = jwt.verify(state as string, process.env.JWT_SECRET as string) as any;
        if (decoded.service !== 'github') {
            throw new Error('Invalid state service');
        }

        const userId = decoded.userId;

        // Exchange code for token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: `${BASE_URL}/api/sartthi-integrations/connect-github/callback`
        }, {
            headers: { Accept: 'application/json' }
        });

        const { access_token, error } = tokenResponse.data;

        if (error || !access_token) {
            throw new Error(`GitHub Token Error: ${error}`);
        }

        // Get GitHub User Info
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const githubUser = userResponse.data;

        // Store/Update Connected Account
        await ConnectedAccount.findOneAndUpdate(
            { userId, service: 'github' },
            {
                userId,
                service: 'github',
                providerId: githubUser.id.toString(),
                accessToken: access_token,
                refreshToken: '', // GitHub doesn't give refresh tokens by default for web apps unless configured? 
                // Actually they expire in 8 hours if configured, but standard flow gives persistent tokens unless revoked.
                email: githubUser.email,
                name: githubUser.name || githubUser.login,
                avatarUrl: githubUser.avatar_url,
                isActive: true,
                connectedAt: new Date(),
                lastSyncedAt: new Date()
            },
            { upsert: true, new: true }
        );

        // Update User model reference
        const user = await User.findById(userId);
        if (user) {
            user.connectedAccounts = user.connectedAccounts || {};
            user.connectedAccounts.github = {
                accounts: [], // We are using ConnectedAccount model primarily now, but keeping this structure for compatibility if needed
                activeAccountId: ''
            };
            await user.save();
        }

        // Redirect back to frontend settings
        const frontendUrl = process.env.NODE_ENV === 'production' ? 'https://sartthi.com' : 'http://localhost:3000';
        res.redirect(`${frontendUrl}/settings?tab=connected-accounts&status=success&service=github`);

    } catch (error: any) {
        console.error('GitHub Callback Error:', error);
        const frontendUrl = process.env.NODE_ENV === 'production' ? 'https://sartthi.com' : 'http://localhost:3000';
        res.redirect(`${frontendUrl}/settings?tab=connected-accounts&status=error&message=${encodeURIComponent(error.message)}`);
    }
});

router.post('/disconnect-github', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        await ConnectedAccount.findOneAndDelete({ userId, service: 'github' });

        // Update User model
        // ... (Optional clean up of user.connectedAccounts)

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to disconnect GitHub' });
    }
});

export default router;
