import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import Task from '../models/Task';
import Project from '../models/Project';
import { Reminder } from '../models/Reminder';
import Activity from '../models/Activity';

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

    const [tasks, projects, reminders, activities] = await Promise.all([
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
          { 'members.user': userId },
          { 'teamMembers.user': userId },
        ],
        isActive: { $ne: false },
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
    ]);

    const quickTasks = (tasks || []).slice(0, 8).map((task) => ({
      _id: task._id,
      title: task.title,
      dueDate: task.dueDate,
      completed: task.status === 'done',
      priority: task.priority,
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

      return {
        _id: project._id,
        name: project.name,
        description: project.description,
        progress: project.progress ?? 0,
        status: project.status ?? 'active',
        startDate: project.startDate,
        endDate: (project as any).dueDate,
        team: Array.isArray(rawTeam)
          ? rawTeam.map(mapUserSummary).filter(Boolean)
          : [],
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
