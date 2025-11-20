import https from 'https';
import crypto from 'crypto';
import { URL } from 'url';

const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const ENDPOINT = process.env.R2_ENDPOINT || '';

// Custom HTTPS agent with enhanced SSL/TLS settings for Node.js 22 compatibility
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    maxSockets: 50,
    // Add TLS 1.2 and 1.3 support
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
    // Enable legacy SSL support
    secureOptions: 0,
    // Increase timeout
    timeout: 60000,
});

/**
 * Generate AWS Signature V4
 */
function generateSignature(
    method: string,
    path: string,
    headers: Record<string, string>,
    payload: Buffer | string
): string {
    const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = date.slice(0, 8);
    const region = 'auto';
    const service = 's3';

    // Create canonical request
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    const canonicalHeaders = Object.keys(headers)
        .sort()
        .map(key => `${key.toLowerCase()}:${(headers[key] || '').trim()}\n`)
        .join('');
    const signedHeaders = Object.keys(headers).sort().map(k => k.toLowerCase()).join(';');

    const canonicalRequest = [
        method,
        path,
        '', // query string
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    const stringToSign = [algorithm, date, credentialScope, canonicalRequestHash].join('\n');

    // Calculate signature
    const kDate = crypto.createHmac('sha256', `AWS4${SECRET_ACCESS_KEY}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    return `${algorithm} Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

/**
 * Upload a file to Cloudflare R2 using raw HTTPS
 */
export const uploadToR2 = async (
    fileBuffer: Buffer,
    key: string,
    contentType: string
): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            console.log('📤 [R2] Uploading file:', key);
            console.log('📍 [R2] Endpoint:', ENDPOINT);
            console.log('📍 [R2] Bucket:', BUCKET_NAME);

            const url = new URL(ENDPOINT);
            const path = `/${BUCKET_NAME}/${key}`;
            const date = new Date().toUTCString();

            const headers: Record<string, string> = {
                'Host': url.hostname,
                'Date': date,
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length.toString(),
                'x-amz-content-sha256': crypto.createHash('sha256').update(fileBuffer).digest('hex'),
            };

            const authorization = generateSignature('PUT', path, headers, fileBuffer);
            headers['Authorization'] = authorization;

            const options: https.RequestOptions = {
                hostname: url.hostname,
                port: 443,
                path: path,
                method: 'PUT',
                headers: headers,
                agent: httpsAgent,
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode === 200 || res.statusCode === 204) {
                        const publicUrl = `${PUBLIC_URL}/${key}`;
                        console.log('✅ [R2] File uploaded successfully:', publicUrl);
                        resolve(publicUrl);
                    } else {
                        console.error('❌ [R2] Upload failed with status:', res.statusCode);
                        console.error('❌ [R2] Response:', data);
                        reject(new Error(`Upload failed with status ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                console.error('❌ [R2] Request error:', error);
                reject(new Error(`Failed to upload file to R2: ${error.message}`));
            });

            req.write(fileBuffer);
            req.end();
        } catch (error: any) {
            console.error('❌ [R2] Upload failed:', error);
            reject(new Error(`Failed to upload file to R2: ${error.message}`));
        }
    });
};

/**
 * Delete a file from Cloudflare R2
 */
export const deleteFromR2 = async (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            console.log('🗑️ [R2] Deleting file:', key);

            const url = new URL(ENDPOINT);
            const path = `/${BUCKET_NAME}/${key}`;
            const date = new Date().toUTCString();

            const headers: Record<string, string> = {
                'Host': url.hostname,
                'Date': date,
                'x-amz-content-sha256': crypto.createHash('sha256').update('').digest('hex'),
            };

            const authorization = generateSignature('DELETE', path, headers, '');
            headers['Authorization'] = authorization;

            const options: https.RequestOptions = {
                hostname: url.hostname,
                port: 443,
                path: path,
                method: 'DELETE',
                headers: headers,
                agent: httpsAgent,
            };

            const req = https.request(options, (res) => {
                if (res.statusCode === 204 || res.statusCode === 200) {
                    console.log('✅ [R2] File deleted successfully');
                    resolve();
                } else {
                    reject(new Error(`Delete failed with status ${res.statusCode}`));
                }
            });

            req.on('error', (error) => {
                console.error('❌ [R2] Delete failed:', error);
                reject(new Error(`Failed to delete file from R2: ${error.message}`));
            });

            req.end();
        } catch (error: any) {
            console.error('❌ [R2] Delete failed:', error);
            reject(new Error(`Failed to delete file from R2: ${error.message}`));
        }
    });
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
