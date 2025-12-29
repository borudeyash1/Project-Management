import mongoose, { Schema, Document } from 'mongoose';

export interface ILinearIssue extends Document {
    identifier: string; // e.g. ENG-123
    issueId: string; // Linear UUID
    title: string;
    description: string;
    state: {
        id: string;
        name: string;
        color: string;
        type: string;
    };
    priority: number;
    priorityLabel: string;
    teamId: string;
    teamName: string;
    projectId?: string;
    projectName?: string;
    assignee?: mongoose.Types.ObjectId; // Local user ID if matched
    assigneeLinearId?: string; // Linear user ID
    assigneeName?: string;
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;
    url: string;
    labels: string[];
    workspaceId: mongoose.Types.ObjectId; // Link to Sartthi workspace
    lastSyncedAt: Date;
}

const LinearIssueSchema: Schema = new Schema({
    identifier: { type: String, required: true, unique: true, index: true },
    issueId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    state: {
        id: String,
        name: String,
        color: String,
        type: String
    },
    priority: { type: Number, default: 0 },
    priorityLabel: { type: String },
    teamId: { type: String, required: true },
    teamName: { type: String },
    projectId: { type: String },
    projectName: { type: String },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    assigneeLinearId: { type: String },
    assigneeName: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    dueDate: { type: Date },
    url: { type: String },
    labels: [{ type: String }],
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    lastSyncedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes
LinearIssueSchema.index({ workspaceId: 1, teamId: 1 });
LinearIssueSchema.index({ workspaceId: 1, 'state.type': 1 }); // For filtering by status type (backlog, completed, etc)

export default mongoose.model<ILinearIssue>('LinearIssue', LinearIssueSchema);
