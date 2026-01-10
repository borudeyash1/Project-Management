import React, { createContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface RealtimeContextType {
    socket: Socket | null;
    isConnected: boolean;
    subscribe: (room: string) => void;
    unsubscribe: (room: string) => void;
}

export const RealtimeContext = createContext<RealtimeContextType | null>(null);

interface RealtimeProviderProps {
    children: React.ReactNode;
    token?: string;
}

export function RealtimeProvider({ children, token }: RealtimeProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Only connect if we have a token
        if (!token) {
            console.log('[Realtime] No token, skipping connection');
            return;
        }

        // Prevent multiple connections
        if (socketRef.current?.connected) {
            console.log('[Realtime] Already connected');
            return;
        }

        console.log('[Realtime] Initializing connection...');

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        const newSocket = io(apiUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('✅ [Realtime] Connected to server');
        });

        newSocket.on('disconnect', (reason) => {
            setIsConnected(false);
            console.log(`❌ [Realtime] Disconnected: ${reason}`);
        });

        newSocket.on('connect_error', (error) => {
            console.error('[Realtime] Connection error:', error.message);
        });

        newSocket.on('user:online', ({ userId, userName }) => {
            console.log(`👤 [Realtime] User online: ${userName}`);
        });

        newSocket.on('user:offline', ({ userId, userName }) => {
            console.log(`👤 [Realtime] User offline: ${userName}`);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
            console.log('[Realtime] Cleaning up connection');
            newSocket.close();
            socketRef.current = null;
        };
    }, [token]);

    const subscribe = (room: string) => {
        if (socket?.connected) {
            socket.emit(`subscribe:${room.split(':')[0]}`, room.split(':')[1]);
            console.log(`[Realtime] Subscribed to ${room}`);
        }
    };

    const unsubscribe = (room: string) => {
        if (socket?.connected) {
            socket.emit(`unsubscribe:${room.split(':')[0]}`, room.split(':')[1]);
            console.log(`[Realtime] Unsubscribed from ${room}`);
        }
    };

    return (
        <RealtimeContext.Provider value={{ socket, isConnected, subscribe, unsubscribe }}>
            {children}
        </RealtimeContext.Provider>
    );
}
