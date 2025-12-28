import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';

const SLACK_API_URL = 'https://slack.com/api';

export const getSlackService = () => {
    const getHeaders = (token: string) => ({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });

    const getAccessToken = async (userId: string, accountId?: string) => {
        let query: any = {
            userId,
            service: 'slack'
        };

        if (accountId) {
            query._id = accountId;
        } else {
            query.isActive = true;
        }

        const account = await ConnectedAccount.findOne(query);

        if (!account || !account.accessToken) {
            throw new Error('Slack account not connected');
        }

        return account.accessToken;
    };

    const getChannels = async (userId: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.get(`${SLACK_API_URL}/conversations.list`, {
                headers: getHeaders(token),
                params: {
                    types: 'public_channel,private_channel',
                    exclude_archived: true,
                    limit: 100
                }
            });

            if (!response.data.ok) {
                throw new Error(response.data.error || 'Failed to fetch channels');
            }

            return response.data.channels.map((ch: any) => ({
                id: ch.id,
                name: ch.name,
                isPrivate: ch.is_private
            }));
        } catch (error: any) {
            console.error('Slack getChannels error:', error.response?.data || error.message);
            throw error;
        }
    };

    const postMessage = async (userId: string, channelId: string, text: string, blocks?: any[], accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.post(`${SLACK_API_URL}/chat.postMessage`, {
                channel: channelId,
                text,
                blocks
            }, {
                headers: getHeaders(token)
            });

            if (!response.data.ok) {
                throw new Error(response.data.error || 'Failed to post message');
            }

            return response.data;
        } catch (error: any) {
            console.error('Slack postMessage error:', error.response?.data || error.message);
            throw error;
        }
    };

    // New: Post interactive message with buttons
    const postInteractiveMessage = async (
        userId: string,
        channelId: string,
        task: any,
        accountId?: string
    ) => {
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '📋 New Task Created',
                    emoji: true
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${task.title}*\n${task.description || '_No description provided_'}`
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
                        text: `📊 *Status*\n${task.status.charAt(0).toUpperCase() + task.status.slice(1)}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `⚡ *Priority*\n${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `👤 *Assignee*\n${task.assignee?.fullName || task.assignee?.name || 'Unassigned'}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `📅 *Due Date*\n${task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}`
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
                            text: '✅ Mark Complete',
                            emoji: true
                        },
                        style: 'primary',
                        value: `complete_${task._id}`,
                        action_id: 'task_complete'
                    },
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: '💬 Add Comment',
                            emoji: true
                        },
                        value: `comment_${task._id}`,
                        action_id: 'task_comment'
                    },
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'View in Sartthi →',
                            emoji: true
                        },
                        url: `${process.env.CLIENT_URL}/tasks/${task._id}`,
                        action_id: 'task_view'
                    }
                ]
            }
        ];

        return postMessage(userId, channelId, `📋 New Task: ${task.title}`, blocks, accountId);
    };

    // New: Get user info
    const getUserInfo = async (userId: string, slackUserId: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.get(`${SLACK_API_URL}/users.info`, {
                headers: getHeaders(token),
                params: { user: slackUserId }
            });

            if (!response.data.ok) {
                throw new Error(response.data.error || 'Failed to fetch user info');
            }

            return {
                id: response.data.user.id,
                name: response.data.user.real_name || response.data.user.name,
                email: response.data.user.profile.email,
                avatar: response.data.user.profile.image_72
            };
        } catch (error: any) {
            console.error('Slack getUserInfo error:', error.response?.data || error.message);
            throw error;
        }
    };

    // New: Get message permalink
    const getPermalink = async (userId: string, channelId: string, messageTs: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.get(`${SLACK_API_URL}/chat.getPermalink`, {
                headers: getHeaders(token),
                params: {
                    channel: channelId,
                    message_ts: messageTs
                }
            });

            if (!response.data.ok) {
                throw new Error(response.data.error || 'Failed to get permalink');
            }

            return response.data.permalink;
        } catch (error: any) {
            console.error('Slack getPermalink error:', error.response?.data || error.message);
            throw error;
        }
    };

    // New: Add reaction to message
    const addReaction = async (userId: string, channelId: string, messageTs: string, emoji: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.post(`${SLACK_API_URL}/reactions.add`, {
                channel: channelId,
                timestamp: messageTs,
                name: emoji
            }, {
                headers: getHeaders(token)
            });

            if (!response.data.ok) {
                throw new Error(response.data.error || 'Failed to add reaction');
            }

            return response.data;
        } catch (error: any) {
            console.error('Slack addReaction error:', error.response?.data || error.message);
            throw error;
        }
    };

    // New: Get thread messages
    const getThreadMessages = async (userId: string, channelId: string, threadTs: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.get(`${SLACK_API_URL}/conversations.replies`, {
                headers: getHeaders(token),
                params: {
                    channel: channelId,
                    ts: threadTs
                }
            });

            if (!response.data.ok) {
                throw new Error(response.data.error || 'Failed to fetch thread messages');
            }

            return response.data.messages;
        } catch (error: any) {
            console.error('Slack getThreadMessages error:', error.response?.data || error.message);
            throw error;
        }
    };

    // New: Get channel history
    const getChannelHistory = async (userId: string, channelId: string, limit: number = 50, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            console.log('[SlackService] Fetching history for channel:', channelId, 'with limit:', limit);
            const response = await axios.get(`${SLACK_API_URL}/conversations.history`, {
                headers: getHeaders(token),
                params: {
                    channel: channelId,
                    limit
                }
            });

            console.log('[SlackService] Slack API response:', {
                ok: response.data.ok,
                error: response.data.error,
                messages_count: response.data.messages?.length || 0,
                response_keys: Object.keys(response.data)
            });

            if (!response.data.ok) {
                console.error('[SlackService] Slack API error:', response.data.error);
                throw new Error(response.data.error || 'Failed to fetch channel history');
            }

            // We might want to reverse it so oldest is first for chat UI, or keep as is (newest first)
            return response.data;
        } catch (error: any) {
            console.error('Slack getChannelHistory error:', error.response?.data || error.message);
            throw error;
        }
    };

    return {
        getChannels,
        postMessage,
        postInteractiveMessage,
        getUserInfo,
        getPermalink,
        addReaction,
        getThreadMessages,
        getChannelHistory
    };
};
