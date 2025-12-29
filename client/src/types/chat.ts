export interface ChatServer {
    _id: string;
    name: string;
    icon?: string;
    description?: string;
    workspaceId: string;
    ownerId: string;
    members: {
        userId: string;
        role: 'owner' | 'admin' | 'member';
        joinedAt: Date;
    }[];
    channels: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatChannel {
    _id: string;
    serverId: string;
    name: string;
    type: 'text' | 'voice' | 'announcement';
    category?: string;
    topic?: string;
    position: number;
    permissions: {
        viewChannel: string[];
        sendMessages: string[];
        manageMessages: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessage {
    _id: string;
    channelId: string;
    serverId: string;
    authorId: {
        _id: string;
        username: string;
        email: string;
        profilePicture?: string;
    };
    content: string;
    attachments: {
        url: string;
        filename: string;
        size: number;
        type: string;
    }[];
    mentions: string[];
    reactions: {
        emoji: string;
        users: string[];
    }[];
    isPinned: boolean;
    isEdited: boolean;
    replyTo?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DirectMessage {
    _id: string;
    participants: {
        _id: string;
        username: string;
        email: string;
        profilePicture?: string;
    }[];
    messages: {
        authorId: string;
        content: string;
        attachments: {
            url: string;
            filename: string;
            size: number;
            type: string;
        }[];
        createdAt: Date;
    }[];
    lastMessage: Date;
    createdAt: Date;
    updatedAt: Date;
}
