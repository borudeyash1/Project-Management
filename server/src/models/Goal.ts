import mongoose, { Document, Schema } from 'mongoose';

export interface IMilestone {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedDate?: Date;
  dueDate: Date;
}

export interface IGoal extends Document {
  title: string;
  description: string;
  type: 'personal' | 'team' | 'project' | 'company';
  category: 'productivity' | 'learning' | 'health' | 'financial' | 'career' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  startDate: Date;
  targetDate: Date;
  completedDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  milestones: IMilestone[];
  tags: string[];
  slackChannelId?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  completedDate: { type: Date },
  dueDate: { type: Date, required: true }
});

const goalSchema = new Schema<IGoal>({
  title: {
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
    enum: ['personal', 'team', 'project', 'company'],
    required: true
  },
  category: {
    type: String,
    enum: ['productivity', 'learning', 'health', 'financial', 'career', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'paused', 'cancelled'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  targetDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  milestones: [milestoneSchema],
  tags: [{
    type: String,
    trim: true
  }],
  slackChannelId: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
goalSchema.index({ createdBy: 1, status: 1 });
goalSchema.index({ createdBy: 1, type: 1 });
goalSchema.index({ createdBy: 1, category: 1 });
goalSchema.index({ createdBy: 1, targetDate: 1 });
goalSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to update progress based on milestones
goalSchema.pre('save', function (next) {
  if (this.milestones && this.milestones.length > 0) {
    const completedMilestones = this.milestones.filter(m => m.completed).length;
    this.progress = Math.round((completedMilestones / this.milestones.length) * 100);

    // Auto-complete goal if all milestones are done
    if (this.progress === 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.completedDate = new Date();
    }
  }
  next();
});

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
