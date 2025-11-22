import { Request, Response, RequestHandler } from 'express';
import Workspace from '../models/Workspace';
import User from '../models/User';
import Notification from '../models/Notification';
import SubscriptionPlan from '../models/SubscriptionPlan';
import { sendEmail } from '../services/emailService';
import { generateOTP, OTP_VALIDITY_MS } from '../utils/otp';
import { AuthenticatedRequest, ApiResponse, IWorkspace } from '../types';

const buildBillingResponse = (plan: any, type: string, estimatedMembers: number) => {
  const workspaceType = type === 'enterprise' ? 'enterprise' : type === 'personal' ? 'personal' : 'team';
  const baseFee = plan.workspaceFees?.[workspaceType] ?? plan.workspaceFees?.team ?? 0;
  const perHead = plan.perHeadPrice ?? 0;
  const total = baseFee + perHead * Math.max(0, estimatedMembers);
  return {
    baseFee,
    perHeadPrice: perHead,
    estimatedMembers,
    total
  };
};

// Create workspace with plan limits & OTP guard
export const createWorkspace: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      description,
      type = 'team',
      region,
      estimatedMembers = 0
    } = req.body;
    const user = (req as AuthenticatedRequest).user!;
    const userId = user._id;

    if (!user.workspaceCreationOtpVerifiedAt) {
      res.status(403).json({
        success: false,
        message: 'Please verify the workspace creation OTP before continuing.'
      });
      return;
    }

    if (Date.now() - user.workspaceCreationOtpVerifiedAt.getTime() > OTP_VALIDITY_MS) {
      user.workspaceCreationOtpVerifiedAt = undefined;
      await user.save();
      res.status(403).json({
        success: false,
        message: 'OTP verification expired. Please request a new code.'
      });
      return;
    }

    const planKey = (user.subscription?.plan as 'free' | 'pro' | 'ultra') || 'free';
    const plan = await SubscriptionPlan.findOne({ planKey });
    const ownerWorkspaceCount = await Workspace.countDocuments({ owner: userId });

    // Check workspace limits (default to unlimited if plan or limits not found)
    const maxWorkspaces = plan?.limits?.maxWorkspaces ?? -1;
    if (maxWorkspaces !== -1 && ownerWorkspaceCount >= maxWorkspaces) {
      const billing = buildBillingResponse(plan || {}, type, Number(estimatedMembers));
      res.status(402).json({
        success: false,
        message: 'Workspace limit reached for your current subscription.',
        requiresCustomBilling: true,
        billing
      });
      return;
    }

    const workspace = new Workspace({
      name,
      description,
      type,
      region,
      owner: userId,
      members: [{
        user: userId,
        role: 'owner',
        permissions: {
          canCreateProject: true,
          canManageEmployees: true,
          canViewPayroll: true,
          canExportReports: true,
          canManageWorkspace: true
        },
        status: 'active'
      }]
    });

    await workspace.save();
    await workspace.populate('owner', 'fullName email avatarUrl');

    user.workspaceCreationOtp = undefined;
    user.workspaceCreationOtpExpires = undefined;
    user.workspaceCreationOtpVerifiedAt = undefined;
    await user.save();

    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Workspace created successfully',
      data: workspace
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Create workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during workspace creation'
    });
  }
};

