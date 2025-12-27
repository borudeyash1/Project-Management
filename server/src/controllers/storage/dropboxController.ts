import { Request, Response } from 'express';
import { ConnectedAccount } from '../../models/ConnectedAccount';
import axios from 'axios';
import { IUser } from '../../types';

// Helper to get Dropbox Access Token (with Refresh logic)
const getValidDropboxToken = async (userId: string): Promise<string | null> => {
    const account = await ConnectedAccount.findOne({
        userId,
        service: 'dropbox',
        isActive: true
    });

    if (!account) return null;

    // Check if token needs refresh (heuristic or proactive)
    // Dropbox doesn't strictly provide expires_in always in the same format, but we catch 401 later.
    // However, if we have a refresh token and no access token, or we want to be safe:
    return account.accessToken;
};

// Refresh Token Helper
const refreshDropboxToken = async (userId: string): Promise<string | null> => {
    try {
        const account = await ConnectedAccount.findOne({ userId, service: 'dropbox' });
        if (!account || !account.refreshToken) {
            console.error('Dropbox refresh failed: No account or refresh token');
            return null;
        }

        const credentials = Buffer.from(
            `${process.env.DROPBOX_CLIENT_ID}:${process.env.DROPBOX_CLIENT_SECRET}`
        ).toString('base64');

        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', account.refreshToken);

        const response = await axios.post('https://api.dropboxapi.com/oauth2/token', params, {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.access_token) {
            account.accessToken = response.data.access_token;
            // Dropbox tokens are usually 4h.
            if (response.data.expires_in) {
                account.expiresAt = new Date(Date.now() + response.data.expires_in * 1000);
            }
            await account.save();
            return account.accessToken;
        }
        return null;
    } catch (error: any) {
        console.error('Dropbox token refresh error:', error.response?.data || error.message);
        return null;
    }
};

// Retry wrapper
const executeDropboxRequest = async (userId: string, requestFn: (token: string) => Promise<any>): Promise<any> => {
    const token = await getValidDropboxToken(userId);
    if (!token) throw new Error('Dropbox not connected');

    try {
        return await requestFn(token);
    } catch (error: any) {
        // Check for specific Dropbox 401 expiry error
        // Dropbox v2 API returns 401 for auth errors/expiry
        // Or sometimes 409 with specific tags? Usually 401 for bad token.
        // The user log showed: error: { '.tag': 'expired_access_token' }
        const isExpired = error.response?.status === 401 ||
            (error.response?.data?.error?.['.tag'] === 'expired_access_token') ||
            (error.response?.data?.error_summary?.includes('expired_access_token'));

        if (isExpired) {
            console.log('Dropbox token expired, refreshing...');
            const newToken = await refreshDropboxToken(userId);
            if (newToken) {
                // Retry with new token
                return await requestFn(newToken);
            } else {
                throw new Error('Failed to refresh Dropbox token. Please reconnect your account.');
            }
        }
        throw error;
    }
};

// List Files & Folders
export const listFiles = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.user as IUser)._id;
        const { path = '' } = req.body;

        const responseData = await executeDropboxRequest(userId, async (token) => {
            const response = await axios.post(
                'https://api.dropboxapi.com/2/files/list_folder',
                {
                    path: path === '/' ? '' : path,
                    recursive: false,
                    include_media_info: false,
                    include_deleted: false,
                    include_has_explicit_shared_members: false,
                    include_mounted_folders: true
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        });

        const files = responseData.entries.map((entry: any) => ({
            id: entry.id,
            name: entry.name,
            path: entry.path_lower,
            path_display: entry.path_display,
            type: entry['.tag'] === 'folder' ? 'folder' : 'file',
            size: entry.size,
            modified: entry.client_modified || entry.server_modified,
            content_hash: entry.content_hash
        }));

        res.json({ success: true, data: files });
    } catch (error: any) {
        console.error('Dropbox list files error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to list files', error: error.response?.data || error.message });
    }
};

// Upload File
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.user as IUser)._id;
        const file = req.file;
        const { path = '' } = req.body;

        if (!file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }

        const dbxPath = path === '/' ? `/${file.originalname}` : `${path === '' ? '' : path}/${file.originalname}`;
        const args = {
            path: dbxPath,
            mode: 'add',
            autorename: true,
            mute: false,
            strict_conflict: false
        };

        const responseData = await executeDropboxRequest(userId, async (token) => {
            const response = await axios.post(
                'https://content.dropboxapi.com/2/files/upload',
                file.buffer,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/octet-stream',
                        'Dropbox-API-Arg': JSON.stringify(args)
                    }
                }
            );
            return response.data;
        });

        res.json({ success: true, data: responseData, message: 'File uploaded successfully' });
    } catch (error: any) {
        console.error('Dropbox upload error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to upload file', error: error.response?.data || error.message });
    }
};

// Create Folder
export const createFolder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.user as IUser)._id;
        const { path } = req.body;

        const responseData = await executeDropboxRequest(userId, async (token) => {
            const response = await axios.post(
                'https://api.dropboxapi.com/2/files/create_folder_v2',
                { path, autorename: true },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        });

        res.json({ success: true, data: responseData });
    } catch (error: any) {
        console.error('Dropbox create folder error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to create folder' });
    }
};

// Delete File/Folder
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.user as IUser)._id;
        const { path } = req.body;

        const responseData = await executeDropboxRequest(userId, async (token) => {
            const response = await axios.post(
                'https://api.dropboxapi.com/2/files/delete_v2',
                { path },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        });

        res.json({ success: true, data: responseData, message: 'Item deleted' });
    } catch (error: any) {
        console.error('Dropbox delete error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to delete item' });
    }
};

// Get Download Link
export const getDownloadLink = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.user as IUser)._id;
        const { path } = req.body;

        const responseData = await executeDropboxRequest(userId, async (token) => {
            const response = await axios.post(
                'https://api.dropboxapi.com/2/files/get_temporary_link',
                { path },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        });

        res.json({ success: true, data: { link: responseData.link, metadata: responseData.metadata } });
    } catch (error: any) {
        console.error('Dropbox download link error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to get download link' });
    }
};
