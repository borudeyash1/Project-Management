const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    maxlength: [100, 'Workspace name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['personal', 'team', 'enterprise'],
    default: 'team'
  },
  region: {
    type: String,
    trim: true,
    maxlength: [50, 'Region cannot exceed 50 characters']
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
      enum: ['owner', 'admin', 'manager', 'member'],
      default: 'member'
    },
    permissions: {
      canCreateProject: {
        type: Boolean,
        default: false
      },
      canManageEmployees: {
        type: Boolean,
        default: false
      },
      canViewPayroll: {
        type: Boolean,
        default: false
      },
      canExportReports: {
        type: Boolean,
        default: false
      },
      canManageWorkspace: {
        type: Boolean,
        default: false
      }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'pending'
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
    requireApprovalForJoining: {
      type: Boolean,
      default: true
    },
    defaultProjectPermissions: {
      canCreate: {
        type: Boolean,
        default: false
      },
      canManage: {
        type: Boolean,
        default: false
      },
      canView: {
        type: Boolean,
        default: true
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    maxMembers: {
      type: Number,
      default: 5
    },
    maxProjects: {
      type: Number,
      default: 3
    },
    features: {
      advancedAnalytics: {
        type: Boolean,
        default: false
      },
      customFields: {
        type: Boolean,
        default: false
      },
      apiAccess: {
        type: Boolean,
        default: false
      },
      prioritySupport: {
        type: Boolean,
        default: false
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
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });
workspaceSchema.index({ name: 1 });

// Virtual for member count
workspaceSchema.virtual('memberCount').get(function() {
  return this.members.filter(member => member.status === 'active').length;
});

// Method to add member
workspaceSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.status = 'active';
    existingMember.role = role;
  } else {
    this.members.push({
      user: userId,
      role: role,
      status: 'active'
    });
  }
  
  return this.save();
};

// Method to remove member
workspaceSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update member role
workspaceSchema.methods.updateMemberRole = function(userId, role) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (member) {
    member.role = role;
  }
  
  return this.save();
};

// Method to check if user is member
workspaceSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && member.status === 'active'
  );
};

// Method to check if user has permission
workspaceSchema.methods.hasPermission = function(userId, permission) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString() && member.status === 'active'
  );
  
  if (!member) return false;
  
  // Owner has all permissions
  if (member.role === 'owner') return true;
  
  return member.permissions[permission] || false;
};

// Transform JSON output
workspaceSchema.methods.toJSON = function() {
  const workspaceObject = this.toObject();
  workspaceObject.memberCount = this.memberCount;
  return workspaceObject;
};

module.exports = mongoose.model('Workspace', workspaceSchema);
