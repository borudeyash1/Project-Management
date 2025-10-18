import { Request, Response } from 'express';
import Project from '../models/Project';
import Workspace from '../models/Workspace';
import { AuthenticatedRequest, ApiResponse, IProject } from '../types';

// Create project
export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, workspaceId, startDate, dueDate, priority, category } = req.body;
    const userId = req.user!._id;

    // Verify workspace access
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.status': 'active' }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Create project
    const project = new Project({
      name,
      description,
      workspace: workspaceId,
      owner: userId,
      members: [{
        user: userId,
        role: 'owner',
        permissions: {
          canEdit: true,
          canDelete: true,
          canManageMembers: true,
          canViewReports: true
        }
      }],
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'medium',
      category
    });

    await project.save();

    // Populate the project with owner details
    await project.populate('owner', 'fullName email avatarUrl');
    await project.populate('members.user', 'fullName email avatarUrl');

    const response: ApiResponse<IProject> = {
      success: true,
      message: 'Project created successfully',
      data: project
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during project creation'
    });
  }
};

// Get workspace projects
export const getWorkspaceProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user!._id;

    // Verify workspace access
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.status': 'active' }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isActive: true
    })
    .populate('owner', 'fullName email avatarUrl')
    .populate('members.user', 'fullName email avatarUrl')
    .sort({ createdAt: -1 });

    const response: ApiResponse<IProject[]> = {
      success: true,
      message: 'Projects retrieved successfully',
      data: projects
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get project by ID
export const getProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const project = await Project.findOne({
      _id: id,
      isActive: true,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    })
    .populate('owner', 'fullName email avatarUrl')
    .populate('members.user', 'fullName email avatarUrl');

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
      return;
    }

    const response: ApiResponse<IProject> = {
      success: true,
      message: 'Project retrieved successfully',
      data: project
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update project
export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;
    const updateData = req.body;

    const project = await Project.findOne({
      _id: id,
      isActive: true,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.role': { $in: ['owner', 'manager'] } }
      ]
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
      return;
    }

    // Update project
    Object.assign(project, updateData);
    
    // Convert date strings to Date objects if provided
    if (updateData.startDate) {
      project.startDate = new Date(updateData.startDate);
    }
    if (updateData.dueDate) {
      project.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.endDate) {
      project.set('endDate', new Date(updateData.endDate));
    }

    await project.save();

    await project.populate('owner', 'fullName email avatarUrl');
    await project.populate('members.user', 'fullName email avatarUrl');

    const response: ApiResponse<IProject> = {
      success: true,
      message: 'Project updated successfully',
      data: project
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete project
export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const project = await Project.findOne({
      _id: id,
      owner: userId
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
      return;
    }

    // Soft delete by setting isActive to false
    project.isActive = false;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add member to project
export const addMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    const currentUserId = req.user!._id;

    const project = await Project.findOne({
      _id: id,
      isActive: true,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'manager'] } }
      ]
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
      return;
    }

    // Add member
    (project as any).members.push({
      user: userId,
      role: role || 'member',
      permissions: {
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canViewReports: true
      }
    });
    await project.save();

    await project.populate('members.user', 'fullName email avatarUrl');

    const response: ApiResponse<IProject> = {
      success: true,
      message: 'Member added successfully',
      data: project
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

// Remove member from project
export const removeMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, memberId } = req.params;
    const currentUserId = req.user!._id;

    const project = await Project.findOne({
      _id: id,
      isActive: true,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'manager'] } }
      ]
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
      return;
    }

    // Remove member
    (project as any).members = (project as any).members.filter((member: any) => 
      member.user.toString() !== memberId
    );
    await project.save();

    await project.populate('members.user', 'fullName email avatarUrl');

    const response: ApiResponse<IProject> = {
      success: true,
      message: 'Member removed successfully',
      data: project
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

    const project = await Project.findOne({
      _id: id,
      isActive: true,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'manager'] } }
      ]
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
      return;
    }

    // Update member role
    const member = (project as any).members.find((member: any) => 
      member.user.toString() === memberId
    );
    if (member) {
      member.role = role;
    }
    await project.save();

    await project.populate('members.user', 'fullName email avatarUrl');

    const response: ApiResponse<IProject> = {
      success: true,
      message: 'Member role updated successfully',
      data: project
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
