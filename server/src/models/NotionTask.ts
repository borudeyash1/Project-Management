import mongoose, { Schema, Document } from 'mongoose';

export interface INotionTask extends Document {
    pageId: string;
    title: string;
    description?: string;
    status: string;
    priority?: string;
    dueDate?: Date;
    workspaceId: mongoose.Types.ObjectId;
    notionDatabaseId: string;
    labels?: string[];
    lastSyncedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const NotionTaskSchema: Schema = new Schema(
    {
        pageId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            required: true,
            default: 'Not started'
        },
        priority: {
            type: String,
            default: 'Medium'
        },
        dueDate: {
            type: Date
        },
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
            index: true
        },
        notionDatabaseId: {
            type: String,
            required: true,
            index: true
        },
        labels: [{
            type: String
        }],
        lastSyncedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient querying
NotionTaskSchema.index({ workspaceId: 1, pageId: 1 });
NotionTaskSchema.index({ notionDatabaseId: 1 });

export default mongoose.model<INotionTask>('NotionTask', NotionTaskSchema);
