import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
    user: mongoose.Types.ObjectId;
    type: 'task_created' | 'task_updated' | 'task_completed' | 'project_created' | 'project_updated' | 'team_joined' | 'milestone_reached' | 'file_uploaded' | 'goal_achieved' | 'comment_added';
    title: string;
    description: string;
    relatedModel?: string; // 'Task', 'Project', 'Goal', etc.
    relatedId?: mongoose.Types.ObjectId;
    metadata?: any;
    createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                'task_created',
                'task_updated',
                'task_completed',
                'project_created',
                'project_updated',
                'team_joined',
                'milestone_reached',
                'file_uploaded',
                'goal_achieved',
                'comment_added',
            ],
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        relatedModel: {
            type: String,
        },
        relatedId: {
            type: Schema.Types.ObjectId,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
ActivitySchema.index({ user: 1, createdAt: -1 });
ActivitySchema.index({ type: 1 });

// TTL Index: Automatically delete documents after 24 hours (86400 seconds)
ActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
