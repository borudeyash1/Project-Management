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

export const listEmails = async (userId: string, labelIds: string[] = ['INBOX'], maxResults = 50) => {
    console.log(`📧 [GMAIL] Fetching emails for user: ${userId}, labels: ${labelIds.join(', ')}`);

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

        console.log(`📧 [GMAIL] Listing messages (max: ${maxResults}, labels: ${labelIds.join(', ')})...`);
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults,
            labelIds
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

// Helper to decode base64url
const decodeBase64Url = (data: string): string => {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
};

// Extract email body from payload
const extractBody = (payload: any): { html: string; text: string } => {
    let html = '';
    let text = '';

    const getParts = (part: any) => {
        if (part.mimeType === 'text/html' && part.body?.data) {
            html = decodeBase64Url(part.body.data);
        } else if (part.mimeType === 'text/plain' && part.body?.data) {
            text = decodeBase64Url(part.body.data);
        }

        if (part.parts) {
            part.parts.forEach(getParts);
        }
    };

    if (payload.body?.data) {
        if (payload.mimeType === 'text/html') {
            html = decodeBase64Url(payload.body.data);
        } else if (payload.mimeType === 'text/plain') {
            text = decodeBase64Url(payload.body.data);
        }
    }

    if (payload.parts) {
        payload.parts.forEach(getParts);
    }

    return { html, text };
};

// Extract attachments info
const extractAttachments = (payload: any): Array<{ filename: string; mimeType: string; attachmentId: string; size: number }> => {
    const attachments: Array<{ filename: string; mimeType: string; attachmentId: string; size: number }> = [];

    const getParts = (part: any) => {
        if (part.filename && part.body?.attachmentId) {
            attachments.push({
                filename: part.filename,
                mimeType: part.mimeType,
                attachmentId: part.body.attachmentId,
                size: part.body.size || 0
            });
        }

        if (part.parts) {
            part.parts.forEach(getParts);
        }
    };

    if (payload.parts) {
        payload.parts.forEach(getParts);
    }

    return attachments;
};

// Get full email content (for rich previews)
export const getEmailContent = async (userId: string, messageId: string) => {
    console.log(`📧 [GMAIL] Fetching full content for message: ${messageId}`);

    const gmail = await getGmailClient(userId);

    try {
        const message = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        const payload = message.data.payload;
        const headers = payload?.headers;

        const subject = headers?.find(h => h.name === 'Subject')?.value || '(No Subject)';
        const from = headers?.find(h => h.name === 'From')?.value || 'Unknown';
        const to = headers?.find(h => h.name === 'To')?.value || '';
        const date = headers?.find(h => h.name === 'Date')?.value || '';
        const body = extractBody(payload);
        const attachments = extractAttachments(payload);

        return {
            id: message.data.id,
            threadId: message.data.threadId,
            subject,
            from,
            to,
            date,
            body,
            attachments,
            labels: message.data.labelIds,
            snippet: message.data.snippet
        };
    } catch (error: any) {
        console.error('📧 [GMAIL] Failed to fetch email content:', error.message);
        throw error;
    }
};
