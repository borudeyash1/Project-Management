import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface TaskUpdateEvent {
    taskId: string;
    newStatus: string;
    userId: string;
    title: string;
}

interface UseNotionSyncOptions {
    onTaskUpdate: (event: TaskUpdateEvent) => void;
    enabled?: boolean;
}

/**
 * Hook to listen for real-time Notion sync updates via WebSocket
 * Replaces constant polling with event-driven updates
 */
export const useNotionSync = ({ onTaskUpdate, enabled = true }: UseNotionSyncOptions) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!enabled) return;

        // Connect to WebSocket server
        const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🔌 [WEBSOCKET] Connected to server');
        });

        socket.on('disconnect', () => {
            console.log('🔌 [WEBSOCKET] Disconnected from server');
        });

        socket.on('taskUpdated', (event: TaskUpdateEvent) => {
            console.log(`📡 [WEBSOCKET] Received task update:`, event);
            onTaskUpdate(event);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ [WEBSOCKET] Connection error:', error);
        });

        // Cleanup on unmount
        return () => {
            console.log('🔌 [WEBSOCKET] Disconnecting...');
            socket.disconnect();
        };
    }, [enabled, onTaskUpdate]);

    return {
        isConnected: socketRef.current?.connected || false
    };
};

export default useNotionSync;
