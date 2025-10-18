const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  client: {
    type: String,
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
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
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
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
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  budget: {
    estimated: {
      type: Number,
      min: 0
    },
    actual: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['project-manager', 'developer', 'designer', 'tester', 'analyst', 'member'],
      default: 'member'
    },
    permissions: {
      canManageTasks: {
        type: Boolean,
        default: false
      },
      canManageTeam: {
        type: Boolean,
        default: false
      },
      canViewReports: {
        type: Boolean,
        default: true
      },
      canManageProject: {
        type: Boolean,
        default: false
      }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  milestones: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Milestone name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Milestone description cannot exceed 500 characters']
    },
    dueDate: {
      type: Date,
      required: true
    },
    completedDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'overdue'],
      default: 'pending'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
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
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    timeTracking: {
      enabled: {
        type: Boolean,
        default: true
      },
      requireApproval: {
        type: Boolean,
        default: false
      }
    },
    notifications: {
      taskUpdates: {
        type: Boolean,
        default: true
      },
      milestoneReminders: {
        type: Boolean,
        default: true
      },
      deadlineAlerts: {
        type: Boolean,
        default: true
      }
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
projectSchema.index({ workspace: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ 'teamMembers.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ dueDate: 1 });

// Virtual for team member count
projectSchema.virtual('teamMemberCount').get(function() {
  return this.teamMembers.length;
});

// Virtual for completed tasks count (will be populated from Task model)
projectSchema.virtual('completedTasksCount').get(function() {
  // This will be populated by aggregation pipeline
  return this._completedTasksCount || 0;
});

// Virtual for total tasks count (will be populated from Task model)
projectSchema.virtual('totalTasksCount').get(function() {
  // This will be populated by aggregation pipeline
  return this._totalTasksCount || 0;
});

// Method to add team member
projectSchema.methods.addTeamMember = function(userId, role = 'member') {
  const existingMember = this.teamMembers.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.role = role;
  } else {
    this.teamMembers.push({
      user: userId,
      role: role
    });
  }
  
  return this.save();
};

// Method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  this.teamMembers = this.teamMembers.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to check if user is team member
projectSchema.methods.isTeamMember = function(userId) {
  return this.teamMembers.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Method to check if user has permission
projectSchema.methods.hasPermission = function(userId, permission) {
  const member = this.teamMembers.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) return false;
  
  // Project manager has all permissions
  if (member.role === 'project-manager') return true;
  
  return member.permissions[permission] || false;
};

// Method to add milestone
projectSchema.methods.addMilestone = function(milestoneData, userId) {
  this.milestones.push({
    ...milestoneData,
    createdBy: userId
  });
  return this.save();
};

// Method to update milestone
projectSchema.methods.updateMilestone = function(milestoneId, updateData) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    Object.assign(milestone, updateData);
  }
  return this.save();
};

// Method to delete milestone
projectSchema.methods.deleteMilestone = function(milestoneId) {
  this.milestones.pull(milestoneId);
  return this.save();
};

// Transform JSON output
projectSchema.methods.toJSON = function() {
  const projectObject = this.toObject();
  projectObject.teamMemberCount = this.teamMemberCount;
  projectObject.completedTasksCount = this.completedTasksCount;
  projectObject.totalTasksCount = this.totalTasksCount;
  return projectObject;
};

module.exports = mongoose.model('Project', projectSchema);
