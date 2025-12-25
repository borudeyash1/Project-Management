import Task from '../models/Task';
import Project from '../models/Project';
import User from '../models/User';
import { scheduleReminderTrigger } from './reminderScheduler';

/**
 * GitHub Sync Service
 * Handles bi-directional synchronization between GitHub and Sartthi
 */

interface GitHubPR {
    id: number;
    number: number;
    title: string;
    body: string;
    html_url: string;
    state: 'open' | 'closed';
    merged: boolean;
    user: {
        login: string;
    };
    created_at: string;
    updated_at: string;
    requested_reviewers?: Array<{ login: string }>;
}

interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body: string;
    html_url: string;
    state: 'open' | 'closed';
    user: {
        login: string;
    };
    created_at: string;
    updated_at: string;
}

interface GitHubRepository {
    full_name: string;
    owner: {
        login: string;
    };
    name: string;
}

/**
 * Find Sartthi user by GitHub username
 * Looks for connected GitHub account with matching username
 */
async function findUserByGitHubUsername(githubUsername: string): Promise<string | null> {
    try {
        const user = await User.findOne({
            'connectedAccounts': {
                $elemMatch: {
                    service: 'github',
                    'accountInfo.login': githubUsername
                }
            }
        });
        return user?._id.toString() || null;
    } catch (error) {
        console.error('[GitHub Sync] Error finding user by GitHub username:', error);
        return null;
    }
}

/**
 * Find project linked to a GitHub repository
 */
async function findProjectByRepo(repoFullName: string): Promise<any | null> {
    try {
        const project = await Project.findOne({
            'integrations.github.repos': {
                $elemMatch: {
                    fullName: repoFullName
                }
            }
        });
        return project;
    } catch (error) {
        console.error('[GitHub Sync] Error finding project by repo:', error);
        return null;
    }
}

/**
 * Check if a task already exists for a GitHub PR
 */
async function findTaskByPR(prNumber: number, repoFullName: string): Promise<any | null> {
    try {
        const task = await Task.findOne({
            'githubPr.number': prNumber,
            'githubPr.repo': repoFullName
        });
        return task;
    } catch (error) {
        console.error('[GitHub Sync] Error finding task by PR:', error);
        return null;
    }
}

/**
 * Sync GitHub PR to Sartthi Task
 * Creates or updates a task based on PR data
 */
export async function syncPRToTask(
    pr: GitHubPR,
    repo: GitHubRepository,
    projectId?: string
): Promise<any> {
    try {
        const repoFullName = repo.full_name;

        // Check if project has auto-create enabled for this repo
        const project = projectId
            ? await Project.findById(projectId)
            : await findProjectByRepo(repoFullName);

        if (!project) {
            console.log(`[GitHub Sync] No project linked to ${repoFullName}, skipping`);
            return null;
        }

        // Check if auto-create is enabled
        const linkedRepo = project.integrations?.github?.repos?.find(
            (r: any) => r.fullName === repoFullName
        );

        if (!linkedRepo || !linkedRepo.autoCreateTasks) {
            console.log(`[GitHub Sync] Auto-create disabled for ${repoFullName}, skipping`);
            return null;
        }

        // Check if task already exists
        let task = await findTaskByPR(pr.number, repoFullName);

        // Find assignee by GitHub username
        const assigneeId = await findUserByGitHubUsername(pr.user.login);

        // Determine task status based on PR state
        let taskStatus = 'in-progress';
        if (pr.state === 'closed') {
            taskStatus = pr.merged ? 'completed' : 'cancelled';
        }

        const taskData = {
            title: pr.title,
            description: pr.body || `GitHub PR #${pr.number}`,
            project: project._id,
            workspace: project.workspace,
            assignee: assigneeId,
            reporter: assigneeId || project.createdBy,
            status: taskStatus,
            priority: 'medium',
            tags: ['github', 'pr', repo.name],
            githubPr: {
                id: pr.id,
                number: pr.number,
                title: pr.title,
                url: pr.html_url,
                state: pr.merged ? 'merged' : pr.state,
                repo: repoFullName,
                author: pr.user.login,
                createdAt: new Date(pr.created_at),
                updatedAt: new Date(pr.updated_at),
                syncEnabled: linkedRepo.syncStatus || true
            },
            autoCreated: true,
            autoCreatedFrom: 'github-pr'
        };

        if (task) {
            // Update existing task
            Object.assign(task, taskData);
            await task.save();
            console.log(`[GitHub Sync] Updated task for PR #${pr.number}`);
        } else {
            // Create new task
            task = await Task.create(taskData);
            console.log(`[GitHub Sync] Created task for PR #${pr.number}`);
        }

        return task;
    } catch (error) {
        console.error('[GitHub Sync] Error syncing PR to task:', error);
        throw error;
    }
}

