import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';

const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';

export const getOnedriveService = () => {

    const getAccessToken = async (userId: string, accountId?: string) => {
        let query: any = {
            userId,
            service: 'onedrive'
        };

        if (accountId) {
            query._id = accountId;
        } else {
            query.isActive = true;
        }

        const account = await ConnectedAccount.findOne(query);

        if (!account || !account.accessToken) {
            throw new Error('OneDrive account not connected');
        }

        return account.accessToken;
    };

    const listFiles = async (userId: string, folderId: string = 'root', accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);

            // If folderId is 'root', use /me/drive/root/children
            // If folderId is actual ID, use /me/drive/items/{id}/children
            const endpoint = folderId === 'root'
                ? `${GRAPH_API_URL}/me/drive/root/children`
                : `${GRAPH_API_URL}/me/drive/items/${folderId}/children`;

            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.value.map((item: any) => ({
                id: item.id,
                name: item.name,
                type: item.folder ? 'folder' : 'file',
                webUrl: item.webUrl,
                size: item.size
            }));
        } catch (error: any) {
            console.error('OneDrive listFiles error:', error.response?.data || error.message);
            throw error;
        }
    };

    const getShareLink = async (userId: string, itemId: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);

            // Create a viewable link
            const response = await axios.post(
                `${GRAPH_API_URL}/me/drive/items/${itemId}/createLink`,
                { type: 'view', scope: 'anonymous' },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                link: response.data.link.webUrl,
                text: 'View on OneDrive'
            };
        } catch (error: any) {
            console.error('OneDrive getShareLink error:', error.response?.data || error.message);
            // Fallback to getting item details if createLink fails (some accounts might restrict sharing)
            try {
                const token = await getAccessToken(userId, accountId);
                const itemResponse = await axios.get(
                    `${GRAPH_API_URL}/me/drive/items/${itemId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                return {
                    link: itemResponse.data.webUrl,
                    text: 'Open in OneDrive'
                };
            } catch (retryError) {
                throw error;
            }
        }
    };

    return {
        listFiles,
        getShareLink
    };
};
