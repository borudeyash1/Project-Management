import { Request, Response } from 'express';
import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';
import User from '../../models/User';

// Helper to get fresh token
// Helper to get fresh token
const getSpotifyToken = async (userId: string): Promise<string | null> => {
    const account = await ConnectedAccount.findOne({
        userId,
        service: 'spotify',
        isActive: true
    });

    if (!account) return null;

    // Check if expired
    if (account.expiresAt && new Date() > account.expiresAt) {
        if (!account.refreshToken) {
            console.error('No refresh token found for Spotify');
            return null;
        }

        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', account.refreshToken);
            params.append('client_id', process.env.SPOTIFY_CLIENT_ID || '');
            params.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET || '');

            const response = await axios.post('https://accounts.spotify.com/api/token', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token, expires_in } = response.data;
            account.accessToken = access_token;
            account.expiresAt = new Date(Date.now() + expires_in * 1000);
            await account.save();
            return access_token;
        } catch (error) {
            console.error('Spotify token refresh failed:', error);
            return null;
        }
    }

    return account.accessToken;
};

// Helper for error handling
const handleSpotifyError = (res: Response, error: any, action: string) => {
    if (error.response) {
        const status = error.response.status;
        // Don't log 403 Premium errors to console to avoid noise
        if (status !== 403) {
            console.error(`${action} Spotify error:`, error.response.data || error.message);
        }
        res.status(status).json(error.response.data?.error || { message: 'Spotify API Error' });
    } else {
        console.error(`${action} error:`, error.message);
        res.status(500).json({ message: `Failed to ${action}` });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json(response.data);
    } catch (error: any) {
        handleSpotifyError(res, error, 'getProfile');
    }
};

export const getAccessToken = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }
        res.json({ token });
    } catch (error: any) {
        console.error('Get token error:', error.message);
        res.status(500).json({ message: 'Failed to get token' });
    }
};

export const transferPlayback = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { device_ids, play } = req.body;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        await axios.put('https://api.spotify.com/v1/me/player', { device_ids, play }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json({ success: true });
    } catch (error: any) {
        handleSpotifyError(res, error, 'transferPlayback');
    }
};

export const getPlaybackState = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        const response = await axios.get('https://api.spotify.com/v1/me/player', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 204) {
            res.json({ is_playing: false, item: null });
            return;
        }

        res.json(response.data);
    } catch (error: any) {
        handleSpotifyError(res, error, 'getPlaybackState');
    }
};

export const play = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        const { uris, context_uri, offset, position_ms } = req.body;
        const body: any = {};
        if (context_uri) body.context_uri = context_uri;
        if (uris) body.uris = uris;
        if (offset) body.offset = offset;
        if (position_ms) body.position_ms = position_ms;

        await axios.put('https://api.spotify.com/v1/me/player/play', body, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json({ success: true });
    } catch (error: any) {
        handleSpotifyError(res, error, 'play');
    }
};

export const pause = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        await axios.put('https://api.spotify.com/v1/me/player/pause', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json({ success: true });
    } catch (error: any) {
        handleSpotifyError(res, error, 'pause');
    }
};

export const next = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        await axios.post('https://api.spotify.com/v1/me/player/next', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json({ success: true });
    } catch (error: any) {
        handleSpotifyError(res, error, 'next');
    }
};

export const previous = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        await axios.post('https://api.spotify.com/v1/me/player/previous', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json({ success: true });
    } catch (error: any) {
        handleSpotifyError(res, error, 'previous');
    }
};

export const seek = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { position_ms } = req.body;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        await axios.put(`https://api.spotify.com/v1/me/player/seek?position_ms=${position_ms}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json({ success: true });
    } catch (error: any) {
        handleSpotifyError(res, error, 'seek');
    }
};

export const setVolume = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { volume_percent } = req.body;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        await axios.put(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume_percent}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json({ success: true });
    } catch (error: any) {
        handleSpotifyError(res, error, 'setVolume');
    }
};

export const setShuffle = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { state } = req.body;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        await axios.put(`https://api.spotify.com/v1/me/player/shuffle?state=${state}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json({ success: true });
    } catch (error: any) {
        handleSpotifyError(res, error, 'setShuffle');
    }
};

export const setRepeat = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { state } = req.body;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        await axios.put(`https://api.spotify.com/v1/me/player/repeat?state=${state}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json({ success: true });
    } catch (error: any) {
        handleSpotifyError(res, error, 'setRepeat');
    }
};

// --- Library & Search ---

export const getPlaylists = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        const response = await axios.get('https://api.spotify.com/v1/me/playlists?limit=50', {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Get playlists error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to get playlists' });
    }
};

export const getPlaylistTracks = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { playlistId } = req.params;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Get playlist tracks error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to get playlist tracks' });
    }
};

export const search = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { q, type } = req.query;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(String(q))}&type=${type || 'track,artist,album'}&limit=20`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Search error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to search' });
    }
};

export const checkSaved = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { ids } = req.query; // comma separated
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        const response = await axios.get(`https://api.spotify.com/v1/me/tracks/contains?ids=${ids}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Check saved error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to check saved' });
    }
};

export const toggleSaved = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { id, saved } = req.body; // saved = boolean (true to add, false to remove)
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        if (saved) {
            await axios.put(`https://api.spotify.com/v1/me/tracks?ids=${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } else {
            await axios.delete(`https://api.spotify.com/v1/me/tracks?ids=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to toggle saved' });
    }
};

export const getSavedTracks = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        const response = await axios.get('https://api.spotify.com/v1/me/tracks?limit=50', {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Get saved tracks error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to get saved tracks' });
    }
};

export const getDevices = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const token = await getSpotifyToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Spotify not connected' });
            return;
        }

        const response = await axios.get('https://api.spotify.com/v1/me/player/devices', {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Get devices error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to get devices' });
    }
};
