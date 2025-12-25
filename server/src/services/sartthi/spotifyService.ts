import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export const getSpotifyService = () => {

    const getAccessToken = async (userId: string, accountId?: string) => {
        let query: any = { userId, service: 'spotify' };
        if (accountId) query._id = accountId;
        else query.isActive = true;

        const account = await ConnectedAccount.findOne(query);
        if (!account || !account.accessToken) throw new Error('Spotify account not connected');
        return account.accessToken;
    };

    const getMe = async (userId: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.get(`${SPOTIFY_API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Spotify getMe error:', error.response?.data || error.message);
            throw error;
        }
    };

    // Future: Search tracks, control playback
    const searchTracks = async (userId: string, query: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.get(`${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.tracks.items.map((t: any) => ({
                id: t.id,
                name: t.name,
                artist: t.artists[0]?.name,
                preview: t.preview_url,
                url: t.external_urls.spotify,
                image: t.album.images[2]?.url
            }));
        } catch (error: any) {
            console.error('Spotify searchTracks error:', error.response?.data || error.message);
            throw error;
        }
    }

    return { getMe, searchTracks };
};
