import mongoose, { Schema, Document } from 'mongoose';

export interface IRequest extends Document {
  project: mongoose.Types.ObjectId;
  type: 'workload-redistribution' | 'deadline-extension';
  taskId: string;
  taskName: string;
  requestedBy: mongoose.Types.ObjectId;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  currentDeadline?: Date;
  requestedDeadline?: Date;
  currentWorkload?: string;
  rejectionReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema: Schema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['workload-redistribution', 'deadline-extension'],
      required: true
    },
    taskId: {
      type: String,
      required: true
    },
    taskName: {
      type: String,
      required: true
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    reason: {
      type: String,
      required: true
    },
    currentDeadline: {
      type: Date
    },
    requestedDeadline: {
      type: Date
    },
    currentWorkload: {
      type: String
    },
    rejectionReason: {
      type: String
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
RequestSchema.index({ project: 1, status: 1 });
RequestSchema.index({ requestedBy: 1, status: 1 });

export default mongoose.model<IRequest>('Request', RequestSchema);
