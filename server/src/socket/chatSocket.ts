import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface SocketUser {
    userId: string;
    socketId: string;
    username: string;
}

const onlineUsers = new Map<string, SocketUser>();
const typingUsers = new Map<string, Set<string>>(); // channelId -> Set of userIds

export const initializeSocket = (httpServer: HTTPServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true
        }
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
            const user = await User.findById(decoded.userId);

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.data.userId = user._id.toString();
            socket.data.username = user.username;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        const username = socket.data.username;

        console.log(`[Socket.IO] User connected: ${username} (${userId})`);

        // Add user to online users
        onlineUsers.set(userId, {
            userId,
            socketId: socket.id,
            username
        });

        // Broadcast online status
        io.emit('user:online', { userId, username });

        // Join server rooms
        socket.on('server:join', (serverId: string) => {
            socket.join(`server:${serverId}`);
            console.log(`[Socket.IO] ${username} joined server ${serverId}`);
        });

        // Leave server rooms
        socket.on('server:leave', (serverId: string) => {
            socket.leave(`server:${serverId}`);
            console.log(`[Socket.IO] ${username} left server ${serverId}`);
        });

        // Join channel room
        socket.on('channel:join', (channelId: string) => {
            socket.join(`channel:${channelId}`);
            console.log(`[Socket.IO] ${username} joined channel ${channelId}`);
        });

        // Leave channel room
        socket.on('channel:leave', (channelId: string) => {
            socket.leave(`channel:${channelId}`);

            // Remove from typing users
            const typingSet = typingUsers.get(channelId);
            if (typingSet) {
                typingSet.delete(userId);
                if (typingSet.size === 0) {
                    typingUsers.delete(channelId);
                }
            }

            console.log(`[Socket.IO] ${username} left channel ${channelId}`);
        });

        // Typing indicator
        socket.on('typing:start', ({ channelId }: { channelId: string }) => {
            if (!typingUsers.has(channelId)) {
                typingUsers.set(channelId, new Set());
            }
            typingUsers.get(channelId)!.add(userId);

            socket.to(`channel:${channelId}`).emit('typing:start', {
                channelId,
                userId,
                username
            });
        });

        socket.on('typing:stop', ({ channelId }: { channelId: string }) => {
            const typingSet = typingUsers.get(channelId);
            if (typingSet) {
                typingSet.delete(userId);
                if (typingSet.size === 0) {
                    typingUsers.delete(channelId);
                }
            }

            socket.to(`channel:${channelId}`).emit('typing:stop', {
                channelId,
                userId
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`[Socket.IO] User disconnected: ${username} (${userId})`);

            // Remove from online users
            onlineUsers.delete(userId);

            // Remove from all typing indicators
            typingUsers.forEach((userSet, channelId) => {
                if (userSet.has(userId)) {
                    userSet.delete(userId);
                    io.to(`channel:${channelId}`).emit('typing:stop', {
                        channelId,
                        userId
                    });
                }
            });

            // Broadcast offline status
            io.emit('user:offline', { userId });
        });
    });

    return io;
};

export const getIO = (): SocketIOServer => {
    // This will be set in server.ts
    return (global as any).io;
};
