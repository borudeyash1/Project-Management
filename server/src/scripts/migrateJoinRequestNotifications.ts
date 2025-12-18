import mongoose from 'mongoose';
import Notification from '../models/Notification';
import JoinRequest from '../models/JoinRequest';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration script to add metadata to existing join request notifications
 * Run this once to update old notifications
 */
async function migrateJoinRequestNotifications() {
  try {
    console.log('🔄 Starting migration: Adding metadata to join request notifications...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pms');
    console.log('✅ Connected to MongoDB');

    // Find all join request notifications without metadata
    const joinRequestNotifications = await Notification.find({
      type: 'workspace',
      title: { $regex: 'join request', $options: 'i' },
      $or: [
        { metadata: { $exists: false } },
        { 'metadata.joinRequestId': { $exists: false } }
      ]
    });

    console.log(`📊 Found ${joinRequestNotifications.length} join request notifications to update`);

    let updated = 0;
    let failed = 0;

    for (const notification of joinRequestNotifications) {
      try {
        // Try to find the corresponding join request
        // We'll look for a join request with matching workspace and status pending
        const joinRequest = (await JoinRequest.findOne({
          workspace: notification.relatedId,
          status: 'pending'
        }).sort({ createdAt: -1 })) as any; // Cast to any to avoid type issues

        if (joinRequest) {
          // Update notification with metadata
          await Notification.updateOne(
            { _id: notification._id },
            {
              $set: {
                metadata: {
                  workspaceId: notification.relatedId,
                  joinRequestId: joinRequest._id.toString()
                }
              }
            }
          );
          updated++;
          console.log(`✅ Updated notification ${notification._id} with joinRequestId ${joinRequest._id}`);
        } else {
          // No matching join request found - this notification is stale, delete it
          await Notification.deleteOne({ _id: notification._id });
          console.log(`🗑️  Deleted stale notification ${notification._id} (no matching join request)`);
          updated++;
        }
      } catch (error) {
        console.error(`❌ Failed to update notification ${notification._id}:`, error);
        failed++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Successfully updated/deleted: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log('✨ Migration complete!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateJoinRequestNotifications();
