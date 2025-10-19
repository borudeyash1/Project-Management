import { Request, Response } from 'express';
import { Goal } from '../models/Goal';

// Create a new goal
export const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const goalData = {
      ...req.body,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const goal = new Goal(goalData);
    await goal.save();

    res.status(201).json({
      success: true,
      data: goal,
      message: 'Goal created successfully'
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all goals for a user
export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, status, category, search } = req.query;

    let query: any = { createdBy: userId };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const goals = await Goal.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: goals,
      count: goals.length
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a specific goal
export const getGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const goal = await Goal.findOne({ _id: id, createdBy: userId })
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color');

    if (!goal) {
      res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a goal
export const updateGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const goal = await Goal.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('createdBy', 'name email avatar')
     .populate('assignedTo', 'name email avatar')
     .populate('project', 'name color');

    if (!goal) {
      res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: goal,
      message: 'Goal updated successfully'
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a goal
export const deleteGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const goal = await Goal.findOneAndDelete({ _id: id, createdBy: userId });

    if (!goal) {
      res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get goal statistics
export const getGoalStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const totalGoals = await Goal.countDocuments({ createdBy: userId });
    const completedGoals = await Goal.countDocuments({ 
      createdBy: userId, 
      status: 'completed' 
    });
    const inProgressGoals = await Goal.countDocuments({ 
      createdBy: userId, 
      status: 'in_progress' 
    });
    const overdueGoals = await Goal.countDocuments({
      createdBy: userId,
      status: { $in: ['not_started', 'in_progress'] },
      targetDate: { $lt: new Date() }
    });

    const averageProgress = await Goal.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: null, avgProgress: { $avg: '$progress' } } }
    ]);

    const categoryStats = await Goal.aggregate([
      { $match: { createdBy: userId } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        completed: { 
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }},
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalGoals,
        completedGoals,
        inProgressGoals,
        overdueGoals,
        averageProgress: averageProgress[0]?.avgProgress || 0,
        completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
        topCategories: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching goal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a milestone
export const createMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalId } = req.params;
    const userId = (req as any).user.id;

    const goal = await Goal.findOne({ _id: goalId, createdBy: userId });
    if (!goal) {
      res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
      return;
    }

    const milestone = {
      _id: new Date().getTime().toString(),
      ...req.body,
      completed: false
    } as any;

    goal.milestones = [...(goal.milestones || []), milestone];
    await goal.save();

    res.status(201).json({
      success: true,
      data: milestone,
      message: 'Milestone created successfully'
    });
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create milestone',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a milestone
export const updateMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalId, milestoneId } = req.params;
    const userId = (req as any).user.id;

    const goal = await Goal.findOne({ _id: goalId, createdBy: userId });
    if (!goal) {
      res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
      return;
    }

    const idx = (goal.milestones || []).findIndex((m: any) => String((m as any)._id) === String(milestoneId));
    if (idx === -1) {
      res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
      return;
    }

    const updated = { ...(goal.milestones as any)[idx], ...req.body };
    (goal.milestones as any)[idx] = updated;
    await goal.save();

    res.status(200).json({
      success: true,
      data: (goal.milestones as any)[idx],
      message: 'Milestone updated successfully'
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update milestone',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a milestone
export const deleteMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalId, milestoneId } = req.params;
    const userId = (req as any).user.id;

    const goal = await Goal.findOne({ _id: goalId, createdBy: userId });
    if (!goal) {
      res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
      return;
    }

    goal.milestones = (goal.milestones || []).filter((m: any) => String(m._id) !== String(milestoneId));
    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete milestone',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Toggle milestone completion
export const toggleMilestoneCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalId, milestoneId } = req.params;
    const userId = (req as any).user.id;

    const goal = await Goal.findOne({ _id: goalId, createdBy: userId });
    if (!goal) {
      res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
      return;
    }

    const idx = (goal.milestones || []).findIndex((m: any) => String((m as any)._id) === String(milestoneId));
    if (idx === -1) {
      res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
      return;
    }

    const milestone: any = (goal.milestones as any)[idx];
    const completed = !milestone.completed;
    (goal.milestones as any)[idx] = {
      ...milestone,
      completed,
      completedDate: completed ? new Date() : undefined
    };

    // Update goal progress based on completed milestones
    const completedMilestones = (goal.milestones as any).filter((m: any) => m.completed).length;
    goal.progress = goal.milestones.length > 0 ? 
      Math.round((completedMilestones / goal.milestones.length) * 100) : 0;

    // Update goal status if all milestones are completed
    if (goal.progress === 100 && goal.status !== 'completed') {
      goal.status = 'completed';
      goal.completedDate = new Date();
    }

    await goal.save();

    res.status(200).json({
      success: true,
      data: {
        milestone: (goal.milestones as any)[idx],
        goalProgress: goal.progress,
        goalStatus: goal.status
      },
      message: 'Milestone status updated successfully'
    });
  } catch (error) {
    console.error('Error toggling milestone completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update milestone status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
