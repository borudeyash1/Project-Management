import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeEntry extends Document {
  userId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  description?: string;
  isRunning: boolean;
  billable: boolean;
  hourlyRate?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const timeEntrySchema = new Schema<ITimeEntry>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  billable: {
    type: Boolean,
    default: true
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
timeEntrySchema.index({ userId: 1, startTime: -1 });
timeEntrySchema.index({ userId: 1, projectId: 1 });
timeEntrySchema.index({ userId: 1, taskId: 1 });
timeEntrySchema.index({ userId: 1, isRunning: 1 });
timeEntrySchema.index({ description: 'text', tags: 'text' });

// Pre-save middleware to calculate duration
timeEntrySchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }
  next();
});

export const TimeEntry = mongoose.model<ITimeEntry>('TimeEntry', timeEntrySchema);
