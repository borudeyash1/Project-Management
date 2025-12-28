import mongoose, { Schema, Document } from 'mongoose';

export interface IJiraIssue extends Document {
    issueKey: string;
    issueId: string;
    summary: string;
    description: string;
    status: string;
    priority: string;
    issueType: string;
    assignee?: mongoose.Types.ObjectId;
    reporter?: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    workspaceId: mongoose.Types.ObjectId;
    jiraProjectKey: string;
    jiraProjectName: string;
    labels: string[];
    sprint?: string;
    storyPoints?: number;
    linkedTasks: mongoose.Types.ObjectId[];
    components: string[];
    fixVersions: string[];
    dueDate?: Date;
    resolution?: string;
    resolutionDate?: Date;
    customFields: Map<string, any>;
    attachments: {
        id: string;
        filename: string;
        url: string;
        mimeType: string;
        size: number;
    }[];
    comments: {
        id: string;
        author: string;
        body: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    transitions: {
        id: string;
        name: string;
        to: {
            id: string;
            name: string;
        };
    }[];
    lastSyncedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const JiraIssueSchema: Schema = new Schema({
    issueKey: { type: String, required: true, unique: true, index: true },
    issueId: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, required: true, index: true },
    priority: { type: String, required: true, index: true },
    issueType: { type: String, required: true, index: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    reporter: { type: Schema.Types.ObjectId, ref: 'User' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    jiraProjectKey: { type: String, required: true, index: true },
    jiraProjectName: { type: String, required: true },
    labels: [{ type: String }],
    sprint: { type: String },
    storyPoints: { type: Number },
    linkedTasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    components: [{ type: String }],
    fixVersions: [{ type: String }],
    dueDate: { type: Date },
    resolution: { type: String },
    resolutionDate: { type: Date },
    customFields: { type: Map, of: Schema.Types.Mixed },
    attachments: [{
        id: String,
        filename: String,
        url: String,
        mimeType: String,
        size: Number
    }],
    comments: [{
        id: String,
        author: String,
        body: String,
        createdAt: Date,
        updatedAt: Date
    }],
    transitions: [{
        id: String,
        name: String,
        to: {
            id: String,
            name: String
        }
    }],
    lastSyncedAt: { type: Date, default: Date.now },
}, {
    timestamps: true
});

// Indexes for performance
JiraIssueSchema.index({ workspaceId: 1, jiraProjectKey: 1 });
JiraIssueSchema.index({ workspaceId: 1, status: 1 });
JiraIssueSchema.index({ workspaceId: 1, assignee: 1 });
JiraIssueSchema.index({ projectId: 1 });

export default mongoose.model<IJiraIssue>('JiraIssue', JiraIssueSchema);
