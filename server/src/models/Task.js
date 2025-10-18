const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed', 'cancelled', 'on-hold'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  type: {
    type: String,
    enum: ['task', 'bug', 'feature', 'epic', 'story', 'subtask'],
    default: 'task'
  },
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
    min: 0,
    default: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Subtask title cannot exceed 200 characters']
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'completed'],
      default: 'todo'
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    completedDate: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked-by', 'relates-to'],
      default: 'blocks'
    }
  }],
  comments: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
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
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  timeEntries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number, // in minutes
      min: 0
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Time entry description cannot exceed 500 characters']
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date
  }],
  customFields: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select', 'multiselect'],
      default: 'text'
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowComments: {
      type: Boolean,
      default: true
    },
    allowTimeTracking: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
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
taskSchema.index({ createdBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ 'watchers': 1 });

// Virtual for subtask completion percentage
taskSchema.virtual('subtaskCompletionPercentage').get(function() {
  if (this.subtasks.length === 0) return 0;
  const completed = this.subtasks.filter(subtask => subtask.status === 'completed').length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Virtual for total time logged
taskSchema.virtual('totalTimeLogged').get(function() {
  return this.timeEntries.reduce((total, entry) => {
    if (entry.isApproved && entry.duration) {
      return total + entry.duration;
    }
    return total;
  }, 0);
});

// Virtual for comment count
taskSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to add subtask
taskSchema.methods.addSubtask = function(subtaskData, userId) {
  this.subtasks.push({
    ...subtaskData,
    createdBy: userId
  });
  return this.save();
};

// Method to update subtask
taskSchema.methods.updateSubtask = function(subtaskId, updateData) {
  const subtask = this.subtasks.id(subtaskId);
  if (subtask) {
    Object.assign(subtask, updateData);
    if (updateData.status === 'completed') {
      subtask.completedDate = new Date();
    }
  }
  return this.save();
};

// Method to delete subtask
taskSchema.methods.deleteSubtask = function(subtaskId) {
  this.subtasks.pull(subtaskId);
  return this.save();
};

// Method to add comment
taskSchema.methods.addComment = function(content, userId) {
  this.comments.push({
    content,
    author: userId
  });
  return this.save();
};

// Method to update comment
taskSchema.methods.updateComment = function(commentId, content, userId) {
  const comment = this.comments.id(commentId);
  if (comment && comment.author.toString() === userId.toString()) {
    comment.content = content;
    comment.updatedAt = new Date();
    comment.isEdited = true;
  }
  return this.save();
};

// Method to delete comment
taskSchema.methods.deleteComment = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment && comment.author.toString() === userId.toString()) {
    this.comments.pull(commentId);
  }
  return this.save();
};

// Method to add time entry
taskSchema.methods.addTimeEntry = function(timeEntryData, userId) {
  this.timeEntries.push({
    ...timeEntryData,
    user: userId
  });
  return this.save();
};

// Method to approve time entry
taskSchema.methods.approveTimeEntry = function(timeEntryId, approverId) {
  const timeEntry = this.timeEntries.id(timeEntryId);
  if (timeEntry) {
    timeEntry.isApproved = true;
    timeEntry.approvedBy = approverId;
    timeEntry.approvedAt = new Date();
  }
  return this.save();
};

// Method to add watcher
taskSchema.methods.addWatcher = function(userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
  }
  return this.save();
};

// Method to remove watcher
taskSchema.methods.removeWatcher = function(userId) {
  this.watchers = this.watchers.filter(watcher => watcher.toString() !== userId.toString());
  return this.save();
};

// Transform JSON output
transform: function() {
  const taskObject = this.toObject();
  taskObject.subtaskCompletionPercentage = this.subtaskCompletionPercentage;
  taskObject.totalTimeLogged = this.totalTimeLogged;
  taskObject.commentCount = this.commentCount;
  return taskObject;
};

module.exports = mongoose.model('Task', taskSchema);
