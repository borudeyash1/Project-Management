import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceAttendance extends Document {
  workspace: string;
  user: string;
  date: Date;
  checkIn?: {
    time: Date;
    location?: {
      lat: number;
      lng: number;
      accuracy?: number;
      address?: string;
      withinAllowedArea?: boolean;
    };
    faceVerified: boolean;
    mode: 'manual' | 'automatic';
  };
  checkOut?: {
    time: Date;
    location?: {
      lat: number;
      lng: number;
      accuracy?: number;
      address?: string;
      withinAllowedArea?: boolean;
    };
    faceVerified: boolean;
    mode: 'manual' | 'automatic';
  };
  status: 'present' | 'absent' | 'work-from-home' | 'half-day' | 'late';
  workingHours?: number; // Calculated from check-in and check-out
  notes?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceAttendanceSchema = new Schema<IWorkspaceAttendance>({
  workspace: {
    type: String,
    required: true,
    ref: 'Workspace',
    index: true,
  },
  user: {
    type: String,
    required: true,
    ref: 'User',
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  checkIn: {
    time: { type: Date },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number },
      address: { type: String },
      withinAllowedArea: { type: Boolean },
    },
    faceVerified: { type: Boolean, default: false },
    mode: { type: String, enum: ['manual', 'automatic'] },
  },
  checkOut: {
    time: { type: Date },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number },
      address: { type: String },
      withinAllowedArea: { type: Boolean },
    },
    faceVerified: { type: Boolean, default: false },
    mode: { type: String, enum: ['manual', 'automatic'] },
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'work-from-home', 'half-day', 'late'],
    required: true,
    default: 'absent',
  },
  workingHours: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
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

// Ensure one attendance record per user per workspace per day
workspaceAttendanceSchema.index({ workspace: 1, user: 1, date: 1 }, { unique: true });

// Calculate working hours before saving
workspaceAttendanceSchema.pre('save', function(next) {
  if (this.checkIn?.time && this.checkOut?.time) {
    const checkInTime = new Date(this.checkIn.time).getTime();
    const checkOutTime = new Date(this.checkOut.time).getTime();
    this.workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
  }
  next();
});

export default mongoose.model<IWorkspaceAttendance>('WorkspaceAttendance', workspaceAttendanceSchema);
