import mongoose, { Schema, Document } from 'mongoose';
import { IProject } from '../types';

const projectSchema = new Schema<IProject>({
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
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'manager', 'member', 'viewer'],
      default: 'member'
    },
    permissions: {
      canEdit: {
        type: Boolean,
        default: false
      },
      canDelete: {
        type: Boolean,
        default: false
      },
      canManageMembers: {
        type: Boolean,
        default: false
      },
      canViewReports: {
        type: Boolean,
        default: true
      }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
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
  endDate: {
    type: Date
  },
  budget: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApprovalForTasks: {
      type: Boolean,
      default: false
    },
    enableTimeTracking: {
      type: Boolean,
      default: true
    },
    enableFileSharing: {
      type: Boolean,
      default: true
    }
  },
  metrics: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    overdueTasks: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    averageTaskCompletionTime: {
      type: Number,
      default: 0
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
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ dueDate: 1 });

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  if (this.metrics.totalTasks === 0) return 0;
  return Math.round((this.metrics.completedTasks / this.metrics.totalTasks) * 100);
});

// Virtual for member count
projectSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to add member
projectSchema.methods.addMember = function(userId: string, role: string = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.members.push({
      user: userId,
      role: role
    });
  }
  
  return this.save();
};

// Method to remove member
projectSchema.methods.removeMember = function(userId: string) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update member role
projectSchema.methods.updateMemberRole = function(userId: string, role: string) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (member) {
    member.role = role;
  }
  
  return this.save();
};

// Method to check if user is member
projectSchema.methods.isMember = function(userId: string) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Method to check if user has permission
projectSchema.methods.hasPermission = function(userId: string, permission: string) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) return false;
  
  // Owner has all permissions
  if (member.role === 'owner') return true;
  
  return member.permissions[permission] || false;
};

// Method to update progress
projectSchema.methods.updateProgress = function() {
  if (this.metrics.totalTasks === 0) {
    this.progress = 0;
  } else {
    this.progress = Math.round((this.metrics.completedTasks / this.metrics.totalTasks) * 100);
  }
  return this.save();
};

// Transform JSON output
projectSchema.methods.toJSON = function() {
  const projectObject = this.toObject();
  projectObject.completionPercentage = this.completionPercentage;
  projectObject.memberCount = this.memberCount;
  return projectObject;
};

export default mongoose.model<IProject>('Project', projectSchema);
