import { Request, Response } from 'express';
import ytsr from 'ytsr';

export const searchVideo = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        if (!query) {
            res.status(400).json({ message: 'Query is required' });
            return;
        }

        const filters1 = await ytsr.getFilters(query as string);
        const filter1 = filters1.get('Type')?.get('Video');

        if (!filter1?.url) {
            // Fallback if no video filter found
            const searchResults = await ytsr(query as string, { limit: 1 });
            const item = searchResults.items[0];
            res.json(item || null);
            return;
        }

        const searchResults = await ytsr(filter1.url, { limit: 1 });
        const item = searchResults.items[0];

        res.json(item || null);
    } catch (error: any) {
        console.error('YouTube search error:', error.message);
        res.status(500).json({ message: 'Failed to search video' });
    }
};
