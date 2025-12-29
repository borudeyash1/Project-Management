import mongoose, { Schema, Document } from 'mongoose';

export interface IChatServer extends Document {
    name: string;
    icon?: string;
    description?: string;
    workspaceId: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    members: {
        userId: mongoose.Types.ObjectId;
        role: 'owner' | 'admin' | 'member';
        joinedAt: Date;
    }[];
    channels: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const ChatServerSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    icon: {
        type: String,
        default: null
    },
    description: {
        type: String,
        maxlength: 500
    },
    workspaceId: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    channels: [{
        type: Schema.Types.ObjectId,
        ref: 'ChatChannel'
    }]
}, {
    timestamps: true
});

// Index for faster queries
ChatServerSchema.index({ workspaceId: 1 });
ChatServerSchema.index({ 'members.userId': 1 });

export default mongoose.model<IChatServer>('ChatServer', ChatServerSchema);
