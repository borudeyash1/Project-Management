import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const ENDPOINT = process.env.R2_ENDPOINT || '';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: ENDPOINT,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});

/**
 * Upload a file to Cloudflare R2 using AWS SDK
 */
export const uploadToR2 = async (
    fileBuffer: Buffer,
    key: string,
    contentType: string
): Promise<string> => {
    try {
        console.log('📤 [R2-SDK] Uploading file:', key);
        console.log('📍 [R2-SDK] Endpoint:', ENDPOINT);
        console.log('📍 [R2-SDK] Bucket:', BUCKET_NAME);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await s3Client.send(command);

        const publicUrl = `${PUBLIC_URL}/${key}`;
        console.log('✅ [R2-SDK] File uploaded successfully:', publicUrl);

        return publicUrl;
    } catch (error: any) {
        console.error('❌ [R2-SDK] Upload failed:', error);
        throw new Error(`Failed to upload file to R2: ${error.message}`);
    }
};

/**
 * Delete a file from Cloudflare R2 using AWS SDK
 */
export const deleteFromR2 = async (key: string): Promise<void> => {
    try {
        console.log('🗑️ [R2-SDK] Deleting file:', key);

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
        console.log('✅ [R2-SDK] File deleted successfully');
    } catch (error: any) {
        console.error('❌ [R2-SDK] Delete failed:', error);
        throw new Error(`Failed to delete file from R2: ${error.message}`);
    }
};

/**
 * Get public URL for a file in R2
 */
export const getR2PublicUrl = (key: string): string => {
    return `${PUBLIC_URL}/${key}`;
};

/**
 * Extract R2 key from public URL
 */
export const extractR2Key = (url: string): string => {
    if (url.startsWith(PUBLIC_URL)) {
        return url.replace(`${PUBLIC_URL}/`, '');
    }

    const match = url.match(/\/download\/(.+)$/);
    return match ? `releases/${match[1]}` : url;
};
