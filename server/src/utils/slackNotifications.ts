import { getSlackService } from '../services/sartthi/slackService';
import { ConnectedAccount } from '../models/ConnectedAccount';
import User from '../models/User';

/**
 * Send interactive Slack notification for a task
 * @param task - The task object
 * @param userId - ID of the user triggering the notification
 * @param channelId - Optional specific channel to notify
 * @param accountId - Optional specific Slack account to use
 */
export async function notifySlackForTask(
    task: any,
    userId: string,
    channelId?: string,
    accountId?: string
) {
    const slackService = getSlackService();

    try {
        // Populate assignee if needed
        const assignee = task.assignee ? await User.findById(task.assignee) : null;

        const taskData = {
            _id: task._id,
            title: task.title,
            description: task.description || 'No description',
            status: task.status,
            priority: task.priority,
            assignee,
            dueDate: task.dueDate
        };

        // 1. Send to specified channel if provided
        if (channelId) {
            await slackService.postInteractiveMessage(
                userId,
                channelId,
                taskData,
                accountId
            );
        }

        // 2. Auto-notify assignee via DM if they have Slack connected
        // and they're not the one who created/updated the task
        if (task.assignee && task.assignee.toString() !== userId.toString()) {
            const assigneeSlackAccount = await ConnectedAccount.findOne({
                userId: task.assignee,
                service: 'slack',
                isActive: true
            });

            if (assigneeSlackAccount) {
                const slackUserId = (assigneeSlackAccount as any).metadata?.user?.id;
                if (slackUserId) {
                    await slackService.postInteractiveMessage(
                        task.assignee.toString(),
                        slackUserId, // DM to user
                        taskData
                    );
                }
            }
        }
    } catch (error) {
        console.error('Failed to send Slack notification:', error);
    }
}

/**
 * Send Slack notification when task is completed
 */
export async function notifySlackTaskCompleted(task: any, userId: string) {
    const slackService = getSlackService();

    try {
        // Get user's connected Slack account
        const slackAccount = await ConnectedAccount.findOne({
            userId,
            service: 'slack',
            isActive: true
        });

        if (!slackAccount) return;

        const slackUserId = (slackAccount as any).metadata?.user?.id;
        if (!slackUserId) return;

        const message = `✅ Task completed: *${task.title}*`;
        const blocks = [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: message
                }
            }
        ];

        await slackService.postMessage(
            userId,
            slackUserId,
            message,
            blocks
        );
    } catch (error) {
        console.error('Failed to send task completion notification:', error);
    }
}

/**
 * Send Slack notification when task is updated
 */
export async function notifySlackTaskUpdated(task: any, userId: string, changes: string) {
    const slackService = getSlackService();

    try {
        // Get task assignee's Slack account
        if (!task.assignee || task.assignee.toString() === userId.toString()) {
            return; // Don't notify if no assignee or if assignee is the one making changes
        }

        const slackAccount = await ConnectedAccount.findOne({
            userId: task.assignee,
            service: 'slack',
            isActive: true
        });

        if (!slackAccount) return;

        const slackUserId = (slackAccount as any).metadata?.user?.id;
        if (!slackUserId) return;

        const message = `📝 Task updated: *${task.title}*\nChanges: ${changes}`;
        const blocks = [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: message
                }
            }
        ];

        await slackService.postMessage(
            task.assignee.toString(),
            slackUserId,
            message,
            blocks
        );
    } catch (error) {
        console.error('Failed to send task update notification:', error);
    }
}

/**
 * Send Slack notification for a reminder
 */
export async function notifySlackForReminder(
    reminder: any,
    userId: string,
    channelId?: string
) {
    const slackService = getSlackService();

    try {
        if (!channelId) return;

        const message = `🔔 *Reminder: ${reminder.title}*`;
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '🔔 New Reminder',
                    emoji: true
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${reminder.title}*\n${reminder.description || '_No description_'}`
                }
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `📅 *Due Date*\n${new Date(reminder.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `⚡ *Priority*\n${reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `📋 *Type*\n${reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}`
                    }
                ]
            }
        ];

        await slackService.postMessage(
            userId,
            channelId,
            message,
            blocks
        );
    } catch (error) {
        console.error('Failed to send reminder Slack notification:', error);
    }
}

/**
 * Send Slack notification for a goal
 */
export async function notifySlackForGoal(
    goal: any,
    userId: string,
    channelId?: string
) {
    const slackService = getSlackService();

    try {
        if (!channelId) return;

        const message = `🎯 *Goal: ${goal.title}*`;
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '🎯 New Goal Created',
                    emoji: true
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${goal.title}*\n${goal.description || '_No description_'}`
                }
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `📊 *Progress*\n${goal.progress}%`
                    },
                    {
                        type: 'mrkdwn',
                        text: `⚡ *Priority*\n${goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `📅 *Target Date*\n${new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `🏷️ *Category*\n${goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}`
                    }
                ]
            }
        ];

        await slackService.postMessage(
            userId,
            channelId,
            message,
            blocks
        );
    } catch (error) {
        console.error('Failed to send goal Slack notification:', error);
    }
}

/**
 * Send Slack notification for a planner event
 */
export async function notifySlackForPlannerEvent(
    event: any,
    userId: string,
    channelId?: string
) {
    const slackService = getSlackService();

    try {
        if (!channelId) return;

        const message = `📅 *Event: ${event.title}*`;
        const startDate = new Date(event.start);
        const endDate = event.end ? new Date(event.end) : null;

        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '📅 New Event Scheduled',
                    emoji: true
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${event.title}*\n${event.description || '_No description_'}`
                }
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `🕐 *Start*\n${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                    },
                    {
                        type: 'mrkdwn',
                        text: endDate
                            ? `🕐 *End*\n${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                            : `📌 *All Day*\n${event.allDay ? 'Yes' : 'No'}`
                    }
                ]
            }
        ];

        await slackService.postMessage(
            userId,
            channelId,
            message,
            blocks
        );
    } catch (error) {
        console.error('Failed to send planner event Slack notification:', error);
    }
}
