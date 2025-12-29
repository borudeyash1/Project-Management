import { io, Socket } from 'socket.io-client';

class ChatSocketService {
    private socket: Socket | null = null;
    private token: string | null = null;

    connect(token: string) {
        if (this.socket?.connected) {
            return;
        }

        this.token = token;
        this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('[Chat Socket] Connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('[Chat Socket] Disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Chat Socket] Connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Server rooms
    joinServer(serverId: string) {
        this.socket?.emit('server:join', serverId);
    }

    leaveServer(serverId: string) {
        this.socket?.emit('server:leave', serverId);
    }

    // Channel rooms
    joinChannel(channelId: string) {
        this.socket?.emit('channel:join', channelId);
    }

    leaveChannel(channelId: string) {
        this.socket?.emit('channel:leave', channelId);
    }

    // Typing indicators
    startTyping(channelId: string) {
        this.socket?.emit('typing:start', { channelId });
    }

    stopTyping(channelId: string) {
        this.socket?.emit('typing:stop', { channelId });
    }

    // Event listeners
    onNewMessage(callback: (message: any) => void) {
        this.socket?.on('message:new', callback);
    }

    onMessageEdit(callback: (message: any) => void) {
        this.socket?.on('message:edit', callback);
    }

    onMessageDelete(callback: (data: { messageId: string }) => void) {
        this.socket?.on('message:delete', callback);
    }

    onTypingStart(callback: (data: { channelId: string; userId: string; username: string }) => void) {
        this.socket?.on('typing:start', callback);
    }

    onTypingStop(callback: (data: { channelId: string; userId: string }) => void) {
        this.socket?.on('typing:stop', callback);
    }

    onUserOnline(callback: (data: { userId: string; username: string }) => void) {
        this.socket?.on('user:online', callback);
    }

    onUserOffline(callback: (data: { userId: string }) => void) {
        this.socket?.on('user:offline', callback);
    }

    // Remove listeners
    off(event: string, callback?: any) {
        this.socket?.off(event, callback);
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export const chatSocket = new ChatSocketService();
