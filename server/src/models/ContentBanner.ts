import mongoose, { Schema, Document } from 'mongoose';

export interface IContentBanner extends Document {
    title: string;
    content: string;
    type: 'text' | 'image' | 'both';
    imageUrl?: string;
    backgroundColor: string;
    textColor: string;
    height: number;
    placement: 'top' | 'bottom' | 'popup' | 'custom';
    routes: string[];
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    priority: number;
    // New formatting options
    customX?: number;
    customY?: number;
    customWidth?: number;
    backgroundType?: 'solid' | 'gradient' | 'image' | 'transparent';
    gradientStart?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    fontFamily?: string;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: number;
    padding?: number;
    imageHeight?: number;
    imageWidth?: number;
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
            enum: ['top', 'bottom', 'popup', 'custom'],
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
        // Custom Placement
        customX: {
            type: Number,
            default: null
        },
        customY: {
            type: Number,
            default: null
        },
        customWidth: {
            type: Number,
            default: null
        },
        // Advanced Backgrounds
        backgroundType: {
            type: String,
            enum: ['solid', 'gradient', 'image', 'transparent'],
            default: 'solid'
        },
        gradientStart: {
            type: String,
            default: null
        },
        gradientEnd: {
            type: String,
            default: null
        },
        gradientDirection: {
            type: String,
            default: 'to right'
        },
        // Font
        fontFamily: {
            type: String,
            default: 'Inter, sans-serif'
        },
        borderRadius: {
            type: Number,
            default: 0,
            min: 0,
            max: 50
        },
        fontSize: {
            type: Number,
            default: 16,
            min: 10,
            max: 48
        },
        fontWeight: {
            type: Number,
            default: 700,
            enum: [100, 200, 300, 400, 500, 600, 700, 800, 900]
        },
        padding: {
            type: Number,
            default: 16,
            min: 0,
            max: 100
        },
        imageHeight: {
            type: Number,
            default: null
        },
        imageWidth: {
            type: Number,
            default: null
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
