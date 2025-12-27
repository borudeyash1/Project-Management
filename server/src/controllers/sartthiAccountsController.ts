import { Request, Response } from 'express';
import { ConnectedAccount } from '../models/ConnectedAccount';
import User from '../models/User';
import { google } from 'googleapis';
import crypto from 'crypto';
import axios from 'axios';
import mongoose from 'mongoose';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || '',
    process.env.GOOGLE_CLIENT_SECRET || '',
    process.env.GOOGLE_REDIRECT_URI || ''
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
    ],
    slack: [
        'channels:read',
        'groups:read',
        'chat:write',
        'chat:write.public',
        'users:read'
    ],
    github: ['repo', 'user'],
    dropbox: [
        'account_info.read',
        'files.metadata.read',
        'files.metadata.write',
        'files.content.read',
        'files.content.write'
    ],
    onedrive: ['Files.ReadWrite.All', 'offline_access'],
    figma: ['file_content:read', 'file_metadata:read', 'current_user:read'],
    notion: [], // Notion uses internal integration tokens usually, or specific flow
    zoom: ['meeting:write:admin'],
    vercel: [],
    spotify: [
        'user-read-private',
        'user-read-email',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'user-library-read',
        'user-library-modify',
        'playlist-read-private',
        'playlist-read-collaborative'
    ],
    jira: [
        'read:me',
        'read:jira-user',
        'read:jira-work',
        'write:jira-work',
        'manage:jira-webhook',
        'offline_access'
    ],
    zendesk: [
        'read',
        'write'
    ],
    trello: [
        'read',
        'write',
        'account'
    ],
    monday: [
        'me',
        'boards:read',
        'boards:write'
    ],
    linear: [
        'read',
        'write'
    ],
    discord: [
        'identify',
        'email',
        'guilds',
        'messages.read'
    ]
};

type ServiceType = 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'onedrive' | 'figma' | 'notion' | 'zoom' | 'vercel' | 'spotify' | 'jira' | 'trello' | 'monday' | 'zendesk' | 'linear' | 'discord';

// Validation helper
const isValidService = (service: string): service is ServiceType => {
    return ['mail', 'calendar', 'vault', 'slack', 'github', 'dropbox', 'onedrive', 'figma', 'notion', 'zoom', 'vercel', 'spotify', 'jira', 'trello', 'monday', 'zendesk', 'linear', 'discord'].includes(service);
};

