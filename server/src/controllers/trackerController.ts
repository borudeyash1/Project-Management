import { Request, Response } from 'express';
import { TimeEntry } from '../models/TimeEntry';
import { scheduleReminderTrigger, clearReminderTriggers } from '../services/reminderScheduler';

const TRACKER_REMINDER_MINUTES = 60;

const toIdString = (value: any): string => {
  if (!value) return '';
  return typeof value === 'string' ? value : value.toString?.() || '';
};

const scheduleTimeEntryReminder = async (entry: any) => {
  const entryId = toIdString(entry?._id);
  if (!entryId || !entry.isRunning) return;

  await clearReminderTriggers('tracker_time_entry', entryId);

  const triggerTime = new Date(entry.startTime.getTime() + TRACKER_REMINDER_MINUTES * 60 * 1000);
  if (Number.isNaN(triggerTime.getTime()) || triggerTime <= new Date()) {
    return;
  }

  await scheduleReminderTrigger({
    entityType: 'tracker_time_entry',
    entityId: entryId,
    userIds: [entry.userId],
    triggerType: 'deadline_reached',
    triggerTime,
    payload: {
      message: entry.description ? `Timer running: ${entry.description}` : 'Timer running reminder',
      description: 'Your tracker timer has been running for an hour. Remember to take action.',
      project: entry.projectId,
      tags: ['tracker'],
    },
  });
};

const clearTimeEntryReminder = async (entryId: any) => {
  const id = toIdString(entryId);
  if (!id) return;
  await clearReminderTriggers('tracker_time_entry', id);
};

