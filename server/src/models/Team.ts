import mongoose, { Schema, Document } from 'mongoose';
import { ITeam } from '../types';

const teamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  leader: {
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
      enum: ['leader', 'senior', 'member', 'intern'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave'],
      default: 'active'
    }
  }],
  skills: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
teamSchema.index({ workspace: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ 'members.user': 1 });

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.filter(member => member.status === 'active').length;
});

// Method to add member
teamSchema.methods.addMember = function(userId: string, role: string = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.members.push({
      user: userId,
      role: role,
      status: 'active'
    });
  }
  
  return this.save();
};

// Method to remove member
teamSchema.methods.removeMember = function(userId: string) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update member role
teamSchema.methods.updateMemberRole = function(userId: string, role: string) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (member) {
    member.role = role;
  }
  
  return this.save();
};

// Transform JSON output
teamSchema.methods.toJSON = function() {
  const teamObject = this.toObject();
  teamObject.memberCount = this.memberCount;
  return teamObject;
};

export default mongoose.model<ITeam>('Team', teamSchema);
