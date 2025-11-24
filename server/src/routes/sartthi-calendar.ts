import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../services/calendarService';

const router = express.Router();

/**
 * GET /api/calendar/events
 * Fetch calendar events
 */
router.get('/events', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { timeMin, timeMax } = req.query;

        const events = await listEvents(
            userId,
            timeMin as string,
            timeMax as string
        );

        res.json({
            success: true,
            data: events
        });
    } catch (error: any) {
        console.error('Fetch Events Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
});

/**
 * POST /api/calendar/events
 * Create a new calendar event
 */
router.post('/events', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const eventData = req.body;

        const event = await createEvent(userId, eventData);

        res.json({
            success: true,
            data: event
        });
    } catch (error: any) {
        console.error('Create Event Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event',
            error: error.message
        });
    }
});

/**
 * PUT /api/calendar/events/:eventId
 * Update an existing calendar event
 */
router.put('/events/:eventId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const eventId = req.params.eventId;
        const eventData = req.body;

        if (!eventId) {
            res.status(400).json({
                success: false,
                message: 'Event ID is required'
            });
            return;
        }

        const event = await updateEvent(userId, eventId, eventData);

        res.json({
            success: true,
            data: event
        });
    } catch (error: any) {
        console.error('Update Event Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: error.message
        });
    }
});

/**
 * DELETE /api/calendar/events/:eventId
 * Delete a calendar event
 */
router.delete('/events/:eventId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const eventId = req.params.eventId;

        if (!eventId) {
            res.status(400).json({
                success: false,
                message: 'Event ID is required'
            });
            return;
        }

        await deleteEvent(userId, eventId);

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete Event Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event',
            error: error.message
        });
    }
});

export default router;
