import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { spotifyService, SpotifyPlaybackState } from '../../services/spotifyService';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Search, Heart, Clock, Music, Volume2, Mic2, ListMusic } from 'lucide-react';

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: any;
    }
}

const MusicPage: React.FC = () => {
    const { state } = useApp();
    const isSpotifyConnected = state.userProfile.connectedAccounts?.spotify?.activeAccountId;
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [savedTracks, setSavedTracks] = useState<any[]>([]);
    const [playback, setPlayback] = useState<SpotifyPlaybackState | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [volume, setVolume] = useState(50);
    const [showVolume, setShowVolume] = useState(false);
    const [player, setPlayer] = useState<any>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);

    useEffect(() => {
        if (isSpotifyConnected) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [isSpotifyConnected]);

    // Handle Search
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await spotifyService.search(searchQuery);
            setSearchResults(res.tracks?.items || []);
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    useEffect(() => {
        if (!isSpotifyConnected) {
            setLoading(false);
            return;
        }

        // Load SDK Script
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        // Initialize Player when SDK is ready
        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Sartthi Web Player',
                getOAuthToken: async (cb: any) => {
                    const token = await spotifyService.getToken();
                    cb(token);
                },
                volume: 0.5
            });

            player.addListener('ready', ({ device_id }: any) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
                // Auto-transfer playback to this device
                spotifyService.play({ transfer_device_id: device_id });
            });

            player.addListener('not_ready', ({ device_id }: any) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', (state: any) => {
                if (!state) return;
                setPlayback(state);
            });

            player.connect();
            setPlayer(player);
        };

        loadData();

        return () => {
            player?.disconnect();
        };
    }, [isSpotifyConnected]);

    const loadData = async () => {
        try {
            const [playlistsData, playbackData, tracksData] = await Promise.all([
                spotifyService.getPlaylists(),
                spotifyService.getPlaybackState(),
                spotifyService.getSavedTracks()
            ]);
            setPlaylists(playlistsData?.items || []);
            setPlayback(playbackData || null);
            setSavedTracks(tracksData?.items || []);
        } catch (error) {
            console.error('Failed to load music data', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isSpotifyConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <Music className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Connect Spotify</h2>
                <p className="text-gray-400 max-w-md mb-8">
                    Connect your Spotify account to listen to music, browse playlists, and control playback directly from Sartthi.
                </p>
                {/* Connection button would be handled in Settings, referring user there */}
                <a href="/settings" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors">
                    Go to Settings to Connect
                </a>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-8 pb-32">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Music Library</h1>
                    <p className="text-gray-400">Your playlists and saved tracks</p>
                </div>
                <form onSubmit={handleSearch} className="relative w-96">
                    <input
                        type="text"
                        placeholder="Search songs, artists, albums..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (!e.target.value) setSearchResults([]);
                        }}
                        className="w-full bg-[#282828] border-none rounded-full py-3 px-6 pl-12 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#1DB954] transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                </form>
            </header>

            {/* Search Results Overlay or Section */}
            {searchResults.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-xl font-bold mb-4">Search Results</h3>
                    <div className="space-y-2">
                        {searchResults.slice(0, 5).map((track: any) => (
                            <div
                                key={track.id}
                                onClick={() => spotifyService.play({ uris: [track.uri] })}
                                className="flex items-center gap-4 p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800 transition-colors cursor-pointer group"
                            >
                                <img src={track.album.images[2]?.url} className="w-12 h-12 rounded" alt={track.name} />
                                <div className="flex-1">
                                    <div className="font-bold group-hover:text-green-500 transition-colors">{track.name}</div>
                                    <div className="text-sm text-gray-400">{track.artists[0].name}</div>
                                </div>
                                <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                    <div className="h-px bg-gray-800 my-8" />
                </div>
            )}

            {/* Now Playing Hero */}
            {playback?.item && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 p-8 rounded-3xl bg-gradient-to-br from-green-900/40 to-black border border-white/10 flex items-end gap-8 relative overflow-hidden"
                >
                    {/* Background Blur */}
                    <div
                        className="absolute inset-0 opacity-30 blur-3xl z-0"
                        style={{
                            backgroundImage: `url(${playback.item.album.images[0]?.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />

                    <img
                        src={playback.item.album.images[0]?.url}
                        alt="Album Art"
                        className="w-64 h-64 rounded-2xl shadow-2xl z-10"
                    />

                    <div className="z-10 flex-1 mb-4">
                        <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Now Playing
                        </div>
                        <h2 className="text-5xl font-bold mb-4 line-clamp-2">{playback.item.name}</h2>
                        <div className="flex items-center gap-4 text-xl text-gray-300 mb-8">
                            <span>{playback.item.artists.map(a => a.name).join(', ')}</span>
                            <span>•</span>
                            <span>{playback.item.album.name}</span>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Controls */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => spotifyService.setShuffle(!playback.shuffle_state)}
                                    className={`p-2 rounded-full transition-colors ${playback.shuffle_state ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Shuffle className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => spotifyService.previous()}
                                    className="p-2 text-white hover:text-green-500 transition-colors"
                                >
                                    <SkipBack className="w-8 h-8 fill-current" />
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            if (playback.is_playing) await spotifyService.pause();
                                            else await spotifyService.play();
                                        } catch (error: any) {
                                            if (error?.response?.status === 403 || error?.message?.includes('Premium')) {
                                                window.open(playback.item?.external_urls?.spotify || 'https://open.spotify.com', '_blank');
                                            }
                                        }
                                    }}
                                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center transition-transform hover:scale-105"
                                >
                                    {playback.is_playing ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current pl-1" />}
                                </button>
                                <button
                                    onClick={() => spotifyService.next()}
                                    className="p-2 text-white hover:text-green-500 transition-colors"
                                >
                                    <SkipForward className="w-8 h-8 fill-current" />
                                </button>
                                <button
                                    onClick={() => spotifyService.setRepeat(playback.repeat_state === 'off' ? 'context' : 'off')}
                                    className={`p-2 rounded-full transition-colors ${playback.repeat_state !== 'off' ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Repeat className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="w-px h-12 bg-white/20 mx-2" />

                            {/* Actions & Volume */}
                            <div className="flex items-center gap-4">
                                <button onClick={() => spotifyService.toggleSaved(playback.item!.id, true)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                    <Heart className="w-6 h-6" />
                                </button>
                                <div className="relative group flex items-center gap-2" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
                                    <Volume2 className="w-6 h-6 text-gray-300 group-hover:text-white" />
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        defaultValue={playback.device.volume_percent}
                                        onChange={(e) => spotifyService.setVolume(Number(e.target.value))}
                                        className={`w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 transition-all duration-300 ${showVolume ? 'opacity-100 w-24' : 'opacity-0 w-0 overflow-hidden'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Playlists Grid */}
            <h3 className="text-xl font-bold mb-6">Your Playlists</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {playlists.map((playlist, i) => (
                    <motion.div
                        key={playlist.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group p-4 rounded-xl bg-gray-900/50 hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => spotifyService.play({ context_uri: playlist.uri })}
                    >
                        <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
                            <img src={playlist.images[0]?.url} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <Play className="w-6 h-6 text-black fill-current pl-1" />
                                </div>
                            </div>
                        </div>
                        <h4 className="font-bold truncate mb-1">{playlist.name}</h4>
                        <p className="text-sm text-gray-400 line-clamp-2">{playlist.description || `By ${playlist.owner.display_name}`}</p>
                    </motion.div>
                ))}
            </div>

            {/* Liked Songs */}
            <h3 className="text-xl font-bold mb-6 mt-8">Liked Songs</h3>
            <div className="space-y-2">
                {savedTracks.map((item: any) => (
                    <div
                        key={item.track.id}
                        onClick={() => spotifyService.play({ uris: [item.track.uri] })}
                        className="flex items-center gap-4 p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800 transition-colors cursor-pointer group"
                    >
                        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <img src={item.track.album.images[2]?.url} alt={item.track.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="w-6 h-6 text-white fill-current" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold truncate group-hover:text-green-500 transition-colors">{item.track.name}</h4>
                            <p className="text-sm text-gray-400 truncate">{item.track.artists.map((a: any) => a.name).join(', ')}</p>
                        </div>
                        <div className="text-sm text-gray-500 font-mono hidden md:block">
                            {Math.floor(item.track.duration_ms / 60000)}:{((item.track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                spotifyService.toggleSaved(item.track.id, false);
                                setSavedTracks(prev => prev.filter(t => t.track.id !== item.track.id));
                            }}
                            className="p-2 text-green-500 hover:text-white transition-colors"
                        >
                            <Heart className="w-5 h-5 fill-current" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MusicPage;
