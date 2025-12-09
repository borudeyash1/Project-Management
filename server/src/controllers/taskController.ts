import { Request, Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { ApiResponse } from '../types';
import { createActivity } from '../utils/activityUtils';
import { getCalendarService } from '../services/sartthi/calendarService';
import { getMailService } from '../services/sartthi/mailService';
import User from '../models/User';

// Map frontend-style status values to backend Task.status
const mapFrontendStatusToBackend = (status?: string): string | undefined => {
  if (!status) return undefined;
  switch (status) {
    case 'pending':
      return 'todo';
    case 'in-progress':
      return 'in-progress';
    case 'completed':
    case 'verified':
      return 'done';
    case 'blocked':
      return 'cancelled';
    default:
      return status;
  }
};

// Map frontend-style priority values to backend Task.priority
// Frontend uses: 'low' | 'medium' | 'high' | 'critical'
// Backend enum is: 'low' | 'medium' | 'high' | 'urgent'
const mapFrontendPriorityToBackend = (priority?: string): string | undefined => {
  if (!priority) return undefined;
  switch (priority) {
    case 'low':
    case 'medium':
    case 'high':
      return priority;
    case 'critical':
      return 'urgent';
    default:
      return priority;
  }
};

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

    // Add status filtering
    if (status) {
      const backendStatus = mapFrontendStatusToBackend(status);
      if (backendStatus) {
        filter.status = backendStatus;
      }
    }

    // Add priority filtering
    if (priority) {
      const backendPriority = mapFrontendPriorityToBackend(priority);
      if (backendPriority) {
        filter.priority = backendPriority;
      }
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
      startDate,
      dueDate,
      estimatedHours,
      progress,
      subtasks,
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

    const backendStatus = mapFrontendStatusToBackend(status) || 'todo';
    const backendPriority = mapFrontendPriorityToBackend(priority) || 'medium';

    const taskData: any = {
      title,
      description,
      reporter: authUser._id,
      status: backendStatus,
      priority: backendPriority,
      type: type || 'task',
      category,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours,
      progress: typeof progress === 'number' ? progress : 0,
    };

    // Add optional fields
    if (projectId) taskData.project = projectId;
    if (workspaceId) taskData.workspace = workspaceId;
    else if (project) taskData.workspace = project.workspace;
    if (assignee) taskData.assignee = assignee;
    if (subtasks && Array.isArray(subtasks)) taskData.subtasks = subtasks;

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
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee || undefined;
    if (status !== undefined) task.status = mapFrontendStatusToBackend(status) || task.status;
    if (priority !== undefined) task.priority = mapFrontendPriorityToBackend(priority) || task.priority;
    if (category !== undefined) task.category = category;
    if (startDate !== undefined) task.startDate = startDate ? new Date(startDate) : undefined;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (progress !== undefined) task.progress = progress;

    const oldStatus = task.status;
    await task.save();

    // Create activity for task update
    const isCompleted = oldStatus !== 'done' && task.status === 'done';
    if (isCompleted) {
      await createActivity(
        authUser._id,
        'task_completed',
        `Completed task: ${task.title}`,
        `Task "${task.title}" was marked as completed`,
        'Task',
        String(task._id)
      );
    } else {
      await createActivity(
        authUser._id,
        'task_updated',
        `Updated task: ${task.title}`,
        `Task "${task.title}" was updated`,
        'Task',
        String(task._id)
      );
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
