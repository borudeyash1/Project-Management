import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    content: string;
    tags: string[];
    isSticky: boolean;
    color: string;
    position?: {
        x: number;
        y: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            default: '',
        },
        content: {
            type: String,
            default: '',
        },
        tags: [{
            type: String,
        }],
        isSticky: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: '#ffffff',
        },
        position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries by user
NoteSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.model<INote>('Note', NoteSchema);
