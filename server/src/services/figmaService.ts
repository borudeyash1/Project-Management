import axios from 'axios';
import FigmaFile from '../models/FigmaFile';

interface FigmaFileResponse {
    name: string;
    thumbnailUrl: string;
    document: {
        children: any[];
    };
}

export class FigmaService {
    private baseUrl = 'https://api.figma.com/v1';

    /**
     * Get Figma file details
     */
    async getFile(fileId: string, token: string): Promise<FigmaFileResponse> {
        try {
            const response = await axios.get(`${this.baseUrl}/files/${fileId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            const status = error.response?.status;
            const errorData = error.response?.data;

            console.error('Figma getFile error:', { status, err: errorData?.err || errorData?.message || error.message });

            // Provide specific error messages
            if (status === 429) {
                throw new Error('Figma API rate limit exceeded. Please wait a few minutes before trying again.');
            } else if (status === 403) {
                throw new Error('Invalid Figma token or insufficient permissions.');
            } else if (status === 404) {
                throw new Error('Figma file not found. Please check the file URL.');
            } else {
                throw new Error('Failed to fetch Figma file');
            }
        }
    }

    /**
     * Get file images/thumbnails
     */
    async getFileImages(fileId: string, frameIds: string[], token: string): Promise<{ [key: string]: string }> {
        try {
            const response = await axios.get(`${this.baseUrl}/images/${fileId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: {
                    ids: frameIds.join(','),
                    format: 'png',
                    scale: 2
                }
            });
            return response.data.images;
        } catch (error: any) {
            console.error('Figma getFileImages error:', error.response?.data || error.message);
            throw new Error('Failed to fetch Figma images');
        }
    }

    /**
     * Get file comments
     */
    async getComments(fileId: string, token: string): Promise<any[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/files/${fileId}/comments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.comments;
        } catch (error: any) {
            console.error('Figma getComments error:', error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Post comment to Figma
     */
    async postComment(fileId: string, message: string, token: string): Promise<any> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/files/${fileId}/comments`,
                { message },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            console.error('Figma postComment error:', error.response?.data || error.message);
            throw new Error('Failed to post comment');
        }
    }

    /**
     * Extract frames from Figma file
     */
    extractFrames(fileData: any): any[] {
        const frames: any[] = [];

        const traverse = (node: any) => {
            if (node.type === 'FRAME' || node.type === 'COMPONENT') {
                frames.push({
                    id: node.id,
                    name: node.name,
                    type: node.type
                });
            }
            if (node.children) {
                node.children.forEach(traverse);
            }
        };

        if (fileData.document?.children) {
            fileData.document.children.forEach(traverse);
        }

        return frames;
    }

    /**
     * Sync Figma file to database
     */
    async syncFileToDatabase(
        fileId: string,
        workspaceId: string,
        userId: string,
        token: string,
        options?: {
            projectId?: string;
            clientId?: string;
            category?: 'brand' | 'project' | 'template';
            visibility?: 'workspace' | 'client' | 'private';
        }
    ): Promise<any> {
        try {
            console.log('[FIGMA SYNC] Starting sync for file:', fileId);

            // Fetch file from Figma
            const fileData = await this.getFile(fileId, token);
            console.log('[FIGMA SYNC] File data received:', fileData.name);

            // Extract frames
            const frames = this.extractFrames(fileData);
            console.log('[FIGMA SYNC] Frames extracted:', frames.length);

            // Get thumbnails for frames (limit to first 10 to avoid rate limits)
            const frameIds = frames.slice(0, 10).map(f => f.id);
            let thumbnails: { [key: string]: string } = {};

            if (frameIds.length > 0) {
                try {
                    thumbnails = await this.getFileImages(fileId, frameIds, token);
                    console.log('[FIGMA SYNC] Thumbnails fetched:', Object.keys(thumbnails).length);
                } catch (error) {
                    console.error('[FIGMA SYNC] Failed to fetch thumbnails:', error);
                }
            }

            // Get file thumbnail URL (use first frame thumbnail or generate URL)
            const fileThumbnail = Object.values(thumbnails)[0] ||
                `https://www.figma.com/file/${fileId}/thumbnail`;

            // Create or update in database
            const figmaFile = await FigmaFile.findOneAndUpdate(
                { fileId },
                {
                    workspaceId,
                    projectId: options?.projectId,
                    clientId: options?.clientId,
                    fileId,
                    fileName: fileData.name,
                    fileUrl: `https://www.figma.com/file/${fileId}`,
                    thumbnail: fileThumbnail,
                    frames: frames.map(frame => ({
                        frameId: frame.id,
                        frameName: frame.name,
                        thumbnail: thumbnails[frame.id] || '',
                        comments: [],
                        approvals: []
                    })),
                    category: options?.category || 'project',
                    visibility: options?.visibility || 'workspace',
                    status: 'draft',
                    createdBy: userId,
                    lastSyncedAt: new Date()
                },
                { upsert: true, new: true }
            );

            console.log('[FIGMA SYNC] File synced successfully:', figmaFile._id);
            return figmaFile;
        } catch (error: any) {
            console.error('[FIGMA SYNC] Sync error:', error);
            throw error;
        }
    }
}

export default new FigmaService();
