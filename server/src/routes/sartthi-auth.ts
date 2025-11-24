import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Helper to get OAuth2 Client
const getOAuthClient = (type: 'mail' | 'calendar' | 'vault') => {
    const BASE_URL = process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || 'https://sartthi.com')
        : 'http://localhost:5000';

    const callbackPath = type === 'mail'
        ? '/api/auth/sartthi/connect-mail/callback'
        : type === 'calendar'
            ? '/api/auth/sartthi/connect-calendar/callback'
            : '/api/auth/sartthi/connect-vault/callback';

    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${BASE_URL}${callbackPath}`
    );
};

/**
 * GET /auth/sartthi/connect-mail
 */
router.get('/connect-mail', authenticate, async (req: Request, res: Response) => {
    try {
        const client = getOAuthClient('mail');
        const userId = (req as any).user._id;
        const state = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/gmail.modify'],
            prompt: 'consent',
            state: state
        });

        res.redirect(url);
    } catch (error) {
        console.error('Connect Mail Error:', error);
        res.status(500).json({ message: 'Failed to initiate Google Auth' });
    }
});

/**
 * GET /auth/sartthi/connect-mail/callback
 */
router.get('/connect-mail/callback', async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;
        if (!code || !state) throw new Error('Missing code or state');

        const decoded = jwt.verify(state as string, process.env.JWT_SECRET as string) as { userId: string };
        const client = getOAuthClient('mail');
        const { tokens } = await client.getToken(code as string);

        const user = await User.findById(decoded.userId);
        if (!user) throw new Error('User not found');

        user.modules = user.modules || {};
        user.modules.mail = {
            isEnabled: true,
            refreshToken: tokens.refresh_token || null,
            connectedAt: new Date(),
            lastSyncedAt: new Date()
        };
        await user.save();

        const redirectUrl = process.env.NODE_ENV === 'production' ? 'https://mail.sartthi.com' : 'http://localhost:3001';
        res.redirect(redirectUrl);
    } catch (error: any) {
        console.error('Mail Callback Error:', error);
        res.redirect(process.env.NODE_ENV === 'production' ? 'https://sartthi.com/error' : 'http://localhost:3000/error');
    }
});

/**
 * GET /auth/sartthi/connect-calendar
 */
router.get('/connect-calendar', authenticate, async (req: Request, res: Response) => {
    try {
        const client = getOAuthClient('calendar');
        const userId = (req as any).user._id;
        const state = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar'],
            prompt: 'consent',
            state: state
        });

        res.redirect(url);
    } catch (error) {
        console.error('Connect Calendar Error:', error);
        res.status(500).json({ message: 'Failed to initiate Google Auth' });
    }
});

/**
 * GET /auth/sartthi/connect-calendar/callback
 */
router.get('/connect-calendar/callback', async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;
        if (!code || !state) throw new Error('Missing code or state');

        const decoded = jwt.verify(state as string, process.env.JWT_SECRET as string) as { userId: string };
        const client = getOAuthClient('calendar');
        const { tokens } = await client.getToken(code as string);

        const user = await User.findById(decoded.userId);
        if (!user) throw new Error('User not found');

        user.modules = user.modules || {};
        user.modules.calendar = {
            isEnabled: true,
            refreshToken: tokens.refresh_token || null,
            connectedAt: new Date(),
            lastSyncedAt: new Date()
        };
        await user.save();

        const redirectUrl = process.env.NODE_ENV === 'production' ? 'https://calendar.sartthi.com' : 'http://localhost:3002';
        res.redirect(redirectUrl);
    } catch (error: any) {
        console.error('Calendar Callback Error:', error);
        res.redirect(process.env.NODE_ENV === 'production' ? 'https://sartthi.com/error' : 'http://localhost:3000/error');
    }
});

/**
 * GET /auth/sartthi/connect-vault
 */
router.get('/connect-vault', authenticate, async (req: Request, res: Response) => {
    try {
        const client = getOAuthClient('vault');
        const userId = (req as any).user._id;
        const state = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/drive'],
            prompt: 'consent',
            state: state
        });

        res.redirect(url);
    } catch (error) {
        console.error('Connect Vault Error:', error);
        res.status(500).json({ message: 'Failed to initiate Google Auth' });
    }
});

/**
 * GET /auth/sartthi/connect-vault/callback
 */
router.get('/connect-vault/callback', async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;
        if (!code || !state) throw new Error('Missing code or state');

        const decoded = jwt.verify(state as string, process.env.JWT_SECRET as string) as { userId: string };
        const client = getOAuthClient('vault');
        const { tokens } = await client.getToken(code as string);

        const user = await User.findById(decoded.userId);
        if (!user) throw new Error('User not found');

        // Save refresh token first
        user.modules = user.modules || {};
        user.modules.vault = {
            isEnabled: false,
            refreshToken: tokens.refresh_token || null,
            rootFolderId: undefined,
            connectedAt: new Date(),
            lastSyncedAt: new Date()
        };
        await user.save();

        // Create root "Sartthi Vault" folder
        const { createRootVaultFolder } = await import('../services/vaultService');
        const rootFolderId = await createRootVaultFolder(decoded.userId);

        // Update user with folder ID and enable vault
        if (user.modules.vault) {
            user.modules.vault.rootFolderId = rootFolderId;
            user.modules.vault.isEnabled = true;
        }
        await user.save();

        const redirectUrl = process.env.NODE_ENV === 'production' ? 'https://vault.sartthi.com' : 'http://localhost:3003';
        res.redirect(redirectUrl);
    } catch (error: any) {
        console.error('Vault Callback Error:', error);
        res.redirect(process.env.NODE_ENV === 'production' ? 'https://sartthi.com/error' : 'http://localhost:3000/error');
    }
});

/**
 * POST /auth/sartthi/disconnect-mail
 */
router.post('/disconnect-mail', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById((req as any).user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        user.modules = user.modules || {};
        user.modules.mail = {
            isEnabled: false,
            refreshToken: null,
            connectedAt: undefined,
            lastSyncedAt: undefined
        };
        await user.save();
        res.json({ success: true, message: 'Mail disconnected' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to disconnect mail' });
    }
});

/**
 * POST /auth/sartthi/disconnect-calendar
 */
router.post('/disconnect-calendar', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById((req as any).user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        user.modules = user.modules || {};
        user.modules.calendar = {
            isEnabled: false,
            refreshToken: null,
            connectedAt: undefined,
            lastSyncedAt: undefined
        };
        await user.save();
        res.json({ success: true, message: 'Calendar disconnected' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to disconnect calendar' });
    }
});

/**
 * POST /auth/sartthi/disconnect-vault
 */
router.post('/disconnect-vault', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById((req as any).user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        user.modules = user.modules || {};
        user.modules.vault = {
            isEnabled: false,
            refreshToken: null,
            rootFolderId: undefined,
            connectedAt: undefined,
            lastSyncedAt: undefined
        };
        await user.save();
        res.json({ success: true, message: 'Vault disconnected' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to disconnect vault' });
    }
});

export default router;
