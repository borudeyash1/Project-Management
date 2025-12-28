import apiService from './api';

export interface JiraIssue {
    id: string;
    key: string;
    summary: string;
    status: {
        name: string;
        color: string;
    };
    priority: {
        name: string;
        iconUrl?: string;
    };
    updated: string;
    project: {
        name: string;
        avatarUrl?: string;
    };
    type: {
        name: string;
        iconUrl?: string;
    };
}

export const jiraService = {
    getRecentIssues: async (): Promise<JiraIssue[]> => {
        try {
            const response = await apiService.get('/jira/issues');
            if (response.data?.success) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Jira get recent issues error:', error);
            // Return empty array instead of throwing to avoid breaking UI
            return [];
        }
    }
};
