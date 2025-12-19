import { Request, Response } from 'express';
import { ConnectedAccount } from '../models/ConnectedAccount';
import User from '../models/User';
import { google } from 'googleapis';
import crypto from 'crypto';
import mongoose from 'mongoose';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Scopes for each service
const SCOPES = {
    mail: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ],
    calendar: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ],
    vault: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ]
};

type ServiceType = 'mail' | 'calendar' | 'vault';

// Get all connected accounts for a service
export const getAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { service } = req.params;
        const userId = (req as any).user._id;

        if (!service || !['mail', 'calendar', 'vault'].includes(service)) {
            res.status(400).json({ success: false, message: 'Invalid service' });
            return;
        }

        const accounts = await ConnectedAccount.find({
            userId,
            service
        }).select('-accessToken -refreshToken');

        const user = await User.findById(userId);
        const activeAccountId = user?.connectedAccounts?.[service as ServiceType]?.activeAccountId;

        const activeAccount = accounts.find(acc =>
            acc._id && acc._id.toString() === activeAccountId?.toString()
        );

        res.json({
            success: true,
            data: {
                accounts,
                activeAccount: activeAccount || null
            }
        });
    } catch (error: any) {
        console.error('Get accounts error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Initiate OAuth connection
export const initiateConnection = async (req: Request, res: Response): Promise<void> => {
    try {
        const { service } = req.params;
        const userId = (req as any).user._id;

        if (!service || !['mail', 'calendar', 'vault'].includes(service)) {
            res.status(400).json({ success: false, message: 'Invalid service' });
            return;
        }

        // Create service-specific OAuth client with correct redirect URI
        const redirectUri = `${process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/sartthi-accounts'}/${service}/callback`;
        console.log(`[OAuth] Initiating connection for ${service} with redirect URI:`, redirectUri);

        const serviceOAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
        );

        // Generate state token for security
        const state = crypto.randomBytes(32).toString('hex');

        // Store state in session or temporary storage (you might want to use Redis)
        // For now, we'll encode userId in the state
        const stateData = Buffer.from(JSON.stringify({ userId, service, state })).toString('base64');

        const authUrl = serviceOAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES[service as keyof typeof SCOPES],
            state: stateData,
            prompt: 'consent' // Force consent screen to get refresh token
        });

        console.log(`[OAuth] Generated auth URL for ${service}:`, authUrl);

        res.json({
            success: true,
            data: { authUrl }
        });
    } catch (error: any) {
        console.error('Initiate connection error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Handle OAuth callback
export const handleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, state, error } = req.query;
        const { service } = req.params;

        if (error) {
            res.redirect(`${process.env.CLIENT_URL}/settings?error=${error}`);
            return;
        }

        if (!code || !state) {
            res.redirect(`${process.env.CLIENT_URL}/settings?error=missing_params`);
            return;
        }

        // Decode state
        const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
        const { userId } = stateData;

        // Create service-specific OAuth client with correct redirect URI (MUST match the one used in initiateConnection)
        const redirectUri = `${process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/sartthi-accounts'}/${service}/callback`;
        console.log(`[OAuth] Handling callback for ${service} with redirect URI:`, redirectUri);

        const serviceOAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
        );

        // Exchange code for tokens
        const { tokens } = await serviceOAuth2Client.getToken(code as string);

        if (!tokens.access_token || !tokens.refresh_token) {
            res.redirect(`${process.env.CLIENT_URL}/settings?error=token_exchange_failed`);
            return;
        }

        // Get user info from Google
        serviceOAuth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: serviceOAuth2Client });
        const userInfo = await oauth2.userinfo.get();

        // Check if account already connected
        const existingAccount = await ConnectedAccount.findOne({
            userId,
            service,
            providerAccountId: userInfo.data.id
        });

        if (existingAccount) {
            // Update tokens
            existingAccount.accessToken = tokens.access_token;
            existingAccount.refreshToken = tokens.refresh_token!;
            existingAccount.expiresAt = new Date(tokens.expiry_date || Date.now() + 3600000);
            await existingAccount.save();

            // Sync with deprecated modules field for backward compatibility
            const user = await User.findById(userId);
            if (user) {
                if (!user.modules) {
                    user.modules = {
                        mail: { isEnabled: false },
                        calendar: { isEnabled: false },
                        vault: { isEnabled: false }
                    };
                }
                const moduleService = user.modules?.[service as ServiceType];
                if (moduleService) {
                    moduleService.isEnabled = true;
                    moduleService.refreshToken = tokens.refresh_token!;
                    moduleService.connectedAt = moduleService.connectedAt || new Date();
                    moduleService.lastSyncedAt = new Date();
                }
                await user.save();
            }

            res.redirect(`${process.env.CLIENT_URL}/settings?success=account_updated&service=${service}`);
            return;
        }

        // Create new connected account
        const newAccount = await ConnectedAccount.create({
            userId,
            service,
            provider: 'google',
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token!,
            expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
            providerAccountId: userInfo.data.id!,
            providerEmail: userInfo.data.email!,
            providerName: userInfo.data.name || userInfo.data.email!,
            providerAvatar: userInfo.data.picture,
            isActive: false,
            isPrimary: false,
            scopes: SCOPES[service as keyof typeof SCOPES]
        });

        // Update user's connected accounts
        const user = await User.findById(userId);
        if (user) {
            if (!user.connectedAccounts) {
                user.connectedAccounts = {
                    mail: { accounts: [], activeAccountId: undefined },
                    calendar: { accounts: [], activeAccountId: undefined },
                    vault: { accounts: [], activeAccountId: undefined }
                };
            }

            const serviceAccounts = user.connectedAccounts[service as ServiceType];
            if (serviceAccounts) {
                if (!serviceAccounts.accounts) {
                    serviceAccounts.accounts = [];
                }

                serviceAccounts.accounts.push((newAccount._id as mongoose.Types.ObjectId).toString());

                // Set as active if first account
                if (serviceAccounts.accounts.length === 1) {
                    serviceAccounts.activeAccountId = (newAccount._id as mongoose.Types.ObjectId).toString();
                    newAccount.isActive = true;
                    newAccount.isPrimary = true;
                    await newAccount.save();
                }

                // Sync with deprecated modules field for backward compatibility
                if (!user.modules) {
                    user.modules = {
                        mail: { isEnabled: false },
                        calendar: { isEnabled: false },
                        vault: { isEnabled: false }
                    };
                }
                const moduleService = user.modules?.[service as ServiceType];
                if (moduleService) {
                    moduleService.isEnabled = true;
                    moduleService.refreshToken = tokens.refresh_token!;
                    moduleService.connectedAt = new Date();
                    moduleService.lastSyncedAt = new Date();
                }

                await user.save();
            }
        }

        res.redirect(`${process.env.CLIENT_URL}/settings?success=account_connected&service=${service}`);
    } catch (error: any) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}/settings?error=${encodeURIComponent(error.message)}`);
    }
};

// Set active account
export const setActiveAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { service } = req.params;
        const { accountId } = req.body;
        const userId = (req as any).user._id;

        if (!service || !['mail', 'calendar', 'vault'].includes(service)) {
            res.status(400).json({ success: false, message: 'Invalid service' });
            return;
        }

        // Verify account belongs to user
        const account = await ConnectedAccount.findOne({
            _id: accountId,
            userId,
            service
        });

        if (!account) {
            res.status(404).json({ success: false, message: 'Account not found' });
            return;
        }

        // Deactivate all other accounts for this service
        await ConnectedAccount.updateMany(
            { userId, service, _id: { $ne: accountId } },
            { $set: { isActive: false } }
        );

        // Activate the selected account
        account.isActive = true;
        await account.save();

        // Update user's active account reference
        const user = await User.findById(userId);
        if (user && user.connectedAccounts) {
            const serviceAccounts = user.connectedAccounts[service as ServiceType];
            if (serviceAccounts) {
                serviceAccounts.activeAccountId = (account._id as mongoose.Types.ObjectId).toString();
                await user.save();
            }
        }

        res.json({
            success: true,
            data: {
                activeAccount: {
                    _id: account._id,
                    providerEmail: account.providerEmail,
                    providerName: account.providerName,
                    providerAvatar: account.providerAvatar
                }
            }
        });
    } catch (error: any) {
        console.error('Set active account error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Disconnect account
export const disconnectAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { service, accountId } = req.params;
        const userId = (req as any).user._id;

        const account = await ConnectedAccount.findOne({
            _id: accountId,
            userId,
            service
        });

        if (!account) {
            res.status(404).json({ success: false, message: 'Account not found' });
            return;
        }

        const wasActive = account.isActive;

        // Delete the account
        await ConnectedAccount.deleteOne({ _id: accountId });

        // Update user's connected accounts
        const user = await User.findById(userId);
        if (user && user.connectedAccounts) {
            const serviceAccounts = user.connectedAccounts[service as ServiceType];
            if (serviceAccounts && serviceAccounts.accounts) {
                serviceAccounts.accounts = serviceAccounts.accounts.filter(
                    (id: any) => id.toString() !== accountId
                );

                // If this was the active account, set another as active
                if (wasActive && serviceAccounts.accounts.length > 0) {
                    const newActiveAccount = await ConnectedAccount.findById(serviceAccounts.accounts[0]);
                    if (newActiveAccount) {
                        newActiveAccount.isActive = true;
                        await newActiveAccount.save();
                        serviceAccounts.activeAccountId = (newActiveAccount._id as mongoose.Types.ObjectId).toString();
                    }
                } else if (serviceAccounts.accounts.length === 0) {
                    serviceAccounts.activeAccountId = undefined;

                    // Sync with deprecated modules field - disable if no accounts left
                    const moduleService = user.modules?.[service as ServiceType];
                    if (moduleService) {
                        moduleService.isEnabled = false;
                    }
                }

                await user.save();
            }
        }

        res.json({ success: true, message: 'Account disconnected successfully' });
    } catch (error: any) {
        console.error('Disconnect account error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Refresh OAuth tokens
export const refreshTokens = async (req: Request, res: Response): Promise<void> => {
    try {
        const { service, accountId } = req.params;
        const userId = (req as any).user._id;

        const account = await ConnectedAccount.findOne({
            _id: accountId,
            userId,
            service
        });

        if (!account) {
            res.status(404).json({ success: false, message: 'Account not found' });
            return;
        }

        // Refresh tokens using Google OAuth
        oauth2Client.setCredentials({
            refresh_token: account.refreshToken
        });

        const { credentials } = await oauth2Client.refreshAccessToken();

        if (credentials.access_token) {
            account.accessToken = credentials.access_token;
            if (credentials.expiry_date) {
                account.expiresAt = new Date(credentials.expiry_date);
            }
            await account.save();

            res.json({
                success: true,
                data: {
                    expiresAt: account.expiresAt
                }
            });
        } else {
            throw new Error('Failed to refresh access token');
        }
    } catch (error: any) {
        console.error('Refresh tokens error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
