import mongoose, { Schema, Document } from 'mongoose';

export interface IContentBanner extends Document {
    title: string;
    content: string;
    type: 'text' | 'image' | 'both';
    imageUrl?: string;
    backgroundColor: string;
    textColor: string;
    height: number;
    placement: 'top' | 'bottom';
    routes: string[];
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    priority: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ContentBannerSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['text', 'image', 'both'],
            required: true,
            default: 'text'
        },
        imageUrl: {
            type: String,
            default: null
        },
        backgroundColor: {
            type: String,
            default: '#FF006B' // Pink/magenta like Hostinger
        },
        textColor: {
            type: String,
            default: '#FFFFFF'
        },
        height: {
            type: Number,
            default: 60,
            min: 40,
            max: 200
        },
        placement: {
            type: String,
            enum: ['top', 'bottom'],
            default: 'top'
        },
        routes: {
            type: [String],
            default: []
        },
        isActive: {
            type: Boolean,
            default: true
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        priority: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient querying
ContentBannerSchema.index({ isActive: 1, routes: 1, priority: -1 });
ContentBannerSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model<IContentBanner>('ContentBanner', ContentBannerSchema);
