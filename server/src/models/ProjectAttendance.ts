import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectAttendance extends Document {
  project: string;
  user: string;
  date: Date;
  status: 'present' | 'absent' | 'work-from-home';
  mode: 'manual' | 'automatic';
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
    address?: string;
    withinAllowedArea?: boolean;
  };
  faceVerified: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectAttendanceSchema = new Schema<IProjectAttendance>({
  project: {
    type: String,
    required: true,
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
  status: {
    type: String,
    enum: ['present', 'absent', 'work-from-home'],
    required: true,
  },
  mode: {
    type: String,
    enum: ['manual', 'automatic'],
    required: true,
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number },
    address: { type: String },
    withinAllowedArea: { type: Boolean },
  },
  faceVerified: {
    type: Boolean,
    default: false,
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

// Ensure one attendance record per user per project per day
projectAttendanceSchema.index({ project: 1, user: 1, date: 1 }, { unique: true });

export default mongoose.model<IProjectAttendance>('ProjectAttendance', projectAttendanceSchema);
