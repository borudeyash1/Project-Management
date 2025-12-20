import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
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
 * GET /auth/sartthi/connect-mail (authenticated - for in-app connection)
 */
router.get('/connect-mail', authenticate, async (req: Request, res: Response) => {
    try {
        const client = getOAuthClient('mail');
        const userId = (req as any).user._id;
        const state = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/gmail.modify'],
            prompt: 'select_account consent',
            state: state
        });

        res.redirect(url);
    } catch (error) {
        console.error('Connect Mail Error:', error);
        res.status(500).json({ message: 'Failed to initiate Google Auth' });
    }
});

/**
 * GET /auth/sartthi/login-mail (public - for standalone login)
 */
router.get('/login-mail', async (req: Request, res: Response) => {
    try {
        const client = getOAuthClient('mail');
        // Use a special marker for standalone login
        const state = jwt.sign({ standalone: true, service: 'mail' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'openid',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/gmail.modify'
            ],
            prompt: 'select_account consent',
            state: state
        });

        res.redirect(url);
    } catch (error) {
        console.error('Login Mail Error:', error);
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

        const decoded = jwt.verify(state as string, process.env.JWT_SECRET as string) as any;
        const client = getOAuthClient('mail');
        const { tokens } = await client.getToken(code as string);

        // Check if this is a standalone login or in-app connection
        if (decoded.standalone) {
            // Standalone login - decode ID token to get user info
            if (!tokens.id_token) {
                throw new Error('No ID token received');
            }

            const ticket = await client.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();

            if (!payload || !payload.email) {
                throw new Error('Invalid ID token payload');
            }

            // Find user by email
            const user = await User.findOne({ email: payload.email });

            if (!user) {
                // New user - redirect to main app to sign up first
                console.log('📧 [MAIL] New user detected, redirecting to main app');
                res.redirect('http://localhost:3000?message=Please sign up on Sartthi first, then connect your Mail account from Settings');
                return;
            }

            // Check if user has mail connected
            const hasMailConnected = user.connectedAccounts?.mail?.accounts &&
                user.connectedAccounts.mail.accounts.length > 0;

            if (!hasMailConnected) {
                // User exists but hasn't connected mail yet
                console.log('📧 [MAIL] User exists but mail not connected, redirecting to settings');
                res.redirect('http://localhost:3000/settings?tab=connected-accounts&message=Please connect your Mail account first');
                return;
            }

            // User exists and has mail connected - update refresh token and log them in
            user.modules = user.modules || {};
            user.modules.mail = {
                isEnabled: true,
                refreshToken: tokens.refresh_token || user.modules.mail?.refreshToken || null,
                connectedAt: user.modules.mail?.connectedAt || new Date(),
                lastSyncedAt: new Date()
            };
            await user.save();

            // Generate JWT token
            const accessToken = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            console.log('✅ [MAIL] Standalone login successful for:', user.email);
            const redirectUrl = process.env.NODE_ENV === 'production'
                ? `https://mail.sartthi.com?token=${accessToken}`
                : `http://localhost:3001?token=${accessToken}`;
            res.redirect(redirectUrl);
        } else {
            // In-app connection - existing logic
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
        }
    } catch (error: any) {
        console.error('Mail Callback Error:', error);
        res.redirect(process.env.NODE_ENV === 'production' ? 'https://sartthi.com/error' : 'http://localhost:3000/error');
    }
});

/**
 * GET /auth/sartthi/connect-calendar (authenticated - for in-app connection)
 */
router.get('/connect-calendar', authenticate, async (req: Request, res: Response) => {
    try {
        const client = getOAuthClient('calendar');
        const userId = (req as any).user._id;
        const state = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar'],
            prompt: 'select_account consent',
            state: state
        });

        res.redirect(url);
    } catch (error) {
        console.error('Connect Calendar Error:', error);
        res.status(500).json({ message: 'Failed to initiate Google Auth' });
    }
});

/**
 * GET /auth/sartthi/login-calendar (public - for standalone login)
 */
