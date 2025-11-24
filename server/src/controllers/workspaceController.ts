import { Request, Response, RequestHandler } from 'express';
import Workspace from '../models/Workspace';
import User from '../models/User';
import Notification from '../models/Notification';
import SubscriptionPlan from '../models/SubscriptionPlan';
import WorkspaceInvitation from '../models/WorkspaceInvitation';
import JoinRequest from '../models/JoinRequest';
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

// Discover all workspaces (public and private)
export const discoverWorkspaces: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    // Get all active workspaces
    const workspaces = await Workspace.find({
      isActive: { $ne: false }
    })
      .populate('owner', 'fullName email avatarUrl')
      .sort({ createdAt: -1 });

    // For each workspace, check if current user has pending invitation or join request
    const workspacesWithStatus = await Promise.all(
      workspaces.map(async (workspace) => {
        const pendingInvite = await WorkspaceInvitation.findOne({
          workspace: workspace._id,
          invitee: currentUserId,
          status: 'pending'
        });

        const pendingJoinRequest = await JoinRequest.findOne({
          workspace: workspace._id,
          user: currentUserId,
          status: 'pending'
        });

        return {
          ...workspace.toJSON(),
          hasPendingInvite: !!pendingInvite,
          hasPendingJoinRequest: !!pendingJoinRequest
        };
      })
    );

    const response: ApiResponse<any[]> = {
      success: true,
      message: 'Workspaces retrieved successfully',
      data: workspacesWithStatus
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

    console.log('🔍 [REMOVE MEMBER] Workspace:', id, 'Member to remove:', memberId, 'Requested by:', currentUserId);

    const workspace = await Workspace.findOne({
      _id: id,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!workspace) {
      console.log('❌ [REMOVE MEMBER] Workspace not found or access denied');
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Prevent removing the workspace owner
    if (workspace.owner.toString() === memberId) {
      console.log('❌ [REMOVE MEMBER] Cannot remove workspace owner');
      res.status(400).json({
        success: false,
        message: 'Cannot remove the workspace owner'
      });
      return;
    }

    // Check if member exists in workspace
    const memberExists = workspace.members.some((member: any) => 
      member.user.toString() === memberId
    );

    if (!memberExists) {
      console.log('❌ [REMOVE MEMBER] Member not found in workspace');
      res.status(404).json({
        success: false,
        message: 'Member not found in this workspace'
      });
      return;
    }

    console.log('🔄 [REMOVE MEMBER] Removing member from workspace...');
    
    // IMPORTANT: We only remove them from the workspace members list
    // Their historical data (tasks, activities, project contributions) is preserved
    // This is done by the removeMember method which only filters the members array
    await workspace.removeMember(memberId as string);

    console.log('✅ [REMOVE MEMBER] Member removed from workspace');
    console.log('📝 [REMOVE MEMBER] Historical data preserved (tasks, activities, contributions)');

    // Note: We do NOT delete:
    // - Tasks created/assigned to this user
    // - Activities logged by this user
    // - Project contributions
    // - Comments or other content
    // These remain for audit trail and historical accuracy

    await workspace.populate('members.user', 'fullName email avatarUrl');

    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Member removed successfully. Their historical data has been preserved.',
      data: workspace
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [REMOVE MEMBER] Error:', error);
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

    // Check if user is already a member
    if (workspace.isMember(targetUser._id.toString())) {
      res.status(400).json({ success: false, message: 'User is already a member of this workspace' });
      return;
    }

    // Check if there's already a pending invitation
    const existingInvite = await WorkspaceInvitation.findOne({
      workspace: workspace._id,
      invitee: targetUser._id,
      status: 'pending'
    });

    if (existingInvite) {
      res.status(400).json({ success: false, message: 'An invitation is already pending for this user' });
      return;
    }

    // Create workspace invitation record
    const invitation = await WorkspaceInvitation.create({
      workspace: workspace._id,
      inviter: currentUserId,
      invitee: targetUser._id,
      message: message || '',
      status: 'pending'
    });

    // Create notification for the invitee
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
      message: 'Invitation sent successfully',
      data: invitation
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

    // Update invitation status to accepted
    const invitation = await WorkspaceInvitation.findOne({
      workspace: workspace._id,
      invitee: currentUserId,
      status: 'pending'
    });

    if (invitation) {
      invitation.status = 'accepted';
      invitation.respondedAt = new Date();
      await invitation.save();
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

// Reject workspace invite
export const rejectWorkspaceInvite: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id.toString();

    const invitation = await WorkspaceInvitation.findOne({
      workspace: id,
      invitee: currentUserId,
      status: 'pending'
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Invitation not found' });
      return;
    }

    invitation.status = 'rejected';
    invitation.respondedAt = new Date();
    await invitation.save();

    const response: ApiResponse = {
      success: true,
      message: 'Invitation rejected successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Reject workspace invite error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get sent invitations for a workspace (for workspace owner/admin)
export const getSentInvitations: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    // Verify user has access to this workspace
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

    const invitations = await WorkspaceInvitation.find({
      workspace: id
    })
      .populate('inviter', 'fullName email avatarUrl')
      .populate('invitee', 'fullName email avatarUrl')
      .sort({ createdAt: -1 });

    const response: ApiResponse = {
      success: true,
      message: 'Invitations retrieved successfully',
      data: invitations
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get sent invitations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get received invitations for current user
export const getReceivedInvitations: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    const invitations = await WorkspaceInvitation.find({
      invitee: currentUserId
    })
      .populate('inviter', 'fullName email avatarUrl')
      .populate('workspace', 'name description type')
      .sort({ createdAt: -1 });

    const response: ApiResponse = {
      success: true,
      message: 'Invitations retrieved successfully',
      data: invitations
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get received invitations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Cancel workspace invitation (for workspace owner/admin)
export const cancelWorkspaceInvite: RequestHandler = async (req, res) => {
  try {
    const { id, invitationId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    // Verify user has access to this workspace
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

    const invitation = await WorkspaceInvitation.findOne({
      _id: invitationId,
      workspace: id,
      status: 'pending'
    });

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Invitation not found or already processed' });
      return;
    }

    await invitation.deleteOne();

    const response: ApiResponse = {
      success: true,
      message: 'Invitation cancelled successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Cancel workspace invite error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Send join request to workspace
export const sendJoinRequest: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id.toString();

    const workspace = await Workspace.findById(id);
    if (!workspace || workspace.isActive === false) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    // Check if user is already a member
    if (workspace.isMember(currentUserId)) {
      res.status(400).json({ success: false, message: 'You are already a member of this workspace' });
      return;
    }

    // Check if there's already a pending join request
    const existingRequest = await JoinRequest.findOne({
      workspace: id,
      user: currentUserId,
      status: 'pending'
    });

    if (existingRequest) {
      res.status(400).json({ success: false, message: 'You already have a pending join request for this workspace' });
      return;
    }

    // Create join request
    console.log('🔍 [JOIN REQUEST] Creating join request for workspace:', id, 'user:', currentUserId);
    const joinRequest = await JoinRequest.create({
      workspace: id,
      user: currentUserId,
      message: message || '',
      status: 'pending'
    });
    console.log('✅ [JOIN REQUEST] Join request created:', joinRequest._id);

    // Create notification for workspace owner
    await Notification.create({
      type: 'workspace',
      title: `New join request for ${workspace.name}`,
      message: `${authReq.user!.fullName || 'A user'} has requested to join your workspace "${workspace.name}"`,
      userId: workspace.owner,
      relatedId: workspace._id.toString()
    });

    const response: ApiResponse = {
      success: true,
      message: 'Join request sent successfully',
      data: joinRequest
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Send join request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get join requests for a workspace (for workspace owner/admin)
export const getJoinRequests: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    // Verify user has access to this workspace
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

    console.log('🔍 [GET JOIN REQUESTS] Fetching join requests for workspace:', id);

    const joinRequests = await JoinRequest.find({
      workspace: id,
      status: 'pending'  // Only get pending requests
    })
      .populate('user', 'fullName email avatarUrl')
      .sort({ createdAt: -1 });

    console.log('✅ [GET JOIN REQUESTS] Found', joinRequests.length, 'pending join requests');

    const response: ApiResponse = {
      success: true,
      message: 'Join requests retrieved successfully',
      data: joinRequests
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [GET JOIN REQUESTS] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Approve join request
export const approveJoinRequest: RequestHandler = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    // Verify user has access to this workspace
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

    const joinRequest = await JoinRequest.findOne({
      _id: requestId,
      workspace: id,
      status: 'pending'
    });

    if (!joinRequest) {
      res.status(404).json({ success: false, message: 'Join request not found or already processed' });
      return;
    }

    // Update join request status
    joinRequest.status = 'approved';
    await joinRequest.save();

    // Add user to workspace
    await workspace.addMember(joinRequest.user, 'member');

    // Create notification for the user
    await Notification.create({
      type: 'workspace',
      title: `Join request approved`,
      message: `Your request to join "${workspace.name}" has been approved`,
      userId: joinRequest.user,
      relatedId: workspace._id.toString()
    });

    const response: ApiResponse = {
      success: true,
      message: 'Join request approved successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Approve join request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Reject join request
export const rejectJoinRequest: RequestHandler = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id;

    // Verify user has access to this workspace
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

    const joinRequest = await JoinRequest.findOne({
      _id: requestId,
      workspace: id,
      status: 'pending'
    });

    if (!joinRequest) {
      res.status(404).json({ success: false, message: 'Join request not found or already processed' });
      return;
    }

    // Update join request status
    joinRequest.status = 'rejected';
    await joinRequest.save();

    // Create notification for the user
    await Notification.create({
      type: 'workspace',
      title: `Join request rejected`,
      message: `Your request to join "${workspace.name}" has been rejected`,
      userId: joinRequest.user,
      relatedId: workspace._id.toString()
    });

    const response: ApiResponse = {
      success: true,
      message: 'Join request rejected successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Reject join request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Cancel own join request (for users who sent the request)
export const cancelJoinRequest: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params; // workspace id
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user!._id.toString();

    console.log('🔍 [CANCEL JOIN REQUEST] Looking for join request - workspace:', id, 'user:', currentUserId);

    // Find the user's pending join request
    const joinRequest = await JoinRequest.findOne({
      workspace: id,
      user: currentUserId,
      status: 'pending'
    });

    console.log('🔍 [CANCEL JOIN REQUEST] Found join request:', joinRequest ? joinRequest._id : 'NOT FOUND');

    if (!joinRequest) {
      res.status(404).json({ success: false, message: 'No pending join request found' });
      return;
    }

    // Delete the join request
    await JoinRequest.deleteOne({ _id: joinRequest._id });
    console.log('✅ [CANCEL JOIN REQUEST] Join request cancelled successfully');

    const response: ApiResponse = {
      success: true,
      message: 'Join request cancelled successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [CANCEL JOIN REQUEST] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
