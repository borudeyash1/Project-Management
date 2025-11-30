import mongoose, { Schema, Document } from 'mongoose';
import { IWorkspace } from '../types';

const workspaceSchema = new Schema<IWorkspace>({
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
    type: String,
    required: true
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'manager', 'member'],
      default: 'member'
    },
    permissions: {
      canManageMembers: {
        type: Boolean,
        default: false
      },
      canManageProjects: {
        type: Boolean,
        default: false
      },
      canManageClients: {
        type: Boolean,
        default: false
      },
      canUpdateWorkspaceDetails: {
        type: Boolean,
        default: false
      },
      canManageCollaborators: {
        type: Boolean,
        default: false
      },
      canManageInternalProjectSettings: {
        type: Boolean,
        default: false
      },
      canAccessProjectManagerTabs: {
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
  },
  vaultFolderId: {
    type: Schema.Types.ObjectId,
    ref: 'VaultDocument'
  },
  quickAccessDocs: [{
    type: Schema.Types.ObjectId,
    ref: 'VaultDocument'
  }],
  documentSettings: {
    autoSync: {
      type: Boolean,
      default: true
    },
    allowedFileTypes: [{
      type: String,
      default: ['*']
    }],
    maxStorageGB: {
      type: Number,
      default: 10
    }
  }
}, {
  timestamps: true
});

// Indexes
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });
workspaceSchema.index({ name: 1 });

// Virtual for member count
workspaceSchema.virtual('memberCount').get(function (this: IWorkspace) {
  return this.members.filter((member: any) => member.status === 'active').length;
});

// Method to add member
workspaceSchema.methods.addMember = function (userId: string, role: string = 'member') {
  const existingMember = this.members.find((member: any) =>
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
workspaceSchema.methods.removeMember = function (userId: string) {
  this.members = this.members.filter((member: any) =>
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update member role
workspaceSchema.methods.updateMemberRole = function (userId: string, role: string) {
  const member = this.members.find((member: any) =>
    member.user.toString() === userId.toString()
  );

  if (member) {
    member.role = role;
  }

  return this.save();
};

// Method to check if user is member
workspaceSchema.methods.isMember = function (userId: string) {
  return this.members.some((member: any) =>
    member.user.toString() === userId.toString() && member.status === 'active'
  );
};

// Method to check if user has permission
workspaceSchema.methods.hasPermission = function (userId: string, permission: string) {
  const member = this.members.find((member: any) =>
    member.user.toString() === userId.toString() && member.status === 'active'
  );

  if (!member) return false;

  // Owner has all permissions
  if (member.role === 'owner') return true;

  return member.permissions[permission] || false;
};

// Transform JSON output
workspaceSchema.methods.toJSON = function () {
  const workspaceObject = this.toObject();
  workspaceObject.memberCount = this.memberCount;
  return workspaceObject;
};

export default mongoose.model<IWorkspace>('Workspace', workspaceSchema);
