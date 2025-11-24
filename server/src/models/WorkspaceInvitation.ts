import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceInvitation extends Document {
  workspace: mongoose.Types.ObjectId;
  inviter: mongoose.Types.ObjectId;
  invitee: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
}

const workspaceInvitationSchema = new Schema<IWorkspaceInvitation>({
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  inviter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
workspaceInvitationSchema.index({ workspace: 1, invitee: 1 });
workspaceInvitationSchema.index({ inviter: 1 });
workspaceInvitationSchema.index({ invitee: 1 });
workspaceInvitationSchema.index({ status: 1 });

export default mongoose.model<IWorkspaceInvitation>('WorkspaceInvitation', workspaceInvitationSchema);
