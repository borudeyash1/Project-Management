import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';

const NOTION_API_URL = 'https://api.notion.com/v1';

export const getNotionService = () => {

    const getAccessToken = async (userId: string, accountId?: string) => {
        let query: any = { userId, service: 'notion' };
        if (accountId) query._id = accountId;
        else query.isActive = true;

        const account = await ConnectedAccount.findOne(query);
        if (!account || !account.accessToken) throw new Error('Notion account not connected');
        return account.accessToken;
    };

    const search = async (userId: string, query: string = '', accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.post(`${NOTION_API_URL}/search`,
                {
                    query,
                    filter: { property: 'object', value: 'page' },
                    page_size: 20
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Notion-Version': '2022-06-28'
                    }
                }
            );
            return response.data.results.map((item: any) => ({
                id: item.id,
                title: item.properties?.title?.title?.[0]?.plain_text || 'Untitled',
                url: item.url,
                icon: item.icon
            }));
        } catch (error: any) {
            console.error('Notion search error:', error.response?.data || error.message);
            throw error;
        }
    };

    return { search };
};
