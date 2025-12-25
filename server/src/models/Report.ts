import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  name: string;
  description: string;
  type: 'productivity' | 'time' | 'team' | 'financial' | 'project';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  filters?: {
    projects?: mongoose.Types.ObjectId[];
    users?: mongoose.Types.ObjectId[];
    tags?: string[];
  };
  data: any; // Flexible data structure for different report types
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['productivity', 'time', 'team', 'financial', 'project'],
    required: true
  },
  dateRange: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  filters: {
    projects: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
    }],
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    tags: [{
      type: String,
      trim: true
    }]
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ createdBy: 1, type: 1 });
reportSchema.index({ createdBy: 1, isPublic: 1 });
reportSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Report = mongoose.model<IReport>('Report', reportSchema);
