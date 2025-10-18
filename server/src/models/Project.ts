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
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  teamMembers: [{
    user: {
      type: String,
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
  completedDate: {
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
projectSchema.index({ priority: 1 });
projectSchema.index({ dueDate: 1 });

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  return this.progress || 0;
});

// Virtual for member count
projectSchema.virtual('teamMemberCount').get(function() {
  return this.teamMembers.length;
});

// Method to add team member
projectSchema.methods.addTeamMember = function(userId: string, role: string = 'member') {
  const existingMember = this.teamMembers.find((member: any) => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.teamMembers.push({
      user: userId,
      role: role
    });
  }
  
  return this.save();
};

// Method to remove team member
projectSchema.methods.removeTeamMember = function(userId: string) {
  this.teamMembers = this.teamMembers.filter((member: any) => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update team member role
projectSchema.methods.updateMemberRole = function(userId: string, role: string) {
  const member = this.teamMembers.find((member: any) => 
    member.user.toString() === userId.toString()
  );
  
  if (member) {
    member.role = role;
  }
  
  return this.save();
};

// Method to check if user is team member
projectSchema.methods.isTeamMember = function(userId: string) {
  return this.teamMembers.some((member: any) => 
    member.user.toString() === userId.toString()
  );
};

// Method to check if user has permission
projectSchema.methods.hasPermission = function(userId: string, permission: string) {
  const member = this.teamMembers.find((member: any) => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) return false;
  
  // Owner has all permissions
  if (member.role === 'owner') return true;
  
  return member.permissions[permission] || false;
};

// Method to update progress
projectSchema.methods.updateProgress = function() {
  // Progress is already set, just save
  return this.save();
};

// Transform JSON output
projectSchema.methods.toJSON = function() {
  const projectObject = this.toObject();
  projectObject.completionPercentage = this.completionPercentage;
  projectObject.teamMemberCount = this.teamMemberCount;
  return projectObject;
};

export default mongoose.model<IProject>('Project', projectSchema);
