import { getNotionService } from './notionService';

const POLL_INTERVAL_MS = 15000; // 15 seconds (faster sync)

interface NotionSyncPoller {
    start: () => void;
    stop: () => void;
}

let pollingInterval: NodeJS.Timeout | null = null;

/**
 * Background service that polls Notion for changes and syncs to Sartthi
 */
export const createNotionSyncPoller = (): NotionSyncPoller => {
    const syncAllUsers = async () => {
        try {
            const { ConnectedAccount } = require('../../models/ConnectedAccount');
            const { default: Task } = require('../../models/Task');

            // Find all active Notion accounts
            const notionAccounts = await ConnectedAccount.find({
                service: 'notion',
                isActive: true
            });

            if (notionAccounts.length === 0) {
                return; // No active Notion users
            }

            console.log(`🔄 [NOTION POLLER] Syncing ${notionAccounts.length} users...`);

            for (const account of notionAccounts) {
                try {
                    const userId = account.userId;
                    const databaseId = account.settings?.notion?.defaultDatabaseId;

                    if (!databaseId) {
                        continue; // Skip if no database configured
                    }

                    const notionService = getNotionService();
                    const lastSynced = account.lastSynced ? new Date(account.lastSynced) : undefined;

                    // Get updates from Notion
                    const updates = await notionService.getDatabaseUpdates(
                        userId,
                        databaseId,
                        lastSynced
                    );

                    if (updates.length === 0) {
                        continue;
                    }

                    console.log(`📝 [NOTION POLLER] Found ${updates.length} updates for user ${userId}`);

                    // Update matching tasks
                    let updatedCount = 0;
                    for (const update of updates) {
                        const notionStatus = update.status?.toLowerCase();
                        let sartthiStatus: string | undefined;

                        if (notionStatus === 'not started') sartthiStatus = 'pending';
                        else if (notionStatus === 'in progress') sartthiStatus = 'in-progress';
                        else if (notionStatus === 'done') sartthiStatus = 'completed';

                        if (sartthiStatus) {
                            const task: any = await Task.findOne({
                                'notionSync.pageId': update.id
                            });

                            if (task && task.status !== sartthiStatus) {
                                task.status = sartthiStatus;
                                task.notionSync.lastSyncedAt = new Date();
                                await task.save();
                                updatedCount++;
                                console.log(`✅ [NOTION POLLER] Updated task "${task.title}" to ${sartthiStatus}`);

                                // Emit WebSocket event for real-time update
                                try {
                                    const io = (global as any).io;
                                    if (io) {
                                        io.emit('taskUpdated', {
                                            taskId: task._id.toString(),
                                            newStatus: sartthiStatus,
                                            userId: userId.toString(),
                                            title: task.title
                                        });
                                        console.log(`📡 [WEBSOCKET] Broadcasted task update: ${task.title}`);
                                    }
                                } catch (wsError) {
                                    console.error('❌ [WEBSOCKET] Failed to emit event:', wsError);
                                }
                            }
                        }
                    }

                    // Update last sync time
                    account.lastSynced = new Date();
                    await account.save();

                    if (updatedCount > 0) {
                        console.log(`✅ [NOTION POLLER] Synced ${updatedCount} tasks for user ${userId}`);
                    }
                } catch (error) {
                    console.error(`❌ [NOTION POLLER] Error syncing user ${account.userId}:`, error);
                }
            }
        } catch (error) {
            console.error('❌ [NOTION POLLER] Error in sync cycle:', error);
        }
    };

    return {
        start: () => {
            if (pollingInterval) {
                console.log('⚠️ [NOTION POLLER] Already running');
                return;
            }

            console.log(`🚀 [NOTION POLLER] Starting (interval: ${POLL_INTERVAL_MS / 1000}s)`);

            // Run immediately on start
            syncAllUsers();

            // Then run on interval
            pollingInterval = setInterval(syncAllUsers, POLL_INTERVAL_MS);
        },

        stop: () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
                console.log('🛑 [NOTION POLLER] Stopped');
            }
        }
    };
};

// Export singleton instance
export const notionSyncPoller = createNotionSyncPoller();
