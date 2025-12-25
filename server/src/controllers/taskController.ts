import { Request, Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { ApiResponse } from '../types';
import { createActivity } from '../utils/activityUtils';
import { getCalendarService } from '../services/sartthi/calendarService';
import { getMailService } from '../services/sartthi/mailService';
import { getSlackService } from '../services/sartthi/slackService';
import { notifySlackForTask, notifySlackTaskCompleted, notifySlackTaskUpdated } from '../utils/slackNotifications';
import User from '../models/User';

// GET /api/tasks?projectId=...&status=...&priority=...
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { projectId, status, priority } = req.query as {
      projectId?: string;
      status?: string;
      priority?: string;
    };
    const filter: any = {};

    if (projectId) {
      filter.project = projectId;
    }

    // Add status filtering - now uses values directly
    if (status) {
      filter.status = status;
    }

    // Add priority filtering - now uses values directly
    if (priority) {
      filter.priority = priority;
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });

    const response: ApiResponse = {
      success: true,
      message: 'Tasks fetched successfully',
      data: tasks,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while fetching tasks' });
  }
};

// GET /api/tasks/:id
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task fetched successfully',
      data: task,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while fetching task' });
  }
};

// POST /api/tasks
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      title,
      description,
      project: projectId,
      workspace: workspaceId,
      assignee,
      status,
      priority,
      category,
      type,
      taskType,
      startDate,
      dueDate,
      estimatedHours,
      progress,
      subtasks,
      links,
      requiresLink,
      requiresFile,
      slackChannelId, // Added for Slack integration
      slackAccountId,
    } = req.body;

    // Only title is required now - project and workspace are optional
    if (!title) {
      res.status(400).json({ success: false, message: 'Title is required' });
      return;
    }

    // Validate project if provided
    let project = null;
    if (projectId) {
      project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }
    }

    const taskData: any = {
      title,
      description,
      reporter: authUser._id,
      status: status || 'pending',
      priority: priority || 'medium',
      type: type || 'task',
      taskType: taskType || 'general',
      category,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours,
      progress: typeof progress === 'number' ? progress : 0,
      requiresLink: requiresLink || false,
      requiresFile: requiresFile || false,
    };

    // Add optional fields
    if (projectId) taskData.project = projectId;
    if (workspaceId) taskData.workspace = workspaceId;
    else if (project) taskData.workspace = project.workspace;
    if (assignee) taskData.assignee = assignee;
    if (subtasks && Array.isArray(subtasks)) taskData.subtasks = subtasks;
    if (links && Array.isArray(links)) taskData.links = links;

    console.log('🔍 [CREATE TASK] taskType from request:', taskType);
    console.log('🔍 [CREATE TASK] taskData.taskType:', taskData.taskType);
    console.log('🔍 [CREATE TASK] Full taskData:', JSON.stringify(taskData, null, 2));

    const task = new Task(taskData);

    await task.save();

    // Create activity
    await createActivity(
      authUser._id,
      'task_created',
      `Created task: ${task.title}`,
      `New task "${task.title}" was created`,
      'Task',
      String(task._id)
    );

    // Sartthi Integration: Calendar Sync
    const calendarService = getCalendarService();
    if (calendarService && task.dueDate) {
      await calendarService.createEventFromTask(task);
    }

    // Sartthi Integration: Mail Notification
    const mailService = getMailService();
    if (mailService && task.assignee) {
      const assigneeUser = await User.findById(task.assignee);
      if (assigneeUser && assigneeUser.email) {
        await mailService.sendTaskAssignmentNotification(task, assigneeUser.email);
      }
    }

    // Sartthi Integration: Slack Notification
    // Priority: Task-level channel > Project primary channel
    let targetChannelId = null;
    let targetChannelName = null;

    // Get project's configured Slack channels
    const projectChannels = project?.integrations?.slack?.channels || [];

    // 1. Check if user selected a specific channel for this task
    if (slackChannelId && slackChannelId !== 'none' && slackChannelId !== "Don't post to Slack" && slackChannelId !== '') {
      // Validate that the selected channel is configured in the project
      const selectedChannel = projectChannels.find(c => c.id === slackChannelId);

      if (selectedChannel) {
        targetChannelId = selectedChannel.id;
        targetChannelName = selectedChannel.name;
        console.log('📤 [SLACK] Using task-specific channel:', targetChannelName);
      } else {
        console.warn('⚠️ [SLACK] Selected channel not configured in project, using primary channel');
        // Fall back to primary if selected channel is not configured
        const primaryChannel = projectChannels.find(c => c.isPrimary);
        if (primaryChannel) {
          targetChannelId = primaryChannel.id;
          targetChannelName = primaryChannel.name;
        }
      }
    }
    // 2. Fall back to project's primary channel
    else if (projectChannels.length > 0) {
      const primaryChannel = projectChannels.find(c => c.isPrimary) || projectChannels[0];
      targetChannelId = primaryChannel.id;
      targetChannelName = primaryChannel.name;
      console.log('📤 [SLACK] Using project primary channel:', targetChannelName);
    }

    // Send notification if we have a target channel
    if (targetChannelId) {
      try {
        console.log('📤 [SLACK] Sending notification to channel:', targetChannelName);
        await notifySlackForTask(
          task,
          authUser._id,
          targetChannelId,
          slackAccountId
        );
        console.log('✅ [SLACK] Notification sent successfully');
      } catch (error) {
        console.error('❌ [SLACK] Failed to send notification:', error);
      }
    } else {
      console.log('ℹ️ [SLACK] No Slack channels configured for this project');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task created successfully',
      data: task,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while creating task' });
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const {
      title,
      description,
      assignee,
      status,
      priority,
      category,
      startDate,
      dueDate,
      estimatedHours,
      progress,
      subtasks,
      links,
      files,
      taskType,
      requiresFile,
      requiresLink,
      rating,
      ratingDetails,
      verifiedBy,
      verifiedAt,
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee || undefined;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (startDate !== undefined) task.startDate = startDate ? new Date(startDate) : undefined;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (progress !== undefined) task.progress = progress;
    if (subtasks !== undefined) task.subtasks = subtasks;
    if (links !== undefined) task.links = links;
    if (files !== undefined) task.files = files;
    if (taskType !== undefined) task.taskType = taskType;
    if (requiresFile !== undefined) task.requiresFile = requiresFile;
    if (requiresLink !== undefined) task.requiresLink = requiresLink;

    // Handle verification and rating fields
    if (rating !== undefined) task.rating = rating;
    if (ratingDetails !== undefined) task.ratingDetails = ratingDetails;
    if (verifiedBy !== undefined) task.verifiedBy = verifiedBy;
    if (verifiedAt !== undefined) task.verifiedAt = verifiedAt ? new Date(verifiedAt) : undefined;

    const oldStatus = task.status;
    await task.save();

    // Create activity for task update
    const isCompleted = oldStatus !== 'completed' && oldStatus !== 'verified' && (task.status === 'completed' || task.status === 'verified');
    if (isCompleted) {
      await createActivity(
        authUser._id,
        'task_completed',
        `Completed task: ${task.title}`,
        `Task "${task.title}" was marked as completed`,
        'Task',
        String(task._id)
      );

      // Notify via Slack
      await notifySlackTaskCompleted(task, authUser._id);
    } else {
      await createActivity(
        authUser._id,
        'task_updated',
        `Updated task: ${task.title}`,
        `Task "${task.title}" was updated`,
        'Task',
        String(task._id)
      );

      // Notify via Slack
      const changes = [];
      if (status !== undefined) changes.push(`Status: ${status}`);
      if (priority !== undefined) changes.push(`Priority: ${priority}`);
      if (assignee !== undefined) changes.push('Assignee changed');
      if (dueDate !== undefined) changes.push('Due date changed');

      if (changes.length > 0) {
        await notifySlackTaskUpdated(task, authUser._id, changes.join(', '));
      }
    }

    // Sartthi Integration: Calendar Sync
    const calendarService = getCalendarService();
    if (calendarService && (dueDate !== undefined || title !== undefined)) {
      // Logic to update event would go here
    }

    // Sartthi Integration: Mail Notification
    const mailService = getMailService();
    if (mailService && assignee !== undefined) {
      const assigneeUser = await User.findById(assignee);
      if (assigneeUser && assigneeUser.email) {
        await mailService.sendTaskAssignmentNotification(task, assigneeUser.email);
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task updated successfully',
      data: task,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while updating task' });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    await task.deleteOne();

    const response: ApiResponse = {
      success: true,
      message: 'Task deleted successfully',
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while deleting task' });
  }
};

// Reassign task to another user
export const reassignTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { assignedTo } = req.body;

    console.log('👥 [REASSIGN TASK] Task:', req.params.id, 'New Assignee:', assignedTo);

    if (!assignedTo) {
      res.status(400).json({ success: false, message: 'New assignee is required' });
      return;
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const oldAssignee = task.assignedTo;
    task.assignedTo = assignedTo;
    await task.save();

    // Create activity for task reassignment
    await createActivity(
      authUser._id,
      'task_reassigned',
      `Reassigned task: ${task.title}`,
      task.project?.toString() || ''
    );

    console.log('✅ [REASSIGN TASK] Task reassigned successfully');

    const response: ApiResponse = {
      success: true,
      message: 'Task reassigned successfully',
      data: task
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ [REASSIGN TASK] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while reassigning task' });
  }
};
