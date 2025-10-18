import mongoose, { Schema, Document } from 'mongoose';
import { ITask } from '../types';

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'in-review', 'done', 'cancelled'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['task', 'bug', 'feature', 'story', 'epic'],
    default: 'task'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    default: 0,
    min: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked-by', 'relates-to'],
      default: 'relates-to'
    }
  }],
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  timeEntries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      trim: true
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
      min: 0
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }],
  customFields: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select'],
      default: 'text'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ project: 1 });
taskSchema.index({ workspace: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ type: 1 });

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.subtasks.length === 0) return this.progress;
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for total time spent
taskSchema.virtual('totalTimeSpent').get(function() {
  return this.timeEntries.reduce((total, entry) => {
    if (entry.duration) {
      return total + entry.duration;
    }
    return total;
  }, 0);
});

// Method to add subtask
taskSchema.methods.addSubtask = function(title: string) {
  this.subtasks.push({
    title: title,
    completed: false
  });
  return this.save();
};

// Method to complete subtask
taskSchema.methods.completeSubtask = function(subtaskIndex: number) {
  if (this.subtasks[subtaskIndex]) {
    this.subtasks[subtaskIndex].completed = true;
    this.subtasks[subtaskIndex].completedAt = new Date();
  }
  return this.save();
};

// Method to add comment
taskSchema.methods.addComment = function(content: string, authorId: string) {
  this.comments.push({
    content: content,
    author: authorId
  });
  return this.save();
};

// Method to add time entry
taskSchema.methods.addTimeEntry = function(userId: string, description: string, startTime: Date) {
  this.timeEntries.push({
    user: userId,
    description: description,
    startTime: startTime,
    isActive: true
  });
  return this.save();
};

// Method to stop time entry
taskSchema.methods.stopTimeEntry = function(userId: string) {
  const activeEntry = this.timeEntries.find(entry => 
    entry.user.toString() === userId.toString() && entry.isActive
  );
  
  if (activeEntry) {
    activeEntry.endTime = new Date();
    activeEntry.duration = activeEntry.endTime.getTime() - activeEntry.startTime.getTime();
    activeEntry.isActive = false;
  }
  
  return this.save();
};

// Method to update status
taskSchema.methods.updateStatus = function(status: string) {
  this.status = status;
  
  if (status === 'done') {
    this.completedDate = new Date();
    this.progress = 100;
  } else if (status === 'cancelled') {
    this.completedDate = new Date();
  }
  
  return this.save();
};

// Transform JSON output
taskSchema.methods.toJSON = function() {
  const taskObject = this.toObject();
  taskObject.completionPercentage = this.completionPercentage;
  taskObject.totalTimeSpent = this.totalTimeSpent;
  return taskObject;
};

export default mongoose.model<ITask>('Task', taskSchema);
