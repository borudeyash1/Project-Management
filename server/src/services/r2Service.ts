import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Initialize R2 client
const r2Client = new S3Client({
    region: 'us-east-1', // Cloudflare R2 doesn't use regions, but SDK requires one
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true, // Required for R2
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

/**
 * Upload a file to Cloudflare R2
 * @param fileBuffer - File buffer to upload
 * @param key - Object key (path) in R2 bucket
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export const uploadToR2 = async (
    fileBuffer: Buffer,
    key: string,
    contentType: string
): Promise<string> => {
    try {
        console.log('📤 [R2] Uploading file:', key);

        const upload = new Upload({
            client: r2Client,
            params: {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
            },
        });

        await upload.done();

        const publicUrl = `${PUBLIC_URL}/${key}`;
        console.log('✅ [R2] File uploaded successfully:', publicUrl);

        return publicUrl;
    } catch (error: any) {
        console.error('❌ [R2] Upload failed:', error);
        throw new Error(`Failed to upload file to R2: ${error.message}`);
    }
};

/**
 * Delete a file from Cloudflare R2
 * @param key - Object key (path) in R2 bucket
 */
export const deleteFromR2 = async (key: string): Promise<void> => {
    try {
        console.log('🗑️ [R2] Deleting file:', key);

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);

        console.log('✅ [R2] File deleted successfully');
    } catch (error: any) {
        console.error('❌ [R2] Delete failed:', error);
        throw new Error(`Failed to delete file from R2: ${error.message}`);
    }
};

/**
 * Get public URL for a file in R2
 * @param key - Object key (path) in R2 bucket
 * @returns Public URL of the file
 */
export const getR2PublicUrl = (key: string): string => {
    return `${PUBLIC_URL}/${key}`;
};

/**
 * Extract R2 key from public URL
 * @param url - Public URL or download URL
 * @returns R2 object key
 */
export const extractR2Key = (url: string): string => {
    // Handle both public URLs and old-style download URLs
    if (url.startsWith(PUBLIC_URL)) {
        return url.replace(`${PUBLIC_URL}/`, '');
    }

    // Handle old-style /api/releases/download/filename URLs
    const match = url.match(/\/download\/(.+)$/);
    return match ? `releases/${match[1]}` : url;
};
