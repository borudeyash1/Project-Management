import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectAttendanceConfig extends Document {
  project: string;
  workspace?: string;
  location?: {
    lat: number;
    lng: number;
    radiusMeters: number;
    address?: string;
  };
  workFromHomeAllowed: boolean;
  autoModeEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectAttendanceConfigSchema = new Schema<IProjectAttendanceConfig>({
  project: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  workspace: {
    type: String,
    index: true,
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    radiusMeters: { type: Number, default: 100 },
    address: { type: String },
  },
  workFromHomeAllowed: {
    type: Boolean,
    default: true,
  },
  autoModeEnabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IProjectAttendanceConfig>('ProjectAttendanceConfig', projectAttendanceConfigSchema);
