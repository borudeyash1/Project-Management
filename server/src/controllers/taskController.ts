import { Request, Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { ApiResponse } from '../types';

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

// GET /api/tasks?projectId=...
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { projectId } = req.query as { projectId?: string };
    const filter: any = {};

    if (projectId) {
      filter.project = projectId;
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
    } = req.body;

    if (!title || !projectId) {
      res.status(400).json({ success: false, message: 'Title and project are required' });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const backendStatus = mapFrontendStatusToBackend(status) || 'todo';
    const backendPriority = mapFrontendPriorityToBackend(priority) || 'medium';

    const task = new Task({
      title,
      description,
      project: project._id,
      workspace: workspaceId || project.workspace || null,
      assignee: assignee || undefined,
      reporter: authUser._id,
      status: backendStatus,
      priority: backendPriority,
      type: type || 'task',
      category,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours,
      progress: typeof progress === 'number' ? progress : 0,
    });

    await task.save();

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

    await task.save();

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
