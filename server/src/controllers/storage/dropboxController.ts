import { Request, Response } from 'express';
import { ConnectedAccount } from '../../models/ConnectedAccount';
import axios from 'axios';
import { IUser } from '../../types';

// Helper to get Dropbox Access Token
const getDropboxToken = async (userId: string): Promise<string | null> => {
    const account = await ConnectedAccount.findOne({
        userId,
        service: 'dropbox',
        isActive: true
    });

    if (!account || !account.accessToken) return null;
    return account.accessToken;
};

// List Files & Folders
export const listFiles = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.user as IUser)._id;
        const { path = '' } = req.body; // Dropbox list_folder expects empty string for root, or /path/to/folder

        const token = await getDropboxToken(userId);
        if (!token) {
            res.status(401).json({ success: false, message: 'Dropbox account not connected or active' });
            return;
        }

        const response = await axios.post(
            'https://api.dropboxapi.com/2/files/list_folder',
            {
                path: path === '/' ? '' : path, // Dropbox API requires empty string for root
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

        const files = response.data.entries.map((entry: any) => ({
            id: entry.id,
            name: entry.name,
            path: entry.path_lower, // Use path_lower for API calls
            path_display: entry.path_display, // Use path_display for UI
            type: entry['.tag'] === 'folder' ? 'folder' : 'file',
            size: entry.size, // in bytes
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
        const { path = '' } = req.body; // Parent folder path

        if (!file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }

        const token = await getDropboxToken(userId);
        if (!token) {
            res.status(401).json({ success: false, message: 'Dropbox account not connected' });
            return;
        }

        // Dropbox Upload API (files/upload)
        // Header 'Dropbox-API-Arg' contains parameters
        const dbxPath = path === '/' ? `/${file.originalname}` : `${path === '' ? '' : path}/${file.originalname}`;

        const args = {
            path: dbxPath,
            mode: 'add',
            autorename: true,
            mute: false,
            strict_conflict: false
        };

        const response = await axios.post(
            'https://content.dropboxapi.com/2/files/upload',
            file.buffer, // sending raw buffer
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/octet-stream',
                    'Dropbox-API-Arg': JSON.stringify(args)
                }
            }
        );

        res.json({ success: true, data: response.data, message: 'File uploaded successfully' });
    } catch (error: any) {
        console.error('Dropbox upload error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to upload file', error: error.response?.data || error.message });
    }
};

// Create Folder
export const createFolder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.user as IUser)._id;
        const { path } = req.body; // Full path of new folder

        const token = await getDropboxToken(userId);
        if (!token) {
            res.status(401).json({ success: false, message: 'Dropbox not connected' });
            return;
        }

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

        res.json({ success: true, data: response.data });
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

        const token = await getDropboxToken(userId);
        if (!token) {
            res.status(401).json({ success: false, message: 'Dropbox not connected' });
            return;
        }

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

        res.json({ success: true, data: response.data, message: 'Item deleted' });
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

        const token = await getDropboxToken(userId);
        if (!token) {
            res.status(401).json({ success: false, message: 'Dropbox not connected' });
            return;
        }

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

        res.json({ success: true, data: { link: response.data.link, metadata: response.data.metadata } });
    } catch (error: any) {
        console.error('Dropbox download link error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to get download link' });
    }
};
