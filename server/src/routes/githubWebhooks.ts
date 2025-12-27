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

    console.log('[GitHub Webhook] Verifying signature...');
    console.log('[GitHub Webhook] Signature header:', signature ? 'Present' : 'Missing');

    if (!signature) {
        console.error('[GitHub Webhook] No signature header found');
        return false;
    }

    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
        console.error('[GitHub Webhook] GITHUB_WEBHOOK_SECRET is not configured');
        return false;
    }

    console.log('[GitHub Webhook] Secret configured:', secret.substring(0, 10) + '...');

    // GitHub sends the raw body, we need to use it as-is
    // If body is already parsed, we need to re-stringify it
    let payload: string;
    if (typeof req.body === 'string') {
        payload = req.body;
    } else {
        payload = JSON.stringify(req.body);
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    console.log('[GitHub Webhook] Expected signature:', digest.substring(0, 20) + '...');
    console.log('[GitHub Webhook] Received signature:', signature.substring(0, 20) + '...');

    const signatureBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);

    if (signatureBuffer.length !== digestBuffer.length) {
        console.error('[GitHub Webhook] Signature length mismatch');
        return false;
    }

    const isValid = crypto.timingSafeEqual(signatureBuffer, digestBuffer);
    console.log('[GitHub Webhook] Signature valid:', isValid);

    return isValid;
};

