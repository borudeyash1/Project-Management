import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { Readable } from 'stream';

const getOAuthClient = () => {
    const BASE_URL = process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || 'https://sartthi.com')
        : 'http://localhost:5000';

    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${BASE_URL}/api/auth/sartthi/connect-vault/callback`
    );
};

export const getDriveClient = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user || !user.modules?.vault?.refreshToken) {
        throw new Error('Vault module not connected');
    }

    const auth = getOAuthClient();
    auth.setCredentials({
        refresh_token: user.modules.vault.refreshToken
    });

    return google.drive({ version: 'v3', auth });
};

export const listFiles = async (userId: string, folderId?: string, view?: string) => {
    console.log(`📁 [DRIVE] Listing files for user: ${userId}, folder: ${folderId || 'Sartthi Vault'}, view: ${view}`);

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!user.modules?.vault?.refreshToken) {
        throw new Error('Vault module not connected');
    }

    const drive = await getDriveClient(userId);
    let sartthiVaultFolder = user.modules.vault.rootFolderId;

    // Auto-initialize if folder doesn't exist (for users who connected before this fix)
    if (!sartthiVaultFolder) {
        console.log('📁 [DRIVE] Root folder not found, initializing...');

        // Search for existing "Sartthi Vault" folder
        const searchResponse = await drive.files.list({
            q: "name='Sartthi Vault' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        if (searchResponse.data.files && searchResponse.data.files.length > 0) {
            // Found existing folder
            sartthiVaultFolder = searchResponse.data.files[0]?.id!;
            console.log('📁 [DRIVE] Found existing Sartthi Vault folder:', sartthiVaultFolder);
        } else {
            // Create new folder
            const folderMetadata = {
                name: 'Sartthi Vault',
                mimeType: 'application/vnd.google-apps.folder'
            };

            const folderResponse = await drive.files.create({
                requestBody: folderMetadata,
                fields: 'id'
            });

            sartthiVaultFolder = folderResponse.data.id!;
            console.log('📁 [DRIVE] Created new Sartthi Vault folder:', sartthiVaultFolder);
        }

        // Update user with the folder ID
        user.modules.vault.rootFolderId = sartthiVaultFolder;
        await user.save();
        console.log('📁 [DRIVE] Updated user with rootFolderId');
    }

    // Use dedicated Sartthi Vault folder for privacy and security
    // This ensures we only access files explicitly stored in Sartthi Vault
    const targetFolderId = folderId || sartthiVaultFolder;

    let query = '';
    let orderBy = 'folder,name';

    switch (view) {
        case 'trash':
            // STRICTLY scoped to target folder
            query = `'${targetFolderId}' in parents and trashed=true`;
            break;
        case 'starred':
            // STRICTLY scoped to target folder
            query = `'${targetFolderId}' in parents and starred=true and trashed=false`;
            break;
        case 'recent':
            // STRICTLY scoped to target folder, just sorted differently
            query = `'${targetFolderId}' in parents and trashed=false`;
            orderBy = 'modifiedTime desc';
            break;
        default:
            // Default view (Home)
            query = `'${targetFolderId}' in parents and trashed=false`;
            break;
    }

    try {
        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name, mimeType, size, modifiedTime, thumbnailLink, webViewLink, webContentLink, iconLink)',
            orderBy: orderBy,
            pageSize: 1000,
        });

        const files = response.data.files || [];
        console.log(`📁 [DRIVE] Found ${files.length} files in Sartthi Vault`);

        // Transform to our format
        const transformedFiles = files.map(file => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            const extension = file.name?.split('.').pop()?.toLowerCase();

            let type: 'folder' | 'file' | 'image' | 'video' | 'audio' = 'file';
            if (isFolder) {
                type = 'folder';
            } else if (file.mimeType?.startsWith('image/')) {
                type = 'image';
            } else if (file.mimeType?.startsWith('video/')) {
                type = 'video';
            } else if (file.mimeType?.startsWith('audio/')) {
                type = 'audio';
            }

            return {
                id: file.id,
                name: file.name,
                type,
                extension: isFolder ? undefined : extension,
                size: file.size ? formatFileSize(parseInt(file.size)) : undefined,
                modifiedDate: file.modifiedTime ? formatDate(new Date(file.modifiedTime)) : undefined,
                thumbnail: file.thumbnailLink,
                url: file.webContentLink,
                viewLink: file.webViewLink,
                iconLink: file.iconLink,
                mimeType: file.mimeType,
            };
        });

        return transformedFiles;
    } catch (error: any) {
        console.error('📁 [DRIVE] List files error:', error.message);
        throw error;
    }
};

export const uploadFile = async (userId: string, file: Express.Multer.File, folderId?: string) => {
    console.log(`📤 [DRIVE] Uploading file: ${file.originalname}`);

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!user.modules?.vault?.rootFolderId) {
        throw new Error('Vault module not properly configured');
    }

    const drive = await getDriveClient(userId);
    const sartthiVaultFolder = user.modules.vault.rootFolderId;
    const targetFolderId = folderId || sartthiVaultFolder;

    try {
        const fileMetadata = {
            name: file.originalname,
            parents: [targetFolderId],
        };

        const media = {
            mimeType: file.mimetype,
            body: Readable.from(file.buffer),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, mimeType, size, modifiedTime, webViewLink, webContentLink',
        });

        console.log(`📤 [DRIVE] File uploaded: ${response.data.id}`);
        return response.data;
    } catch (error: any) {
        console.error('📤 [DRIVE] Upload error:', error.message);
        throw error;
    }
};

export const downloadFile = async (userId: string, fileId: string) => {
    console.log(`📥 [DRIVE] Downloading file: ${fileId}`);

    const drive = await getDriveClient(userId);

    try {
        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        return response.data;
    } catch (error: any) {
        console.error('📥 [DRIVE] Download error:', error.message);
        throw error;
    }
};

export const deleteFile = async (userId: string, fileId: string) => {
    console.log(`🗑️ [DRIVE] Deleting file: ${fileId}`);

    const drive = await getDriveClient(userId);

    try {
        await drive.files.delete({ fileId });
        console.log(`🗑️ [DRIVE] File deleted: ${fileId}`);
        return { success: true };
    } catch (error: any) {
        console.error('🗑️ [DRIVE] Delete error:', error.message);
        throw error;
    }
};

export const renameFile = async (userId: string, fileId: string, newName: string) => {
    console.log(`✏️ [DRIVE] Renaming file: ${fileId} to ${newName}`);

    const drive = await getDriveClient(userId);

    try {
        const response = await drive.files.update({
            fileId,
            requestBody: { name: newName },
            fields: 'id, name',
        });

        console.log(`✏️ [DRIVE] File renamed: ${response.data.id}`);
        return response.data;
    } catch (error: any) {
        console.error('✏️ [DRIVE] Rename error:', error.message);
        throw error;
    }
};

export const createFolder = async (userId: string, folderName: string, parentFolderId?: string) => {
    console.log(`📁 [DRIVE] Creating folder: ${folderName}`);

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!user.modules?.vault?.rootFolderId) {
        throw new Error('Vault module not properly configured');
    }

    const drive = await getDriveClient(userId);
    const sartthiVaultFolder = user.modules.vault.rootFolderId;
    const targetFolderId = parentFolderId || sartthiVaultFolder;

    try {
        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [targetFolderId],
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name',
        });

        console.log(`📁 [DRIVE] Folder created: ${response.data.id}`);
        return response.data;
    } catch (error: any) {
        console.error('📁 [DRIVE] Create folder error:', error.message);
        throw error;
    }
};

// Add permission to file
export const addPermission = async (userId: string, fileId: string, email: string, role: 'reader' | 'writer' = 'reader') => {
    console.log(`🔐 [DRIVE] Adding permission: ${role} for ${email} on file ${fileId}`);

    const drive = await getDriveClient(userId);

    try {
        const response = await drive.permissions.create({
            fileId,
            requestBody: {
                role,
                type: 'user',
                emailAddress: email
            },
            fields: 'id',
        });

        console.log(`🔐 [DRIVE] Permission added: ${response.data.id}`);
        return response.data;
    } catch (error: any) {
        console.error('🔐 [DRIVE] Add permission error:', error.message);
        // Don't throw if user already has permission or if email is invalid for Drive
        return null;
    }
};

// Helper functions
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
};