// Provider Config Helper
const getProviderConfig = (service: ServiceType) => {
    // Use GOOGLE_REDIRECT_URI base if available (it is set to http://localhost:5000/api/sartthi-accounts in dev)
    // Otherwise fallback to logic
    let BASE_URL = 'http://localhost:5000';
    if (process.env.GOOGLE_REDIRECT_URI) {
        // Remove /api/sartthi-accounts suffix to get base
        BASE_URL = process.env.GOOGLE_REDIRECT_URI.replace('/api/sartthi-accounts', '');
    } else if (process.env.NODE_ENV === 'production') {
        BASE_URL = process.env.FRONTEND_URL || 'https://sartthi.com';
    }

    const callbackUrl = `${BASE_URL}/api/sartthi-accounts/${service}/callback`;

    switch (service) {
        case 'slack': return {
            clientId: process.env.SLACK_CLIENT_ID || '',
            clientSecret: process.env.SLACK_CLIENT_SECRET || '',
            authUrl: 'https://slack.com/oauth/v2/authorize',
            tokenUrl: 'https://slack.com/api/oauth.v2.access',
            callbackUrl
        };
        case 'github': return {
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            authUrl: 'https://github.com/login/oauth/authorize',
            tokenUrl: 'https://github.com/login/oauth/access_token',
            callbackUrl
        };
        case 'dropbox': return {
            clientId: process.env.DROPBOX_CLIENT_ID || '',
            clientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
            authUrl: 'https://www.dropbox.com/oauth2/authorize',
            tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
            callbackUrl
        };
        case 'onedrive': return {
            clientId: process.env.ONEDRIVE_CLIENT_ID || '',
            clientSecret: process.env.ONEDRIVE_CLIENT_SECRET || '',
            authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            callbackUrl
        };
        case 'figma': return {
            clientId: process.env.FIGMA_CLIENT_ID || '',
            clientSecret: process.env.FIGMA_CLIENT_SECRET || '',
            authUrl: 'https://www.figma.com/oauth',
            tokenUrl: 'https://api.figma.com/v1/oauth/token',
            callbackUrl
        };
        case 'notion': return {
            clientId: process.env.NOTION_CLIENT_ID || '',
            clientSecret: process.env.NOTION_CLIENT_SECRET || '',
            authUrl: 'https://api.notion.com/v1/oauth/authorize',
            tokenUrl: 'https://api.notion.com/v1/oauth/token',
            callbackUrl
        };
        case 'zoom': return {
            clientId: process.env.ZOOM_CLIENT_ID || '',
            clientSecret: process.env.ZOOM_CLIENT_SECRET || '',
            authUrl: 'https://zoom.us/oauth/authorize',
            tokenUrl: 'https://zoom.us/oauth/token',
            callbackUrl
        };
        case 'vercel': return {
            clientId: process.env.VERCEL_CLIENT_ID || '',
            clientSecret: process.env.VERCEL_CLIENT_SECRET || '',
            authUrl: 'https://vercel.com/oauth/authorize',
            tokenUrl: 'https://api.vercel.com/v2/oauth/access_token',
            callbackUrl
        };
        case 'spotify': return {
            clientId: process.env.SPOTIFY_CLIENT_ID || '',
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
            authUrl: 'https://accounts.spotify.com/authorize',
            tokenUrl: 'https://accounts.spotify.com/api/token',
            callbackUrl
        };
        case 'jira': return {
            clientId: process.env.JIRA_CLIENT_ID || '',
            clientSecret: process.env.JIRA_CLIENT_SECRET || '',
            authUrl: 'https://auth.atlassian.com/authorize',
            tokenUrl: 'https://auth.atlassian.com/oauth/token',
            callbackUrl
        };
        case 'trello': return {
            clientId: process.env.TRELLO_API_KEY || '',
            clientSecret: process.env.TRELLO_SECRET || '',
            authUrl: 'https://trello.com/1/authorize',
            tokenUrl: '', // Trello uses different flow usually, but we'll try standard or handle in initiate
            callbackUrl
        };
        case 'monday': return {
            clientId: process.env.MONDAY_CLIENT_ID || '',
            clientSecret: process.env.MONDAY_CLIENT_SECRET || '',
            authUrl: 'https://auth.monday.com/oauth2/authorize',
            tokenUrl: 'https://auth.monday.com/oauth2/token',
            callbackUrl
        };
        case 'spotify': return {
            clientId: process.env.SPOTIFY_CLIENT_ID || '',
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
            authUrl: 'https://accounts.spotify.com/authorize',
            tokenUrl: 'https://accounts.spotify.com/api/token',
            callbackUrl
        };
        case 'zendesk': return {
            clientId: process.env.ZENDESK_CLIENT_ID || '', // Needs to be set or passed dynamically
            clientSecret: process.env.ZENDESK_CLIENT_SECRET || '',
            authUrl: '', // Dynamic based on subdomain
            tokenUrl: '', // Dynamic based on subdomain
            callbackUrl
        };
        case 'linear': return {
            authUrl: 'https://linear.app/oauth/authorize',
            tokenUrl: 'https://api.linear.app/oauth/token',
            clientId: process.env.LINEAR_CLIENT_ID || '',
            clientSecret: process.env.LINEAR_CLIENT_SECRET || '',
            scope: SCOPES.linear.join(','),
            callbackUrl
        };
        case 'discord': return {
            clientId: process.env.DISCORD_CLIENT_ID || '',
            clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
            authUrl: 'https://discord.com/api/oauth2/authorize',
            tokenUrl: 'https://discord.com/api/oauth2/token',
            scope: SCOPES.discord.join(' '), // Discord uses space delimiter
            callbackUrl
        };
        default: return null;
    }
};