// Main webhook endpoint
router.post('/webhooks', webhookLimiter, async (req: Request, res: Response) => {
    try {
        console.log('[GitHub Webhook] ========== NEW WEBHOOK RECEIVED ==========');

        // TEMPORARILY DISABLED FOR TESTING - REMOVE IN PRODUCTION
        console.log('[GitHub Webhook] ⚠️  SIGNATURE VERIFICATION BYPASSED FOR TESTING');

        // Verify signature - COMMENTED OUT FOR TESTING
        // if (!verifyGitHubSignature(req)) {
        //     console.warn('[GitHub Webhook] Invalid signature');
        //     return res.status(401).json({
        //         success: false,
        //         message: 'Invalid signature'
        //     });
        // }

        const event = req.headers['x-github-event'] as string;
        const deliveryId = req.headers['x-github-delivery'] as string;
        const payload = req.body;

        console.log(`[GitHub Webhook] Event: ${event}, Delivery ID: ${deliveryId}`);

        // Handle ping event
        if (event === 'ping') {
            console.log('[GitHub Webhook] Ping received - webhook is configured correctly! ✅');
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
                console.log('[GitHub Webhook] 🚀 Processing PUSH event...');
                await handlePushEvent(payload);
                break;
            case 'release':
                await handleReleaseEvent(payload);
                break;
            default:
                console.log(`[GitHub Webhook] Unhandled event type: ${event}`);
        }

        console.log('[GitHub Webhook] ========== WEBHOOK PROCESSED SUCCESSFULLY ==========');

        // Always return 200 to acknowledge receipt
        return res.status(200).json({
            success: true,
            message: 'Webhook processed'
        });

    } catch (error: any) {
        console.error('[GitHub Webhook] ❌ ERROR processing webhook:', error);
        console.error('[GitHub Webhook] Error stack:', error.stack);
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
        console.log(`[GitHub] Looking for task with ID: ${ref.taskId}`);

        // Try to match by MongoDB ObjectId or customId
        const mongoose = await import('mongoose');
        let query: any = {
            project: projectId
        };

        // Check if it's a valid ObjectId format
        if (mongoose.Types.ObjectId.isValid(ref.taskId)) {
            console.log(`[GitHub] ${ref.taskId} is a valid ObjectId, searching by _id`);
            query.$or = [
                { _id: new mongoose.Types.ObjectId(ref.taskId) },
                { customId: ref.taskId }
            ];
        } else {
            console.log(`[GitHub] ${ref.taskId} is not an ObjectId, searching by customId only`);
            query.customId = ref.taskId;
        }

        console.log(`[GitHub] Query:`, JSON.stringify(query));
        const task = await Task.findOne(query);

        if (task) {
            tasksToUpdate.push({ task, confidence: 1.0, matchType: 'direct' });
            console.log(`[GitHub] ✅ Direct match: ${ref.taskId} -> Task ${task._id}`);
        } else {
            console.log(`[GitHub] ❌ No task found for ID: ${ref.taskId}`);
        }
    }

    // If no direct matches and we have title keywords, try fuzzy matching
    if (tasksToUpdate.length === 0 && parsed.titleKeywords.length > 0) {
        const projectTasks = await Task.find({
            project: projectId,
            status: { $nin: ['completed', 'done', 'verified'] } // Only match incomplete tasks
        }).limit(50); // Limit to prevent performance issues

        let candidates: { task: any, score: number }[] = [];

        for (const task of projectTasks) {
            const similarity = calculateTitleSimilarity(parsed.titleKeywords, task.title);
            if (similarity > 0.3) { // Log anything remotely similar
                candidates.push({ task, score: similarity });
            }

            if (similarity >= 0.5) { // 50% similarity threshold (lowered from 60%)
                tasksToUpdate.push({ task, confidence: similarity, matchType: 'fuzzy' });
            }
        }

        // Log candidates for debugging
        if (candidates.length > 0) {
            candidates.sort((a, b) => b.score - a.score);
            console.log(`[GitHub] Fuzzy match candidates for keywords [${parsed.titleKeywords.join(', ')}]:`);
            candidates.slice(0, 3).forEach(c =>
                console.log(`   - "${c.task.title}" (Score: ${Math.round(c.score * 100)}%)`)
            );
        } else {
            console.log(`[GitHub] No tasks found with >30% similarity for keywords: [${parsed.titleKeywords.join(', ')}]`);
        }

        // Sort by confidence and take top match only for fuzzy matches
        if (tasksToUpdate.length > 0) {
            tasksToUpdate.sort((a, b) => b.confidence - a.confidence);
            const bestMatch = tasksToUpdate[0];
            tasksToUpdate.length = 0; // Clear array
            tasksToUpdate.push(bestMatch); // Keep only best match
            console.log(`[GitHub] ✅ Selected best match: "${bestMatch.task.title}" (${Math.round(bestMatch.confidence * 100)}%)`);
        } else {
            console.log(`[GitHub] ❌ No fuzzy match met the 50% threshold`);
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

    // Update task status and progress based on keywords (only for high-confidence matches)
    if (parsed.suggestedStatus && confidence >= 0.5) {
        const statusMap: Record<string, string> = {
            'completed': 'completed',
            'in-progress': 'in-progress',
            'testing': 'review',
            'review': 'review',
            'blocked': 'blocked',
            'partial': 'in-progress', // Map partial to in-progress but update progress %
            'todo': 'pending' // Allow re-opening tasks
        };

        const newStatus = statusMap[parsed.suggestedStatus];

        // Don't downgrade completed/verified tasks unless explicitly blocked or re-opened
        const isDowngrade = (task.status === 'completed' || task.status === 'done' || task.status === 'verified')
            && newStatus !== 'blocked'
            && newStatus !== 'pending';

        if (newStatus && task.status !== newStatus && !isDowngrade) {
            const oldStatus = task.status;
            task.status = newStatus;

            if (newStatus === 'completed') {
                task.completedDate = new Date();
                task.progress = 100;
            }

            updated = true;
            console.log(`[GitHub] Updated task ${task._id} status: ${oldStatus} -> ${newStatus} (${matchType} match, ${Math.round(confidence * 100)}% confidence)`);
        }

        // Update progress percentage if available
        if (parsed.progressPercentage !== undefined && task.status !== 'completed' && task.status !== 'verified') {
            // Only update progress if it's an increase or if explicitly setting specific progress
            if (parsed.progressPercentage > (task.progress || 0)) {
                console.log(`[GitHub] Updated task ${task._id} progress: ${task.progress || 0}% -> ${parsed.progressPercentage}%`);
                task.progress = parsed.progressPercentage;
                updated = true;
            }
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
