import mongoose, { Schema, Document } from "mongoose";
import { ITeam } from "../types";

const teamSchema: Schema<any> = new Schema<any>(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      maxlength: [100, "Team name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["leader", "senior", "member", "intern"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["active", "inactive", "on-leave"],
          default: "active",
        },
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
teamSchema.index({ workspace: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ "members.user": 1 });

teamSchema.virtual("memberCount").get(function () {
  const self = this as any;
  return (self.members || []).filter(
    (member: any) => member.status === "active",
  ).length;
});

teamSchema.methods.addMember = function (
  userId: string,

  role: string = "member",
) {
  const self = this as any;
  const existingMember = (self.members || []).find(
    (member: any) => member.user.toString() === userId.toString(),
  );

  if (!existingMember) {
    self.members = self.members || [];
    self.members.push({
      user: userId,

      role: role,

      status: "active",
    });
  }

  return this.save();
};

teamSchema.methods.removeMember = function (userId: string) {
  const self = this as any;
  self.members = (self.members || []).filter(
    (member: any) => member.user.toString() !== userId.toString(),
  );

  return this.save();
};

teamSchema.methods.updateMemberRole = function (userId: string, role: string) {
  const self = this as any;
  const member = (self.members || []).find(
    (member: any) => member.user.toString() === userId.toString(),
  );

  if (member) {
    member.role = role;
  }

  return this.save();
};

// Transform JSON output
teamSchema.methods.toJSON = function () {
  const teamObject = this.toObject();
  teamObject.memberCount = this.memberCount;
  return teamObject;
};

export default mongoose.model("Team", teamSchema);
