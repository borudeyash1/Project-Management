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

    // Auto-fix join request notifications missing metadata
    const JoinRequest = (await import('../models/JoinRequest')).default;
    const notificationsToFix: any[] = [];
    const notificationsToDelete: string[] = [];

    for (const notif of notifications) {
      // Check if it's a join request notification without metadata
      if (
        notif.type === 'workspace' &&
        notif.title?.toLowerCase().includes('join request') &&
        !notif.title?.toLowerCase().includes('approved') &&
        !notif.title?.toLowerCase().includes('rejected') &&
        (!notif.metadata || !notif.metadata.joinRequestId)
      ) {
        // Try to find matching join request
        const joinRequest = await JoinRequest.findOne({
          workspace: notif.relatedId,
          status: 'pending'
        }).sort({ createdAt: -1 });

        if (joinRequest) {
          // Add metadata
          await Notification.updateOne(
            { _id: notif._id },
            {
              $set: {
                metadata: {
                  workspaceId: notif.relatedId,
                  joinRequestId: (joinRequest._id as any).toString()
                }
              }
            }
          );
          // Update the notification object for response
          notif.metadata = {
            workspaceId: notif.relatedId,
            joinRequestId: (joinRequest._id as any).toString()
          };
          console.log(`✅ Auto-fixed notification ${notif._id} with metadata`);
        } else {
          // No matching join request - mark for deletion
          notificationsToDelete.push(notif._id.toString());
          console.log(`🗑️ Marked stale notification ${notif._id} for deletion`);
        }
      }
    }

    // Delete stale notifications
    if (notificationsToDelete.length > 0) {
      await Notification.deleteMany({ _id: { $in: notificationsToDelete } });
      console.log(`🗑️ Deleted ${notificationsToDelete.length} stale notifications`);
    }

    // Filter out deleted notifications from response
    const validNotifications = notifications.filter(
      n => !notificationsToDelete.includes(n._id.toString())
    );

    // Deduplicate notifications: keep only the most recent for each unique combination
    // of type + relatedId + title pattern
    const uniqueNotifications: any[] = [];
    const seenKeys = new Set<string>();
    const duplicateIds: string[] = [];

    for (const notif of validNotifications) {
      // Create a unique key based on type, relatedId, and normalized title
      const normalizedTitle = notif.title?.toLowerCase().trim() || '';
      const key = `${notif.type}:${notif.relatedId || 'none'}:${normalizedTitle}`;

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueNotifications.push(notif);
      } else {
        // This is a duplicate, mark for deletion
        duplicateIds.push(notif._id.toString());
      }
    }

    // Delete duplicates from database in the background
    if (duplicateIds.length > 0) {
      Notification.deleteMany({ _id: { $in: duplicateIds } })
        .then(() => {
          console.log(`🗑️ [NOTIFICATIONS] Cleaned up ${duplicateIds.length} duplicate notifications`);
        })
        .catch((err) => {
          console.error('[NOTIFICATIONS] Failed to delete duplicates:', err);
        });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Notifications loaded',
      data: uniqueNotifications,
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

export const deleteNotification = async (
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

    const notif = await Notification.findOneAndDelete({ _id: id, userId: userId.toString() });
    if (!notif) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Notification deleted',
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Notifications] Failed to delete notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};
