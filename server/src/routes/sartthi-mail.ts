import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { listEmails, getGmailClient } from '../services/gmailService';

const router = express.Router();

/**
 * GET /api/mail/messages
 * Fetch recent emails from Gmail
 */
router.get('/messages', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const messages = await listEmails(userId);

        res.json({
            success: true,
            data: messages
        });
    } catch (error: any) {
        console.error('Fetch Emails Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch emails',
            error: error.message
        });
    }
});

/**
 * POST /api/mail/send
 * Send a new email
 */
router.post('/send', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { to, subject, body, cc, bcc } = req.body;

        const gmail = await getGmailClient(userId);

        // Create email message
        const message = [
            `To: ${to}`,
            cc ? `Cc: ${cc}` : '',
            bcc ? `Bcc: ${bcc}` : '',
            `Subject: ${subject}`,
            '',
            body
        ].filter(Boolean).join('\n');

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        res.json({
            success: true,
            message: 'Email sent successfully'
        });
    } catch (error: any) {
        console.error('Send Email Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

/**
 * POST /api/mail/reply
 * Reply to an email
 */
router.post('/reply', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { messageId, threadId, to, subject, body } = req.body;

        const gmail = await getGmailClient(userId);

        const message = [
            `To: ${to}`,
            `Subject: Re: ${subject}`,
            `In-Reply-To: ${messageId}`,
            `References: ${messageId}`,
            '',
            body
        ].join('\n');

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
                threadId: threadId
            }
        });

        res.json({
            success: true,
            message: 'Reply sent successfully'
        });
    } catch (error: any) {
        console.error('Reply Email Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send reply',
            error: error.message
        });
    }
});

/**
 * POST /api/mail/mark-read
 * Mark email as read/unread
 */
router.post('/mark-read', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { messageId, read } = req.body;

        const gmail = await getGmailClient(userId);

        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: read ? ['UNREAD'] : [],
                addLabelIds: read ? [] : ['UNREAD']
            }
        });

        res.json({
            success: true,
            message: `Email marked as ${read ? 'read' : 'unread'}`
        });
    } catch (error: any) {
        console.error('Mark Read Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update email',
            error: error.message
        });
    }
});

/**
 * POST /api/mail/star
 * Star/unstar an email
 */
router.post('/star', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { messageId, starred } = req.body;

        const gmail = await getGmailClient(userId);

        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: starred ? [] : ['STARRED'],
                addLabelIds: starred ? ['STARRED'] : []
            }
        });

        res.json({
            success: true,
            message: `Email ${starred ? 'starred' : 'unstarred'}`
        });
    } catch (error: any) {
        console.error('Star Email Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to star email',
            error: error.message
        });
    }
});

/**
 * POST /api/mail/archive
 * Archive an email (remove from inbox)
 */
router.post('/archive', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { messageId } = req.body;

        const gmail = await getGmailClient(userId);

        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['INBOX']
            }
        });

        res.json({
            success: true,
            message: 'Email archived'
        });
    } catch (error: any) {
        console.error('Archive Email Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to archive email',
            error: error.message
        });
    }
});

/**
 * DELETE /api/mail/delete
 * Move email to trash
 */
router.delete('/delete', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { messageId } = req.body;

        const gmail = await getGmailClient(userId);

        await gmail.users.messages.trash({
            userId: 'me',
            id: messageId
        });

        res.json({
            success: true,
            message: 'Email moved to trash'
        });
    } catch (error: any) {
        console.error('Delete Email Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete email',
            error: error.message
        });
    }
});

export default router;
