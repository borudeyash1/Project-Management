import { apiService } from './api';

export interface CalendarEvent {
    date: string;
    title: string;
    type: 'task' | 'deadline' | 'meeting';
}

export const getCalendarEvents = async (month: string): Promise<CalendarEvent[]> => {
    try {
        const [year, monthNum] = month.split('-').map(Number);
        
        // Calculate start and end dates for the month
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0); // Last day of month
        
        // Fetch tasks from the API
        const tasks = await apiService.getTasks();
        
        // Filter and map tasks that have due dates in this month
        const events: CalendarEvent[] = tasks
            .filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                return dueDate >= startDate && dueDate <= endDate;
            })
            .map(task => {
                const dueDate = new Date(task.dueDate!);
                return {
                    date: `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`,
                    title: task.title,
                    type: 'task' as const
                };
            });
        
        return events;
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        // Return empty array instead of mock data
        return [];
    }
};
