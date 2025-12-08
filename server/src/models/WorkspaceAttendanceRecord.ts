import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceAttendanceRecord extends Document {
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format
  slots: Array<{
    slotName: string;
    markedAt: Date;
    status: 'present' | 'late' | 'absent' | 'work-from-home';
    location?: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
    faceVerified: boolean;
    notes?: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceAttendanceRecordSchema = new Schema<IWorkspaceAttendanceRecord>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true
    },
    slots: [
      {
        slotName: {
          type: String,
          required: true
        },
        markedAt: {
          type: Date,
          required: true
        },
        status: {
          type: String,
          enum: ['present', 'late', 'absent', 'work-from-home'],
          required: true
        },
        location: {
          latitude: Number,
          longitude: Number,
          accuracy: Number
        },
        faceVerified: {
          type: Boolean,
          default: false
        },
        notes: String
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient queries
WorkspaceAttendanceRecordSchema.index({ workspace: 1, date: 1 });
WorkspaceAttendanceRecordSchema.index({ workspace: 1, user: 1, date: 1 }, { unique: true });

export default mongoose.model<IWorkspaceAttendanceRecord>(
  'WorkspaceAttendanceRecord',
  WorkspaceAttendanceRecordSchema
);