// Discover public workspaces
export const discoverWorkspaces: RequestHandler = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      isActive: { $ne: false },
      'settings.isPublic': true
    })
      .populate('owner', 'fullName email avatarUrl')
      .sort({ createdAt: -1 });

    const response: ApiResponse<IWorkspace[]> = {
      success: true,
      message: 'Workspaces retrieved successfully',
      data: workspaces as any
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Discover workspaces error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send OTP for workspace creation
export const sendWorkspaceCreationOtp: RequestHandler = async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const otp = generateOTP();
    user.workspaceCreationOtp = otp;
    user.workspaceCreationOtpExpires = new Date(Date.now() + OTP_VALIDITY_MS);
    user.workspaceCreationOtpVerifiedAt = undefined;
    await user.save();

    const emailSubject = 'Saarthi Workspace Creation OTP';
    const emailHtml = `
      <p>Hello ${user.fullName},</p>
      <p>You're initiating a new workspace. Please use the code below to verify your email:</p>
      <h2>${otp}</h2>
      <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: emailSubject,
        html: emailHtml
      });
    } catch (error) {
      console.warn('Failed to send workspace OTP email:', error);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address'
    });
  } catch (error: any) {
    console.error('Send workspace OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate workspace OTP'
    });
  }
};

// Verify workspace creation OTP
export const verifyWorkspaceCreationOtp: RequestHandler = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      res.status(400).json({ success: false, message: 'OTP is required' });
      return;
    }

    const user = (req as AuthenticatedRequest).user!;
    if (!user.workspaceCreationOtp || !user.workspaceCreationOtpExpires) {
      res.status(400).json({ success: false, message: 'No OTP request found' });
      return;
    }

    if (user.workspaceCreationOtp !== otp) {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
      return;
    }

    if (user.workspaceCreationOtpExpires < new Date()) {
      res.status(400).json({ success: false, message: 'OTP has expired' });
      return;
    }

    user.workspaceCreationOtpVerifiedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Workspace creation OTP verified'
    });
  } catch (error: any) {
    console.error('Verify workspace OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

// Get user workspaces
export const getUserWorkspaces = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    const workspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.status': 'active' }
      ]
    })
      .populate('owner', 'fullName email avatarUrl')
      .populate('members.user', 'fullName email avatarUrl')
      .sort({ createdAt: -1 });

    const response: ApiResponse<IWorkspace[]> = {
      success: true,
      message: 'Workspaces retrieved successfully',
      data: workspaces
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get workspaces error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get workspace by ID
export const getWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const workspace = await Workspace.findOne({
      _id: id,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.status': 'active' }
      ]
    })
      .populate('owner', 'fullName email avatarUrl')
      .populate('members.user', 'fullName email avatarUrl');

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Workspace retrieved successfully',
      data: workspace
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update workspace
export const updateWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;
    const updateData = req.body;

    const workspace = await Workspace.findOne({
      _id: id,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Update workspace
    Object.assign(workspace, updateData);
    await workspace.save();

    await workspace.populate('owner', 'fullName email avatarUrl');
    await workspace.populate('members.user', 'fullName email avatarUrl');

    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Workspace updated successfully',
      data: workspace
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Update workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete workspace
export const deleteWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const workspace = await Workspace.findOne({
      _id: id,
      owner: userId
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    await Workspace.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add member to workspace
export const addMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    const currentUserId = req.user!._id;

    const workspace = await Workspace.findOne({
      _id: id,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Add member
    await workspace.addMember(userId, role || 'member');

    await workspace.populate('members.user', 'fullName email avatarUrl');

    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Member added successfully',
      data: workspace
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Remove member from workspace
export const removeMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, memberId } = req.params;
    const currentUserId = req.user!._id;

    const workspace = await Workspace.findOne({
      _id: id,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Remove member
    await workspace.removeMember(memberId as string);

    await workspace.populate('members.user', 'fullName email avatarUrl');

    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Member removed successfully',
      data: workspace
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update member role
export const updateMemberRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user!._id;

    const workspace = await Workspace.findOne({
      _id: id,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Update member role
    await workspace.updateMemberRole(memberId as string, role);

    await workspace.populate('members.user', 'fullName email avatarUrl');

    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Member role updated successfully',
      data: workspace
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send workspace invite from owner/admin to a specific user
export const sendWorkspaceInvite: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetUserId, identifier, message } = req.body as {
      targetUserId?: string;
      identifier?: string;
      message?: string;
    };

    const authReq = req as AuthenticatedRequest;
    const currentUser = authReq.user!;
    const currentUserId = currentUser._id;

    const workspace = await Workspace.findOne({
      _id: id,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    let targetUser: any = null;
    if (targetUserId) {
      targetUser = await User.findById(targetUserId);
    } else if (identifier) {
      const query: any = identifier.includes('@')
        ? { email: identifier.toLowerCase() }
        : { username: identifier };
      targetUser = await User.findOne(query);
    }

    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Target user not found' });
      return;
    }

    if (targetUser._id.toString() === currentUserId.toString()) {
      res.status(400).json({ success: false, message: 'You cannot invite yourself' });
      return;
    }

    await Notification.create({
      type: 'workspace',
      title: `Workspace invitation: ${workspace.name}`,
      message:
        message ||
        `${currentUser.fullName || 'Workspace owner'} invited you to join workspace "${workspace.name}"`,
      userId: targetUser._id.toString(),
      relatedId: workspace._id.toString()
    });

    const response: ApiResponse = {
      success: true,
      message: 'Invitation sent successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Send workspace invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Accept workspace invite by notification
export const acceptWorkspaceInvite: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { notificationId } = req.body as { notificationId?: string };
    const authReq = req as AuthenticatedRequest;
    const currentUser = authReq.user!;
    const currentUserId = currentUser._id.toString();

    const workspace = await Workspace.findById(id);
    if (!workspace || workspace.isActive === false) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    // Avoid adding duplicates
    if (workspace.isMember(currentUserId)) {
      res.status(400).json({ success: false, message: 'You are already a member of this workspace' });
      return;
    }

    await workspace.addMember(currentUserId, 'member');
    await workspace.populate('members.user', 'fullName email avatarUrl');

    if (notificationId) {
      const notif = await Notification.findOne({ _id: notificationId, userId: currentUserId });
      if (notif) {
        notif.read = true;
        await notif.save();
      }
    }

    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Joined workspace successfully',
      data: workspace as any
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Accept workspace invite error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
