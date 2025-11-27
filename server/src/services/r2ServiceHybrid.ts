import path from 'path';
import fs from 'fs';
import { uploadToR2 as uploadToR2SDK, deleteFromR2 as deleteFromR2SDK, extractR2Key as extractR2KeySDK } from './r2ServiceSDK';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

// Ensure uploads root exists
if (!fs.existsSync(UPLOADS_ROOT)) {
    fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
}

/**
 * Get local storage path for a specific subfolder
 */
const getLocalPath = (subfolder: string = 'releases'): string => {
    const dir = path.join(UPLOADS_ROOT, subfolder);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

/**
 * Upload file - tries R2 first, falls back to local storage on error
 */
export const uploadToR2 = async (
    fileBuffer: Buffer,
    key: string,
    contentType: string,
    subfolder: string = 'releases'
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
        const localStoragePath = getLocalPath(subfolder);
        console.log(`📁 [LOCAL] Storing file locally in ${subfolder}:`, key);

        const fileName = path.basename(key);
        const localPath = path.join(localStoragePath, fileName);
        fs.writeFileSync(localPath, fileBuffer);

        // Always use relative URL for local uploads
        // The client is responsible for prepending the API base URL if needed
        const publicUrl = `/uploads/${subfolder}/${fileName}`;

        console.log('✅ [LOCAL] File stored:', publicUrl);
        return publicUrl;
    }
};

/**
 * Delete file - removes from local storage or R2
 */
export const deleteFromR2 = async (key: string, subfolder: string = 'releases'): Promise<void> => {
    // ALWAYS try to delete local file first to prevent pile-up
    const localStoragePath = getLocalPath(subfolder);
    const localPath = path.join(localStoragePath, path.basename(key));

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
    if (url.startsWith('/uploads/') || url.includes('/uploads/')) {
        // Extract filename from local URL
        // Matches /uploads/anything/filename.ext
        const match = url.match(/\/uploads\/[^\/]+\/(.+)$/);
        return (match && match[1]) ? match[1] : path.basename(url);
    }
    return extractR2KeySDK(url);
};