// Get all connected accounts for a service
export const getAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { service } = req.params;
        const userId = (req as any).user._id;

        if (!service || !isValidService(service)) {
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

        if (!service || !isValidService(service)) {
            res.status(400).json({ success: false, message: 'Invalid service' });
            return;
        }

        console.log(`[OAuth] Initiating connection for ${service}`);

        if (['mail', 'calendar', 'vault'].includes(service)) {
            // Create service-specific OAuth client with correct redirect URI
            const redirectUri = `${process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/sartthi-accounts'}/${service}/callback`;
            const serviceOAuth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID || '',
                process.env.GOOGLE_CLIENT_SECRET || '',
                redirectUri
            );

            // Generate state token for security
            const state = crypto.randomBytes(32).toString('hex');
            const stateData = Buffer.from(JSON.stringify({ userId, service, state })).toString('base64');

            const authUrl = serviceOAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES[service as keyof typeof SCOPES],
                state: stateData,
                prompt: 'consent'
            });

            res.json({
                success: true,
                data: { authUrl }
            });
            return;
        }

        const config = getProviderConfig(service as ServiceType);
        if (!config) {
            res.status(500).json({ success: false, message: 'Provider configuration missing' });
            return;
        }

        // Generic OAuth 2.0 flow
        const state = crypto.randomBytes(32).toString('hex');
        // Include subdomain in state for Zendesk
        const subdomain = req.query.subdomain as string | undefined;
        const statePayload: any = { userId, service, state };
        if (service === 'zendesk' && subdomain) {
            statePayload.subdomain = subdomain;
        }
        const stateData = Buffer.from(JSON.stringify(statePayload)).toString('base64');

        if (service === 'zendesk') {
            if (!subdomain) {
                res.status(400).json({ success: false, message: 'Subdomain required for Zendesk' });
                return;
            }
            // Construct dynamic Zendesk URL
            const scope = SCOPES.zendesk.join(' ');
            const authUrl = `https://${subdomain}.zendesk.com/oauth/authorizations/new?response_type=code&redirect_uri=${encodeURIComponent(config.callbackUrl)}&client_id=${config.clientId}&scope=${encodeURIComponent(scope)}&state=${stateData}`;

            res.json({ success: true, data: { authUrl } });
            return;
        }

        let url = `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.callbackUrl)}&state=${stateData}`;

        const scopes = SCOPES[service as keyof typeof SCOPES];
        if (scopes && scopes.length > 0) {
            // Join scopes based on provider requirements (usually space or comma)
            const separator = service === 'slack' ? ',' : ' ';
            url += `&scope=${encodeURIComponent(scopes.join(separator))}`;
        }

        // Provider specific adjustments
        if (service === 'onedrive') {
            url += '&response_type=code&response_mode=query';
        } else if (service === 'dropbox') {
            url += '&response_type=code&token_access_type=offline';
        } else if (service === 'slack') {
            url += '&user_scope=';
        } else if (service === 'figma') {
            url += '&response_type=code';
        } else if (service === 'notion') {
            url += '&response_type=code&owner=user';
        } else if (service === 'zoom') {
            url += '&response_type=code';
        } else if (service === 'vercel') {
            url += '&response_type=code';
        } else if (service === 'spotify') {
            url += '&response_type=code&show_dialog=true';
        } else if (service === 'jira') {
            url += '&response_type=code&prompt=consent&audience=api.atlassian.com';
        } else if (service === 'trello') {
            // Trello specific: https://trello.com/1/authorize?expiration=never&name=MyPersonalToken&scope=read&response_type=token&key={YourAPIKey}
            // Note: Trello often returns token directly in fragment, need 'response_type=fragment' or handle differently.
            // For server-side flow, Trello uses OAuth 1.0 which is complex.
            // A simplified flow uses response_type=fragment (client side) or we use the Power-Up style.
            // Let's try standard URL construction for now with 'return_url'
            url = `${config.authUrl}?expiration=never&name=Sartthi&scope=read,write,account&response_type=fragment&key=${config.clientId}&return_url=${encodeURIComponent(config.callbackUrl)}`;
            // NOTE: Trello is weird. This might need frontend handling if it's fragment based.
        } else if (service === 'monday') {
            url += '&response_type=code';
        } else if (service === 'linear') {
            url += '&response_type=code&prompt=consent';
        } else if (service === 'discord') {
            url += '&response_type=code&prompt=consent';
        }

        res.json({
            success: true,
            data: { authUrl: url }
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
        const service = req.params.service as string;

        if (error) {
            res.redirect(`${process.env.CLIENT_URL}/settings?error=${error}`);
            return;
        }

        if (!code || !state) {
            res.redirect(`${process.env.CLIENT_URL}/settings?error=missing_params`);
            return;
        }

        // Decode state
        // Decode state
        const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
        const { userId, subdomain } = stateData;

        // Verify service matches
        if (stateData.service !== service) {
            res.redirect(`${process.env.CLIENT_URL}/settings?error=service_mismatch`);
            return;
        }

        let tokens: any = {};
        let userInfo: any = {};

        if (['mail', 'calendar', 'vault'].includes(service)) {
            // Google Logic
            const redirectUri = `${process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/sartthi-accounts'}/${service}/callback`;
            const serviceOAuth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID || '',
                process.env.GOOGLE_CLIENT_SECRET || '',
                redirectUri
            );
            const { tokens: googleTokens } = await serviceOAuth2Client.getToken(code as string);
            tokens = {
                access_token: googleTokens.access_token,
                refresh_token: googleTokens.refresh_token,
                expiry_date: googleTokens.expiry_date
            };

            serviceOAuth2Client.setCredentials(googleTokens);
            const oauth2 = google.oauth2({ version: 'v2', auth: serviceOAuth2Client });
            const { data } = await oauth2.userinfo.get();
            userInfo = {
                id: data.id,
                email: data.email,
                name: data.name,
                picture: data.picture
            };
        } else {
            // Generic Logic
            if (!isValidService(service)) return; // TS guard
            const config = getProviderConfig(service);
            if (!config) throw new Error('Config missing');

            let tokenResponse;

            if (service === 'github') {
                tokenResponse = await axios.post(config.tokenUrl, {
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    code,
                    redirect_uri: config.callbackUrl
                }, { headers: { Accept: 'application/json' } });
                tokens = tokenResponse.data;

                // Get User Info
                const userResponse = await axios.get('https://api.github.com/user', {
                    headers: { Authorization: `Bearer ${tokens.access_token}` }
                });
                userInfo = {
                    id: String(userResponse.data.id),
                    email: userResponse.data.email || `${userResponse.data.login}@github.com`, // Email might be private
                    name: userResponse.data.name || userResponse.data.login,
                    picture: userResponse.data.avatar_url
                };

            } else if (service === 'slack') {
                const params = new URLSearchParams();
                params.append('client_id', config.clientId || '');
                params.append('client_secret', config.clientSecret || '');
                params.append('code', code as string);
                params.append('redirect_uri', config.callbackUrl);

                tokenResponse = await axios.post(config.tokenUrl, params);
                if (!tokenResponse.data.ok) throw new Error(tokenResponse.data.error || 'Slack auth failed');

                tokens = {
                    access_token: tokenResponse.data.access_token || tokenResponse.data.authed_user.access_token,
                    refresh_token: undefined, // Slack often doesn't give refresh tokens for simple apps
                    expiry_date: undefined
                };

                userInfo = {
                    id: tokenResponse.data.authed_user.id,
                    email: 'slack_user', // Slack generic
                    name: 'Slack User',
                    picture: ''
                };

            } else if (service === 'dropbox') {
                const params = new URLSearchParams();
                params.append('code', code as string);
                params.append('grant_type', 'authorization_code');
                params.append('client_id', config.clientId || '');
                params.append('client_secret', config.clientSecret || '');
                params.append('redirect_uri', config.callbackUrl);

                tokenResponse = await axios.post(config.tokenUrl, params);
                tokens = tokenResponse.data;
                // Get account info
                const accountResponse = await axios.post('https://api.dropboxapi.com/2/users/get_current_account', null, {
                    headers: {
                        'Authorization': `Bearer ${tokens.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });
                userInfo = {
                    id: accountResponse.data.account_id,
                    email: accountResponse.data.email,
                    name: accountResponse.data.name.display_name,
                    picture: accountResponse.data.profile_photo_url
                };

            } else if (service === 'onedrive') {
                const params = new URLSearchParams();
                params.append('client_id', config.clientId || '');
                params.append('scope', 'Files.ReadWrite.All offline_access');
                params.append('code', code as string);
                params.append('redirect_uri', config.callbackUrl);
                params.append('grant_type', 'authorization_code');
                params.append('client_secret', config.clientSecret || '');

                tokenResponse = await axios.post(config.tokenUrl, params);
                tokens = tokenResponse.data;

                const meResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
                    headers: { Authorization: `Bearer ${tokens.access_token}` }
                });
                userInfo = {
                    id: meResponse.data.id,
                    email: meResponse.data.mail || meResponse.data.userPrincipalName,
                    name: meResponse.data.displayName,
                    picture: ''
                };
            } else if (service === 'figma') {
                // Figma expects form-encoded body, not JSON
                const params = new URLSearchParams();
                params.append('client_id', config.clientId || '');
                params.append('client_secret', config.clientSecret || '');
                params.append('redirect_uri', config.callbackUrl);
                params.append('code', code as string);
                params.append('grant_type', 'authorization_code');

                tokenResponse = await axios.post(config.tokenUrl, params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                tokens = tokenResponse.data;
                const meResponse = await axios.get('https://api.figma.com/v1/me', {
                    headers: { Authorization: `Bearer ${tokens.access_token}` }
                });
                userInfo = {
                    id: meResponse.data.id,
                    email: meResponse.data.email,
                    name: meResponse.data.handle,
                    picture: meResponse.data.img_url
                };
            } else if (service === 'notion') {
                // Notion uses Basic Auth for token endpoint usually
                const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
                tokenResponse = await axios.post(config.tokenUrl, {
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: config.callbackUrl
                }, {
                    headers: { Authorization: `Basic ${auth}` }
                });
                tokens = tokenResponse.data;
                // Notion doesn't have a standardized "me" endpoint for user info, but returns workspace info in token response
                userInfo = {
                    id: tokens.owner?.user?.id || tokens.bot_id, // Use bot_id if user id not present
                    email: tokens.owner?.user?.person?.email || 'notion_user',
                    name: tokens.workspace_name || tokens.owner?.user?.name || 'Notion Workspace',
                    picture: tokens.owner?.user?.avatar_url || tokens.icon
                };
            } else if (service === 'zoom') {
                const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
                const params = new URLSearchParams();
                params.append('grant_type', 'authorization_code');
                params.append('code', code as string);
                params.append('redirect_uri', config.callbackUrl);

                tokenResponse = await axios.post(config.tokenUrl, params, {
                    headers: { Authorization: `Basic ${auth}` }
                });
                tokens = tokenResponse.data;
                const meResponse = await axios.get('https://api.zoom.us/v2/users/me', {
                    headers: { Authorization: `Bearer ${tokens.access_token}` }
                });
                userInfo = {
                    id: meResponse.data.id,
                    email: meResponse.data.email,
                    name: `${meResponse.data.first_name} ${meResponse.data.last_name}`,
                    picture: meResponse.data.pic_url
                };
            } else if (service === 'linear') {
                const params = new URLSearchParams();
                params.append('client_id', config.clientId || '');
                params.append('client_secret', config.clientSecret || '');
                params.append('code', code as string);
                params.append('redirect_uri', config.callbackUrl);
                params.append('grant_type', 'authorization_code');

                tokenResponse = await axios.post(config.tokenUrl, params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                tokens = tokenResponse.data;

                const query = `
                query {
                    viewer {
                        id
                        name
                        email
                    }
                }
            `;
                const userResponse = await axios.post('https://api.linear.app/graphql', { query }, {
                    headers: {
                        'Authorization': `Bearer ${tokens.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const viewer = userResponse.data.data.viewer;
                userInfo = {
                    id: viewer.id,
                    email: viewer.email,
                    name: viewer.name,
                };
            } else if (service === 'vercel') {
                // Vercel expects JSON body, not form-encoded
                tokenResponse = await axios.post(config.tokenUrl, {
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    code: code as string,
                    redirect_uri: config.callbackUrl
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });
                tokens = tokenResponse.data;

                // Fetch user info from correct endpoint
                const meResponse = await axios.get('https://api.vercel.com/www/user', {
                    headers: { Authorization: `Bearer ${tokens.access_token}` }
                });
                userInfo = {
                    id: meResponse.data.user.id,
                    email: meResponse.data.user.email,
                    name: meResponse.data.user.name || meResponse.data.user.username,
                    picture: meResponse.data.user.avatar ? `https://vercel.com/api/www/avatar/${meResponse.data.user.avatar}?s=60` : ''
                };
            } else if (service === 'spotify') {
                const params = new URLSearchParams();
                params.append('grant_type', 'authorization_code');
                params.append('code', code as string);
                params.append('redirect_uri', config.callbackUrl);
                params.append('client_id', config.clientId || '');
                params.append('client_secret', config.clientSecret || '');

                tokenResponse = await axios.post(config.tokenUrl, params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                tokens = tokenResponse.data;
                const meResponse = await axios.get('https://api.spotify.com/v1/me', {
                    headers: { Authorization: `Bearer ${tokens.access_token}` }
                });
                userInfo = {
                    id: meResponse.data.id,
                    email: meResponse.data.email,
                    name: meResponse.data.display_name,
                    picture: meResponse.data.images?.[0]?.url
                };

                userInfo = {
                    id: meResponse.data.accountId,
                    email: meResponse.data.emailAddress,
                    name: meResponse.data.displayName,
                    picture: meResponse.data.avatarUrls['48x48']
                };
            } else if (service === 'monday') {
                tokenResponse = await axios.post(config.tokenUrl, {
                    code,
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    redirect_uri: config.callbackUrl // monday might not strictly need this if configured in app
                });
                tokens = tokenResponse.data;

                const meResponse = await axios.post('https://api.monday.com/v2', {
                    query: 'query { me { id email name photo_tiny } }'
                }, {
                    headers: { Authorization: tokens.access_token }
                });

                const me = meResponse.data.data.me;
                userInfo = {
                    id: me.id,
                    email: me.email,
                    name: me.name,
                    picture: me.photo_tiny
                };
            } else if (service === 'trello') {
                // Trello usually returns token in fragment, so server-side Exchange might fail if we expect 'code'.
                // If we are here, we might be handling a manual token paste or a different flow.
                // For now, let's assume we got a token passed as 'code' (not standard) or just throw error "Not implemented"
                // to avoid crashing until we fix Trello flow.
                // However, to satisfy "Implementation Plan", we will add a placeholder.
                // Trello doesn't have a code->token exchange endpoint like OAuth2.
                throw new Error('Trello authentication requires client-side token handling or OAuth 1.0a. Updates pending.');
            } else if (service === 'jira') {
                // Exchange code for token
                tokenResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
                    grant_type: 'authorization_code',
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    code,
                    redirect_uri: config.callbackUrl
                });
                tokens = tokenResponse.data;

                // Get User Info from Atlassian Me API
                const meResponse = await axios.get('https://api.atlassian.com/me', {
                    headers: { Authorization: `Bearer ${tokens.access_token}` }
                });

                userInfo = {
                    id: meResponse.data.account_id,
                    email: meResponse.data.email,
                    name: meResponse.data.name,
                    picture: meResponse.data.picture
                };
            } else if (service === 'zendesk') {
                if (!subdomain) throw new Error('Subdomain missing in state');

                tokenResponse = await axios.post(`https://${subdomain}.zendesk.com/oauth/tokens`, {
                    grant_type: 'authorization_code',
                    code,
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    redirect_uri: config.callbackUrl,
                    scope: 'read write'
                });
                tokens = tokenResponse.data;

                const meResponse = await axios.get(`https://${subdomain}.zendesk.com/api/v2/users/me.json`, {
                    headers: { Authorization: `Bearer ${tokens.access_token}` }
                });

                userInfo = {
                    id: String(meResponse.data.user.id),
                    email: meResponse.data.user.email,
                    name: meResponse.data.user.name,
                    picture: meResponse.data.user.photo?.content_url || ''
                };

                // We'll need to modify the create/update logic to save 'settings.zendesk.subdomain'.
            } else if (service === 'discord') {
                const params = new URLSearchParams();
                params.append('client_id', config.clientId || '');
                params.append('client_secret', config.clientSecret || '');
                params.append('grant_type', 'authorization_code');
                params.append('code', code as string);
                params.append('redirect_uri', config.callbackUrl);

                tokenResponse = await axios.post(config.tokenUrl, params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                tokens = tokenResponse.data;

                const meResponse = await axios.get('https://discord.com/api/users/@me', {
                    headers: { Authorization: `Bearer ${tokens.access_token}` }
                });

                userInfo = {
                    id: meResponse.data.id,
                    email: meResponse.data.email,
                    name: meResponse.data.username || meResponse.data.global_name,
                    picture: meResponse.data.avatar
                        ? `https://cdn.discordapp.com/avatars/${meResponse.data.id}/${meResponse.data.avatar}.png`
                        : ''
                };
            }
        }

        if (!tokens.access_token) {
            throw new Error('No access token received');
        }

        // Check if account already connected
        const existingAccount = await ConnectedAccount.findOne({
            userId,
            service,
            providerAccountId: userInfo.id
        });

        if (existingAccount) {
            // Update tokens
            existingAccount.accessToken = tokens.access_token;
            if (tokens.refresh_token) existingAccount.refreshToken = tokens.refresh_token;
            if (tokens.expiry_date || tokens.expires_in) {
                existingAccount.expiresAt = new Date(Date.now() + (tokens.expires_in ? tokens.expires_in * 1000 : 3600000));
            }
            await existingAccount.save();
            // Sync logic omitted for new services as they don't have 'modules' back-compat
            res.redirect(`${process.env.CLIENT_URL}/settings?success=account_updated&service=${service}`);
            return;
        }

        // Create new connected account
        const newAccount = await ConnectedAccount.create({
            userId,
            service,
            provider: ['mail', 'calendar', 'vault'].includes(service) ? 'google' : service === 'onedrive' ? 'microsoft' : service,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || '',
            expiresAt: (tokens.expiry_date || tokens.expires_in) ? new Date(Date.now() + (tokens.expires_in ? tokens.expires_in * 1000 : 3600000)) : undefined,
            providerAccountId: userInfo.id!,
            providerEmail: userInfo.email!,
            providerName: userInfo.name || userInfo.email!,
            providerAvatar: userInfo.picture,
            isActive: false,
            isPrimary: false,
            scopes: SCOPES[service as keyof typeof SCOPES],
            settings: service === 'zendesk' ? { zendesk: { subdomain } } : undefined
        });

        // Update user's connected accounts
        const user = await User.findById(userId);
        if (user) {
            if (!user.connectedAccounts) user.connectedAccounts = {};

            // Initialize the specific service object if missing
            // We need to cast to any or check existence because TS might complain if we dynamic index
            // But we updated IUser interface so it should be fine if we handle optional
            const serviceKey = service as keyof typeof user.connectedAccounts;

            if (!user.connectedAccounts[serviceKey]) {
                user.connectedAccounts[serviceKey] = { accounts: [], activeAccountId: undefined };
            }

            const serviceAccounts = user.connectedAccounts[serviceKey]!; // We just created it if missing

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

                // Sync with legacy modules field for backward compatibility
                if (['mail', 'calendar', 'vault'].includes(service)) {
                    if (!user.modules) user.modules = {};

                    const moduleKey = service as 'mail' | 'calendar' | 'vault';
                    if (!user.modules[moduleKey]) {
                        user.modules[moduleKey] = {
                            isEnabled: false,
                            refreshToken: undefined,
                            connectedAt: undefined,
                            lastSyncedAt: undefined
                        };
                    }

                    user.modules[moduleKey]!.isEnabled = true;
                    user.modules[moduleKey]!.refreshToken = newAccount.refreshToken;
                    user.modules[moduleKey]!.connectedAt = newAccount.createdAt;
                }
            }

            await user.save();
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

        if (!service || !isValidService(service)) {
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

                // Sync with legacy modules field for backward compatibility
                if (['mail', 'calendar', 'vault'].includes(service)) {
                    if (!user.modules) user.modules = {};

                    const moduleKey = service as 'mail' | 'calendar' | 'vault';
                    if (!user.modules[moduleKey]) {
                        user.modules[moduleKey] = {
                            isEnabled: false,
                            refreshToken: undefined,
                            connectedAt: undefined,
                            lastSyncedAt: undefined
                        };
                    }

                    user.modules[moduleKey]!.isEnabled = true;
                    user.modules[moduleKey]!.refreshToken = account.refreshToken;
                }

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
        const { accountId } = req.params;
        const service = req.params.service as string;
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
                    if (['mail', 'calendar', 'vault'].includes(service)) {
                        const moduleService = user.modules?.[service as 'mail' | 'calendar' | 'vault'];
                        if (moduleService) {
                            moduleService.isEnabled = false;
                            moduleService.refreshToken = null;
                        }
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
