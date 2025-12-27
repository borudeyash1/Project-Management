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

    const createPage = async (
        userId: string,
        data: {
            title: string;
            content: any[];
            properties?: Record<string, any>;
            parentDatabase?: string;
            parentPage?: string;
        },
        accountId?: string
    ) => {
        try {
            const token = await getAccessToken(userId, accountId);

            // Determine parent (database or page)
            let parent;
            if (data.parentDatabase) {
                parent = { database_id: data.parentDatabase };
            } else if (data.parentPage) {
                parent = { page_id: data.parentPage };
            } else {
                // No parent specified, try to find a fallback
                // First try to find a database (preferred for tasks)
                const databases = await listDatabases(userId, accountId);
                if (databases && databases.length > 0) {
                    parent = { database_id: databases[0].id };
                } else {
                    // If no databases, try to find any page
                    const pages = await search(userId, '', accountId);
                    if (pages && pages.length > 0) {
                        parent = { page_id: pages[0].id };
                    } else {
                        throw new Error('No Notion parent (page or database) found to sync to. Please select pages when authenticating Notion.');
                    }
                }
            }

            const response = await axios.post(`${NOTION_API_URL}/pages`,
                {
                    parent,
                    properties: {
                        title: {
                            title: [{ text: { content: data.title } }]
                        },
                        ...data.properties
                    },
                    children: data.content
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Notion-Version': '2022-06-28',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                pageId: response.data.id,
                url: response.data.url
            };
        } catch (error: any) {
            console.error('Notion create page error:', error.response?.data || error.message);
            throw error;
        }
    };

    const updatePage = async (
        userId: string,
        pageId: string,
        data: {
            properties?: Record<string, any>;
            archived?: boolean;
        },
        accountId?: string
    ) => {
        try {
            const token = await getAccessToken(userId, accountId);

            await axios.patch(`${NOTION_API_URL}/pages/${pageId}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Notion-Version': '2022-06-28',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return { success: true };
        } catch (error: any) {
            console.error('Notion update page error:', error.response?.data || error.message);
            throw error;
        }
    };

    const appendBlockChildren = async (
        userId: string,
        blockId: string,
        children: any[],
        accountId?: string
    ) => {
        try {
            const token = await getAccessToken(userId, accountId);

            await axios.patch(`${NOTION_API_URL}/blocks/${blockId}/children`,
                { children },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Notion-Version': '2022-06-28',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return { success: true };
        } catch (error: any) {
            console.error('Notion append blocks error:', error.response?.data || error.message);
            throw error;
        }
    };

    const createDatabase = async (
        userId: string,
        data: {
            title: string;
            properties: Record<string, any>;
            parentPage?: string;
        },
        accountId?: string
    ) => {
        try {
            const token = await getAccessToken(userId, accountId);

            const parent = data.parentPage
                ? { page_id: data.parentPage }
                : { type: 'page_id', page_id: 'root' };

            const response = await axios.post(`${NOTION_API_URL}/databases`,
                {
                    parent,
                    title: [{ text: { content: data.title } }],
                    properties: data.properties
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Notion-Version': '2022-06-28',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                databaseId: response.data.id,
                url: response.data.url
            };
        } catch (error: any) {
            console.error('Notion create database error:', error.response?.data || error.message);
            throw error;
        }
    };

    const listDatabases = async (userId: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);

            const response = await axios.post(`${NOTION_API_URL}/search`,
                {
                    filter: { property: 'object', value: 'database' },
                    page_size: 100
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Notion-Version': '2022-06-28'
                    }
                }
            );

            return response.data.results.map((db: any) => ({
                id: db.id,
                title: db.title?.[0]?.plain_text || 'Untitled Database',
                url: db.url
            }));
        } catch (error: any) {
            console.error('Notion list databases error:', error.response?.data || error.message);
            throw error;
        }
    };

    const getDatabaseUpdates = async (userId: string, databaseId: string, lastSyncedTime?: Date, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);

            // Notion doesn't support filtering by last_edited_time in database queries
            // So we fetch all pages and filter client-side
            const response = await axios.post(`${NOTION_API_URL}/databases/${databaseId}/query`,
                {
                    page_size: 100 // Limit to 100 pages
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Notion-Version': '2022-06-28'
                    }
                }
            );

            // Map and filter results
            const allPages = response.data.results.map((page: any) => ({
                id: page.id,
                status: page.properties?.Status?.status?.name || page.properties?.Status?.select?.name,
                lastEditedTime: page.last_edited_time,
                url: page.url
            }));

            // Filter by lastSyncedTime if provided
            if (lastSyncedTime) {
                const lastSyncedTimestamp = lastSyncedTime.getTime();
                return allPages.filter((page: any) => {
                    const pageEditedTime = new Date(page.lastEditedTime).getTime();
                    return pageEditedTime > lastSyncedTimestamp;
                });
            }

            return allPages;
        } catch (error: any) {
            console.error('Notion get database updates error:', error.response?.data || error.message);
            // Don't throw for now, just return empty to avoid blocking
            return [];
        }
    };

    return {
        search,
        createPage,
        updatePage,
        appendBlockChildren,
        createDatabase,
        listDatabases,
        getDatabaseUpdates
    };
};
