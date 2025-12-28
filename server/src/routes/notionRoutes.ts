import express from 'express';
import { getNotionService } from '../services/sartthi/notionService';
import { authenticate } from '../middleware/auth';
import NotionTask from '../models/NotionTask';

const router = express.Router();
router.use(authenticate);

router.post('/search', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const accountId = req.query.accountId as string;
        const { query } = req.body;

        const notionService = getNotionService();
        const data = await notionService.search(userId, query, accountId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/database/:id/query', async (req, res) => {
    try {
        const userId = (req as any).user._id;
        const { id } = req.params;
        const accountId = req.query.accountId as string;

        const notionService = getNotionService();
        // Use getDatabaseUpdates to fetch items. It returns basic info ideal for the widget.
        const data = await notionService.getDatabaseUpdates(userId, id, undefined, accountId);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all Notion tasks for a workspace
router.get('/workspace/:workspaceId/tasks', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = (req as any).user._id;

        // Fetch Notion config directly from user's connected account
        // We need to find the database ID
        const { ConnectedAccount } = require('../models/ConnectedAccount');
        const account = await ConnectedAccount.findOne({
            userId,
            service: 'notion',
            isActive: true
        });

        if (!account || !account.settings?.notion?.defaultDatabaseId) {
            console.log('[NOTION] No active account or default database found for user', userId);
            return res.json({ success: true, data: [] });
        }

        const databaseId = account.settings.notion.defaultDatabaseId;
        const notionService = getNotionService();

        // Fetch live updates (using the robust method we improved)
        const pages = await notionService.getDatabaseUpdates(userId, databaseId, undefined, account._id);

        // Transform to NotionTask-like structure for frontend compatibility
        const tasks = pages.map((page: any) => ({
            _id: page.id, // Use Notion ID as _id
            pageId: page.id,
            title: page.title,
            description: page.description,
            status: page.status,
            workspaceId,
            url: page.url,
            updatedAt: page.lastEditedTime,
            createdAt: page.lastEditedTime // Fallback
        }));

        console.log(`[NOTION] Returning ${tasks.length} LIVE Notion tasks`);
        return res.json({ success: true, data: tasks });
    } catch (error: any) {
        console.error('[NOTION] Error fetching workspace tasks:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Update a Notion task
router.put('/workspace/:workspaceId/tasks/:id', async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const updates = req.body;
        const userId = (req as any).user._id;

        console.log(`[NOTION] Updating LIVE task ${id}`, updates);

        // Update Notion via API directly
        try {
            const notionService = getNotionService();
            const notionUpdates: any = {};

            // Fetch page to get property metadata (dynamic title property name)
            let titleKey = 'Name';
            try {
                const page = await notionService.getPage(userId, id); // id is pageId
                if (page && page.properties) {
                    const foundKey = Object.keys(page.properties).find(key => page.properties[key].type === 'title');
                    if (foundKey) titleKey = foundKey;
                }
            } catch (err) {
                console.warn('[NOTION] Failed to fetch page metadata, using default "Name" property:', err);
            }

            if (updates.title) notionUpdates[titleKey] = { title: [{ text: { content: updates.title } }] };

            // For status, try "Status" or "State"
            if (updates.status) {
                // Simple validtion/mapping could go here
                notionUpdates.Status = { status: { name: updates.status } };
            }
            if (updates.priority) notionUpdates.Priority = { select: { name: updates.priority } };
            if (updates.dueDate) notionUpdates.Due = { date: { start: new Date(updates.dueDate).toISOString().split('T')[0] } };

            if (Object.keys(notionUpdates).length > 0) {
                await notionService.updatePage(userId, id, { properties: notionUpdates });
                console.log(`✅ [NOTION] Live updated Notion page ${id}`);
            }

            // Return success with echoed data (frontend optimistic update)
            return res.json({ success: true, data: { _id: id, ...updates } });

        } catch (syncError: any) {
            console.error(`❌ [NOTION] Failed to live update Notion:`, syncError.message);
            return res.status(500).json({ success: false, message: syncError.message });
        }
    } catch (error: any) {
        console.error('[NOTION] Update error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Sync Notion tasks for a workspace
router.post('/workspace/:workspaceId/sync', async (req, res) => {
    try {
        const { workspaceId } = req.params;

        // This would trigger a manual sync
        // For now, just return success - the poller will handle syncing
        console.log(`[NOTION] Manual sync requested for workspace ${workspaceId}`);

        res.json({ success: true, message: 'Sync initiated' });
    } catch (error: any) {
        console.error('[NOTION] Sync error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Notion pages as tasks
router.post('/workspace/:workspaceId/import', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { items } = req.body; // Array of Notion search results
        const userId = (req as any).user._id;

        console.log(`[NOTION] Importing ${items?.length} items for workspace ${workspaceId}`);

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items provided for import' });
        }

        const importedTasks = [];

        for (const item of items) {
            // Check if already exists
            const existing = await NotionTask.findOne({ pageId: item.id, workspaceId });
            if (existing) {
                continue;
            }

            // Map Notion properties to our schema
            // Provide defaults for missing fields
            let title = 'Untitled';

            // Extract title based on Notion property types
            if (item.properties) {
                // Find property with type 'title'
                const titlePropKey = Object.keys(item.properties).find(key => item.properties[key].type === 'title');
                if (titlePropKey && item.properties[titlePropKey].title?.[0]?.plain_text) {
                    title = item.properties[titlePropKey].title[0].plain_text;
                }
            }
            // Fallback for pages that might not have properties structure standardly or if searching pages by title directly
            if (title === 'Untitled' && (item as any).title) {
                title = (item as any).title;
            }

            // Try to find status
            let status = 'Not started';
            if (item.properties) {
                const statusPropKey = Object.keys(item.properties).find(key => item.properties[key].type === 'status');
                if (statusPropKey) {
                    status = item.properties[statusPropKey].status?.name || 'Not started';
                }
            }

            const newTask = new NotionTask({
                pageId: item.id,
                workspaceId,
                title,
                status, // Will need mapping in future if strictly enforcing enum
                notionDatabaseId: item.parent?.type === 'database_id' ? item.parent.database_id : undefined,
                lastSyncedAt: new Date(),
                createdAt: item.created_time,
                updatedAt: item.last_edited_time,
                url: item.url
            });

            await newTask.save();
            importedTasks.push(newTask);
        }

        console.log(`✅ [NOTION] Successfully imported ${importedTasks.length} tasks`);
        return res.json({ success: true, data: importedTasks });

    } catch (error: any) {
        console.error('[NOTION] Import error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;

