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
 * @param task - The completed task
 * @param userId - ID of the user who completed the task
 */
export async function notifySlackTaskCompleted(task: any, userId: string) {
    const slackService = getSlackService();

    try {
        // Notify the task reporter if they have Slack connected
        if (task.reporter && task.reporter.toString() !== userId.toString()) {
            const reporterSlackAccount = await ConnectedAccount.findOne({
                userId: task.reporter,
                service: 'slack',
                isActive: true
            });

            if (reporterSlackAccount) {
                const slackUserId = (reporterSlackAccount as any).metadata?.user?.id;
                const completedBy = await User.findById(userId);

                if (slackUserId) {
                    const blocks = [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `✅ *Task Completed: ${task.title}*\nCompleted by: ${(completedBy as any)?.name || 'Unknown'}`
                            }
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'button',
                                    text: {
                                        type: 'plain_text',
                                        text: 'View in Sartthi'
                                    },
                                    url: `${process.env.CLIENT_URL}/tasks/${task._id}`
                                }
                            ]
                        }
                    ];

                    await slackService.postMessage(
                        task.reporter.toString(),
                        slackUserId,
                        `Task completed: ${task.title}`,
                        blocks
                    );
                }
            }
        }
    } catch (error) {
        console.error('Failed to send task completion notification:', error);
    }
}

/**
 * Send Slack notification when task is updated
 * @param task - The updated task
 * @param userId - ID of the user who updated the task
 * @param changes - Description of what changed
 */
export async function notifySlackTaskUpdated(
    task: any,
    userId: string,
    changes: string
) {
    const slackService = getSlackService();

    try {
        // Notify assignee if they have Slack connected and they're not the one who updated
        if (task.assignee && task.assignee.toString() !== userId.toString()) {
            const assigneeSlackAccount = await ConnectedAccount.findOne({
                userId: task.assignee,
                service: 'slack',
                isActive: true
            });

            if (assigneeSlackAccount) {
                const slackUserId = (assigneeSlackAccount as any).metadata?.user?.id;
                const updatedBy = await User.findById(userId);

                if (slackUserId) {
                    const blocks = [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `📝 *Task Updated: ${task.title}*\nUpdated by: ${(updatedBy as any)?.name || 'Unknown'}\nChanges: ${changes}`
                            }
                        },
                        {
                            type: 'section',
                            fields: [
                                {
                                    type: 'mrkdwn',
                                    text: `*Status:*\n${task.status}`
                                },
                                {
                                    type: 'mrkdwn',
                                    text: `*Priority:*\n${task.priority}`
                                }
                            ]
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'button',
                                    text: {
                                        type: 'plain_text',
                                        text: 'View in Sartthi'
                                    },
                                    url: `${process.env.CLIENT_URL}/tasks/${task._id}`
                                }
                            ]
                        }
                    ];

                    await slackService.postMessage(
                        task.assignee.toString(),
                        slackUserId,
                        `Task updated: ${task.title}`,
                        blocks
                    );
                }
            }
        }
    } catch (error) {
        console.error('Failed to send task update notification:', error);
    }
}
