import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { rateLimit } from 'express-rate-limit';
import {
    handlePREvent as syncPREvent,
    handleReviewEvent as syncReviewEvent,
    handleIssuesEvent as syncIssuesEvent
} from '../services/githubSync';

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

    const signatureBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);

    if (signatureBuffer.length !== digestBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
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
        return res.status(200).json({
            success: true,
            message: 'Webhook processed'
        });

    } catch (error: any) {
        console.error('[GitHub Webhook] Error processing webhook:', error);
        // Still return 200 to prevent GitHub from retrying
        return res.status(200).json({
            success: false,
            message: 'Error processing webhook',
            error: error.message
        });
    }
});



// Event handlers
async function handlePullRequestEvent(payload: any) {
    const action = payload.action;
    const pr = payload.pull_request;
    const repo = payload.repository;

    await syncPREvent(action, pr, repo);
}

async function handlePullRequestReviewEvent(payload: any) {
    const action = payload.action;
    const review = payload.review;
    const pr = payload.pull_request;
    const repo = payload.repository;

    await syncReviewEvent(action, review, pr, repo);
}

async function handlePullRequestReviewCommentEvent(payload: any) {
    // Optional: treating review comments same as reviews or separate
    // For now logging only, can be expanded
    console.log(`[GitHub Webhook] PR Review Comment ${payload.action}`);
}

async function handleIssuesEvent(payload: any) {
    const action = payload.action;
    const issue = payload.issue;
    const repo = payload.repository;

    await syncIssuesEvent(action, issue, repo);
}

async function handleIssueCommentEvent(payload: any) {
    // Optional: sync comments to task
    console.log(`[GitHub Webhook] Issue Comment ${payload.action}`);
}

async function handlePushEvent(payload: any) {
    const ref = payload.ref;
    const commits = payload.commits || [];
    const repo = payload.repository;

    console.log(`[GitHub Webhook] Push to ${repo.full_name}:${ref} (${commits.length} commits)`);

    if (commits.length === 0) return;

    // Import Task model
    const Task = (await import('../models/Task')).default;

    for (const commit of commits) {
        await linkCommitToTask(commit, repo, Task);
    }
}

/**
 * Parse task references from commit message
 * Supports: #TASK-123, TASK-123, #123
 */
function parseTaskReferences(message: string): string[] {
    const refs = new Set<string>();

    // Pattern 1: #TASK-123 or TASK-123
    const taskPattern = /#?([A-Z]+-\d+)/g;
    let match;
    while ((match = taskPattern.exec(message)) !== null) {
        if (match[1]) refs.add(match[1]);
    }

    // Pattern 2: #123 (simple number reference)
    const numberPattern = /#(\d+)/g;
    while ((match = numberPattern.exec(message)) !== null) {
        if (match[1]) refs.add(match[1]);
    }

    return Array.from(refs);
}

/**
 * Parse completion keywords from commit message
 * Supports: fixes #123, closes TASK-456, resolves #789
 */
function parseCompletionKeywords(message: string): string[] {
    const refs = new Set<string>();
    const pattern = /(?:fixes|closes|resolves|completes)\s+#?([A-Z]+-\d+|\d+)/gi;

    let match;
    while ((match = pattern.exec(message)) !== null) {
        if (match[1]) refs.add(match[1]);
    }

    return Array.from(refs);
}

/**
 * Link commit to task based on commit message
 */
async function linkCommitToTask(commit: any, repo: any, Task: any) {
    try {
        const message = commit.message;
        const taskRefs = parseTaskReferences(message);
        const completionRefs = parseCompletionKeywords(message);

        // Link commit to all referenced tasks
        for (const taskRef of taskRefs) {
            const task = await Task.findOne({
                $or: [
                    { _id: taskRef },
                    { customId: taskRef },
                    { title: { $regex: taskRef, $options: 'i' } }
                ]
            });

            if (task) {
                // Check if commit already linked
                const existingCommit = task.commits?.find((c: any) => c.sha === commit.id);

                if (!existingCommit) {
                    task.commits = task.commits || [];
                    task.commits.push({
                        sha: commit.id,
                        message: commit.message,
                        author: commit.author?.username || commit.author?.name || 'Unknown',
                        url: commit.url,
                        timestamp: new Date(commit.timestamp)
                    });

                    await task.save();
                    console.log(`[GitHub] Linked commit ${commit.id.substring(0, 7)} to task ${task._id}`);
                }
            }
        }

        // Auto-complete tasks with completion keywords
        for (const taskRef of completionRefs) {
            const task = await Task.findOne({
                $or: [
                    { _id: taskRef },
                    { customId: taskRef }
                ]
            });

            if (task && task.status !== 'completed' && task.status !== 'done') {
                task.status = 'completed';
                task.completedDate = new Date();
                await task.save();
                console.log(`[GitHub] Auto-completed task ${task._id} via commit keyword`);
            }
        }
    } catch (error) {
        console.error('[GitHub] Error linking commit to task:', error);
    }
}

async function handleReleaseEvent(payload: any) {
    const action = payload.action;
    const release = payload.release;
    const repo = payload.repository;

    console.log(`[GitHub Webhook] Release ${action}: ${repo.full_name} ${release.tag_name}`);
    // Future: Mark milestones complete
}

export default router;
