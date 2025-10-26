import mongoose, { Schema, Document } from 'mongoose';

export interface IDesktopRelease extends Document {
  version: string;
  versionName: string;
  description: string;
  releaseNotes: string;
  platform: 'windows' | 'macos' | 'linux';
  architecture: 'x64' | 'arm64' | 'universal';
  fileName: string;
  fileSize: number;
  filePath: string;
  downloadUrl: string;
  downloadCount: number;
  isLatest: boolean;
  isActive: boolean;
  releaseDate: Date;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const desktopReleaseSchema = new Schema<IDesktopRelease>({
  version: {
    type: String,
    required: [true, 'Version is required'],
    trim: true,
    index: true
  },
  versionName: {
    type: String,
    required: [true, 'Version name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  releaseNotes: {
    type: String,
    required: [true, 'Release notes are required']
  },
  platform: {
    type: String,
    enum: ['windows', 'macos', 'linux'],
    required: [true, 'Platform is required'],
    index: true
  },
  architecture: {
    type: String,
    enum: ['x64', 'arm64', 'universal'],
    required: [true, 'Architecture is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  downloadUrl: {
    type: String,
    required: [true, 'Download URL is required']
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isLatest: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
desktopReleaseSchema.index({ platform: 1, isLatest: 1, isActive: 1 });
desktopReleaseSchema.index({ version: 1, platform: 1 });
desktopReleaseSchema.index({ releaseDate: -1 });

// Before saving, if isLatest is true, set all other releases for this platform to false
desktopReleaseSchema.pre('save', async function(next) {
  if (this.isModified('isLatest') && this.isLatest) {
    await mongoose.model('DesktopRelease').updateMany(
      { 
        platform: this.platform,
        _id: { $ne: this._id }
      },
      { isLatest: false }
    );
  }
  next();
});

const DesktopRelease = mongoose.model<IDesktopRelease>('DesktopRelease', desktopReleaseSchema);

export default DesktopRelease;
