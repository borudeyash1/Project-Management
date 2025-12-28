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

// Get all Notion tasks for a workspace
router.get('/workspace/:workspaceId/tasks', async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const tasks = await NotionTask.find({ workspaceId }).sort({ createdAt: -1 });

        console.log(`[NOTION] Returning ${tasks.length} Notion tasks for workspace ${workspaceId}`);
        res.json({ success: true, data: tasks });
    } catch (error: any) {
        console.error('[NOTION] Error fetching workspace tasks:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update a Notion task
router.put('/workspace/:workspaceId/tasks/:id', async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const updates = req.body;
        const userId = (req as any).user._id;

        console.log(`[NOTION] Updating task ${id} in workspace ${workspaceId}`, updates);

        // Find the Notion task
        const task = await NotionTask.findOne({ _id: id, workspaceId });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Notion task not found' });
        }

        // Map status from Sartthi to Notion format
        if (updates.status) {
            const statusMap: Record<string, string> = {
                'pending': 'Not started',
                'in-progress': 'In progress',
                'completed': 'Done'
            };
            updates.status = statusMap[updates.status] || updates.status;
        }

        // Update Notion via API
        try {
            const notionService = getNotionService();
            const notionUpdates: any = {};

            if (updates.title) notionUpdates.Name = { title: [{ text: { content: updates.title } }] };
            if (updates.status) notionUpdates.Status = { status: { name: updates.status } };
            if (updates.priority) notionUpdates.Priority = { select: { name: updates.priority } };
            if (updates.dueDate) notionUpdates.Due = { date: { start: new Date(updates.dueDate).toISOString().split('T')[0] } };

            if (Object.keys(notionUpdates).length > 0) {
                await notionService.updatePage(userId, task.pageId, { properties: notionUpdates });
                console.log(`✅ [NOTION] Synced updates to Notion for ${task.pageId}`);
            }
        } catch (syncError: any) {
            console.error(`❌ [NOTION] Failed to sync to Notion:`, syncError.message);
            // Continue to update local database even if Notion sync fails
        }

        // Update local NotionTask document
        if (updates.title) task.title = updates.title;
        if (updates.description !== undefined) task.description = updates.description;
        if (updates.status) task.status = updates.status;
        if (updates.priority) task.priority = updates.priority;
        if (updates.dueDate) task.dueDate = updates.dueDate;

        task.lastSyncedAt = new Date();
        await task.save();

        console.log(`✅ [NOTION] Updated local NotionTask document`);
        return res.json({ success: true, data: task });
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

export default router;

