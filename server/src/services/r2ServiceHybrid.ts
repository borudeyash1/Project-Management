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

        // In production, use relative URL (browser will use current domain)
        // In development, use absolute localhost URL
        let publicUrl: string;
        if (process.env.NODE_ENV === 'production') {
            publicUrl = `/uploads/releases/${path.basename(key)}`;
        } else {
            const baseUrl = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:5000';
            publicUrl = `${baseUrl}/uploads/releases/${path.basename(key)}`;
        }

        console.log('✅ [LOCAL] File stored:', publicUrl);
        return publicUrl;
    }
};

/**
 * Delete file - removes from local storage or R2
 */
export const deleteFromR2 = async (key: string): Promise<void> => {
    // ALWAYS try to delete local file first to prevent pile-up
    // This ensures that even if it's an R2 file but we have a local copy (e.g. from failed cleanup), it gets removed
    const localPath = path.join(LOCAL_STORAGE_PATH, path.basename(key));
    if (fs.existsSync(localPath)) {
        try {
            console.log('🗑️ [LOCAL] Deleting local file:', key);
            fs.unlinkSync(localPath);
            console.log('✅ [LOCAL] File deleted');
        } catch (err) {
            console.warn('⚠️ [LOCAL] Failed to delete local file:', err);
        }
    }

    // Then try R2 (unless we know for sure it was ONLY local, but trying R2 doesn't hurt)
    try {
        await deleteFromR2SDK(key);
    } catch (error) {
        // If it wasn't on R2, that's fine.
        console.warn('ℹ️ [HYBRID] R2 deletion skipped or failed (might be local-only):', error);
    }
};

/**
 * Extract key from URL
 */
export const extractR2Key = (url: string): string => {
    if (url.startsWith('/uploads/') || url.includes('/uploads/releases/')) {
        // Extract filename from local URL
        const match = url.match(/\/uploads\/releases\/(.+)$/);
        return (match && match[1]) ? match[1] : url.replace('/uploads/releases/', '');
    }
    return extractR2KeySDK(url);
};
