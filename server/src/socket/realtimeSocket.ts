import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

interface UserData {
    _id: string;
    email: string;
    fullName?: string;
}

/**
 * Initialize real-time Socket.IO server
 */
export function initializeRealtimeSocket(server: HTTPServer): SocketIOServer {
    io = new SocketIOServer(server, {
        cors: {
            origin: process.env.CLIENT_URL || ['http://localhost:3000', 'https://sartthi.com'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Authentication middleware
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserData;
            socket.data.user = decoded;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.user._id;
        const userName = socket.data.user.fullName || socket.data.user.email;

        console.log(`[Realtime] User connected: ${userName} (${userId})`);

        // Join user-specific room for notifications
        socket.join(`user:${userId}`);

        // Emit user online status to all connected clients
        io.emit('user:online', { userId, userName });

        // Handle workspace subscriptions
        socket.on('subscribe:workspace', (workspaceId: string) => {
            socket.join(`workspace:${workspaceId}`);
            console.log(`[Realtime] ${userName} subscribed to workspace:${workspaceId}`);
        });

        socket.on('unsubscribe:workspace', (workspaceId: string) => {
            socket.leave(`workspace:${workspaceId}`);
            console.log(`[Realtime] ${userName} unsubscribed from workspace:${workspaceId}`);
        });

        // Handle project subscriptions
        socket.on('subscribe:project', (projectId: string) => {
            socket.join(`project:${projectId}`);
            console.log(`[Realtime] ${userName} subscribed to project:${projectId}`);
        });

        socket.on('unsubscribe:project', (projectId: string) => {
            socket.leave(`project:${projectId}`);
            console.log(`[Realtime] ${userName} unsubscribed from project:${projectId}`);
        });

        // Handle task subscriptions
        socket.on('subscribe:task', (taskId: string) => {
            socket.join(`task:${taskId}`);
        });

        socket.on('unsubscribe:task', (taskId: string) => {
            socket.leave(`task:${taskId}`);
        });

        // Handle typing indicators
        socket.on('typing:start', ({ room, userName }: { room: string; userName: string }) => {
            socket.to(room).emit('typing:start', { userId, userName });
        });

        socket.on('typing:stop', ({ room }: { room: string }) => {
            socket.to(room).emit('typing:stop', { userId });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`[Realtime] User disconnected: ${userName} (${userId})`);
            io.emit('user:offline', { userId, userName });
        });
    });

    console.log('✅ Real-time Socket.IO initialized');
    return io;
}

/**
 * Get the Socket.IO instance
 */
export function getIO(): SocketIOServer | null {
    return io || null;
}

/**
 * Emit event to a specific room
 */
export function emitToRoom(room: string, event: string, data: any): void {
    if (io) {
        io.to(room).emit(event, data);
        console.log(`[Realtime] Emitted ${event} to room ${room}`);
    } else {
        console.warn('[Realtime] Socket.IO not initialized, cannot emit event');
    }
}

/**
 * Emit event to a specific user
 */
export function emitToUser(userId: string, event: string, data: any): void {
    emitToRoom(`user:${userId}`, event, data);
}

/**
 * Emit event to all users in a workspace
 */
export function emitToWorkspace(workspaceId: string, event: string, data: any): void {
    emitToRoom(`workspace:${workspaceId}`, event, data);
}

/**
 * Emit event to all users in a project
 */
export function emitToProject(projectId: string, event: string, data: any): void {
    emitToRoom(`project:${projectId}`, event, data);
}

/**
 * Emit event to all connected clients
 */
export function emitToAll(event: string, data: any): void {
    if (io) {
        io.emit(event, data);
        console.log(`[Realtime] Emitted ${event} to all clients`);
    }
}

/**
 * Get list of users in a room
 */
export async function getUsersInRoom(room: string): Promise<string[]> {
    if (!io) return [];

    const sockets = await io.in(room).fetchSockets();
    return sockets.map(socket => socket.data.user._id);
}

/**
 * Check if user is online
 */
export async function isUserOnline(userId: string): Promise<boolean> {
    if (!io) return false;

    const sockets = await io.in(`user:${userId}`).fetchSockets();
    return sockets.length > 0;
}
