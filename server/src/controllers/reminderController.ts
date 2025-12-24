import { Request, Response } from 'express';
import { Reminder } from '../models/Reminder';
import { scheduleReminderTrigger } from '../services/reminderScheduler';

// Create a new reminder
export const createReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const reminderData = {
      ...req.body,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const reminder = new Reminder(reminderData);
    await reminder.save();

    // Schedule triggers for each notification
    if (reminder.notifications && reminder.notifications.length > 0) {
      for (const notif of reminderData.notifications) {
        if (notif.minutesBefore !== undefined) {
          const triggerTime = new Date(new Date(reminderData.dueDate).getTime() - (notif.minutesBefore * 60000));
          await scheduleReminderTrigger({
            entityType: 'custom',
            entityId: String(reminder._id),
            userIds: [String(userId)],
            triggerType: 'custom',
            triggerTime: triggerTime,
            payload: {
              message: `Reminder: ${reminder.title}`,
              description: reminder.description,
              notificationType: notif.type
            }
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      data: reminder,
      message: 'Reminder created successfully'
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reminder',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all reminders for a user
export const getReminders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, status, priority, search } = req.query;

    let query: any = { createdBy: userId };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const reminders = await Reminder.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: reminders,
      count: reminders.length
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a specific reminder
export const getReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const reminder = await Reminder.findOne({ _id: id, createdBy: userId })
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color');

    if (!reminder) {
      res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminder',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a reminder
export const updateReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color');

    if (!reminder) {
      res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: reminder,
      message: 'Reminder updated successfully'
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reminder',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a reminder
export const deleteReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const reminder = await Reminder.findOneAndDelete({ _id: id, createdBy: userId });

    if (!reminder) {
      res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reminder',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Toggle reminder completion
export const toggleReminderCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const reminder = await Reminder.findOne({ _id: id, createdBy: userId });
    if (!reminder) {
      res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
      return;
    }

    reminder.completed = !reminder.completed;
    reminder.completedAt = reminder.completed ? new Date() : undefined;
    reminder.updatedAt = new Date();

    await reminder.save();

    res.status(200).json({
      success: true,
      data: reminder,
      message: 'Reminder status updated successfully'
    });
  } catch (error) {
    console.error('Error toggling reminder completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reminder status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get reminder statistics
export const getReminderStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const totalReminders = await Reminder.countDocuments({ createdBy: userId });
    const completedReminders = await Reminder.countDocuments({
      createdBy: userId,
      completed: true
    });
    const pendingReminders = await Reminder.countDocuments({
      createdBy: userId,
      completed: false
    });
    const overdueReminders = await Reminder.countDocuments({
      createdBy: userId,
      completed: false,
      dueDate: { $lt: new Date() }
    });

    const todayReminders = await Reminder.countDocuments({
      createdBy: userId,
      dueDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const thisWeekReminders = await Reminder.countDocuments({
      createdBy: userId,
      dueDate: {
        $gte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
        $lt: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7))
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalReminders,
        completedReminders,
        pendingReminders,
        overdueReminders,
        todayReminders,
        thisWeekReminders,
        completionRate: totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching reminder stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminder statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get calendar events
export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { startDate, endDate } = req.query;

    let query: any = { createdBy: userId };

    if (startDate && endDate) {
      query.dueDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const reminders = await Reminder.find(query)
      .populate('project', 'name color')
      .sort({ dueDate: 1 });

    const events = reminders.map(reminder => ({
      _id: reminder._id,
      title: reminder.title,
      start: reminder.dueDate,
      end: reminder.dueDate,
      type: reminder.type,
      priority: reminder.priority,
      project: reminder.project,
      completed: reminder.completed,
      allDay: true
    }));

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
