import { apiService } from './api';

export interface SlackChannel {
    id: string;
    name: string;
    isPrivate: boolean;
}

export interface SlackMessage {
    type: string;
    user: string;
    text: string;
    ts: string;
    blocks?: any[];
    attachments?: any[];
    reactions?: any[];
}

export const slackService = {
    getChannels: async (): Promise<SlackChannel[]> => {
        const response = await apiService.get('/slack/channels');
        if (response.success) {
            return response.data;
        }
        return [];
    },

    getChannelMessages: async (channelId: string): Promise<SlackMessage[]> => {
        console.log('[SlackService] Fetching messages for channel:', channelId);
        const response = await apiService.get(`/slack/channels/${channelId}/messages`);
        console.log('[SlackService] API response:', response);
        if (response.success) {
            return response.data;
        }
        return [];
    },

    postMessage: async (channelId: string, text: string): Promise<any> => {
        const response = await apiService.post(`/slack/channels/${channelId}/messages`, { text });
        if (response.success) {
            return response.data;
        }
        throw new Error(response.message || 'Failed to send message');
    }
};
