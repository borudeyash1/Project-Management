import { Request, Response } from 'express';
import Project from '../models/Project';
import Workspace from '../models/Workspace';
import mongoose from 'mongoose';
import { AuthenticatedRequest, ApiResponse, IProject } from '../types';
import { PlanName, SUBSCRIPTION_LIMITS, requiresWorkspaceForProjects } from '../config/subscriptionLimits';
import { sendEmail } from '../services/emailService';
import { createActivity } from '../utils/activityUtils';
import { getCalendarService } from '../services/sartthi/calendarService';
import { getMailService } from '../services/sartthi/mailService';

// Create project
export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, workspaceId, startDate, dueDate, priority, category, tier } = req.body;
    const user = req.user!;
    const plan = (user.subscription?.plan || 'free') as keyof typeof SUBSCRIPTION_LIMITS;
    const planLimits = SUBSCRIPTION_LIMITS[plan];

    // Determine tier + workspace relationship
    const isPaidTier = tier && tier !== 'free';
    const needsWorkspace = isPaidTier || requiresWorkspaceForProjects(plan);

    let resolvedWorkspaceId: string | undefined = workspaceId;

    if (workspaceId) {
      // Creating project in a workspace
      const workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [
          { owner: user._id },
          { 'members.user': user._id, 'members.status': 'active' }
        ]
      });

      if (!workspace) {
        res.status(404).json({
          success: false,
          message: 'Workspace not found or access denied'
        });
        return;
      }

      // Enforce workspace project limits when applicable
      const currentWorkspaceProjectCount = await Project.countDocuments({ workspace: workspaceId, isActive: true });
      console.log('📊 Project limit check:', { currentCount: currentWorkspaceProjectCount, workspaceLimit: workspace.subscription?.maxProjects, planLimit: planLimits.maxProjects });

      const workspaceLimit = workspace.subscription?.maxProjects ?? planLimits.maxProjects;

      // Only enforce if limit is explicitly set and not unlimited
      if (workspaceLimit && workspaceLimit !== -1 && currentWorkspaceProjectCount >= workspaceLimit) {
        res.status(403).json({
          success: false,
          message: `Workspace project limit reached (${currentWorkspaceProjectCount}/${workspaceLimit})`
        });
        return;
      }

      resolvedWorkspaceId = workspaceId;
    } else {
      // Creating personal project (no workspace)
      // Free users can only have 1 active personal project
      const existingProjectCount = await Project.countDocuments({
        createdBy: user._id,
        workspace: null,  // Only count personal projects
        isActive: true
      });

      console.log('📊 Personal project check:', { existingCount: existingProjectCount, limit: planLimits.maxProjects });

      if (planLimits.maxProjects !== -1 && existingProjectCount >= planLimits.maxProjects) {
        res.status(403).json({
          success: false,
          message: `Free plan allows only ${planLimits.maxProjects} personal project(s). Create projects in a workspace for more.`
        });
        return;
      }
    }

    // Create project
    const project = new Project({
      name,
      description,
      workspace: resolvedWorkspaceId || null,
      tier: tier || plan,
      createdBy: user._id,
      teamMembers: [{
        user: user._id,
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
    await project.populate('teamMembers.user', 'fullName email avatarUrl');

    // Create activity
    await createActivity(
      user._id,
      'project_created',
      `Created project: ${project.name}`,
      `New project "${project.name}" was created`,
      'Project',
      project._id
    );

    const response: ApiResponse<IProject> = {
      success: true,
      message: 'Project created successfully',
      data: project
    };

    try {
      if (req.user?.email && resolvedWorkspaceId) {
        await sendEmail({
          to: req.user.email,
          subject: `New project created: ${project.name}`,
          html: `
            <h2>Project Created Successfully</h2>
            <p>Your project <strong>${project.name}</strong> has been created${resolvedWorkspaceId ? ' in your workspace' : ''}.</p>
            <p>Status: ${project.status || 'active'} | Priority: ${project.priority || 'medium'}</p>
            <p>Start: ${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} | Due: ${project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</p>
          `,
        });
      }
    } catch (emailErr) {
      console.error('Project creation email failed:', emailErr);
    }

    // Sartthi Integration: Calendar Sync
    const calendarService = getCalendarService();
    if (calendarService) {
      await calendarService.createEventFromProject(project);
    }

    // Sartthi Integration: Mail Notification
    const mailService = getMailService();
    if (mailService) {
      // Collect team emails
      const teamEmails: string[] = [];
      if (req.user?.email) teamEmails.push(req.user.email);
      // Add other members if any (though usually just creator at start)

      await mailService.sendProjectCreationNotification(project, teamEmails);
    }

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
    const { workspaceId: workspaceIdParam } = req.params as { workspaceId?: string };
    const userId = req.user!._id;

    if (!workspaceIdParam) {
      res.status(400).json({
        success: false,
        message: 'Workspace identifier is required',
      });
      return;
    }

    // Handle personal projects (workspace-less)
    if (workspaceIdParam === 'personal') {
      const personalProjects = await Project.find({
        createdBy: userId,
        workspace: null,
        isActive: true
      })
        .populate('teamMembers.user', 'fullName email avatarUrl')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        message: 'Personal projects retrieved successfully',
        data: personalProjects
      });
      return;
    }

    let resolvedWorkspaceId = workspaceIdParam;
    if (!mongoose.Types.ObjectId.isValid(workspaceIdParam)) {
      const fallbackWorkspace = await Workspace.findOne({
        $or: [
          { owner: userId },
          { 'members.user': userId, 'members.status': 'active' },
        ],
      }).select('_id');

      if (!fallbackWorkspace) {
        res.status(400).json({
          success: false,
          message: 'Invalid workspace identifier provided',
        });
        return;
      }

      resolvedWorkspaceId = fallbackWorkspace._id.toString();
    }

    // Verify workspace access
    const workspace = await Workspace.findOne({
      _id: resolvedWorkspaceId,
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

    // Check if user is workspace owner or admin
    const isWorkspaceOwner = workspace.owner.toString() === userId.toString();
    const isWorkspaceAdmin = workspace.members.some(
      (member: any) =>
        member.user.toString() === userId.toString() &&
        (member.role === 'admin' || member.role === 'owner')
    );

    console.log('🔍 [GET PROJECTS] User:', userId, 'Workspace:', resolvedWorkspaceId);
    console.log('🔍 [GET PROJECTS] Is owner:', isWorkspaceOwner, 'Is admin:', isWorkspaceAdmin);

    // Build query based on user role
    let projectQuery: any = {
      workspace: resolvedWorkspaceId,
      isActive: true
    };

    // If user is not workspace owner/admin, only show projects they're assigned to
    if (!isWorkspaceOwner && !isWorkspaceAdmin) {
      projectQuery['teamMembers.user'] = userId;
      console.log('🔍 [GET PROJECTS] Regular member - filtering by team membership (includes managers)');
    } else {
      console.log('🔍 [GET PROJECTS] Owner/Admin - showing all workspace projects');
    }

    const projects = await Project.find(projectQuery)
      .populate('teamMembers.user', 'fullName email avatarUrl')
      .sort({ createdAt: -1 });

    console.log('✅ [GET PROJECTS] Found', projects.length, 'projects');

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
        { 'teamMembers.user': userId }
      ]
    })
      .populate('teamMembers.user', 'fullName email avatarUrl');

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
        { 'teamMembers.user': userId, 'teamMembers.role': { $in: ['owner', 'manager'] } }
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

    // Create activity
    await createActivity(
      userId,
      'project_updated',
      `Updated project: ${project.name}`,
      `Project "${project.name}" was updated`,
      'Project',
      project._id
    );

    await project.populate('owner', 'fullName email avatarUrl');
    await project.populate('teamMembers.user', 'fullName email avatarUrl');

    const response: ApiResponse<IProject> = {
      success: true,
      message: 'Project updated successfully',
      data: project
    };

    try {
      const recipients = new Set<string>();
      if (req.user?.email) recipients.add(req.user.email);

      const projectMembers = Array.isArray((project as any).teamMembers) ? (project as any).teamMembers : [];
      projectMembers.forEach((member: any) => {
        const email = member.user?.email || member.user?.emailAddress;
        if (email) recipients.add(email);
      });

      if (recipients.size > 0) {
        await sendEmail({
          to: Array.from(recipients),
          subject: `Project updated: ${project.name}`,
          html: `
            <h2>Project Updated</h2>
            <p>The project <strong>${project.name}</strong> has new updates.</p>
            <p>Status: ${project.status || 'active'} | Priority: ${project.priority || 'medium'}</p>
            <p>Updated by: ${req.user?.fullName || req.user?.email}</p>
          `,
        });
      }
    } catch (emailErr) {
      console.error('Project update email failed:', emailErr);
    }

    // Sartthi Integration: Calendar Sync
    const calendarService = getCalendarService();
    if (calendarService) {
      // await calendarService.updateEvent(project.calendarEventId, { ... });
    }

    // Sartthi Integration: Mail Notification (already handled by existing email logic, but could be enhanced)

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
        { 'teamMembers.user': currentUserId, 'teamMembers.role': { $in: ['owner', 'manager'] } }
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
    (project as any).teamMembers = (project as any).teamMembers || [];
    (project as any).teamMembers.push({
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

    await project.populate('teamMembers.user', 'fullName email avatarUrl');

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
        { 'teamMembers.user': currentUserId, 'teamMembers.role': { $in: ['owner', 'manager'] } }
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
    (project as any).teamMembers = ((project as any).teamMembers || []).filter((member: any) =>
      member.user.toString() !== memberId
    );
    await project.save();

    await project.populate('teamMembers.user', 'fullName email avatarUrl');

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
        { 'teamMembers.user': currentUserId, 'teamMembers.role': { $in: ['owner', 'manager'] } }
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
    const member = ((project as any).teamMembers || []).find((member: any) =>
      member.user.toString() === memberId
    );
    if (member) {
      member.role = role;
    }
    await project.save();

    await project.populate('teamMembers.user', 'fullName email avatarUrl');

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

// Link existing personal project to a workspace after upgrade
export const linkProjectToWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { workspaceId } = req.body as { workspaceId?: string };
    const user = req.user!;
    const plan = (user.subscription?.plan || 'free') as PlanName;

    if (plan === 'free') {
      res.status(403).json({
        success: false,
        message: 'Upgrade to a paid plan before linking projects to a workspace'
      });
      return;
    }

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      res.status(400).json({
        success: false,
        message: 'A valid workspaceId is required'
      });
      return;
    }

    const project = await Project.findOne({
      _id: id,
      createdBy: user._id,
      isActive: true,
      workspace: null
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Personal project not found or already linked'
      });
      return;
    }

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: user._id },
        { 'members.user': user._id, 'members.status': 'active' }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    const planLimits = SUBSCRIPTION_LIMITS[plan];
    const currentWorkspaceProjectCount = await Project.countDocuments({ workspace: workspaceId, isActive: true });
    const workspaceLimit = workspace.subscription?.maxProjects ?? planLimits.maxProjects;
    if (workspaceLimit !== -1 && currentWorkspaceProjectCount >= workspaceLimit) {
      res.status(403).json({
        success: false,
        message: 'Workspace project limit reached'
      });
      return;
    }

    await project.upgradeTier(plan === 'ultra' ? 'ultra' : 'pro', workspaceId);
    await project.populate('teamMembers.user', 'fullName email avatarUrl');

    res.status(200).json({
      success: true,
      message: 'Project linked to workspace successfully',
      data: project
    });
  } catch (error: any) {
    console.error('Link project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while linking project'
    });
  }
};
