import mongoose, { Schema, Document } from 'mongoose';

export interface IJoinRequest extends Document {
  workspace: string;
  user: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const joinRequestSchema = new Schema<IJoinRequest>({
  workspace: {
    type: String,
    required: true,
    ref: 'Workspace'
  },
  user: {
    type: String,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes
joinRequestSchema.index({ workspace: 1, user: 1 }, { unique: true });
joinRequestSchema.index({ workspace: 1, status: 1 });
joinRequestSchema.index({ user: 1, status: 1 });

export default mongoose.model<IJoinRequest>('JoinRequest', joinRequestSchema);
