import mongoose, { Schema, Document } from 'mongoose';

export interface IChatChannel extends Document {
    serverId: mongoose.Types.ObjectId;
    name: string;
    type: 'text' | 'voice' | 'announcement';
    category?: string;
    topic?: string;
    position: number;
    permissions: {
        viewChannel: mongoose.Types.ObjectId[];
        sendMessages: mongoose.Types.ObjectId[];
        manageMessages: mongoose.Types.ObjectId[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const ChatChannelSchema: Schema = new Schema({
    serverId: {
        type: Schema.Types.ObjectId,
        ref: 'ChatServer',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    type: {
        type: String,
        enum: ['text', 'voice', 'announcement'],
        default: 'text'
    },
    category: {
        type: String,
        maxlength: 50
    },
    topic: {
        type: String,
        maxlength: 1024
    },
    position: {
        type: Number,
        default: 0
    },
    permissions: {
        viewChannel: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        sendMessages: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        manageMessages: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }
}, {
    timestamps: true
});

// Index for faster queries
ChatChannelSchema.index({ serverId: 1, position: 1 });

export default mongoose.model<IChatChannel>('ChatChannel', ChatChannelSchema);
