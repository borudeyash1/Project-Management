import { Router, Request, Response } from 'express';
import { getSlackService } from '../services/sartthi/slackService';
import Task from '../models/Task';
import User from '../models/User';
import { ConnectedAccount } from '../models/ConnectedAccount';

const router = Router();

// Slack Event Subscriptions endpoint
router.post('/events', async (req: Request, res: Response) => {
    try {
        const { type, challenge, event, team_id } = req.body;

        // Slack URL verification challenge
        if (type === 'url_verification') {
            return res.json({ challenge });
        }

        // Handle events
        if (type === 'event_callback') {
            // Process event asynchronously to respond quickly to Slack
            processSlackEvent(event, team_id).catch(console.error);
            return res.status(200).send('OK');
        }

        return res.status(400).json({ error: 'Unknown event type' });
    } catch (error) {
        console.error('Slack events error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Slack Interactive Components endpoint (button clicks, etc.)
router.post('/interactions', async (req: Request, res: Response) => {
    try {
        const payload = JSON.parse(req.body.payload);
        const { type, user, actions, team } = payload;

        if (type === 'block_actions') {
            const action = actions[0];

            // Handle task completion
            if (action.action_id === 'task_complete') {
                const taskId = action.value.replace('complete_', '');
                await Task.findByIdAndUpdate(taskId, { status: 'completed' });

                return res.json({
                    text: '✅ Task marked as complete!',
                    replace_original: false
                });
            }

            // Handle add comment (open modal)
            if (action.action_id === 'task_comment') {
                const taskId = action.value.replace('comment_', '');

                return res.json({
                    response_action: 'push',
                    view: {
                        type: 'modal',
                        callback_id: `add_comment_${taskId}`,
                        title: {
                            type: 'plain_text',
                            text: 'Add Comment'
                        },
                        submit: {
                            type: 'plain_text',
                            text: 'Submit'
                        },
                        blocks: [
                            {
                                type: 'input',
                                block_id: 'comment_input',
                                element: {
                                    type: 'plain_text_input',
                                    action_id: 'comment_text',
                                    multiline: true,
                                    placeholder: {
                                        type: 'plain_text',
                                        text: 'Enter your comment...'
                                    }
                                },
                                label: {
                                    type: 'plain_text',
                                    text: 'Comment'
                                }
                            }
                        ]
                    }
                });
            }
        }

        // Handle modal submissions
        if (type === 'view_submission') {
            const callbackId = payload.view.callback_id;

            if (callbackId.startsWith('add_comment_')) {
                const taskId = callbackId.replace('add_comment_', '');
                const commentText = payload.view.state.values.comment_input.comment_text.value;

                // Find user by Slack team ID
                const account = await ConnectedAccount.findOne({
                    service: 'slack',
                    'metadata.team.id': team.id
                });

                if (account) {
                    const user = await User.findById(account.userId);

                    await Task.findByIdAndUpdate(taskId, {
                        $push: {
                            comments: {
                                author: account.userId,
                                content: commentText,
                                createdAt: new Date()
                            }
                        }
                    });
                }

                return res.json({});
            }
        }

        return res.status(200).send('OK');
    } catch (error) {
        console.error('Slack interactions error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Slack Slash Commands endpoint
router.post('/commands', async (req: Request, res: Response) => {
    try {
        const { command, text, user_id, team_id, channel_id } = req.body;

        if (command === '/create-task') {
            // Find user by Slack team ID
            const account = await ConnectedAccount.findOne({
                service: 'slack',
                'metadata.team.id': team_id
            });

            if (!account) {
                return res.json({
                    response_type: 'ephemeral',
                    text: 'Please connect your Slack account in Sartthi Settings first.'
                });
            }

            // Parse task from text (simple format: "Task title | description")
            const [title, description] = text.split('|').map((s: string) => s.trim());

            if (!title) {
                return res.json({
                    response_type: 'ephemeral',
                    text: 'Usage: /create-task Task Title | Optional Description'
                });
            }

            // Create task
            const user = await User.findById(account.userId);
            const task = await Task.create({
                title,
                description: description || '',
                assignee: account.userId,
                project: (user as any)?.currentWorkspace, // Assuming workspace context
                status: 'todo',
                priority: 'medium',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                estimatedHours: 0,
                actualHours: 0,
                progress: 0,
                tags: [],
                subtasks: [],
                comments: [],
                attachments: [],
                links: []
            });

            // Add reaction to original message
            const slackService = getSlackService();
            await slackService.addReaction(account.userId.toString(), channel_id, req.body.message_ts || '', 'white_check_mark');

            return res.json({
                response_type: 'in_channel',
                text: `✅ Task created: *${title}*`,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `✅ Task created: *${title}*\n${description || ''}`
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
                ]
            });
        }

        return res.status(400).json({ error: 'Unknown command' });
    } catch (error) {
        console.error('Slack commands error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Process Slack events asynchronously
async function processSlackEvent(event: any, teamId: string) {
    try {
        const { type, user, channel, text, ts, thread_ts } = event;

        // Find account by team ID
        const account = await ConnectedAccount.findOne({
            service: 'slack',
            'metadata.team.id': teamId
        });

        if (!account) {
            console.log('No account found for team:', teamId);
            return;
        }

        const slackService = getSlackService();

        // Handle message events with specific keywords
        if (type === 'message' && text) {
            // Check for task creation keywords
            if (text.toLowerCase().includes('create task:') || text.toLowerCase().includes('new task:')) {
                const taskTitle = text.replace(/create task:|new task:/i, '').trim();

                if (taskTitle) {
                    const userObj = await User.findById(account.userId);

                    const task = await Task.create({
                        title: taskTitle,
                        description: `Created from Slack message`,
                        assignee: account.userId,
                        project: (userObj as any)?.currentWorkspace,
                        status: 'todo',
                        priority: 'medium',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        estimatedHours: 0,
                        actualHours: 0,
                        progress: 0,
                        tags: ['slack'],
                        subtasks: [],
                        comments: [],
                        attachments: [],
                        links: []
                    });

                    // Add link to original Slack message
                    const permalink = await slackService.getPermalink(account.userId.toString(), channel, ts);
                    await Task.findByIdAndUpdate(task._id, {
                        $push: { links: permalink }
                    });

                    // React to the message
                    await slackService.addReaction(account.userId.toString(), channel, ts, 'white_check_mark');

                    // Post confirmation
                    await slackService.postMessage(
                        account.userId.toString(),
                        channel,
                        `✅ Task created: ${taskTitle}`,
                        [
                            {
                                type: 'section',
                                text: {
                                    type: 'mrkdwn',
                                    text: `Task: *${taskTitle}*`
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
                        ]
                    );
                }
            }
        }

        // Handle reactions (could be used for task status updates)
        if (type === 'reaction_added') {
            const { reaction, item } = event;

            // Example: ✅ reaction marks task as complete
            if (reaction === 'white_check_mark') {
                // Find tasks linked to this message
                const permalink = await slackService.getPermalink(account.userId.toString(), item.channel, item.ts);
                const tasks = await Task.find({ links: permalink });

                for (const task of tasks) {
                    await Task.findByIdAndUpdate(task._id, { status: 'completed' });
                }
            }
        }

    } catch (error) {
        console.error('Error processing Slack event:', error);
    }
}

export default router;
