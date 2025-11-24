import { google } from 'googleapis';
import User from '../models/User';

export async function getDriveClient(userId: string) {
    const user = await User.findById(userId);

    if (!user || !user.modules?.vault?.refreshToken) {
        throw new Error('Vault not connected');
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.BACKEND_URL}/api/auth/sartthi/connect-vault/callback`
    );

    oauth2Client.setCredentials({
        refresh_token: user.modules.vault.refreshToken
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * List assets (files and folders) in a specific folder
 */
export async function listAssets(userId: string, folderId?: string) {
    try {
        console.log('📁 [VAULT] Listing assets for user:', userId, 'folder:', folderId);

        const drive = await getDriveClient(userId);
        const user = await User.findById(userId);

        // Use root folder if no folderId provided
        const targetFolder = folderId || user?.modules?.vault?.rootFolderId;

        if (!targetFolder) {
            throw new Error('No target folder specified');
        }

        const response = await drive.files.list({
            q: `'${targetFolder}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, size, createdTime, modifiedTime, iconLink)',
            orderBy: 'folder,name',
            pageSize: 100
        });

        const files = response.data.files || [];

        // Map to our abstraction
        const assets = files.map(file => ({
            id: file.id,
            name: file.name,
            type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
            mimeType: file.mimeType,
            thumbnailLink: file.thumbnailLink,
            webViewLink: file.webViewLink,
            iconLink: file.iconLink,
            size: file.size ? parseInt(file.size) : 0,
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime
        }));

        console.log('📁 [VAULT] Found', assets.length, 'assets');
        return assets;
    } catch (error: any) {
        console.error('📁 [VAULT] List error:', error.message);
        throw error;
    }
}

/**
 * Create a new folder
 */
export async function createFolder(userId: string, name: string, parentId?: string) {
    try {
        const drive = await getDriveClient(userId);
        const user = await User.findById(userId);

        const targetParent = parentId || user?.modules?.vault?.rootFolderId;

        if (!targetParent) {
            throw new Error('No parent folder specified');
        }

        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [targetParent]
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name, mimeType, webViewLink'
        });

        console.log('📁 [VAULT] Folder created:', response.data.id);
        return response.data;
    } catch (error: any) {
        console.error('📁 [VAULT] Create folder error:', error.message);
        throw error;
    }
}

/**
 * Create the root "Sartthi Vault" folder
 */
export async function createRootVaultFolder(userId: string) {
    try {
        const drive = await getDriveClient(userId);

        // Check if folder already exists
        const existingFolders = await drive.files.list({
            q: "name = 'Sartthi Vault' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        if (existingFolders.data.files && existingFolders.data.files.length > 0 && existingFolders.data.files[0]?.id) {
            console.log('📁 [VAULT] Root folder already exists:', existingFolders.data.files[0].id);
            return existingFolders.data.files[0].id;
        }

        // Create new root folder
        const fileMetadata = {
            name: 'Sartthi Vault',
            mimeType: 'application/vnd.google-apps.folder'
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id'
        });

        console.log('📁 [VAULT] Root folder created:', response.data.id);
        return response.data.id!;
    } catch (error: any) {
        console.error('📁 [VAULT] Create root folder error:', error.message);
        throw error;
    }
}

/**
 * Delete a file or folder
 */
export async function deleteAsset(userId: string, fileId: string) {
    try {
        const drive = await getDriveClient(userId);

        await drive.files.delete({
            fileId: fileId
        });

        console.log('📁 [VAULT] Asset deleted:', fileId);
    } catch (error: any) {
        console.error('📁 [VAULT] Delete error:', error.message);
        throw error;
    }
}

/**
 * Rename a file or folder
 */
export async function renameAsset(userId: string, fileId: string, newName: string) {
    try {
        const drive = await getDriveClient(userId);

        const response = await drive.files.update({
            fileId: fileId,
            requestBody: {
                name: newName
            },
            fields: 'id, name'
        });

        console.log('📁 [VAULT] Asset renamed:', fileId);
        return response.data;
    } catch (error: any) {
        console.error('📁 [VAULT] Rename error:', error.message);
        throw error;
    }
}

/**
 * Get file/folder details
 */
export async function getAssetDetails(userId: string, fileId: string) {
    try {
        const drive = await getDriveClient(userId);

        const response = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, mimeType, thumbnailLink, webViewLink, size, createdTime, modifiedTime, iconLink, owners, parents'
        });

        console.log('📁 [VAULT] Asset details retrieved:', fileId);
        return response.data;
    } catch (error: any) {
        console.error('📁 [VAULT] Get details error:', error.message);
        throw error;
    }
}
