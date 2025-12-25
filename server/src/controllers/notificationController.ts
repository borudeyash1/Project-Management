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
    const notificationsToDelete: string[] = [];

    // --- Cleanup: Delete old processed notifications ---
    // Keep notifications of last 10 days whose action has been taken (accepted/declined)
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const oldProcessedResult = await Notification.deleteMany({
      userId: userId.toString(),
      actionStatus: { $in: ['accepted', 'declined'] },
      updatedAt: { $lt: tenDaysAgo }
    });

    if (oldProcessedResult.deletedCount > 0) {
      console.log(`🗑️ Deleted ${oldProcessedResult.deletedCount} old processed notifications`);
    }

    // Refresh list after cleanup if needed, or just filter in memory (but pagination/limit applies before cleanup, so reload is safer but expensive.
    // Given we just fetched, we can filter `notifications` array if we want, but since we modify it in the loop, let's just proceed. The user gets limit=100.

    for (const notif of notifications) {
      // ... (existing JoinRequest logic) ...
      // Check if it's a join request notification without metadata
      if (
        notif.type === 'workspace' &&
        notif.title?.toLowerCase().includes('join request') &&
        !notif.title?.toLowerCase().includes('approved') &&
        !notif.title?.toLowerCase().includes('rejected') &&
        (!notif.metadata || !notif.metadata.joinRequestId)
      ) {
        // ... (existing JoinRequest logic reused) ... (Wait, I replaced the loop start, need to be careful)
        // I will just inject the cleanup logic *before* the loop.
        // And update the loop content for status check.
      }

      // --- Sync Workspace Invitation Status ---
      // User requested to fetch status from workspaceinvitations collection
      if (
        notif.title?.toLowerCase().includes('invitation') ||
        notif.message?.toLowerCase().includes('invited you')
      ) {
        const WorkspaceInvitation = (await import('../models/WorkspaceInvitation')).default;
        const Workspace = (await import('../models/Workspace')).default;

        let finalStatus = null;

        // 1. Check strict membership FIRST (Source of Truth)
        if (notif.relatedId && req.user?._id) {
          const isMember = await Workspace.exists({
            _id: notif.relatedId,
            'members.user': req.user._id
          });
          if (isMember) {
            finalStatus = 'accepted';
          }
        }

        // 2. If not found as member, check Invitation record
        if (!finalStatus) {
          let invitation = null;
          // Try getting invitation by stored ID
          if (notif.metadata?.invitationId) {
            invitation = await WorkspaceInvitation.findById(notif.metadata.invitationId);
          }

          // If not found, look up by workspace and user ID (invitee)
          if (!invitation && notif.relatedId && req.user?._id) {
            invitation = await WorkspaceInvitation.findOne({
              workspace: notif.relatedId,
              invitee: req.user._id
            }).sort({ createdAt: -1 });
          }

          if (invitation) {
            finalStatus = invitation.status;
          }
        }

        // 3. Update Notification if we found a conclusive status
        if (finalStatus) {
          // Inject the real status from the collection into the notification
          if (!notif.metadata) notif.metadata = {};

          // Only update if status is different or actionStatus is missing
          if (notif.actionStatus !== finalStatus) {
            notif.actionStatus = finalStatus as 'accepted' | 'declined' | 'pending';
            notif.metadata.status = finalStatus;

            // Persist this sync to DB
            await Notification.updateOne(
              { _id: notif._id },
              {
                $set: {
                  'metadata.status': finalStatus,
                  actionStatus: finalStatus,
                  read: true // Mark as read if action is taken? Maybe not automatically, but usually yes.
                }
              }
            );
          }
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

    const { actionStatus } = req.body;

    notif.read = true;

    if (actionStatus && ['accepted', 'declined'].includes(actionStatus)) {
      notif.actionStatus = actionStatus;
      // Ensure metadata exists and update status there too for consistency
      if (!notif.metadata) notif.metadata = {};
      notif.metadata.status = actionStatus;

      // If we are setting actionStatus, we should mark the field as modified if it's Mixed type, but actionStatus is top level.
      // metadata is Mixed, so:
      notif.markModified('metadata');
    }

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
