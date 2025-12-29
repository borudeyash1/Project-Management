import mongoose, { Schema, Document } from 'mongoose';

export interface IDirectMessage extends Document {
    participants: mongoose.Types.ObjectId[];
    messages: {
        authorId: mongoose.Types.ObjectId;
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

const DirectMessageSchema: Schema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [{
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
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastMessage: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
DirectMessageSchema.index({ participants: 1 });
DirectMessageSchema.index({ lastMessage: -1 });

// Ensure participants array has 2-10 users
DirectMessageSchema.pre('save', function (next) {
    if ((this as any).participants.length < 2 || (this as any).participants.length > 10) {
        next(new Error('Direct message must have between 2 and 10 participants'));
    } else {
        next();
    }
});

export default mongoose.model<IDirectMessage>('DirectMessage', DirectMessageSchema);
