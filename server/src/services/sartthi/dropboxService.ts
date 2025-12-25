import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';

const DROPBOX_API_URL = 'https://api.dropboxapi.com/2';

export const getDropboxService = () => {

    const getAccessToken = async (userId: string, accountId?: string) => {
        let query: any = {
            userId,
            service: 'dropbox'
        };

        if (accountId) {
            query._id = accountId;
        } else {
            query.isActive = true;
        }

        const account = await ConnectedAccount.findOne(query);

        if (!account || !account.accessToken) {
            throw new Error('Dropbox account not connected');
        }

        return account.accessToken;
    };

    const listFiles = async (userId: string, path: string = '', accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.post(
                `${DROPBOX_API_URL}/files/list_folder`,
                {
                    path: path,
                    recursive: false,
                    include_media_info: false,
                    include_deleted: false,
                    include_has_explicit_shared_members: false
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.entries.map((entry: any) => ({
                id: entry.id,
                name: entry.name,
                path: entry.path_lower,
                type: entry['.tag'] // 'file' or 'folder'
            }));
        } catch (error: any) {
            console.error('Dropbox listFiles error:', error.response?.data || error.message);
            throw error;
        }
    };

    const getTemporaryLink = async (userId: string, path: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.post(
                `${DROPBOX_API_URL}/files/get_temporary_link`,
                { path },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                link: response.data.link,
                metadata: response.data.metadata
            };
        } catch (error: any) {
            console.error('Dropbox getTemporaryLink error:', error.response?.data || error.message);
            throw error;
        }
    };

    return {
        listFiles,
        getTemporaryLink
    };
};
