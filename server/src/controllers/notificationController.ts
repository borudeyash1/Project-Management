import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthenticatedRequest, ApiResponse } from '../types';

export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const notifications = await Notification.find({ userId: userId.toString() })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const response: ApiResponse = {
      success: true,
      message: 'Notifications loaded',
      data: notifications,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Notifications] Failed to load notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const notif = await Notification.findOne({ _id: id, userId: userId.toString() });
    if (!notif) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    notif.read = true;
    await notif.save();

    const response: ApiResponse = {
      success: true,
      message: 'Notification marked as read',
      data: notif.toJSON(),
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Notifications] Failed to mark notification read:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};
