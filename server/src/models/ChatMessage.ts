import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
    channelId: mongoose.Types.ObjectId;
    serverId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    content: string;
    attachments: {
        url: string;
        filename: string;
        size: number;
        type: string;
    }[];
    mentions: mongoose.Types.ObjectId[];
    reactions: {
        emoji: string;
        users: mongoose.Types.ObjectId[];
    }[];
    isPinned: boolean;
    isEdited: boolean;
    replyTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
    channelId: {
        type: Schema.Types.ObjectId,
        ref: 'ChatChannel',
        required: true
    },
    serverId: {
        type: Schema.Types.ObjectId,
        ref: 'ChatServer',
        required: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    attachments: [{
        url: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    }],
    mentions: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    reactions: [{
        emoji: {
            type: String,
            required: true
        },
        users: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],
    isPinned: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'ChatMessage'
    }
}, {
    timestamps: true
});

// Indexes for faster queries
ChatMessageSchema.index({ channelId: 1, createdAt: -1 });
ChatMessageSchema.index({ serverId: 1 });
ChatMessageSchema.index({ authorId: 1 });
ChatMessageSchema.index({ mentions: 1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