/**
 * Sync task status changes back to GitHub PR
 * Adds comments and labels to PR based on task updates
 */
export async function syncTaskStatusToPR(
    task: any,
    oldStatus: string,
    newStatus: string
): Promise<void> {
    try {
        if (!task.githubPr || !task.githubPr.syncEnabled) {
            return;
        }

        const { getGitHubService } = await import('./sartthi/githubService');
        const githubService = getGitHubService();

        // Find user with GitHub connected
        const user = await User.findById(task.reporter);
        if (!user) return;

        const [owner, repo] = task.githubPr.repo.split('/');
        const prNumber = task.githubPr.number;

        // Add comment based on status change
        let comment = '';
        const labels: string[] = [];

        if (newStatus === 'completed') {
            comment = `✅ Task marked as **completed** in Sartthi!\n\nGreat work on this PR!`;
            labels.push('sartthi:completed');
        } else if (newStatus === 'blocked') {
            comment = `🚫 Task marked as **blocked** in Sartthi.\n\nPlease check for any blockers.`;
            labels.push('blocked');
        } else if (newStatus === 'in-review') {
            comment = `👀 Task is now **in review** in Sartthi.`;
            labels.push('sartthi:in-review');
        }

        // Add comment to PR
        if (comment) {
            try {
                await githubService.addComment(
                    user._id.toString(),
                    owner,
                    repo,
                    prNumber,
                    comment
                );
                console.log(`[GitHub Sync] Added comment to PR #${prNumber}`);
            } catch (error) {
                console.error('[GitHub Sync] Failed to add comment to PR:', error);
            }
        }

        // Add labels to PR
        if (labels.length > 0) {
            try {
                await githubService.addLabel(
                    user._id.toString(),
                    owner,
                    repo,
                    prNumber,
                    labels
                );
                console.log(`[GitHub Sync] Added labels to PR #${prNumber}`);
            } catch (error) {
                console.error('[GitHub Sync] Failed to add labels to PR:', error);
            }
        }

    } catch (error) {
        console.error('[GitHub Sync] Error syncing task status to PR:', error);
    }
}

/**
 * Handle GitHub PR events from webhook
 */
export async function handlePREvent(
    action: string,
    pr: GitHubPR,
    repo: GitHubRepository
): Promise<void> {
    try {
        console.log(`[GitHub Sync] Handling PR ${action}: ${repo.full_name}#${pr.number}`);

        switch (action) {
            case 'opened':
                // Create task for new PR
                await syncPRToTask(pr, repo);
                break;

            case 'closed':
                // Update task status based on merge status
                const task = await findTaskByPR(pr.number, repo.full_name);
                if (task) {
                    task.status = pr.merged ? 'completed' : 'cancelled';
                    if (pr.merged) {
                        task.completedDate = new Date();
                        task.progress = 100;
                    }
                    await task.save();
                    console.log(`[GitHub Sync] Updated task status to ${task.status}`);
                }
                break;

            case 'reopened':
                // Reopen task
                const reopenedTask = await findTaskByPR(pr.number, repo.full_name);
                if (reopenedTask) {
                    reopenedTask.status = 'in-progress';
                    reopenedTask.completedDate = null;
                    await reopenedTask.save();
                    console.log(`[GitHub Sync] Reopened task`);
                }
                break;

            case 'review_requested':
                // Create reminder for reviewer
                if (pr.requested_reviewers && pr.requested_reviewers.length > 0) {
                    for (const reviewer of pr.requested_reviewers) {
                        const reviewerId = await findUserByGitHubUsername(reviewer.login);
                        if (reviewerId) {
                            await createReviewReminder(pr, repo, reviewerId);
                        }
                    }
                }
                break;

            case 'synchronize':
                // PR updated with new commits
                await syncPRToTask(pr, repo);
                break;

            default:
                console.log(`[GitHub Sync] Unhandled PR action: ${action}`);
        }

    } catch (error) {
        console.error('[GitHub Sync] Error handling PR event:', error);
    }
}

/**
 * Create a reminder for PR review
 */
