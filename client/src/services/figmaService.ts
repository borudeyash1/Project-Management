import { apiService } from './api';

export interface FigmaProject {
    id: string;
    name: string;
    thumbnail_url?: string;
}

export interface FigmaFile {
    key: string;
    name: string;
    thumbnail_url: string;
    last_modified: string;
    project?: {
        id: string;
        name: string;
    };
}

class FigmaService {
    // Get authenticated user info
    async getMe(accountId?: string) {
        const response = await apiService.get<any>(`/figma/me${accountId ? `?accountId=${accountId}` : ''}`);
        return response.data;
    }

    // Get team projects
    async getTeamProjects(teamId: string, accountId?: string) {
        const response = await apiService.get<FigmaProject[]>(`/figma/teams/${teamId}/projects${accountId ? `?accountId=${accountId}` : ''}`);
        return response.data || [];
    }

    // Get files in a project
    async getProjectFiles(projectId: string, accountId?: string) {
        const response = await apiService.get<FigmaFile[]>(`/figma/projects/${projectId}/files${accountId ? `?accountId=${accountId}` : ''}`);
        return response.data || [];
    }

    // Get all designs in a workspace (using our backend aggregation)
    async getWorkspaceDesigns(workspaceId: string) {
        const response = await apiService.get<{ designs: any[] }>(`/figma/workspace/${workspaceId}/designs`);
        return response.data?.designs || [];
    }

    // Get recent files for widget (from teams/projects)
    async getRecentFiles(accountId?: string) {
        // Since we don't have a direct "recent files" endpoint in Figma API easily accessible without enterprise,
        // we might rely on our stored workspace designs or fetch from the first few teams/projects.
        // For now, let's try to get designs associated with the user via our backend aggregation or stored tokens.

        // This is a simplified implementation. A robust one would cache this or have a specific backend endpoint.
        // We'll trust the user to have some designs in the workspace for now, or fetch from 'me' endpoint if available.
        try {
            const me = await this.getMe(accountId);
            // If we had a way to access recently viewed files, we'd use it.
            // For now, returning empty or could be extended to explore teams.
            return [];
        } catch (error) {
            console.error('Failed to fetch recent Figma files', error);
            return [];
        }
    }
}

export const figmaService = new FigmaService();
