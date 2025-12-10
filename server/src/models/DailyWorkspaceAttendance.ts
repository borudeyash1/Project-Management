import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyWorkspaceAttendance extends Document {
  workspace: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format
  attendance: Array<{
    user: mongoose.Types.ObjectId;
    status: 'present' | 'absent' | 'work-from-home' | 'late';
    markedAt: Date;
    markedBy?: mongoose.Types.ObjectId; // For manual marking
    slotName?: string;
    location?: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
    faceVerified?: boolean;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DailyWorkspaceAttendanceSchema = new Schema<IDailyWorkspaceAttendance>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true
    },
    attendance: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        status: {
          type: String,
          enum: ['present', 'absent', 'work-from-home', 'late'],
          required: true
        },
        markedAt: {
          type: Date,
          required: true,
          default: Date.now
        },
        markedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        slotName: {
          type: String,
          default: 'Manual Entry'
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
    ]
  },
  {
    timestamps: true
  }
);

// Compound unique index to ensure one document per workspace per date
DailyWorkspaceAttendanceSchema.index({ workspace: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailyWorkspaceAttendance>(
  'DailyWorkspaceAttendance',
  DailyWorkspaceAttendanceSchema
);
