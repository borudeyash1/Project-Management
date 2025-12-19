import { Request, Response } from 'express';
import { ConnectedAccount } from '../models/ConnectedAccount';
import User from '../models/User';
import { google } from 'googleapis';

type ServiceType = 'mail' | 'calendar' | 'vault';

// Get recent emails from active mail account
export const getRecentEmails = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const limit = parseInt(req.query.limit as string) || 5;

        // Get active mail account (check both new and old structures)
        const user = await User.findById(userId);
        let activeAccountId = user?.connectedAccounts?.mail?.activeAccountId;
        let accessToken: string | undefined;
        let refreshToken: string | undefined;

        // If no active account in new structure, check old modules structure
        if (!activeAccountId && user?.modules?.mail?.refreshToken) {
            // Use old modules structure (only has refreshToken, access token will be auto-refreshed)
            refreshToken = user.modules.mail.refreshToken;
        } else if (activeAccountId) {
            // Use new connectedAccounts structure
            const account = await ConnectedAccount.findById(activeAccountId);
            if (account) {
                accessToken = account.accessToken;
                refreshToken = account.refreshToken;
            }
        }

        if (!refreshToken) {
            res.json({
                success: true,
                data: {
                    account: null,
                    emails: []
                }
            });
            return;
        }

        // Set up Gmail API
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials(
            accessToken ? {
                access_token: accessToken,
                refresh_token: refreshToken
            } : {
                refresh_token: refreshToken
            }
        );

        try {
            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

            // Fetch recent emails
            const response = await gmail.users.messages.list({
                userId: 'me',
                maxResults: limit,
                q: 'in:inbox'
            });

            const messages = response.data.messages || [];
            const emails = await Promise.all(
                messages.map(async (msg) => {
                    const detail = await gmail.users.messages.get({
                        userId: 'me',
                        id: msg.id!,
                        format: 'metadata',
                        metadataHeaders: ['From', 'Subject', 'Date']
                    });

                    const headers = detail.data.payload?.headers || [];
                    const from = headers.find(h => h.name === 'From')?.value || '';
                    const subject = headers.find(h => h.name === 'Subject')?.value || '';
                    const date = headers.find(h => h.name === 'Date')?.value || '';

                    return {
                        id: msg.id,
                        from,
                        subject,
                        snippet: detail.data.snippet || '',
                        date,
                        isUnread: detail.data.labelIds?.includes('UNREAD') || false
                    };
                })
            );

            // Get account info from ConnectedAccount model (not from OAuth to ensure we show the active account)
            let accountInfo = null;
            if (activeAccountId) {
                const account = await ConnectedAccount.findById(activeAccountId);
                if (account) {
                    accountInfo = {
                        email: account.providerEmail,
                        name: account.providerName || account.providerEmail,
                        avatar: account.providerAvatar
                    };
                }
            } else if (user?.modules?.mail) {
                // Fallback to old structure - fetch from OAuth
                const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
                const userInfo = await oauth2.userinfo.get();
                accountInfo = {
                    email: userInfo.data.email || '',
                    name: userInfo.data.name || '',
                    avatar: userInfo.data.picture
                };
            }

            res.json({
                success: true,
                data: {
                    account: accountInfo,
                    emails
                }
            });
        } catch (apiError: any) {
            // If token is invalid/expired, return empty data instead of error
            console.warn('Gmail API error (likely expired token):', apiError.message);
            res.json({
                success: true,
                data: {
                    account: null,
                    emails: []
                }
            });
        }
    } catch (error: any) {
        console.error('Get recent emails error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get upcoming calendar events
export const getUpcomingEvents = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const days = parseInt(req.query.days as string) || 7;

        // Get active calendar account (check both new and old structures)
        const user = await User.findById(userId);
        let activeAccountId = user?.connectedAccounts?.calendar?.activeAccountId;
        let accessToken: string | undefined;
        let refreshToken: string | undefined;

        // If no active account in new structure, check old modules structure
        if (!activeAccountId && user?.modules?.calendar?.refreshToken) {
            // Use old modules structure (only has refreshToken, access token will be auto-refreshed)
            refreshToken = user.modules.calendar.refreshToken;
        } else if (activeAccountId) {
            const account = await ConnectedAccount.findById(activeAccountId);
            if (account) {
                accessToken = account.accessToken;
                refreshToken = account.refreshToken;
            }
        }

        if (!refreshToken) {
            res.json({
                success: true,
                data: {
                    account: null,
                    events: []
                }
            });
            return;
        }

        // Set up Calendar API
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials(
            accessToken ? {
                access_token: accessToken,
                refresh_token: refreshToken
            } : {
                refresh_token: refreshToken
            }
        );

        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            // Fetch upcoming events
            const timeMin = new Date().toISOString();
            const timeMax = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin,
                timeMax,
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            });

            const events = (response.data.items || []).map(event => ({
                id: event.id,
                title: event.summary || 'Untitled Event',
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
                location: event.location,
                attendees: event.attendees?.map(a => a.email) || []
            }));

            // Get account info from ConnectedAccount model (not from OAuth to ensure we show the active account)
            let accountInfo = null;
            if (activeAccountId) {
                const account = await ConnectedAccount.findById(activeAccountId);
                if (account) {
                    accountInfo = {
                        email: account.providerEmail,
                        name: account.providerName || account.providerEmail,
                        avatar: account.providerAvatar
                    };
                }
            } else if (user?.modules?.calendar) {
                // Fallback to old structure - fetch from OAuth
                const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
                const userInfo = await oauth2.userinfo.get();
                accountInfo = {
                    email: userInfo.data.email || '',
                    name: userInfo.data.name || '',
                    avatar: userInfo.data.picture
                };
            }

            res.json({
                success: true,
                data: {
                    account: accountInfo,
                    events
                }
            });
        } catch (apiError: any) {
            console.warn('Calendar API error (likely expired token):', apiError.message);
            res.json({
                success: true,
                data: {
                    account: null,
                    events: []
                }
            });
        }
    } catch (error: any) {
        console.error('Get upcoming events error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get vault summary
export const getVaultSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;

        // Get active vault account (check both new and old structures)
        const user = await User.findById(userId);
        let activeAccountId = user?.connectedAccounts?.vault?.activeAccountId;
        let accessToken: string | undefined;
        let refreshToken: string | undefined;

        // If no active account in new structure, check old modules structure
        if (!activeAccountId && user?.modules?.vault?.refreshToken) {
            // Use old modules structure (only has refreshToken, access token will be auto-refreshed)
            refreshToken = user.modules.vault.refreshToken;
        } else if (activeAccountId) {
            const account = await ConnectedAccount.findById(activeAccountId);
            if (account) {
                accessToken = account.accessToken;
                refreshToken = account.refreshToken;
            }
        }

        if (!refreshToken) {
            res.json({
                success: true,
                data: {
                    account: null,
                    storage: { used: 0, total: 0 },
                    recentFiles: []
                }
            });
            return;
        }

        // Set up Drive API
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken
        });

        try {
            const drive = google.drive({ version: 'v3', auth: oauth2Client });

            // Get storage quota
            const about = await drive.about.get({
                fields: 'storageQuota'
            });

            const storageQuota = about.data.storageQuota;
            const used = parseInt(storageQuota?.usage || '0');
            const total = parseInt(storageQuota?.limit || '0');

            // Get recent files
            const filesResponse = await drive.files.list({
                pageSize: 5,
                orderBy: 'modifiedTime desc',
                fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)'
            });

            const recentFiles = (filesResponse.data.files || []).map(file => ({
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                size: parseInt(file.size || '0'),
                modifiedTime: file.modifiedTime,
                webViewLink: file.webViewLink,
                iconLink: file.iconLink
            }));

            // Get account info from ConnectedAccount model (not from OAuth to ensure we show the active account)
            let accountInfo = null;
            if (activeAccountId) {
                const account = await ConnectedAccount.findById(activeAccountId);
                if (account) {
                    accountInfo = {
                        email: account.providerEmail,
                        name: account.providerName || account.providerEmail,
                        avatar: account.providerAvatar
                    };
                }
            } else if (user?.modules?.vault) {
                // Fallback to old structure - fetch from OAuth
                const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
                const userInfo = await oauth2.userinfo.get();
                accountInfo = {
                    email: userInfo.data.email || '',
                    name: userInfo.data.name || '',
                    avatar: userInfo.data.picture
                };
            }

            res.json({
                success: true,
                data: {
                    account: accountInfo,
                    storage: {
                        used,
                        total
                    },
                    recentFiles
                }
            });
        } catch (apiError: any) {
            console.warn('Vault API error (likely expired token):', apiError.message);
            res.json({
                success: true,
                data: {
                    account: null,
                    storage: { used: 0, total: 0 },
                    recentFiles: []
                }
            });
        }
    } catch (error: any) {
        console.error('Get vault summary error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
