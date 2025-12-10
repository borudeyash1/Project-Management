import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceAttendanceConfig extends Document {
  workspace: string;
  attendanceSlots?: Array<{
    name: string;
    time: string; // HH:MM format
    windowMinutes: number; // Time window before/after
    isActive: boolean;
  }>;
  location?: {
    lat: number;
    lng: number;
    radiusMeters: number;
    address?: string;
    name?: string; // e.g., "Main Office", "Branch Office"
  };
  checkInTime?: {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "10:00" - Grace period
  };
  checkOutTime?: {
    start: string; // e.g., "17:00"
    end: string;   // e.g., "18:00" - Grace period
  };
  holidays?: string[]; // Array of date strings in YYYY-MM-DD format
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  workFromHomeAllowed: boolean;
  autoModeEnabled: boolean;
  requireFaceVerification: boolean;
  requireLocation: boolean;
  lateThresholdMinutes: number; // Minutes after check-in start time to mark as late
  halfDayThresholdHours: number; // Working hours threshold for half-day
  fullDayThresholdHours: number; // Working hours threshold for full-day
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceAttendanceConfigSchema = new Schema<IWorkspaceAttendanceConfig>({
  workspace: {
    type: String,
    required: true,
    unique: true,
    ref: 'Workspace',
    index: true,
  },
  attendanceSlots: [
    {
      name: {
        type: String,
        required: true
      },
      time: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      windowMinutes: {
        type: Number,
        default: 30,
        min: 0,
        max: 120
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }
  ],
  location: {
    lat: { type: Number },
    lng: { type: Number },
    radiusMeters: { type: Number, default: 100 },
    address: { type: String },
    name: { type: String },
  },
  checkInTime: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '10:00' },
  },
  checkOutTime: {
    start: { type: String, default: '17:00' },
    end: { type: String, default: '18:00' },
  },
  holidays: {
    type: [String],
    default: []
  },
  workingDays: {
    type: [Number],
    default: [1, 2, 3, 4, 5], // Monday to Friday
  },
  workFromHomeAllowed: {
    type: Boolean,
    default: true,
  },
  autoModeEnabled: {
    type: Boolean,
    default: true,
  },
  requireFaceVerification: {
    type: Boolean,
    default: false,
  },
  requireLocation: {
    type: Boolean,
    default: true,
  },
  lateThresholdMinutes: {
    type: Number,
    default: 15, // 15 minutes late threshold
  },
  halfDayThresholdHours: {
    type: Number,
    default: 4, // 4 hours for half-day
  },
  fullDayThresholdHours: {
    type: Number,
    default: 8, // 8 hours for full-day
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User',
  },
  updatedBy: {
    type: String,
    ref: 'User',
  },
}, {
  timestamps: true,
});

export default mongoose.model<IWorkspaceAttendanceConfig>('WorkspaceAttendanceConfig', workspaceAttendanceConfigSchema);
