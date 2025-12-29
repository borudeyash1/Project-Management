import { apiService } from './api';
import { LinearTeam, LinearIssue, LinearProject, LinearWorkflowState } from '../types/linear';

export const linearService = {
    getTeams: async (): Promise<LinearTeam[]> => {
        console.log('[Linear] Fetching teams...');
        const response = await apiService.get('/linear/teams');
        console.log('[Linear] Teams response:', response);
        if (response.success) {
            return response.data;
        }
        return [];
    },

    getIssues: async (teamId?: string): Promise<LinearIssue[]> => {
        const endpoint = teamId ? `/linear/teams/${teamId}/issues` : '/linear/issues';
        console.log('[Linear] Fetching issues from:', endpoint);
        const response = await apiService.get(endpoint);
        console.log('[Linear] Issues response:', response);
        if (response.success) {
            return response.data;
        }
        return [];
    },

    getIssue: async (issueId: string): Promise<LinearIssue | null> => {
        const response = await apiService.get(`/linear/issues/${issueId}`);
        if (response.success) {
            return response.data;
        }
        return null;
    },

    getProjects: async (teamId: string): Promise<LinearProject[]> => {
        const response = await apiService.get(`/linear/teams/${teamId}/projects`);
        if (response.success) {
            return response.data;
        }
        return [];
    },

    getWorkflowStates: async (teamId: string): Promise<LinearWorkflowState[]> => {
        const response = await apiService.get(`/linear/teams/${teamId}/states`);
        if (response.success) {
            return response.data;
        }
        return [];
    },

    createIssue: async (teamId: string, data: {
        title: string;
        description?: string;
        priority?: number;
        stateId?: string;
        assigneeId?: string;
        projectId?: string;
        dueDate?: string;
    }): Promise<LinearIssue> => {
        const response = await apiService.post(`/linear/teams/${teamId}/issues`, data);
        if (response.success) {
            return response.data;
        }
        throw new Error(response.message || 'Failed to create issue');
    },

    updateIssue: async (issueId: string, updates: {
        title?: string;
        description?: string;
        priority?: number;
        stateId?: string;
        assigneeId?: string;
        projectId?: string;
        dueDate?: string;
    }): Promise<LinearIssue> => {
        const response = await apiService.put(`/linear/issues/${issueId}`, updates);
        if (response.success) {
            return response.data;
        }
        throw new Error(response.message || 'Failed to update issue');
    }
};
