import mongoose, { Schema, Document } from 'mongoose';
import { DesktopDeviceInfo } from '../types';

export interface DesktopSessionTokenDoc extends Document {
  tokenHash: string;
  user: mongoose.Types.ObjectId;
  expiresAt: Date;
  consumed: boolean;
  consumedAt?: Date;
  source: 'web' | 'desktop' | 'mobile';
  deviceInfo?: DesktopDeviceInfo;
  ipAddress?: string;
  userAgent?: string;
}

const DeviceInfoSchema = new Schema({
  runtime: { type: String, enum: ['browser', 'desktop', 'mobile'], default: 'desktop' },
  platform: { type: String },
  userAgent: { type: String },
  language: { type: String },
  timestamp: { type: Date }
}, { _id: false });

const DesktopSessionTokenSchema = new Schema<DesktopSessionTokenDoc>({
  tokenHash: { type: String, required: true, unique: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  consumed: { type: Boolean, default: false },
  consumedAt: { type: Date },
  source: { type: String, enum: ['web', 'desktop', 'mobile'], default: 'desktop' },
  deviceInfo: { type: DeviceInfoSchema, default: undefined },
  ipAddress: { type: String },
  userAgent: { type: String }
}, {
  timestamps: true
});

DesktopSessionTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<DesktopSessionTokenDoc>('DesktopSessionToken', DesktopSessionTokenSchema);
