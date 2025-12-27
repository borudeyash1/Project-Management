import { apiService } from './api';

export interface SpotifyPlaybackState {
    device: {
        id: string;
        is_active: boolean;
        is_private_session: boolean;
        is_restricted: boolean;
        name: string;
        type: string;
        volume_percent: number;
    };
    shuffle_state: boolean;
    repeat_state: 'off' | 'track' | 'context';
    timestamp: number;
    context: {
        external_urls: { spotify: string };
        href: string;
        type: string;
        uri: string;
    } | null;
    progress_ms: number;
    item: {
        album: {
            images: { height: number; url: string; width: number }[];
            name: string;
            uri: string;
        };
        artists: { name: string; uri: string }[];
        duration_ms: number;
        explicit: boolean;
        external_ids: { isrc: string };
        external_urls: { spotify: string };
        href: string;
        id: string;
        is_local: boolean;
        name: string;
        popularity: number;
        preview_url: string;
        uri: string;
    } | null;
    currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
    is_playing: boolean;
}

export const spotifyService = {
    // Playback
    getToken: async () => {
        const res = await apiService.get<{ token: string }>('/media/spotify/token');
        return res.data?.token || '';
    },
    getPlaybackState: async () => {
        const res = await apiService.get<SpotifyPlaybackState>('/media/spotify/player');
        return res.data;
    },
    play: async (data?: { context_uri?: string; uris?: string[]; offset?: any; position_ms?: number; transfer_device_id?: string }) => {
        if (data?.transfer_device_id) {
            await apiService.put('/media/spotify/player', { device_ids: [data.transfer_device_id], play: true }); // Transfer endpoints are different
        } else {
            const res = await apiService.put('/media/spotify/player/play', data || {});
            return res.data;
        }
    },
    pause: async () => {
        const res = await apiService.put('/media/spotify/player/pause', {});
        return res.data;
    },
    next: async () => {
        const res = await apiService.post('/media/spotify/player/next', {});
        return res.data;
    },
    previous: async () => {
        const res = await apiService.post('/media/spotify/player/previous', {});
        return res.data;
    },
    seek: async (position_ms: number) => {
        const res = await apiService.put('/media/spotify/player/seek', { position_ms });
        return res.data;
    },
    setVolume: async (volume_percent: number) => {
        const res = await apiService.put('/media/spotify/player/volume', { volume_percent });
        return res.data;
    },
    setShuffle: async (state: boolean) => {
        const res = await apiService.put('/media/spotify/player/shuffle', { state });
        return res.data;
    },
    setRepeat: async (state: 'track' | 'context' | 'off') => {
        const res = await apiService.put('/media/spotify/player/repeat', { state });
        return res.data;
    },

    // Library
    getPlaylists: async () => {
        const res = await apiService.get<any>('/media/spotify/playlists');
        return res.data;
    },
    getPlaylistTracks: async (playlistId: string) => {
        const res = await apiService.get<any>(`/media/spotify/playlists/${playlistId}/tracks`);
        return res.data;
    },
    search: async (q: string, type: string = 'track,artist,album') => {
        const res = await apiService.get<any>(`/media/spotify/search?q=${encodeURIComponent(q)}&type=${type}`);
        return res.data;
    },

    // Saved Tracks
    getSavedTracks: async () => {
        const res = await apiService.get<any>('/media/spotify/tracks');
        return res.data;
    },
    checkSaved: async (ids: string) => {
        const res = await apiService.get<boolean[]>(`/media/spotify/tracks/contains?ids=${ids}`);
        return res.data || [];
    },
    toggleSaved: async (id: string, saved: boolean) => {
        const res = await apiService.put('/media/spotify/tracks/toggle', { id, saved });
        return res.data;
    }
};
