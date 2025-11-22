import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export interface ReportsSummary {
    tasksCompletedThisWeek: number;
    tasksCompletedChange: number;
    projectsOnTrack: number;
    totalProjects: number;
    projectsAtRisk: number;
    productivityScore: number;
    productivityChange: number;
}

export const getReportsSummary = async (): Promise<ReportsSummary> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reports/summary`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching reports summary:', error);
        // Return mock data for now
        return {
            tasksCompletedThisWeek: 12,
            tasksCompletedChange: 15,
            projectsOnTrack: 3,
            totalProjects: 4,
            projectsAtRisk: 1,
            productivityScore: 78,
            productivityChange: 5
        };
    }
};
