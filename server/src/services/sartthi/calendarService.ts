import axios, { AxiosInstance } from 'axios';

interface CalendarEvent {
    id?: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    attendees?: string[];
    reminders?: {
        method: 'email' | 'popup';
        minutes: number;
    }[];
}

interface SarttHiCalendarConfig {
    baseUrl: string;
    apiKey: string;
    userId: string;
}

class SarttHiCalendarService {
    private client: AxiosInstance;
    private config: SarttHiCalendarConfig;

    constructor(config: SarttHiCalendarConfig) {
        this.config = config;
        this.client = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Create a calendar event from a task
     */
    async createEventFromTask(task: any): Promise<CalendarEvent | null> {
        try {
            if (!task.dueDate) return null;

            const event: CalendarEvent = {
                title: task.title,
                description: task.description || '',
                startTime: task.startDate || new Date(),
                endTime: task.dueDate,
                reminders: [
                    { method: 'email', minutes: 60 },
                    { method: 'popup', minutes: 15 }
                ]
            };

            // TODO: Replace with actual Sartthi Calendar API endpoint
            // const response = await this.client.post('/events', event);
            // return response.data;

            console.log('[Sartthi Calendar] Would create event:', event);
            return event;
        } catch (error) {
            console.error('[Sartthi Calendar] Error creating event:', error);
            return null;
        }
    }

    /**
     * Create calendar event from workspace
     */
    async createEventFromWorkspace(workspace: any): Promise<CalendarEvent | null> {
        try {
            const event: CalendarEvent = {
                title: `Workspace: ${workspace.name}`,
                description: workspace.description || '',
                startTime: new Date(),
                endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            };

            // TODO: Replace with actual API call
            console.log('[Sartthi Calendar] Would create workspace event:', event);
            return event;
        } catch (error) {
            console.error('[Sartthi Calendar] Error creating workspace event:', error);
            return null;
        }
    }

    /**
     * Create calendar event from project
     */
    async createEventFromProject(project: any): Promise<CalendarEvent | null> {
        try {
            const event: CalendarEvent = {
                title: `Project: ${project.name}`,
                description: project.description || '',
                startTime: project.startDate || new Date(),
                endTime: project.endDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            };

            // TODO: Replace with actual API call
            console.log('[Sartthi Calendar] Would create project event:', event);
            return event;
        } catch (error) {
            console.error('[Sartthi Calendar] Error creating project event:', error);
            return null;
        }
    }

    /**
     * Update existing calendar event
     */
    async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<boolean> {
        try {
            // TODO: Replace with actual API call
            // await this.client.patch(`/events/${eventId}`, updates);
            console.log('[Sartthi Calendar] Would update event:', eventId, updates);
            return true;
        } catch (error) {
            console.error('[Sartthi Calendar] Error updating event:', error);
            return false;
        }
    }

    /**
     * Delete calendar event
     */
    async deleteEvent(eventId: string): Promise<boolean> {
        try {
            // TODO: Replace with actual API call
            // await this.client.delete(`/events/${eventId}`);
            console.log('[Sartthi Calendar] Would delete event:', eventId);
            return true;
        } catch (error) {
            console.error('[Sartthi Calendar] Error deleting event:', error);
            return false;
        }
    }

    /**
     * Get user's calendar events
     */
    async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
        try {
            // TODO: Replace with actual API call
            // const response = await this.client.get('/events', {
            //   params: { start: startDate.toISOString(), end: endDate.toISOString() }
            // });
            // return response.data;

            console.log('[Sartthi Calendar] Would fetch events from', startDate, 'to', endDate);
            return [];
        } catch (error) {
            console.error('[Sartthi Calendar] Error fetching events:', error);
            return [];
        }
    }
}

// Singleton instance
let calendarServiceInstance: SarttHiCalendarService | null = null;

export const initializeCalendarService = (config: SarttHiCalendarConfig) => {
    calendarServiceInstance = new SarttHiCalendarService(config);
    return calendarServiceInstance;
};

export const getCalendarService = (): SarttHiCalendarService | null => {
    return calendarServiceInstance;
};

export default SarttHiCalendarService;
