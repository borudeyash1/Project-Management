import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export interface CalendarEvent {
    date: string;
    title: string;
    type: 'task' | 'deadline' | 'meeting';
}

export const getCalendarEvents = async (month: string): Promise<CalendarEvent[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/calendar/events`, {
            params: { month },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.events || [];
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        // Return mock data for now
        return generateMockEvents(month);
    }
};

// Mock data generator for development
const generateMockEvents = (month: string): CalendarEvent[] => {
    const [year, monthNum] = month.split('-').map(Number);
    const events: CalendarEvent[] = [];

    // Add some random events
    for (let i = 0; i < 5; i++) {
        const day = Math.floor(Math.random() * 28) + 1;
        events.push({
            date: `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            title: ['Team Meeting', 'Project Deadline', 'Review Session', 'Sprint Planning'][Math.floor(Math.random() * 4)],
            type: ['task', 'deadline', 'meeting'][Math.floor(Math.random() * 3)] as any
        });
    }

    return events;
};
