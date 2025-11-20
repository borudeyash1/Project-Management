import path from 'path';
import fs from 'fs';
import { uploadToR2 as uploadToR2SDK, deleteFromR2 as deleteFromR2SDK, extractR2Key as extractR2KeySDK } from './r2ServiceSDK';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const LOCAL_STORAGE_PATH = path.join(__dirname, '../../uploads/releases');

// Ensure local storage directory exists
if (!fs.existsSync(LOCAL_STORAGE_PATH)) {
    fs.mkdirSync(LOCAL_STORAGE_PATH, { recursive: true });
}

/**
 * Upload file - tries R2 first, falls back to local storage on error
 */
export const uploadToR2 = async (
    fileBuffer: Buffer,
    key: string,
    contentType: string
): Promise<string> => {
    // Try R2 first (even in development)
    try {
        console.log('🔄 [HYBRID] Attempting R2 upload...');
        const url = await uploadToR2SDK(fileBuffer, key, contentType);
        console.log('✅ [HYBRID] R2 upload successful!');
        return url;
    } catch (error: any) {
        console.warn('⚠️ [HYBRID] R2 upload failed, falling back to local storage');
        console.warn('Error:', error.message);

        // Fallback to local storage
        console.log('📁 [LOCAL] Storing file locally:', key);
        const localPath = path.join(LOCAL_STORAGE_PATH, path.basename(key));
        fs.writeFileSync(localPath, fileBuffer);
        const publicUrl = `/uploads/releases/${path.basename(key)}`;
        console.log('✅ [LOCAL] File stored:', publicUrl);
        return publicUrl;
    }
};

/**
 * Delete file - removes from local storage or R2
 */
export const deleteFromR2 = async (key: string): Promise<void> => {
    // Try local first
    const localPath = path.join(LOCAL_STORAGE_PATH, path.basename(key));
    if (fs.existsSync(localPath)) {
        console.log('🗑️ [LOCAL] Deleting local file:', key);
        fs.unlinkSync(localPath);
        console.log('✅ [LOCAL] File deleted');
        return;
    }

    // Otherwise try R2
    try {
        await deleteFromR2SDK(key);
    } catch (error) {
        console.warn('Failed to delete from R2:', error);
    }
};

/**
 * Extract key from URL
 */
export const extractR2Key = (url: string): string => {
    if (url.startsWith('/uploads/')) {
        return url.replace('/uploads/releases/', '');
    }
    return extractR2KeySDK(url);
};
