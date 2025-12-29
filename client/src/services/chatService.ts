import api from './api';
import { ChatServer, ChatChannel, ChatMessage, DirectMessage } from '../types/chat';

export const chatService = {
    // ===== SERVERS =====
    async createServer(data: { name: string; workspaceId: string; icon?: string; description?: string }) {
        const response = await api.post('/chat/servers', data);
        return response.data as ChatServer;
    },

    async getServersByWorkspace(workspaceId: string) {
        const response = await api.get(`/chat/servers?workspaceId=${workspaceId}`);
        return response.data as ChatServer[];
    },

    async getAllServers() {
        const response = await api.get('/chat/servers/user/all');
        return response.data as ChatServer[];
    },

    async getServerById(serverId: string) {
        const response = await api.get(`/chat/servers/${serverId}`);
        return response.data as ChatServer;
    },

    async addMemberToServer(serverId: string, userId: string, role: 'admin' | 'member' = 'member') {
        const response = await api.post(`/chat/servers/${serverId}/members`, { userId, role });
        return response.data as ChatServer;
    },

    async removeMemberFromServer(serverId: string, userId: string) {
        const response = await api.delete(`/chat/servers/${serverId}/members/${userId}`);
        return response.data as ChatServer;
    },

    async deleteServer(serverId: string) {
        const response = await api.delete(`/chat/servers/${serverId}`);
        return response.data;
    },

    // ===== CHANNELS =====
    async createChannel(serverId: string, data: { name: string; type: 'text' | 'voice' | 'announcement'; category?: string; topic?: string }) {
        const response = await api.post(`/chat/servers/${serverId}/channels`, data);
        return response.data as ChatChannel;
    },

    async getChannelsByServer(serverId: string) {
        const response = await api.get(`/chat/servers/${serverId}/channels`);
        return response.data as ChatChannel[];
    },

    async deleteChannel(channelId: string) {
        const response = await api.delete(`/chat/channels/${channelId}`);
        return response.data;
    },

    // ===== MESSAGES =====
    async getChannelMessages(channelId: string, limit: number = 50, before?: string) {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (before) params.append('before', before);

        const response = await api.get(`/chat/channels/${channelId}/messages?${params.toString()}`);
        return response.data as ChatMessage[];
    },

    async sendMessage(channelId: string, data: { content: string; attachments?: any[]; mentions?: string[]; replyTo?: string }) {
        const response = await api.post(`/chat/channels/${channelId}/messages`, data);
        return response.data as ChatMessage;
    },

    async editMessage(messageId: string, content: string) {
        const response = await api.patch(`/chat/messages/${messageId}`, { content });
        return response.data as ChatMessage;
    },

    async deleteMessage(messageId: string) {
        const response = await api.delete(`/chat/messages/${messageId}`);
        return response.data;
    },

    // ===== DIRECT MESSAGES =====
    async getDirectMessages() {
        const response = await api.get('/chat/dms');
        return response.data as DirectMessage[];
    },

    async getDirectMessageById(dmId: string) {
        const response = await api.get(`/chat/dms/${dmId}`);
        return response.data as DirectMessage;
    },

    async sendDirectMessage(data: { participants: string[]; content: string; attachments?: any[] }) {
        const response = await api.post('/chat/dms', data);
        return response.data as DirectMessage;
    }
};