// Start timer
export const startTimer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { taskId, projectId, description } = req.body;

    // Check if user already has a running timer
    const existingTimer = await TimeEntry.findOne({ 
      userId, 
      isRunning: true 
    });

    if (existingTimer) {
      res.status(400).json({
        success: false,
        message: 'You already have a running timer. Please stop it first.'
      });
      return;
    }

    const timeEntry = new TimeEntry({
      userId,
      taskId,
      projectId,
      description,
      startTime: new Date(),
      isRunning: true,
      duration: 0
    });

    await timeEntry.save();

    await scheduleTimeEntryReminder(timeEntry);

    res.status(201).json({
      success: true,
      data: timeEntry,
      message: 'Timer started successfully'
    });
  } catch (error) {
    console.error('Error starting timer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start timer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Stop timer
export const stopTimer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { timeEntryId } = req.body;

    const timeEntry = await TimeEntry.findOne({ 
      _id: timeEntryId, 
      userId, 
      isRunning: true 
    });

    if (!timeEntry) {
      res.status(404).json({
        success: false,
        message: 'No running timer found'
      });
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60)); // in minutes

    timeEntry.endTime = endTime;
    timeEntry.duration = duration;
    timeEntry.isRunning = false;

    await timeEntry.save();

    await clearTimeEntryReminder(timeEntry._id);

    res.status(200).json({
      success: true,
      data: timeEntry,
      message: 'Timer stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping timer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop timer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Pause timer
export const pauseTimer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { timeEntryId } = req.body;

    const timeEntry = await TimeEntry.findOne({ 
      _id: timeEntryId, 
      userId, 
      isRunning: true 
    });

    if (!timeEntry) {
      res.status(404).json({
        success: false,
        message: 'No running timer found'
      });
      return;
    }

    // For now, we'll just stop the timer
    // In a more complex implementation, you might want to track pause/resume times
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60));

    timeEntry.endTime = endTime;
    timeEntry.duration = duration;
    timeEntry.isRunning = false;

    await timeEntry.save();

    res.status(200).json({
      success: true,
      data: timeEntry,
      message: 'Timer paused successfully'
    });
  } catch (error) {
    console.error('Error pausing timer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause timer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Resume timer
export const resumeTimer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { timeEntryId } = req.body;

    // Check if user already has a running timer
    const existingTimer = await TimeEntry.findOne({ 
      userId, 
      isRunning: true 
    });

    if (existingTimer) {
      res.status(400).json({
        success: false,
        message: 'You already have a running timer. Please stop it first.'
      });
      return;
    }

    const timeEntry = await TimeEntry.findOne({ 
      _id: timeEntryId, 
      userId 
    });

    if (!timeEntry) {
      res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
      return;
    }

    timeEntry.startTime = new Date();
    timeEntry.isRunning = true;

    await timeEntry.save();

    await scheduleTimeEntryReminder(timeEntry);

    res.status(200).json({
      success: true,
      data: timeEntry,
      message: 'Timer resumed successfully'
    });
  } catch (error) {
    console.error('Error resuming timer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume timer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get time entries
export const getTimeEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { startDate, endDate, projectId, taskId } = req.query;

    let query: any = { userId };

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    if (projectId) {
      query.projectId = projectId;
    }

    if (taskId) {
      query.taskId = taskId;
    }

    const timeEntries = await TimeEntry.find(query)
      .populate('projectId', 'name color')
      .populate('taskId', 'title')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      data: timeEntries,
      count: timeEntries.length
    });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time entries',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create time entry manually
export const createTimeEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const timeEntryData = {
      ...req.body,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const timeEntry = new TimeEntry(timeEntryData);
    await timeEntry.save();

    if (timeEntry.isRunning) {
      await scheduleTimeEntryReminder(timeEntry);
    }

    res.status(201).json({
      success: true,
      data: timeEntry,
      message: 'Time entry created successfully'
    });
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create time entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update time entry
export const updateTimeEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const timeEntry = await TimeEntry.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('projectId', 'name color')
     .populate('taskId', 'title');

    if (!timeEntry) {
      res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: timeEntry,
      message: 'Time entry updated successfully'
    });
    if (timeEntry.isRunning) {
      await scheduleTimeEntryReminder(timeEntry);
    } else {
      await clearTimeEntryReminder(timeEntry._id);
    }
  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update time entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete time entry
export const deleteTimeEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const timeEntry = await TimeEntry.findOneAndDelete({ _id: id, userId });

    if (!timeEntry) {
      res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Time entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete time entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get time statistics
export const getTimeStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { period = 'week' } = req.query;

    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }

    const timeEntries = await TimeEntry.find({
      userId,
      startTime: { $gte: startDate, $lte: endDate },
      isRunning: false
    });

    const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalHours = totalMinutes / 60;
    const billableMinutes = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.duration, 0);
    const billableHours = billableMinutes / 60;

    const projectStats = await TimeEntry.aggregate([
      {
        $match: {
          userId: userId,
          startTime: { $gte: startDate, $lte: endDate },
          isRunning: false
        }
      },
      {
        $group: {
          _id: '$projectId',
          totalMinutes: { $sum: '$duration' },
          billableMinutes: { 
            $sum: { 
              $cond: ['$billable', '$duration', 0] 
            } 
          }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $unwind: { path: '$project', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          projectName: '$project.name',
          projectColor: '$project.color',
          totalHours: { $divide: ['$totalMinutes', 60] },
          billableHours: { $divide: ['$billableMinutes', 60] }
        }
      },
      { $sort: { totalHours: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        totalHours: Math.round(totalHours * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        totalEntries: timeEntries.length,
        averageHoursPerDay: period === 'day' ? totalHours : Math.round((totalHours / 7) * 100) / 100,
        projectStats
      }
    });
  } catch (error) {
    console.error('Error fetching time stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get project time data
export const getProjectTimeData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;

    const timeEntries = await TimeEntry.find({
      userId,
      projectId,
      isRunning: false
    }).populate('taskId', 'title')
      .sort({ startTime: -1 });

    const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalHours = totalMinutes / 60;

    const dailyStats = await TimeEntry.aggregate([
      {
        $match: {
          userId: userId,
          projectId: projectId,
          isRunning: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
          },
          totalMinutes: { $sum: '$duration' },
          billableMinutes: { 
            $sum: { 
              $cond: ['$billable', '$duration', 0] 
            } 
          }
        }
      },
      {
        $project: {
          date: '$_id',
          totalHours: { $divide: ['$totalMinutes', 60] },
          billableHours: { $divide: ['$billableMinutes', 60] }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        projectId,
        totalHours: Math.round(totalHours * 100) / 100,
        totalEntries: timeEntries.length,
        dailyStats,
        recentEntries: timeEntries.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error fetching project time data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project time data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
