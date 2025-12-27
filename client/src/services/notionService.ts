import apiService from './api';

export interface NotionPage {
    id: string;
    title: string;
    url: string;
    icon?: {
        type: 'emoji' | 'external' | 'file';
        emoji?: string;
        external?: { url: string };
        file?: { url: string };
    };
}

export const notionService = {
    search: async (query: string): Promise<NotionPage[]> => {
        try {
            const response = await apiService.post('/sartthi/notion/search', { query });
            if (response.data?.success) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Notion search error:', error);
            throw error;
        }
    }
};
