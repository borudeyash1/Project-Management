import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import Milestone from '../models/Milestone';
import Task from '../models/Task';

// Create milestone
export const createMilestone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, project, workspace, dueDate, startDate, tasks } = req.body;
    const userId = req.user!._id;

    const milestone = new Milestone({
      title,
      description,
      project,
      workspace,
      dueDate,
      startDate,
      tasks: tasks || [],
      createdBy: userId
    });

    await milestone.save();

    console.log('✅ [MILESTONE] Created:', milestone._id);

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: milestone
    });
  } catch (error: any) {
    console.error('❌ [MILESTONE] Create error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create milestone'
    });
  }
};

// Get milestones by project
export const getMilestonesByProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const milestones = await Milestone.find({
      project: projectId,
      isActive: true
    })
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('tasks', 'title status progress')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: milestones
    });
  } catch (error: any) {
    console.error('❌ [MILESTONE] Get by project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch milestones'
    });
  }
};

// Get milestones by workspace
export const getMilestonesByWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    const milestones = await Milestone.find({
      workspace: workspaceId,
      isActive: true
    })
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('project', 'name')
      .populate('tasks', 'title status progress')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: milestones
    });
  } catch (error: any) {
    console.error('❌ [MILESTONE] Get by workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch milestones'
    });
  }
};

// Get single milestone
export const getMilestone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;

    const milestone = await Milestone.findById(milestoneId)
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('project', 'name')
      .populate('tasks');

    if (!milestone) {
      res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: milestone
    });
  } catch (error: any) {
    console.error('❌ [MILESTONE] Get error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch milestone'
    });
  }
};

// Update milestone
export const updateMilestone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;
    const updates = req.body;

    const milestone = await Milestone.findByIdAndUpdate(
      milestoneId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('tasks', 'title status progress');

    if (!milestone) {
      res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
      return;
    }

    console.log('✅ [MILESTONE] Updated:', milestone._id);

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      data: milestone
    });
  } catch (error: any) {
    console.error('❌ [MILESTONE] Update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update milestone'
    });
  }
};

// Delete milestone
export const deleteMilestone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;

    const milestone = await Milestone.findByIdAndUpdate(
      milestoneId,
      { isActive: false },
      { new: true }
    );

    if (!milestone) {
      res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
      return;
    }

    console.log('✅ [MILESTONE] Deleted:', milestone._id);

    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ [MILESTONE] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete milestone'
    });
  }
};

// Add task to milestone
export const addTaskToMilestone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;
    const { taskId } = req.body;

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
      return;
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    // Add task if not already in milestone
    if (!milestone.tasks.includes(taskId)) {
      milestone.tasks.push(taskId);
      await milestone.save();
    }

    res.status(200).json({
      success: true,
      message: 'Task added to milestone',
      data: milestone
    });
  } catch (error: any) {
    console.error('❌ [MILESTONE] Add task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add task to milestone'
    });
  }
};

// Remove task from milestone
export const removeTaskFromMilestone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { milestoneId, taskId } = req.params;

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
      return;
    }

    milestone.tasks = milestone.tasks.filter(t => t.toString() !== taskId);
    await milestone.save();

    res.status(200).json({
      success: true,
      message: 'Task removed from milestone',
      data: milestone
    });
  } catch (error: any) {
    console.error('❌ [MILESTONE] Remove task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove task from milestone'
    });
  }
};

// Update milestone progress
export const updateMilestoneProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;
    const { progress } = req.body;

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
      return;
    }

    milestone.progress = progress;
    await (milestone as any).updateStatus();

    res.status(200).json({
      success: true,
      message: 'Milestone progress updated',
      data: milestone
    });
  } catch (error: any) {
    console.error('❌ [MILESTONE] Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update milestone progress'
    });
  }
};
