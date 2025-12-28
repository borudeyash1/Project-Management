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
    object?: 'page' | 'database'; // [NEW] Identify object type
}

export const notionService = {
    search: async (query: string): Promise<NotionPage[]> => {
        try {
            const response = await apiService.post('/notion/search', { query });
            // apiService returns the response body directly
            if (response.success || Array.isArray(response.data)) {
                return response.data || [];
            }
            return [];
        } catch (error) {
            console.error('Notion search error:', error);
            throw error;
        }
    },

    getDatabaseItems: async (databaseId: string): Promise<NotionPage[]> => {
        try {
            const response = await apiService.post(`/notion/database/${databaseId}/query`);
            if (response.data?.success) {
                return response.data.results.map((item: any) => {
                    // Extract title by finding the property of type 'title'
                    let title = 'Untitled';
                    if (item.properties) {
                        const titlePropKey = Object.keys(item.properties).find(key => item.properties[key].type === 'title');
                        if (titlePropKey && item.properties[titlePropKey].title?.[0]?.plain_text) {
                            title = item.properties[titlePropKey].title[0].plain_text;
                        }
                    }
                    // Fallback for regular pages or if 'title' prop missing
                    if (title === 'Untitled') {
                        title = item.properties?.title?.title?.[0]?.plain_text ||
                            item.title?.[0]?.plain_text ||
                            'Untitled';
                    }

                    return {
                        id: item.id,
                        title: title,
                        url: item.url,
                        icon: item.icon,
                        object: item.object,
                    };
                });
            }
            return [];
        } catch (error) {
            console.error('Notion database items error:', error);
            return [];
        }
    }
};

