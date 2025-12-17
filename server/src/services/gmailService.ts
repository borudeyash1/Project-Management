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

        // Use batch request to fetch message details in chunks to avoid rate limits
        const fullMessages = [];
        const chunkSize = 10; // Process 10 messages at a time

        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize);
            console.log(`📧 [GMAIL] Fetching batch ${i / chunkSize + 1}/${Math.ceil(messages.length / chunkSize)}`);

            const chunkResults = await Promise.all(chunk.map(async (msg) => {
                try {
                    const detail = await gmail.users.messages.get({
                        userId: 'me',
                        id: msg.id!,
                        format: 'metadata',
                        metadataHeaders: ['Subject', 'From', 'Date']
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

            fullMessages.push(...chunkResults);

            // Optional: Small delay between batches if needed
            // await new Promise(resolve => setTimeout(resolve, 100));
        }

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
// Send email using Gmail API
export const sendEmailViaGmail = async (userId: string, to: string[], subject: string, htmlBody: string) => {
    console.log(`📧 [GMAIL] Sending email via Gmail API for user ${userId} to ${to.join(', ')}`);

    const gmail = await getGmailClient(userId);

    const messageParts = [
        `To: ${to.join(', ')}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        htmlBody
    ];

    const message = messageParts.join('\n');

    // Base64url encode the message
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    try {
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        console.log(`📧 [GMAIL] Email sent successfully! ID: ${response.data.id}`);
        return response.data;
    } catch (error: any) {
        console.error('📧 [GMAIL] Failed to send email:', error.message);
        throw error;
    }
};
