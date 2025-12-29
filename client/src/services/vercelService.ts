import { apiService } from './api';

export interface VercelProject {
    id: string;
    name: string;
    framework?: string;
    link?: string;
    updatedAt?: number;
}

class VercelService {
    // Get Vercel projects
    async getProjects(accountId?: string) {
        const response = await apiService.get<VercelProject[]>(`/vercel/projects${accountId ? `?accountId=${accountId}` : ''}`);
        return response.data || [];
    }
}

export const vercelService = new VercelService();
