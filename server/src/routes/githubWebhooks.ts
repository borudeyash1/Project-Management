import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

// Rate limiting for webhooks
const webhookLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // limit each IP to 1000 requests per hour
    message: 'Too many webhook requests from this IP'
});

// Verify GitHub webhook signature
const verifyGitHubSignature = (req: Request): boolean => {
    const signature = req.headers['x-hub-signature-256'] as string;
    if (!signature) {
        return false;
    }

    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
        console.error('GITHUB_WEBHOOK_SECRET is not configured');
        return false;
    }

    const payload = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(digest)
    );
};

// Main webhook endpoint
router.post('/webhooks', webhookLimiter, async (req: Request, res: Response) => {
    try {
        // Verify signature
        if (!verifyGitHubSignature(req)) {
            console.warn('Invalid GitHub webhook signature');
            return res.status(401).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        const event = req.headers['x-github-event'] as string;
        const deliveryId = req.headers['x-github-delivery'] as string;
        const payload = req.body;

        console.log(`[GitHub Webhook] Received ${event} event (${deliveryId})`);

        // Handle ping event
        if (event === 'ping') {
            console.log('[GitHub Webhook] Ping received');
            return res.status(200).json({
                success: true,
                message: 'Pong! Webhook is configured correctly'
            });
        }

        // Route to appropriate handler based on event type
        switch (event) {
            case 'pull_request':
                await handlePullRequestEvent(payload);
                break;
            case 'pull_request_review':
                await handlePullRequestReviewEvent(payload);
                break;
            case 'pull_request_review_comment':
                await handlePullRequestReviewCommentEvent(payload);
                break;
            case 'issues':
                await handleIssuesEvent(payload);
                break;
            case 'issue_comment':
                await handleIssueCommentEvent(payload);
                break;
            case 'push':
                await handlePushEvent(payload);
                break;
            case 'release':
                await handleReleaseEvent(payload);
                break;
            default:
                console.log(`[GitHub Webhook] Unhandled event type: ${event}`);
        }

        // Always return 200 to acknowledge receipt
        res.status(200).json({
            success: true,
            message: 'Webhook processed'
        });

    } catch (error: any) {
        console.error('[GitHub Webhook] Error processing webhook:', error);
        // Still return 200 to prevent GitHub from retrying
        res.status(200).json({
            success: false,
            message: 'Error processing webhook',
            error: error.message
        });
    }
});

// Event handlers (to be implemented in Phase 2)
async function handlePullRequestEvent(payload: any) {
    const action = payload.action;
    const pr = payload.pull_request;
    const repo = payload.repository;

    console.log(`[GitHub Webhook] PR ${action}: ${repo.full_name}#${pr.number}`);

    // TODO: Implement in Phase 2
    // - opened: Create task
    // - closed + merged: Complete task
    // - closed + not merged: Cancel task
    // - reopened: Reopen task
    // - review_requested: Create reminder
}

async function handlePullRequestReviewEvent(payload: any) {
    const action = payload.action;
    const review = payload.review;
    const pr = payload.pull_request;

    console.log(`[GitHub Webhook] PR Review ${action}: ${review.state}`);

    // TODO: Implement in Phase 2
    // - submitted: Notify task owner
    // - approved: Add comment to task
    // - changes_requested: Update task priority
}

async function handlePullRequestReviewCommentEvent(payload: any) {
    const action = payload.action;
    const comment = payload.comment;

    console.log(`[GitHub Webhook] PR Review Comment ${action}`);

    // TODO: Implement in Phase 2
    // - created: Add comment to task
}

async function handleIssuesEvent(payload: any) {
    const action = payload.action;
    const issue = payload.issue;
    const repo = payload.repository;

    console.log(`[GitHub Webhook] Issue ${action}: ${repo.full_name}#${issue.number}`);

    // TODO: Implement in Phase 2
    // - opened: Create task
    // - closed: Complete task
    // - reopened: Reopen task
}

async function handleIssueCommentEvent(payload: any) {
    const action = payload.action;
    const comment = payload.comment;

    console.log(`[GitHub Webhook] Issue Comment ${action}`);

    // TODO: Implement in Phase 2
    // - created: Add comment to task
}

async function handlePushEvent(payload: any) {
    const ref = payload.ref;
    const commits = payload.commits;
    const repo = payload.repository;

    console.log(`[GitHub Webhook] Push to ${repo.full_name}:${ref} (${commits.length} commits)`);

    // TODO: Implement in Phase 2
    // - Track commits for linked tasks
    // - Update task progress
}

async function handleReleaseEvent(payload: any) {
    const action = payload.action;
    const release = payload.release;
    const repo = payload.repository;

    console.log(`[GitHub Webhook] Release ${action}: ${repo.full_name} ${release.tag_name}`);

    // TODO: Implement in Phase 2
    // - published: Mark milestone complete
    // - Notify team
}

export default router;