async function createReviewReminder(
    pr: GitHubPR,
    repo: GitHubRepository,
    reviewerId: string
): Promise<void> {
    try {
        // Calculate due date (2 days from now)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 2);

        // Create reminder
        const Reminder = (await import('../models/Reminder')).default;
        await Reminder.create({
            title: `Review PR #${pr.number}: ${pr.title}`,
            description: `You've been requested to review this pull request.\n\n${pr.html_url}`,
            type: 'personal',
            priority: 'high',
            dueDate: dueDate,
            createdBy: reviewerId,
            assignedTo: reviewerId,
            autoCreated: true,
            autoCreatedFrom: 'github-pr'
        });

        console.log(`[GitHub Sync] Created review reminder for user ${reviewerId}`);

        // Schedule notification
        await scheduleReminderTrigger({
            entityType: 'custom',
            entityId: `github-pr-${pr.id}`,
            userIds: [reviewerId],
            triggerType: 'custom',
            triggerTime: new Date(Date.now() + 60000), // 1 minute from now
            payload: {
                message: `👀 Review requested: ${pr.title}`,
                description: `You've been requested to review PR #${pr.number} in ${repo.full_name}`,
                url: pr.html_url,
                notificationType: 'in-app'
            }
        });

    } catch (error) {
        console.error('[GitHub Sync] Error creating review reminder:', error);
    }
}

/**
 * Handle GitHub PR review events
 */
export async function handleReviewEvent(
    action: string,
    review: any,
    pr: GitHubPR,
    repo: GitHubRepository
): Promise<void> {
    try {
        console.log(`[GitHub Sync] Handling review ${action}: ${review.state}`);

        const task = await findTaskByPR(pr.number, repo.full_name);
        if (!task) return;

        switch (action) {
            case 'submitted':
                // Add comment to task
                const reviewComment = `**${review.user.login}** ${review.state === 'approved' ? '✅ approved' : review.state === 'changes_requested' ? '❌ requested changes' : '💬 commented on'} the PR`;

                task.comments.push({
                    content: reviewComment,
                    author: task.reporter, // Use task reporter as fallback
                    createdAt: new Date()
                });

                // Update priority if changes requested
                if (review.state === 'changes_requested' && task.priority !== 'urgent') {
                    task.priority = 'high';
                }

                await task.save();
                console.log(`[GitHub Sync] Added review comment to task`);
                break;

            case 'dismissed':
                // Add dismissal comment
                task.comments.push({
                    content: `Review by **${review.user.login}** was dismissed`,
                    author: task.reporter,
                    createdAt: new Date()
                });
                await task.save();
                break;
        }

    } catch (error) {
        console.error('[GitHub Sync] Error handling review event:', error);
    }
}

/**
 * Sync GitHub Issue to Sartthi Task
 */
export async function syncIssueToTask(
    issue: GitHubIssue,
    repo: GitHubRepository,
    projectId?: string
): Promise<any> {
    try {
        const repoFullName = repo.full_name;

        const project = projectId
            ? await Project.findById(projectId)
            : await findProjectByRepo(repoFullName);

        if (!project) {
            console.log(`[GitHub Sync] No project linked to ${repoFullName}, skipping`);
            return null;
        }

        // Find assignee
        const assigneeId = await findUserByGitHubUsername(issue.user.login);

        const taskData = {
            title: issue.title,
            description: issue.body || `GitHub Issue #${issue.number}`,
            project: project._id,
            workspace: project.workspace,
            assignee: assigneeId,
            reporter: assigneeId || project.createdBy,
            status: issue.state === 'open' ? 'pending' : 'completed',
            priority: 'medium',
            type: 'bug',
            tags: ['github', 'issue', repo.name],
            githubIssue: {
                id: issue.id,
                number: issue.number,
                title: issue.title,
                url: issue.html_url,
                state: issue.state,
                repo: repoFullName,
                syncEnabled: true
            },
            autoCreated: true,
            autoCreatedFrom: 'github-issue'
        };

        const task = await Task.create(taskData);
        console.log(`[GitHub Sync] Created task for issue #${issue.number}`);

        return task;
    } catch (error) {
        console.error('[GitHub Sync] Error syncing issue to task:', error);
        throw error;
    }
}

/**
 * Handle GitHub Issue events
 */
export async function handleIssuesEvent(
    action: string,
    issue: GitHubIssue,
    repo: GitHubRepository
): Promise<void> {
    try {
        console.log(`[GitHub Sync] Handling issue ${action}: ${repo.full_name}#${issue.number}`);

        switch (action) {
            case 'opened':
                await syncIssueToTask(issue, repo);
                break;

            case 'closed':
                const task = await Task.findOne({
                    'githubIssue.number': issue.number,
                    'githubIssue.repo': repo.full_name
                });
                if (task) {
                    task.status = 'completed';
                    task.completedDate = new Date();
                    task.progress = 100;
                    await task.save();
                }
                break;

            case 'reopened':
                const reopenedTask = await Task.findOne({
                    'githubIssue.number': issue.number,
                    'githubIssue.repo': repo.full_name
                });
                if (reopenedTask) {
                    reopenedTask.status = 'pending';
                    reopenedTask.completedDate = null;
                    await reopenedTask.save();
                }
                break;
        }

    } catch (error) {
        console.error('[GitHub Sync] Error handling issue event:', error);
    }
}
