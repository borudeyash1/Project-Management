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

    // Import models and utilities
    const Task = (await import('../models/Task')).default;
    const Project = (await import('../models/Project')).default;
    const { parseCommitMessage, calculateTitleSimilarity } = await import('../utils/commitParser');

    // Find project linked to this repository
    const project = await Project.findOne({
        'integrations.github.repos.fullName': repo.full_name
    });

    if (!project) {
        console.log(`[GitHub Webhook] No project found for repository ${repo.full_name}`);
        return;
    }

    // Check if auto-sync is enabled for this repo
    const linkedRepo = project.integrations?.github?.repos?.find(
        (r: any) => r.fullName === repo.full_name
    );

    if (!linkedRepo?.autoSyncTasks) {
        console.log(`[GitHub Webhook] Auto-sync disabled for ${repo.full_name}`);
        return;
    }

    // Update last webhook event timestamp
    linkedRepo.lastWebhookEvent = new Date();
    await project.save();

    // Process each commit
    for (const commit of commits) {
        try {
            await processCommitForTasks(commit, repo, project._id.toString(), Task, parseCommitMessage, calculateTitleSimilarity);
        } catch (error) {
            console.error(`[GitHub Webhook] Error processing commit ${commit.id}:`, error);
        }
    }
}

/**
 * Process a commit and link/update tasks
 */
async function processCommitForTasks(
    commit: any,
    repo: any,
    projectId: string,
    Task: any,
    parseCommitMessage: any,
    calculateTitleSimilarity: any
) {
    const message = commit.message;
    const parsed = parseCommitMessage(message);

    console.log(`[GitHub] Processing commit ${commit.id.substring(0, 7)}: "${message}"`);
    console.log(`[GitHub] Found ${parsed.taskReferences.length} task references, suggested status: ${parsed.suggestedStatus || 'none'}`);

    // Find tasks by direct reference
    const tasksToUpdate: any[] = [];

    for (const ref of parsed.taskReferences) {
        const task = await Task.findOne({
            project: projectId,
            $or: [
                { _id: ref.taskId },
                { customId: ref.taskId }
            ]
        });

        if (task) {
            tasksToUpdate.push({ task, confidence: 1.0, matchType: 'direct' });
            console.log(`[GitHub] Direct match: ${ref.taskId} -> Task ${task._id}`);
        }
    }

    // If no direct matches and we have title keywords, try fuzzy matching
    if (tasksToUpdate.length === 0 && parsed.titleKeywords.length > 0) {
        const projectTasks = await Task.find({
            project: projectId,
            status: { $nin: ['completed', 'done', 'verified'] } // Only match incomplete tasks
        }).limit(50); // Limit to prevent performance issues

        for (const task of projectTasks) {
            const similarity = calculateTitleSimilarity(parsed.titleKeywords, task.title);
            if (similarity >= 0.6) { // 60% similarity threshold
                tasksToUpdate.push({ task, confidence: similarity, matchType: 'fuzzy' });
                console.log(`[GitHub] Fuzzy match: "${task.title}" (${Math.round(similarity * 100)}% confidence)`);
            }
        }

        // Sort by confidence and take top match only for fuzzy matches
        if (tasksToUpdate.length > 0) {
            tasksToUpdate.sort((a, b) => b.confidence - a.confidence);
            tasksToUpdate.splice(1); // Keep only the best match
        }
    }

    // Update matched tasks
    for (const { task, confidence, matchType } of tasksToUpdate) {
        await updateTaskFromCommit(task, commit, repo, parsed, confidence, matchType);
    }

    if (tasksToUpdate.length === 0) {
        console.log(`[GitHub] No matching tasks found for commit ${commit.id.substring(0, 7)}`);
    }
}

/**
 * Update a task based on commit information
 */
async function updateTaskFromCommit(
    task: any,
    commit: any,
    repo: any,
    parsed: any,
    confidence: number,
    matchType: string
) {
    let updated = false;

    // Link commit to task (if not already linked)
    const existingCommit = task.commits?.find((c: any) => c.sha === commit.id);
    if (!existingCommit) {
        task.commits = task.commits || [];
        task.commits.push({
            sha: commit.id,
            message: commit.message,
            author: commit.author?.username || commit.author?.name || 'Unknown',
            url: commit.url,
            timestamp: new Date(commit.timestamp),
            repo: repo.full_name,
            autoLinked: true
        });
        updated = true;
        console.log(`[GitHub] Linked commit ${commit.id.substring(0, 7)} to task ${task._id}`);
    }

    // Update task status based on keywords (only for high-confidence matches)
    if (parsed.suggestedStatus && confidence >= 0.7) {
        const statusMap: Record<string, string> = {
            'completed': 'completed',
            'in-progress': 'in-progress',
            'testing': 'review', // Map testing to review status
            'review': 'review'
        };

        const newStatus = statusMap[parsed.suggestedStatus];
        if (newStatus && task.status !== newStatus && task.status !== 'completed' && task.status !== 'done') {
            const oldStatus = task.status;
            task.status = newStatus;

            if (newStatus === 'completed') {
                task.completedDate = new Date();
                task.progress = 100;
            }

            updated = true;
            console.log(`[GitHub] Updated task ${task._id} status: ${oldStatus} -> ${newStatus} (${matchType} match, ${Math.round(confidence * 100)}% confidence)`);
        }
    }

    if (updated) {
        await task.save();
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
