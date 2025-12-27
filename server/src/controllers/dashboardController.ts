import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import Task from '../models/Task';
import Project from '../models/Project';
import { Reminder } from '../models/Reminder';
import Activity from '../models/Activity';
import Workspace from '../models/Workspace';

const mapUserSummary = (user: any) => {
  if (!user) {
    return undefined;
  }

  return {
    _id: user._id?.toString() ?? user.id ?? '',
    name: user.fullName || user.name || user.email || 'User',
    avatar: user.avatarUrl,
    email: user.email,
  };
};

export const getDashboardData = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const [tasks, projects, reminders, activities, workspaces] = await Promise.all([
      Task.find({
        $or: [{ assignee: userId }, { reporter: userId }],
        isActive: { $ne: false },
      })
        .populate('assignee', 'fullName email avatarUrl')
        .populate('reporter', 'fullName email avatarUrl')
        .populate('project', 'name')
        .sort({ updatedAt: -1 })
        .limit(25)
        .lean(),
      Project.find({
        $or: [
          { createdBy: userId },
          { owner: userId },
          { 'teamMembers.user': userId },
        ],
      })
        .populate('teamMembers.user', 'fullName email avatarUrl designation')
        .sort({ updatedAt: -1 })
        .limit(15)
        .lean(),
      Reminder.find({
        $or: [{ createdBy: userId }, { assignedTo: userId }],
      })
        .sort({ dueDate: 1 })
        .limit(10)
        .lean(),
      Activity.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Workspace.find({
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      })
        .populate('members.user', 'fullName avatarUrl')
        .limit(5)
        .lean()
    ]);

    const dashboardWorkspaces = (workspaces || []).map((w: any) => ({
      _id: w._id,
      name: w.name,
      role: w.owner === userId.toString() ? 'Owner' : 'Member',
      memberCount: w.members?.length || 0
    }));

    const quickTasks = (tasks || []).slice(0, 8).map((task) => ({
      _id: task._id,
      title: task.title,
      dueDate: task.dueDate,
      completed: ['completed', 'done', 'verified'].includes(String(task.status || '')),
      priority: task.priority,
      category: task.category,
      type: task.type,
    }));

    const recentActivity = (activities || []).map((activity) => ({
      _id: activity._id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.createdAt,
      user: {
        _id: userId,
        name: req.user?.fullName || req.user?.email || 'You',
      },
    }));

    const dashboardProjects = (projects || []).map((project) => {
      const rawTeam = (project as any).teamMembers || (project as any).members || [];

      console.log('🔍 [DASHBOARD] Project:', project.name, 'Raw team:', rawTeam);

      const mappedTeam = Array.isArray(rawTeam)
        ? rawTeam
          .map((member: any) => {
            console.log('🔍 [DASHBOARD] Processing member:', member);

            // Handle both populated and unpopulated user references
            const userData = member.user || member;

            if (!userData) {
              console.log('⚠️ [DASHBOARD] No user data for member');
              return null;
            }

            const mapped = {
              _id: userData._id?.toString() || userData.toString(),
              name: userData.fullName || userData.name || userData.email || 'Unknown User',
              email: userData.email || '',
              avatar: userData.avatarUrl || userData.avatar,
              role: member.role || 'member'
            };

            console.log('✅ [DASHBOARD] Mapped team member:', mapped);
            return mapped;
          })
          .filter(Boolean)
        : [];

      console.log('✅ [DASHBOARD] Final team for project', project.name, ':', mappedTeam);

      return {
        _id: project._id,
        name: project.name,
        description: project.description,
        progress: project.progress ?? 0,
        status: project.status ?? 'active',
        startDate: project.startDate,
        endDate: (project as any).dueDate,
        team: mappedTeam,
        tags: project.tags || [],
      };
    });

    const deadlines = (tasks || [])
      .filter((task) => task.dueDate)
      .sort(
        (a, b) =>
          new Date(a.dueDate as Date).getTime() -
          new Date(b.dueDate as Date).getTime(),
      )
      .slice(0, 6)
      .map((task) => ({
        _id: task._id,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        project: task.project
          ? {
            _id: (task.project as any)._id,
            name: (task.project as any).name,
          }
          : undefined,
      }));

    const teamActivity = (tasks || []).slice(0, 8).map((task) => ({
      _id: task._id,
      user:
        mapUserSummary(task.assignee) ||
        mapUserSummary(task.reporter) || {
          _id: userId,
          name: req.user?.fullName || req.user?.email || 'You',
        },
      action: task.status === 'done' ? 'completed' : 'updated',
      target: task.title,
      timestamp: task.updatedAt ?? task.createdAt,
    }));

    const notifications = (reminders || []).map((reminder) => ({
      _id: reminder._id,
      message: reminder.description || reminder.title,
      type: reminder.priority,
      read: reminder.completed,
      createdAt: reminder.updatedAt ?? reminder.createdAt,
    }));

    const recentFiles = (tasks || [])
      .flatMap((task) => {
        const attachments = Array.isArray(task.attachments) ? task.attachments : [];
        return attachments.map((file: any) => ({
          _id: `${task._id}-${file._id ?? file.filename}`,
          name: file.originalName || file.filename,
          type: file.mimeType,
          size: file.size,
          updatedAt: file.uploadedAt ?? task.updatedAt,
        }));
      })
      .slice(0, 6);

    // Calculate total unique team members across all workspaces AND projects (excluding current user)
    const allTeamMemberIds = new Set<string>();

    const addMemberId = (id: any) => {
      if (id) {
        const strId = id.toString();
        if (strId !== userId.toString()) {
          allTeamMemberIds.add(strId);
        }
      }
    };

    // From Workspaces
    (workspaces || []).forEach((workspace: any) => {
      if (Array.isArray(workspace.members)) {
        workspace.members.forEach((member: any) => {
          addMemberId(member.user?._id || member.user);
        });
      }
    });

    // From Projects
    (projects || []).forEach((project: any) => {
      const members = project.teamMembers || project.members || [];
      if (Array.isArray(members)) {
        members.forEach((member: any) => {
          addMemberId(member.user?._id || member.user);
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        quickTasks,
        recentActivity,
        projects: dashboardProjects,
        notifications,
        deadlines,
        teamActivity,
        recentFiles,
        workspaces: dashboardWorkspaces,
        totalUniqueTeamMembers: allTeamMemberIds.size,
      },
    });
  } catch (error: any) {
    console.error('[Dashboard] Failed to build dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
    });
  }
};
