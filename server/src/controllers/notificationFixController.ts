import { Response } from 'express';
import Notification from '../models/Notification';
import JoinRequest from '../models/JoinRequest';
import { AuthenticatedRequest, ApiResponse } from '../types';

/**
 * Fix existing join request notifications by adding metadata
 * This is a one-time fix for notifications created before metadata was added
 */
export const fixJoinRequestNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    console.log('🔄 Fixing join request notifications...');

    // Find all join request notifications without metadata
    const notifications = await Notification.find({
      type: 'workspace',
      title: { $regex: 'join request', $options: 'i' },
      $or: [
        { metadata: { $exists: false } },
        { 'metadata.joinRequestId': { $exists: false } }
      ]
    });

    console.log(`📊 Found ${notifications.length} notifications to fix`);

    let updated = 0;
    let deleted = 0;

    for (const notification of notifications) {
      try {
        // Try to find the corresponding join request
        const joinRequest = await JoinRequest.findOne({
          workspace: notification.relatedId,
          status: 'pending'
        }).sort({ createdAt: -1 });

        if (joinRequest) {
          // Update notification with metadata
          notification.metadata = {
            workspaceId: notification.relatedId || '',
            joinRequestId: (joinRequest._id as any).toString()
          };
          await notification.save();
          updated++;
          console.log(`✅ Updated notification ${notification._id}`);
        } else {
          // No matching join request - delete stale notification
          await Notification.deleteOne({ _id: notification._id });
          deleted++;
          console.log(`🗑️  Deleted stale notification ${notification._id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to process notification ${notification._id}:`, error);
      }
    }

    const response: ApiResponse = {
      success: true,
      message: `Fixed ${updated} notifications, deleted ${deleted} stale notifications`,
      data: { updated, deleted }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Fix Notifications] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fix notifications',
      error: error.message 
    });
  }
};
