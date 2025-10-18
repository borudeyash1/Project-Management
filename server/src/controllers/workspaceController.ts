import { Request, Response } from 'express';
import Workspace from '../models/Workspace';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse, IWorkspace } from '../types';

// Create workspace
export const createWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, type, region } = req.body;
    const userId = req.user!._id;

    // Create workspace
    const workspace = new Workspace({
      name,
      description,
      type: type || 'team',
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

    // Populate the workspace with owner details
    await workspace.populate('owner', 'fullName email avatarUrl');

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
