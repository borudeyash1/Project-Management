import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentation extends Document {
    title: string;
    slug: string;
    content: string;
    category: string;
    subcategory?: string;
    videoUrl?: string;
    order: number;
    isPublished: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const DocumentationSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        content: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['getting-started', 'user-guide', 'api-reference', 'tutorials', 'faq'],
            default: 'getting-started',
        },
        subcategory: {
            type: String,
            trim: true,
        },
        videoUrl: {
            type: String,
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
DocumentationSchema.index({ category: 1, order: 1 });
DocumentationSchema.index({ slug: 1 });
DocumentationSchema.index({ isPublished: 1 });

export default mongoose.model<IDocumentation>('Documentation', DocumentationSchema);
