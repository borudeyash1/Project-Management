import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  dueDate: Date;
  startDate?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  tasks: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  completedDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
      index: true
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: false,
      index: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    startDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'delayed'],
      default: 'not-started'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task'
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    completedDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
milestoneSchema.index({ project: 1, dueDate: 1 });
milestoneSchema.index({ workspace: 1, status: 1 });
milestoneSchema.index({ dueDate: 1 });

// Virtual for task completion percentage
milestoneSchema.virtual('taskCompletionPercentage').get(function() {
  if (this.tasks.length === 0) return 0;
  // This would need to be populated with actual task data
  return this.progress;
});

// Method to update status based on progress
milestoneSchema.methods.updateStatus = function() {
  if (this.progress === 100) {
    this.status = 'completed';
    this.completedDate = new Date();
  } else if (this.progress > 0) {
    this.status = 'in-progress';
  } else {
    this.status = 'not-started';
  }
  
  // Check if delayed
  if (this.status !== 'completed' && new Date() > this.dueDate) {
    this.status = 'delayed';
  }
  
  return this.save();
};

export default mongoose.model<IMilestone>('Milestone', milestoneSchema);
