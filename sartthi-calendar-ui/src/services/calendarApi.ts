import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface CalendarEvent {
    id: string;
    title: string;
    startTime: string; // ISO string or "HH:mm AM/PM"
    endTime: string;   // ISO string or "HH:mm AM/PM"
    date: string;      // ISO date string YYYY-MM-DD
    description?: string;
    attendees?: Array<{ name?: string; email: string }>;
    meetingLink?: string;
    color?: string;
    location?: string;
}

class CalendarApiService {
    private async request(method: string, endpoint: string, data?: any) {
        try {
            const response = await axios({
                method,
                url: `${API_URL}${endpoint}`,
                data,
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            console.error(`API Error ${endpoint}:`, error);
            throw error;
        }
    }

    async getEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
        try {
            // Use timeMin and timeMax as expected by the backend
            const response = await this.request('GET', `/api/calendar/events?timeMin=${startDate}&timeMax=${endDate}`);
            if (response.success) {
                // Transform Google API events to our internal format
                return response.data.map((gEvent: any) => ({
                    id: gEvent.id,
                    title: gEvent.summary || '(No Title)',
                    startTime: gEvent.start?.dateTime ? new Date(gEvent.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day',
                    endTime: gEvent.end?.dateTime ? new Date(gEvent.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day',
                    date: gEvent.start?.dateTime ? gEvent.start.dateTime.split('T')[0] : (gEvent.start?.date || ''),
                    description: gEvent.description,
                    meetingLink: gEvent.hangoutLink || gEvent.htmlLink,
                    color: 'blue' // Google colors are IDs, mapping them is complex, defaulting to blue
                }));
            }
            return [];
        } catch (error) {
            console.warn('Failed to fetch events from API, using mock data');
            return this.getMockEvents(startDate, endDate);
        }
    }

    async createEvent(event: any): Promise<CalendarEvent> {
        try {
            // Transform our internal event format to Google API format
            const startDateTime = this.combineDateAndTime(event.date, event.startTime);
            const endDateTime = this.combineDateAndTime(event.date, event.endTime);

            const googleEvent: any = {
                summary: event.title,
                description: event.description,
                start: {
                    dateTime: startDateTime,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: {
                    dateTime: endDateTime,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                location: event.location,
            };

            if (event.attendees && event.attendees.length > 0) {
                googleEvent.attendees = event.attendees.map((email: string) => ({ email }));
            }

            // Note: Google Calendar API requires 'colorId' which is a specific ID string.
            // Mapping our UI colors to Google color IDs is complex and requires fetching colors endpoint.
            // For now, we won't send colorId to Google to avoid errors, but we will return it locally.

            const response = await this.request('POST', '/api/calendar/events', googleEvent);

            // Return the created event in our format
            const gEvent = response.data;
            return {
                id: gEvent.id,
                title: gEvent.summary || '(No Title)',
                startTime: event.startTime,
                endTime: event.endTime,
                date: event.date,
                description: gEvent.description,
                meetingLink: gEvent.hangoutLink,
                location: gEvent.location,
                attendees: gEvent.attendees,
                color: event.color || 'blue' // Respect the requested color locally
            };
        } catch (error) {
            console.warn('Failed to create event via API, returning mock');
            // Fallback for demo purposes if backend fails
            return {
                id: Math.random().toString(36).substr(2, 9),
                title: event.title,
                startTime: event.startTime,
                endTime: event.endTime,
                date: event.date,
                description: event.description,
                location: event.location,
                attendees: event.attendees ? event.attendees.map((email: string) => ({ email, name: email.split('@')[0] })) : [],
                color: event.color || 'blue'
            };
        }
    }

    private combineDateAndTime(date: string, time: string): string {
        // time is "HH:mm AM/PM" or "HH:mm"
        const [timePart, period] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const d = new Date(date);
        d.setHours(hours, minutes, 0, 0);
        return d.toISOString();
    }

    async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
        return this.request('PUT', `/api/calendar/events/${id}`, event);
    }

    async deleteEvent(id: string): Promise<void> {
        return this.request('DELETE', `/api/calendar/events/${id}`);
    }

    private getMockEvents(_start: string, _end: string): CalendarEvent[] {
        // Generate some mock events relative to today
        const today = new Date();
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        return [
            {
                id: '1',
                title: 'Team Standup',
                startTime: '09:00 AM',
                endTime: '09:30 AM',
                date: formatDate(today),
                color: 'blue',
                description: 'Daily team sync',
                attendees: [{ name: 'John Doe', email: 'john@example.com' }]
            },
            {
                id: '2',
                title: 'Project Review',
                startTime: '14:00 PM',
                endTime: '15:00 PM',
                date: formatDate(today),
                color: 'purple',
                description: 'Weekly project review',
            },
            {
                id: '3',
                title: 'Client Call',
                startTime: '11:00 AM',
                endTime: '12:00 PM',
                date: formatDate(new Date(today.getTime() + 86400000)), // Tomorrow
                color: 'green',
                meetingLink: 'https://meet.google.com/abc-xyz'
            }
        ];
    }
}

export const calendarApi = new CalendarApiService();
