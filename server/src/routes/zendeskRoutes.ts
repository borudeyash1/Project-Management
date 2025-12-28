import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { ConnectedAccount } from '../models/ConnectedAccount';
import { zendeskService } from '../services/sartthi/zendeskService';

const router = express.Router();

router.use(authenticate);

// Helper to get account
const getZendeskAccount = async (userId: string) => {
    return ConnectedAccount.findOne({
        userId,
        service: 'zendesk',
        isActive: true
    });
};

// GET /api/zendesk/tickets - Fetch recent tickets
router.get('/tickets', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const account = await getZendeskAccount(userId);

        if (!account) {
            return res.status(400).json({ success: false, message: 'Zendesk not connected' });
        }

        // Fetch tickets
        // Default to fetching all recent tickets or "assigned to me" if possible
        // The service.getTickets fetches recent tickets.
        const tickets = await zendeskService.getTickets(account);

        return res.json({ success: true, data: tickets });
    } catch (error: any) {
        console.error('[ZENDESK] Error fetching tickets:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/zendesk/search - Search tickets
router.get('/search', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { query } = req.query;
        const account = await getZendeskAccount(userId);

        if (!account) {
            return res.status(400).json({ success: false, message: 'Zendesk not connected' });
        }

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ success: false, message: 'Query required' });
        }

        const results = await zendeskService.searchTickets(account, query);
        return res.json({ success: true, data: results });
    } catch (error: any) {
        console.error('[ZENDESK] Error searching tickets:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/zendesk/workspace/:workspaceId/tickets - Contextual tickets for workspace
// Currently behaves same as /tickets but ready for future filtering
router.get('/workspace/:workspaceId/tickets', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const account = await getZendeskAccount(userId);

        if (!account) {
            // Return empty list instead of error for Planner to degrade gracefully
            return res.json({ success: true, data: [] });
        }

        // Live fetch
        const tickets = await zendeskService.getTickets(account);

        // Map to standard Task format for Planner compatibility if needed here?
        // Or PlannerContext handles mapping. Let's return raw Zendesk data 
        // but maybe with a minimal transform if it helps consistency.
        // For now, raw data + essential mapping.

        const tasks = tickets.map(t => ({
            _id: t.id.toString(), // Use Zendesk ID as String
            id: t.id,
            title: t.subject,
            description: t.description,
            status: t.status, // 'new', 'open', 'pending', 'solved', 'closed'
            priority: t.priority,
            url: t.url, // API url, need web view url?
            // Web URL is usually https://subdomain.zendesk.com/agent/tickets/{id}
            // We can construct it if we have subdomain
            webUrl: `https://${account.settings?.zendesk?.subdomain}.zendesk.com/agent/tickets/${t.id}`,
            updatedAt: t.updated_at,
            createdAt: t.created_at,
            source: 'zendesk',
            assigneeId: t.assignee_id
        }));

        console.log(`[ZENDESK] Returning ${tasks.length} LIVE tickets`);
        return res.json({ success: true, data: tasks });
    } catch (error: any) {
        console.error('[ZENDESK] Error fetching workspace tickets:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/zendesk/tickets/:id - Get single ticket details
router.get('/tickets/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const ticketId = req.params.id as string;
        const account = await getZendeskAccount(userId);

        if (!account) {
            return res.status(400).json({ success: false, message: 'Zendesk not connected' });
        }

        const data = await zendeskService.getTicketDetails(account, ticketId);
        return res.json({ success: true, data });
    } catch (error: any) {
        console.error('[ZENDESK] Error fetching ticket details:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/zendesk/tickets/:id/comments - Get ticket comments
router.get('/tickets/:id/comments', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const ticketId = req.params.id as string;
        const account = await getZendeskAccount(userId);

        if (!account) {
            return res.status(400).json({ success: false, message: 'Zendesk not connected' });
        }

        const data = await zendeskService.getTicketComments(account, ticketId);
        return res.json({ success: true, data });
    } catch (error: any) {
        console.error('[ZENDESK] Error fetching ticket comments:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