router.get('/login-calendar', async (req: Request, res: Response) => {
    try {
        const client = getOAuthClient('calendar');
        const state = jwt.sign({ standalone: true, service: 'calendar' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'openid',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/calendar'
            ],
            prompt: 'select_account consent',
            state: state
        });

        res.redirect(url);
    } catch (error) {
        console.error('Login Calendar Error:', error);
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

        const decoded = jwt.verify(state as string, process.env.JWT_SECRET as string) as any;
        const client = getOAuthClient('calendar');
        const { tokens } = await client.getToken(code as string);

        // Check if this is a standalone login or in-app connection
        if (decoded.standalone) {
            // Standalone login - get user info from Google
            const oauth2Client = client;
            oauth2Client.setCredentials(tokens);
            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
            const { data: googleUser } = await oauth2.userinfo.get();

            // Find or create user
            let user = await User.findOne({ email: googleUser.email });

            if (!user) {
                user = new User({
                    email: googleUser.email!,
                    fullName: googleUser.name || googleUser.email!,
                    username: (googleUser.email || 'user').split('@')[0] + '_' + Date.now(),
                    password: Math.random().toString(36).slice(-12),
                    isEmailVerified: true,
                    modules: {
                        calendar: {
                            isEnabled: true,
                            refreshToken: tokens.refresh_token || null,
                            connectedAt: new Date(),
                            lastSyncedAt: new Date()
                        }
                    }
                });
                await user.save();
            } else {
                user.modules = user.modules || {};
                user.modules.calendar = {
                    isEnabled: true,
                    refreshToken: tokens.refresh_token || null,
                    connectedAt: new Date(),
                    lastSyncedAt: new Date()
                };
                await user.save();
            }

            const accessToken = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            const redirectUrl = process.env.NODE_ENV === 'production'
                ? `https://calendar.sartthi.com?token=${accessToken}`
                : `http://localhost:3002?token=${accessToken}`;
            res.redirect(redirectUrl);
        } else {
            // In-app connection
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
        }
    } catch (error: any) {
        console.error('Calendar Callback Error:', error);
        res.redirect(process.env.NODE_ENV === 'production' ? 'https://sartthi.com/error' : 'http://localhost:3000/error');
    }
});

/**
 * GET /auth/sartthi/connect-vault (authenticated - for in-app connection)
 */
router.get('/connect-vault', authenticate, async (req: Request, res: Response) => {
    try {
        const client = getOAuthClient('vault');
        const userId = (req as any).user._id;
        const state = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/drive'],
            prompt: 'select_account consent',
            state: state
        });

        res.redirect(url);
    } catch (error) {
        console.error('Connect Vault Error:', error);
        res.status(500).json({ message: 'Failed to initiate Google Auth' });
    }
});

/**
 * GET /auth/sartthi/login-vault (public - for standalone login)
 */
router.get('/login-vault', async (req: Request, res: Response) => {
    try {
        const client = getOAuthClient('vault');
        const state = jwt.sign({ standalone: true, service: 'vault' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'openid',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/drive'
            ],
            prompt: 'select_account consent',
            state: state
        });

        res.redirect(url);
    } catch (error) {
        console.error('Login Vault Error:', error);
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

        const decoded = jwt.verify(state as string, process.env.JWT_SECRET as string) as any;
        const client = getOAuthClient('vault');
        const { tokens } = await client.getToken(code as string);

        // Check if this is a standalone login or in-app connection
        if (decoded.standalone) {
            // Standalone login - get user info from Google
            const oauth2Client = client;
            oauth2Client.setCredentials(tokens);
            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
            const { data: googleUser } = await oauth2.userinfo.get();

            // Find or create user
            let user = await User.findOne({ email: googleUser.email });
            let isNewUser = false;

            if (!user) {
                isNewUser = true;
                user = new User({
                    email: googleUser.email!,
                    fullName: googleUser.name || googleUser.email!,
                    username: googleUser.email!.split('@')[0] + '_' + Date.now(),
                    password: Math.random().toString(36).slice(-12),
                    isEmailVerified: true,
                    modules: {
                        vault: {
                            isEnabled: false,
                            refreshToken: tokens.refresh_token || null,
                            rootFolderId: undefined,
                            connectedAt: new Date(),
                            lastSyncedAt: new Date()
                        }
                    }
                });
                await user.save();
            } else {
                user.modules = user.modules || {};
                user.modules.vault = {
                    isEnabled: false,
                    refreshToken: tokens.refresh_token || null,
                    rootFolderId: undefined,
                    connectedAt: new Date(),
                    lastSyncedAt: new Date()
                };
                await user.save();
            }

            // Create root "Sartthi Vault" folder
            const { createRootVaultFolder } = await import('../services/vaultService');
            const rootFolderId = await createRootVaultFolder(user._id.toString());

            // Update user with folder ID and enable vault
            if (user.modules?.vault) {
                user.modules.vault.rootFolderId = rootFolderId;
                user.modules.vault.isEnabled = true;
            }
            await user.save();

            // Generate JWT token
            const accessToken = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            const redirectUrl = process.env.NODE_ENV === 'production'
                ? `https://vault.sartthi.com?token=${accessToken}`
                : `http://localhost:3003?token=${accessToken}`;
            res.redirect(redirectUrl);
        } else {
            // In-app connection
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
        }
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
