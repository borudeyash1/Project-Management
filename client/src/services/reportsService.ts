import api from './api';

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
        const response = await api.get('/reports/summary');
        return response.data;
    } catch (error) {
        console.error('Error fetching reports summary:', error);
        // Throw error so component can show proper empty state
        throw error;
    }
};
