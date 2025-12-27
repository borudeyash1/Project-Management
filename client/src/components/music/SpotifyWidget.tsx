import React, { useState, useEffect, useRef } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
    Volume2, VolumeX, Maximize2, Minimize2, Music2, Heart,
    ListMusic, X, GripHorizontal, Search, Disc
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { spotifyService, SpotifyPlaybackState } from '../../services/spotifyService';
import YouTubePlayer from './YouTubePlayer';

// Utils
const formatTime = (ms: number) => {
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / 1000) / 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const SpotifyWidget: React.FC = () => {
    const { state, dispatch, addToast } = useApp();

    // UI State
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMini, setIsMini] = useState(true); // Default to mini ball
    const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [view, setView] = useState<'player' | 'playlists' | 'search'>('player');

    // Data State
    const [playback, setPlayback] = useState<SpotifyPlaybackState | null>(null);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [volume, setVolume] = useState(50);

    // Polling interval
    useEffect(() => {
        if (!state.userProfile?.connectedAccounts?.spotify?.activeAccountId) return;

        const fetchPlayback = async () => {
            try {
                const data = await spotifyService.getPlaybackState();
                setPlayback(data || null);
                if (data?.item?.id) {
                    // Check if liked
                    const [saved] = await spotifyService.checkSaved(data.item.id);
                    setIsLiked(saved);
                }
            } catch (error) {
                // Silently fail auth errors to avoid spam
            }
        };

        fetchPlayback();
        const interval = setInterval(fetchPlayback, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [state.modals.spotifyWidget]);

    const [player, setPlayer] = useState<any>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState<boolean>(true); // Assume premium initially

    useEffect(() => {
        if (!state.userProfile?.connectedAccounts?.spotify?.activeAccountId) return;

        const initPlayer = async () => {
            try {
                const profile = await spotifyService.getProfile();
                if (profile.product !== 'premium') {
                    console.log('User is Free plan - Enabling Preview Mode');
                    setIsPremium(false);
                    return; // Skip SDK init
                }

                if (window.Spotify) return;

                const script = document.createElement("script");
                script.src = "https://sdk.scdn.co/spotify-player.js";
                script.async = true;
                document.body.appendChild(script);

                window.onSpotifyWebPlaybackSDKReady = () => {
                    const player = new window.Spotify.Player({
                        name: 'Sartthi Web Player',
                        getOAuthToken: async (cb: any) => {
                            try {
                                const token = await spotifyService.getToken();
                                cb(token);
                            } catch (e) { console.error(e); }
                        },
                        volume: 0.5
                    });

                    player.addListener('ready', ({ device_id }: any) => {
                        console.log('Global Player Ready', device_id);
                        setDeviceId(device_id);
                        setIsPlayerReady(true);
                    });

                    player.addListener('player_state_changed', (state: any) => {
                        if (state) setPlayback(state);
                    });

                    player.connect();
                    setPlayer(player);
                };
            } catch (error) {
                console.error('Failed to init player', error);
            }
        };

        initPlayer();
    }, [state.userProfile?.connectedAccounts?.spotify?.activeAccountId]);

    // Drag Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button, input, input[type="range"]')) return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    // Controls
    const handleControlError = (error: any) => {
        // Spotify returns 403 with reason "PREMIUM_REQUIRED" for free users
        if (error?.response?.status === 403 || error?.message?.includes('Premium')) {
            addToast('Remote playback requires Spotify Premium. Please play from the Spotify app.', 'error');
        } else {
            console.error(error);
        }
    };

    const togglePlay = async () => {
        try {
            if (playback?.is_playing) await spotifyService.pause();
            else await spotifyService.play();
            // Optimistic update
            setPlayback(prev => prev ? { ...prev, is_playing: !prev.is_playing } : null);
        } catch (error) {
            handleControlError(error);
        }
    };

    const handleSkip = async (dir: 'next' | 'prev') => {
        try {
            if (dir === 'next') await spotifyService.next();
            else await spotifyService.previous();
        } catch (error) {
            handleControlError(error);
        }
    };

    const toggleLike = async () => {
        try {
            if (!playback?.item) return;
            await spotifyService.toggleSaved(playback.item.id, !isLiked);
            setIsLiked(!isLiked);
            addToast(isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs', 'success');
        } catch (error) {
            console.error(error);
        }
    };

    const handleSeek = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const ms = Number(e.target.value);
            await spotifyService.seek(ms);
            setPlayback(prev => prev ? { ...prev, progress_ms: ms } : null);
        } catch (error) {
            handleControlError(error);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        try {
            const res = await spotifyService.search(searchQuery);
            setSearchResults(res.tracks?.items || []);
        } catch (error) {
            console.error(error);
        }
    };

    const playTrack = async (uri: string) => {
        try {
            await spotifyService.play({ uris: [uri] });
            setView('player');
        } catch (error) {
            handleControlError(error);
        }
    };

    // --- Render Helpers ---

    if (!state.modals.spotifyWidget) return null;

    // Mini View (Floating Ball)
    // Mini View (Floating Ball)
    const YouTubePlayerComponent = !isPremium && (
        <YouTubePlayer
            isPlaying={playback?.is_playing || false}
            volume={volume / 100}
            onProgress={({ playedSeconds }) => {
                // Sync progress (optional: dispatch to redux if needed)
            }}
            onEnded={async () => {
                setPlayback(prev => prev ? { ...prev, is_playing: false } : null);
                await spotifyService.pause();
            }}
        />
    );

    if (isMini) {
        return (
            <>
                {YouTubePlayerComponent}
                <div
                    style={{ left: position.x, top: position.y }}
                    className="fixed z-[10000] cursor-move group"
                    onMouseDown={handleMouseDown}
                >
                    <div
                        onClick={() => setIsMini(false)}
                        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center border-2 border-[#1DB954] overflow-hidden transition-transform hover:scale-110 ${playback?.is_playing ? 'animate-spin-slow' : ''}`}
                        title="Open Spotify Player"
                    >
                        {playback?.item?.album?.images?.[0]?.url ? (
                            <img src={playback.item.album.images[0].url} alt="Art" className="w-full h-full object-cover" />
                        ) : (
                            <div className="bg-black w-full h-full flex items-center justify-center">
                                <Music2 className="text-[#1DB954]" size={24} />
                            </div>
                        )}
                    </div>
                    {/* Hover control */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'spotifyWidget' })} className="bg-red-500 text-white p-1 rounded-full shadow-md">
                            <X size={10} />
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // Expanded / Card View
    return (
        <>
            {YouTubePlayerComponent}
            <div
                style={{
                    left: position.x,
                    top: position.y,
                    width: isExpanded ? 400 : 320,
                    height: isExpanded ? 500 : 180,
                }}
                className="fixed bg-[#121212] rounded-xl shadow-2xl z-[10000] flex flex-col border border-[#282828] overflow-hidden text-white transition-all duration-300"
            >
                {/* Header */}
                <div
                    onMouseDown={handleMouseDown}
                    className="h-8 flex items-center justify-between px-3 bg-[#181818] border-b border-[#282828] cursor-move select-none"
                >
                    <div className="flex items-center gap-2">
                        <Music2 size={14} className="text-[#1DB954]" />
                        <span className="text-xs font-bold tracking-wider text-[#1DB954]">SPOTIFY</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setIsMini(true)} className="p-1 hover:bg-[#282828] rounded text-gray-400">
                            <Minimize2 size={14} />
                        </button>
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-[#282828] rounded text-gray-400">
                            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>
                        <button onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'spotifyWidget' })} className="p-1 hover:bg-red-900/50 hover:text-red-500 rounded text-gray-400">
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                {view === 'player' ? (
                    <div className="flex-1 flex flex-col relative overflow-hidden">
                        {/* Background Blur */}
                        {playback?.item?.album?.images?.[0]?.url && (
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={playback.item.album.images[0].url}
                                    className="w-full h-full object-cover blur-3xl opacity-30"
                                    alt="bg"
                                />
                            </div>
                        )}

                        <div className="relative z-10 flex-1 flex flex-col p-4 gap-4">
                            {/* Album Art & Info */}
                            <div className="flex gap-4 items-center">
                                <div className={`shadow-lg bg-[#282828] flex-shrink-0 relative group ${isExpanded ? 'w-48 h-48 mx-auto' : 'w-20 h-20 rounded-md'}`}>
                                    {playback?.item?.album?.images?.[0]?.url ? (
                                        <img src={playback.item.album.images[0].url} className={`w-full h-full object-cover ${isExpanded ? 'rounded-lg' : 'rounded-md'}`} alt="Album" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <Disc size={isExpanded ? 48 : 24} />
                                        </div>
                                    )}
                                </div>

                                {!isExpanded && (
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="font-bold truncate text-base hover:underline cursor-pointer">
                                            {playback?.item?.name || 'Nothing Playing'}
                                        </div>
                                        <div className="text-sm text-gray-400 truncate">
                                            {playback?.item?.artists.map(a => a.name).join(', ')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isExpanded && (
                                <div className="text-center">
                                    <div className="font-bold text-xl truncate"> {playback?.item?.name || 'Nothing Playing'}</div>
                                    <div className="text-gray-400 truncate text-sm mt-1">{playback?.item?.artists.map(a => a.name).join(', ')}</div>
                                </div>
                            )}

                            {/* Progress */}
                            <div className="flex flex-col gap-1">
                                <input
                                    type="range"
                                    min={0}
                                    max={playback?.item?.duration_ms || 100}
                                    value={playback?.progress_ms || 0}
                                    onChange={handleSeek}
                                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                                    <span>{formatTime(playback?.progress_ms || 0)}</span>
                                    <span>{formatTime(playback?.item?.duration_ms || 0)}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-center gap-4 mt-auto">
                                <button onClick={() => spotifyService.setShuffle(!playback?.shuffle_state)} className={`p-2 rounded-full ${playback?.shuffle_state ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}>
                                    <Shuffle size={isExpanded ? 18 : 16} />
                                </button>
                                <button onClick={() => handleSkip('prev')} className="p-2 text-gray-200 hover:text-white transition-colors">
                                    <SkipBack size={isExpanded ? 28 : 24} fill="currentColor" />
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="p-3 bg-white rounded-full text-black hover:scale-105 transition-transform shadow-lg"
                                >
                                    {playback?.is_playing ? <Pause size={isExpanded ? 24 : 20} fill="currentColor" /> : <Play size={isExpanded ? 24 : 20} fill="currentColor" className="ml-0.5" />}
                                </button>
                                <button onClick={() => handleSkip('next')} className="p-2 text-gray-200 hover:text-white transition-colors">
                                    <SkipForward size={isExpanded ? 28 : 24} fill="currentColor" />
                                </button>
                                <button onClick={toggleLike} className={`p-2 rounded-full ${isLiked ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}>
                                    <Heart size={isExpanded ? 18 : 16} fill={isLiked ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {/* Search / Playlist View implementation would go here */}
                        {view === 'search' && (
                            <div className="space-y-4">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <input
                                        className="bg-[#282828] border-none rounded-full px-4 py-2 text-sm w-full text-white placeholder-gray-500 focus:ring-1 focus:ring-[#1DB954]"
                                        placeholder="Search songs..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </form>
                                <div className="space-y-1">
                                    {searchResults.map(track => (
                                        <div
                                            key={track.id}
                                            onClick={() => playTrack(track.uri)}
                                            className="flex items-center gap-3 p-2 hover:bg-[#282828] rounded-md cursor-pointer group"
                                        >
                                            <img src={track.album.images[2]?.url} className="w-10 h-10 rounded" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate group-hover:text-[#1DB954]">{track.name}</div>
                                                <div className="text-xs text-gray-400 truncate">{track.artists[0].name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Bar (Buttons to switch views) */}
                <div className="h-10 bg-[#181818] border-t border-[#282828] flex justify-around items-center px-2">
                    <button onClick={() => setView('player')} className={`p-2 ${view === 'player' ? 'text-[#1DB954]' : 'text-gray-500'}`}>
                        <Music2 size={20} />
                    </button>
                    <button onClick={() => setView('search')} className={`p-2 ${view === 'search' ? 'text-[#1DB954]' : 'text-gray-500'}`}>
                        <Search size={20} />
                    </button>
                </div>
            </div>
        </>
    );
};

// Utils
export default SpotifyWidget;
