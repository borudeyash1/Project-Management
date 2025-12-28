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

                    // Process each update from Notion
                    let updatedCount = 0;
                    let createdCount = 0;

                    for (const update of updates) {
                        const notionStatus = update.status?.toLowerCase();
                        let sartthiStatus: string | undefined;

                        if (notionStatus === 'not started') sartthiStatus = 'pending';
                        else if (notionStatus === 'in progress') sartthiStatus = 'in-progress';
                        else if (notionStatus === 'done') sartthiStatus = 'completed';

                        // Check if task already exists in Sartthi
                        const task: any = await Task.findOne({
                            'notionSync.pageId': update.id
                        });

                        if (task) {
                            // Task exists - update fields if changed
                            let hasUpdates = false;

                            // Update Status
                            if (sartthiStatus && task.status !== sartthiStatus) {
                                task.status = sartthiStatus;
                                hasUpdates = true;
                                console.log(`✅ [NOTION POLLER] Updated status for "${task.title}" to ${sartthiStatus}`);
                            }

                            // Update Title
                            const taskTitle = update.title || task.title; // Fallback to existing if empty? No, update.title should be valid from service
                            if (update.title && task.title !== update.title) {
                                task.title = update.title;
                                hasUpdates = true;
                                console.log(`✅ [NOTION POLLER] Updated title for "${task.title}"`);
                            }

                            // Update Description
                            // Only update description if it's not the default one, or if we have a new one
                            // If current is default hardcoded, overwrite it.
                            const newDiffers = update.description !== undefined && task.description !== update.description;
                            const isDefault = task.description === 'Created from Notion database';

                            if (newDiffers || (isDefault && update.description === '')) {
                                task.description = update.description || '';
                                hasUpdates = true;
                            }

                            if (hasUpdates) {
                                task.notionSync.lastSyncedAt = new Date();
                                await task.save();
                                updatedCount++;

                                // Emit WebSocket event for real-time update
                                try {
                                    const io = (global as any).io;
                                    if (io) {
                                        io.emit('taskUpdated', {
                                            taskId: task._id.toString(),
                                            newStatus: task.status,
                                            userId: userId.toString(),
                                            title: task.title,
                                            description: task.description
                                        });
                                        console.log(`📡 [WEBSOCKET] Broadcasted task update: ${task.title}`);
                                    }
                                } catch (wsError) {
                                    console.error('❌ [WEBSOCKET] Failed to emit event:', wsError);
                                }
                            }

                        } else {
                            // Task doesn't exist - create new task in Sartthi
                            try {
                                const { default: User } = require('../../models/User');
                                const user = await User.findById(userId);

                                if (!user) continue;

                                // Get title from update object (already robustly extracted by notionService)
                                const taskTitle = update.title || `Task from Notion (${update.id.substring(0, 8)})`;

                                // Create new task
                                const newTask = new Task({
                                    title: taskTitle,
                                    description: update.description || '', // Use extracted description or empty
                                    status: sartthiStatus || 'pending',
                                    priority: 'medium',
                                    reporter: userId,
                                    workspace: user.activeWorkspace || user.workspaces?.[0],
                                    type: 'task',
                                    taskType: 'general',
                                    progress: 0,
                                    requiresLink: false,
                                    requiresFile: false,
                                    subtasks: [],
                                    notionSync: {
                                        pageId: update.id,
                                        url: update.url,
                                        lastSyncedAt: new Date()
                                    }
                                });

                                await newTask.save();
                                createdCount++;
                                console.log(`🆕 [NOTION POLLER] Created new task from Notion: "${taskTitle}"`);

                                // Emit WebSocket event for new task
                                try {
                                    const io = (global as any).io;
                                    if (io) {
                                        io.emit('taskCreated', {
                                            taskId: newTask._id.toString(),
                                            userId: userId.toString(),
                                            title: taskTitle,
                                            status: sartthiStatus || 'pending'
                                        });
                                        console.log(`📡 [WEBSOCKET] Broadcasted new task creation: ${taskTitle}`);
                                    }
                                } catch (wsError) {
                                    console.error('❌ [WEBSOCKET] Failed to emit event:', wsError);
                                }
                            } catch (createError) {
                                console.error(`❌ [NOTION POLLER] Failed to create task from Notion page ${update.id}:`, createError);
                            }
                        }
                    }

                    // Update last sync time
                    account.lastSynced = new Date();
                    await account.save();

                    if (updatedCount > 0 || createdCount > 0) {
                        console.log(`✅ [NOTION POLLER] Synced for user ${userId}: ${updatedCount} updated, ${createdCount} created`);
                    }
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
