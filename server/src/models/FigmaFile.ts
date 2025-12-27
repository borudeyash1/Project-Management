import mongoose, { Schema, Document } from 'mongoose';

export interface IFigmaFrame {
    frameId: string;
    frameName: string;
    thumbnail: string;
    linkedTaskId?: string;
    comments: {
        userId: string;
        userName: string;
        comment: string;
        timestamp: Date;
    }[];
    approvals: {
        userId: string;
        userName: string;
        role: 'team' | 'client';
        status: 'approved' | 'rejected';
        comment?: string;
        timestamp: Date;
    }[];
}

export interface IFigmaFile extends Document {
    workspaceId: string;
    clientId?: string;
    projectId?: string;
    fileId: string;
    fileName: string;
    fileUrl: string;
    thumbnail: string;
    frames: IFigmaFrame[];
    category: 'brand' | 'project' | 'template';
    visibility: 'workspace' | 'client' | 'private';
    status: 'draft' | 'review' | 'client-review' | 'approved' | 'rejected';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    lastSyncedAt?: Date;
}

const FigmaFrameSchema = new Schema({
    frameId: { type: String, required: true },
    frameName: { type: String, required: true },
    thumbnail: { type: String, required: true },
    linkedTaskId: { type: String },
    comments: [{
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        comment: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    approvals: [{
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        role: { type: String, enum: ['team', 'client'], required: true },
        status: { type: String, enum: ['approved', 'rejected'], required: true },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now }
    }]
});

const FigmaFileSchema = new Schema({
    workspaceId: { type: String, required: true, index: true },
    clientId: { type: String, index: true },
    projectId: { type: String, index: true },
    fileId: { type: String, required: true, unique: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    thumbnail: { type: String, required: true },
    frames: [FigmaFrameSchema],
    category: {
        type: String,
        enum: ['brand', 'project', 'template'],
        default: 'project'
    },
    visibility: {
        type: String,
        enum: ['workspace', 'client', 'private'],
        default: 'workspace'
    },
    status: {
        type: String,
        enum: ['draft', 'review', 'client-review', 'approved', 'rejected'],
        default: 'draft'
    },
    createdBy: { type: String, required: true },
    lastSyncedAt: { type: Date }
}, {
    timestamps: true
});

// Indexes for efficient queries
FigmaFileSchema.index({ workspaceId: 1, status: 1 });
FigmaFileSchema.index({ projectId: 1, status: 1 });
FigmaFileSchema.index({ clientId: 1, status: 1 });
FigmaFileSchema.index({ createdBy: 1 });

export default mongoose.model<IFigmaFile>('FigmaFile', FigmaFileSchema);
