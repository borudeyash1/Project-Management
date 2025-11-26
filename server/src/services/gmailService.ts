import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';

const getOAuthClient = () => {
    const BASE_URL = process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || 'https://sartthi.com')
        : 'http://localhost:5000';

    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${BASE_URL}/api/auth/sartthi/connect-mail/callback`
    );
};

export const getGmailClient = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user || !user.modules?.mail?.refreshToken) {
        throw new Error('Mail module not connected');
    }

    const auth = getOAuthClient();
    auth.setCredentials({
        refresh_token: user.modules.mail.refreshToken
    });

    return google.gmail({ version: 'v1', auth });
};

export const listEmails = async (userId: string, maxResults = 10) => {
    console.log(`📧 [GMAIL] Fetching emails for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
        console.error('📧 [GMAIL] User not found');
        throw new Error('User not found');
    }

    if (!user.modules?.mail?.refreshToken) {
        console.error('📧 [GMAIL] Refresh token missing');
        throw new Error('Mail module not connected (Refresh Token Missing)');
    }

    console.log('📧 [GMAIL] User found, refresh token present');

    try {
        const auth = getOAuthClient();
        auth.setCredentials({
            refresh_token: user.modules.mail.refreshToken
        });

        const gmail = google.gmail({ version: 'v1', auth });

        console.log(`📧 [GMAIL] Listing messages (max: ${maxResults})...`);
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults,
            labelIds: ['INBOX']
        });

        const messages = response.data.messages || [];
        console.log(`📧 [GMAIL] Found ${messages.length} messages to fetch`);

        // Use batch request to fetch all message details in one API call
        const fullMessages = await Promise.all(messages.map(async (msg) => {
            try {
                const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id!,
                    format: 'metadata',  // Changed from 'full' to 'metadata' for faster response
                    metadataHeaders: ['Subject', 'From', 'Date']  // Only fetch needed headers
                });

                const payload = detail.data.payload;
                const headers = payload?.headers;

                const subject = headers?.find(h => h.name === 'Subject')?.value || '(No Subject)';
                const from = headers?.find(h => h.name === 'From')?.value || 'Unknown';
                const date = headers?.find(h => h.name === 'Date')?.value || '';
                const snippet = detail.data.snippet;

                return {
                    id: msg.id,
                    threadId: msg.threadId,
                    subject,
                    from,
                    date,
                    snippet,
                    isRead: !detail.data.labelIds?.includes('UNREAD'),
                    labels: detail.data.labelIds
                };
            } catch (err) {
                console.error(`📧 [GMAIL] Failed to fetch message ${msg.id}`, err);
                return null;
            }
        }));

        console.log(`📧 [GMAIL] Successfully fetched ${fullMessages.filter(m => m !== null).length} messages`);
        return fullMessages.filter(m => m !== null);
    } catch (error: any) {
        console.error('📧 [GMAIL] API Error:', error.message);
        if (error.response) {
            console.error('📧 [GMAIL] API Response:', error.response.data);
        }
        throw error;
    }
};
