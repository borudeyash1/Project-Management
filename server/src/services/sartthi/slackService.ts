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

    return {
        getChannels,
        postMessage
    };
};
