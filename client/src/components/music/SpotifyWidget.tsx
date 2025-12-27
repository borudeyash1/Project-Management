import React, { useState, useEffect, useRef } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
    Volume2, VolumeX, Maximize2, Minimize2, Music2, Heart,
    ListMusic, X, GripHorizontal, Search, Disc, ChevronDown,
    ChevronUp, Clock, User, Radio, TrendingUp, Crown, Smartphone, Monitor, Speaker
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

// Spotify Logo Component
const SpotifyLogo = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
);


const SpotifyWidget: React.FC = () => {
    const { state, dispatch, addToast } = useApp();

    // UI State
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMini, setIsMini] = useState(true);
    const [position, setPosition] = useState({
        x: typeof window !== 'undefined' ? (window.innerWidth / 2) - 180 : 0,
        y: typeof window !== 'undefined' ? (window.innerHeight / 2) - 100 : 0
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [view, setView] = useState<'player' | 'playlists' | 'search' | 'queue'>('player');
    const [showQueue, setShowQueue] = useState(false);

    // Data State
    const [isPremium, setIsPremium] = useState<boolean>(true);
    const [localPlayback, setLocalPlayback] = useState<SpotifyPlaybackState | null>(null);
    const playback = (!state.userProfile?.connectedAccounts?.spotify?.activeAccountId ? null : (isPremium ? (localPlayback || state.playback) : state.playback));

    const updatePlayback = (fn: (prev: SpotifyPlaybackState | null) => SpotifyPlaybackState | null) => {
        const current = playback;
        const next = fn(current);
        if (isPremium) {
            setLocalPlayback(next);
        } else {
            dispatch({ type: 'SET_PLAYBACK', payload: next });
        }
    };

    const [playlists, setPlaylists] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [volume, setVolume] = useState(50);
    const [showVolume, setShowVolume] = useState(false);
    const [queue, setQueue] = useState<any[]>([]);
    const [devices, setDevices] = useState<any[]>([]);
    const [showDevices, setShowDevices] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

    // Polling interval
    useEffect(() => {
        if (!state.userProfile?.connectedAccounts?.spotify?.activeAccountId) return;

        const fetchPlayback = async () => {
            try {
                const data = await spotifyService.getPlaybackState();
                setLocalPlayback(data || null);
                if (data?.item?.id) {
                    const [saved] = await spotifyService.checkSaved(data.item.id);
                    setIsLiked(saved);
                }
            } catch (error) {
                // Silently fail
            }
        };

        fetchPlayback();
        const interval = setInterval(fetchPlayback, 3000);
        return () => clearInterval(interval);
    }, [state.modals.spotifyWidget]);

    const [player, setPlayer] = useState<any>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);

    useEffect(() => {
        if (!state.userProfile?.connectedAccounts?.spotify?.activeAccountId) return;

        const initPlayer = async () => {
            try {
                const profile = await spotifyService.getProfile();
                if (profile.product !== 'premium') {
                    console.log('User is Free plan - Enabling Preview Mode');
                    setIsPremium(false);
                    return;
                }

                if (window.Spotify) {
                    // SDK already loaded, just ensure device is active
                    if (deviceId) {
                        try {
                            await spotifyService.play({ transfer_device_id: deviceId });
                        } catch (e) {
                            console.log('Device transfer skipped:', e);
                        }
                    }
                    return;
                }

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

                    player.addListener('ready', async ({ device_id }: any) => {
                        console.log('Sartthi Web Player Ready:', device_id);
                        setDeviceId(device_id);
                        setIsPlayerReady(true);

                        // Automatically transfer playback to this device
                        try {
                            await spotifyService.play({ transfer_device_id: device_id });
                            addToast('Sartthi Player activated', 'success');
                        } catch (error: any) {
                            console.log('Initial transfer skipped (no active playback)');
                        }
                    });

                    player.addListener('not_ready', ({ device_id }: any) => {
                        console.log('Device has gone offline', device_id);
                        setIsPlayerReady(false);
                    });

                    player.addListener('player_state_changed', (state: any) => {
                        if (state) {
                            setLocalPlayback(state);
                        }
                    });

                    player.addListener('initialization_error', ({ message }: any) => {
                        console.error('Failed to initialize:', message);
                        addToast('Failed to initialize Spotify player', 'error');
                    });

                    player.addListener('authentication_error', ({ message }: any) => {
                        console.error('Failed to authenticate:', message);
                        addToast('Spotify authentication failed', 'error');
                    });

                    player.addListener('account_error', ({ message }: any) => {
                        console.error('Failed to validate account:', message);
                        addToast('Spotify account error', 'error');
                    });

                    player.addListener('playback_error', ({ message }: any) => {
                        console.error('Failed to perform playback:', message);
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

    // Load playlists and devices
    useEffect(() => {
        if (!state.userProfile?.connectedAccounts?.spotify?.activeAccountId) return;
        const loadPlaylists = async () => {
            try {
                const data = await spotifyService.getPlaylists();
                setPlaylists(data.items || []);
            } catch (error) {
                console.error(error);
            }
        };
        const loadDevices = async () => {
            try {
                const data = await spotifyService.getDevices();
                // API returns { devices: [...] } directly
                setDevices(data?.devices || []);
                // Set current active device
                const active = data?.devices?.find((d: any) => d.is_active);
                if (active) setSelectedDevice(active.id);
            } catch (error) {
                console.error(error);
            }
        };
        loadPlaylists();
        loadDevices();
        // Refresh devices every 10 seconds
        const interval = setInterval(loadDevices, 10000);
        return () => clearInterval(interval);
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
    const handleControlError = async (error: any, retryFn?: () => Promise<void>) => {
        // Check for "No active device" error
        if (error?.response?.data?.error?.reason === 'NO_ACTIVE_DEVICE' ||
            error?.response?.data?.error?.message?.includes('No active device')) {

            if (deviceId && isPlayerReady) {
                // Try to activate our device
                try {
                    await spotifyService.play({ transfer_device_id: deviceId });
                    addToast('Activating Sartthi Player...', 'info');

                    // Retry the original action after a short delay
                    if (retryFn) {
                        setTimeout(async () => {
                            try {
                                await retryFn();
                            } catch (retryError) {
                                console.error('Retry failed:', retryError);
                            }
                        }, 1000);
                    }
                    return;
                } catch (transferError) {
                    console.error('Device transfer failed:', transferError);
                }
            }

            addToast('No active device. Please start playback on Spotify first, or wait for Sartthi Player to initialize.', 'error');
        } else if (error?.response?.status === 403 || error?.message?.includes('Premium')) {
            addToast('This feature requires Spotify Premium', 'error');
        } else {
            console.error(error);
            addToast('Playback error. Please try again.', 'error');
        }
    };

    const togglePlay = async () => {
        if (!isPremium) {
            updatePlayback(prev => prev ? { ...prev, is_playing: !prev.is_playing } : null);
            return;
        }

        const performToggle = async () => {
            if (playback?.is_playing) await spotifyService.pause();
            else await spotifyService.play();
            updatePlayback(prev => prev ? { ...prev, is_playing: !prev.is_playing } : null);
        };

        try {
            await performToggle();
        } catch (error) {
            await handleControlError(error, performToggle);
        }
    };

    const handleSkip = async (dir: 'next' | 'prev') => {
        if (!isPremium) {
            addToast('Skipping requires Spotify Premium', 'info');
            return;
        }
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
        const ms = Number(e.target.value);

        if (!isPremium) {
            updatePlayback(prev => prev ? { ...prev, progress_ms: ms } : null);
            return;
        }

        try {
            await spotifyService.seek(ms);
            updatePlayback(prev => prev ? { ...prev, progress_ms: ms } : null);
        } catch (error) {
            handleControlError(error);
        }
    };

    const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = Number(e.target.value);
        setVolume(vol);
        if (isPremium) {
            try {
                await spotifyService.setVolume(vol);
            } catch (error) {
                handleControlError(error);
            }
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
        if (!isPremium) {
            addToast('Playing tracks requires Spotify Premium', 'info');
            return;
        }

        try {
            // If we have a selected device, play on that device
            if (selectedDevice) {
                await spotifyService.play({ uris: [uri], transfer_device_id: selectedDevice });
            } else {
                // Try to play, will use active device or fail
                await spotifyService.play({ uris: [uri] });
            }
            setView('player');
            addToast('Playing track...', 'success');
        } catch (error: any) {
            // If no device, show device selector
            if (error?.response?.data?.error?.reason === 'NO_ACTIVE_DEVICE') {
                addToast('Please select a device first', 'warning');
                setShowDevices(true);
            } else {
                handleControlError(error);
            }
        }
    };

    const playPlaylist = async (uri: string) => {
        if (!isPremium) {
            addToast('Playing playlists requires Spotify Premium', 'info');
            return;
        }

        try {
            // If we have a selected device, play on that device
            if (selectedDevice) {
                await spotifyService.play({ context_uri: uri, transfer_device_id: selectedDevice });
            } else {
                await spotifyService.play({ context_uri: uri });
            }
            setView('player');
            addToast('Playing playlist...', 'success');
        } catch (error: any) {
            if (error?.response?.data?.error?.reason === 'NO_ACTIVE_DEVICE') {
                addToast('Please select a device first', 'warning');
                setShowDevices(true);
            } else {
                handleControlError(error);
            }
        }
    };

    const switchDevice = async (deviceId: string) => {
        try {
            await spotifyService.play({ transfer_device_id: deviceId });
            setSelectedDevice(deviceId);
            setShowDevices(false);
            addToast('Switched playback device', 'success');
        } catch (error) {
            console.error('Device switch error:', error);
            addToast('Failed to switch device', 'error');
        }
    };

    const getDeviceIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'computer': return <Monitor size={16} />;
            case 'smartphone': return <Smartphone size={16} />;
            case 'speaker': return <Speaker size={16} />;
            default: return <Speaker size={16} />;
        }
    };

    if (!state.modals.spotifyWidget) return null;

    const YouTubePlayerComponent = !isPremium && (
        <YouTubePlayer
            isPlaying={playback?.is_playing || false}
            volume={volume / 100}
            onProgress={({ playedSeconds }) => { }}
            onEnded={async () => {
                updatePlayback(prev => prev ? { ...prev, is_playing: false } : null);
                await spotifyService.pause();
            }}
        />
    );

    // Mini View (Floating Ball)
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
                        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-2 ${isPremium ? 'border-[#1DB954]' : 'border-gray-500'} overflow-hidden transition-all hover:scale-110 ${playback?.is_playing ? 'ring-4 ring-[#1DB954]/30 animate-pulse' : ''}`}
                        title="Open Spotify Player"
                    >
                        {playback?.item?.album?.images?.[0]?.url ? (
                            <img src={playback.item.album.images[0].url} alt="Art" className="w-full h-full object-cover" />
                        ) : (
                            <div className="bg-gradient-to-br from-[#1DB954] to-[#1ed760] w-full h-full flex items-center justify-center">
                                <SpotifyLogo size={28} className="text-white" />
                            </div>
                        )}
                    </div>
                    {!isPremium && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-[8px] px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            Free
                        </div>
                    )}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'spotifyWidget' })} className="bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600">
                            <X size={12} />
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
                    width: isExpanded ? 450 : 360,
                    height: isExpanded ? 600 : 200,
                }}
                className="fixed bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#121212] rounded-2xl shadow-2xl z-[10000] flex flex-col border border-[#282828]/50 overflow-hidden text-white transition-all duration-300 backdrop-blur-xl"
            >
                {/* Header */}
                <div
                    onMouseDown={handleMouseDown}
                    className="h-10 flex items-center justify-between px-4 bg-gradient-to-r from-[#181818]/80 to-[#1a1a1a]/80 backdrop-blur-md border-b border-[#282828]/50 cursor-move select-none"
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <SpotifyLogo size={16} className="text-[#1DB954]" />
                            {isPremium && (
                                <Crown size={10} className="absolute -top-1 -right-1 text-yellow-400" />
                            )}
                        </div>
                        <span className="text-xs font-bold tracking-wider bg-gradient-to-r from-[#1DB954] to-[#1ed760] bg-clip-text text-transparent">
                            SPOTIFY {!isPremium && '(FREE)'}
                        </span>

                        {/* Device Selector */}
                        {isPremium && devices.length > 0 && (
                            <div className="relative ml-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDevices(!showDevices);
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 bg-[#282828]/50 hover:bg-[#282828] rounded-md text-xs text-gray-400 hover:text-white transition-colors"
                                    title="Select Device"
                                >
                                    {getDeviceIcon(devices.find(d => d.id === selectedDevice)?.type || 'speaker')}
                                    <ChevronDown size={12} />
                                </button>

                                {showDevices && (
                                    <div className="absolute top-full left-0 mt-1 bg-[#282828] rounded-lg shadow-2xl border border-[#404040] min-w-[200px] z-50 overflow-hidden">
                                        <div className="px-3 py-2 border-b border-[#404040] text-xs text-gray-400 font-semibold">
                                            Select Device
                                        </div>
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                            {devices.map(device => (
                                                <button
                                                    key={device.id}
                                                    onClick={() => switchDevice(device.id)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] transition-colors text-left ${device.id === selectedDevice ? 'bg-[#1DB954]/10 text-[#1DB954]' : 'text-gray-300'
                                                        }`}
                                                >
                                                    {getDeviceIcon(device.type)}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">{device.name}</div>
                                                        <div className="text-xs text-gray-500 capitalize">{device.type}</div>
                                                    </div>
                                                    {device.is_active && (
                                                        <div className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setIsMini(true)} className="p-1.5 hover:bg-[#282828]/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <Minimize2 size={14} />
                        </button>
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-[#282828]/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        </button>
                        <button onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'spotifyWidget' })} className="p-1.5 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-gray-400 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                {view === 'player' ? (
                    <div className="flex-1 flex flex-col relative overflow-hidden">
                        {/* Animated Background */}
                        {playback?.item?.album?.images?.[0]?.url && (
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={playback.item.album.images[0].url}
                                    className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
                                    alt="bg"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
                            </div>
                        )}

                        <div className="relative z-10 flex-1 flex flex-col p-4 gap-3">
                            {/* Album Art & Info */}
                            <div className="flex gap-4 items-center">
                                <div className={`shadow-2xl bg-[#282828]/50 backdrop-blur-sm flex-shrink-0 relative group overflow-hidden ${isExpanded ? 'w-56 h-56 mx-auto rounded-2xl' : 'w-24 h-24 rounded-xl'}`}>
                                    {playback?.item?.album?.images?.[0]?.url ? (
                                        <>
                                            <img
                                                src={playback.item.album.images[0].url}
                                                className="w-full h-full object-cover"
                                                alt="Album"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gradient-to-br from-[#282828] to-[#1a1a1a]">
                                            <Disc size={isExpanded ? 64 : 32} className="animate-spin-slow" />
                                        </div>
                                    )}
                                    {playback?.is_playing && (
                                        <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#1DB954] rounded-full animate-pulse shadow-lg shadow-[#1DB954]/50" />
                                    )}
                                </div>

                                {!isExpanded && (
                                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                        <div className="font-bold truncate text-base hover:underline cursor-pointer">
                                            {playback?.item?.name || 'Nothing Playing'}
                                        </div>
                                        <div className="text-sm text-gray-400 truncate">
                                            {playback?.item?.artists.map(a => a.name).join(', ')}
                                        </div>
                                        {playback?.item?.album && (
                                            <div className="text-xs text-gray-500 truncate">
                                                {playback.item.album.name}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isExpanded && (
                                <div className="text-center space-y-1">
                                    <div className="font-bold text-2xl truncate">{playback?.item?.name || 'Nothing Playing'}</div>
                                    <div className="text-gray-400 truncate text-sm">{playback?.item?.artists.map(a => a.name).join(', ')}</div>
                                    <div className="text-gray-500 truncate text-xs">{playback?.item?.album?.name}</div>
                                </div>
                            )}

                            {/* Progress */}
                            <div className="flex flex-col gap-1.5">
                                <input
                                    type="range"
                                    min={0}
                                    max={playback?.item?.duration_ms || 100}
                                    value={playback?.progress_ms || 0}
                                    onChange={handleSeek}
                                    disabled={!isPremium}
                                    className="w-full h-1.5 bg-gray-700/50 rounded-full appearance-none cursor-pointer accent-[#1DB954] hover:accent-[#1ed760] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${((playback?.progress_ms || 0) / (playback?.item?.duration_ms || 1)) * 100}%, #374151 ${((playback?.progress_ms || 0) / (playback?.item?.duration_ms || 1)) * 100}%, #374151 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                                    <span>{formatTime(playback?.progress_ms || 0)}</span>
                                    <span>{formatTime(playback?.item?.duration_ms || 0)}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleLike}
                                        className={`p-2 rounded-full transition-all ${isLiked ? 'text-[#1DB954] scale-110' : 'text-gray-400 hover:text-white hover:scale-105'}`}
                                        title={isLiked ? "Remove from Liked Songs" : "Add to Liked Songs"}
                                    >
                                        <Heart size={isExpanded ? 20 : 18} fill={isLiked ? "currentColor" : "none"} />
                                    </button>
                                    <button
                                        onClick={() => spotifyService.setShuffle(!playback?.shuffle_state)}
                                        className={`p-2 rounded-full transition-all ${playback?.shuffle_state ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'} ${!isPremium && 'opacity-50 cursor-not-allowed'}`}
                                        disabled={!isPremium}
                                        title={isPremium ? "Toggle Shuffle" : "Premium Only"}
                                    >
                                        <Shuffle size={isExpanded ? 18 : 16} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleSkip('prev')}
                                        className={`p-2 text-gray-200 hover:text-white transition-all hover:scale-110 ${!isPremium && 'opacity-50 cursor-not-allowed'}`}
                                        disabled={!isPremium}
                                    >
                                        <SkipBack size={isExpanded ? 28 : 24} fill="currentColor" />
                                    </button>
                                    <button
                                        onClick={togglePlay}
                                        className="p-4 bg-gradient-to-br from-white to-gray-100 rounded-full text-black hover:scale-110 transition-all shadow-xl hover:shadow-2xl hover:shadow-[#1DB954]/20"
                                    >
                                        {playback?.is_playing ?
                                            <Pause size={isExpanded ? 28 : 24} fill="currentColor" /> :
                                            <Play size={isExpanded ? 28 : 24} fill="currentColor" className="ml-0.5" />
                                        }
                                    </button>
                                    <button
                                        onClick={() => handleSkip('next')}
                                        className={`p-2 text-gray-200 hover:text-white transition-all hover:scale-110 ${!isPremium && 'opacity-50 cursor-not-allowed'}`}
                                        disabled={!isPremium}
                                    >
                                        <SkipForward size={isExpanded ? 28 : 24} fill="currentColor" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 relative">
                                    <button
                                        onClick={() => spotifyService.setRepeat(playback?.repeat_state === 'off' ? 'context' : 'off')}
                                        className={`p-2 rounded-full transition-all ${playback?.repeat_state !== 'off' ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'} ${!isPremium && 'opacity-50 cursor-not-allowed'}`}
                                        disabled={!isPremium}
                                        title={isPremium ? "Toggle Repeat" : "Premium Only"}
                                    >
                                        <Repeat size={isExpanded ? 18 : 16} />
                                    </button>
                                    <button
                                        onClick={() => setShowVolume(!showVolume)}
                                        className="p-2 rounded-full text-gray-400 hover:text-white transition-all"
                                        title="Volume"
                                    >
                                        {volume === 0 ? <VolumeX size={isExpanded ? 18 : 16} /> : <Volume2 size={isExpanded ? 18 : 16} />}
                                    </button>
                                    {showVolume && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-[#282828] p-3 rounded-lg shadow-xl">
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                value={volume}
                                                onChange={handleVolumeChange}
                                                className="w-24 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#1DB954] rotate-0"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isPremium && (
                                <div className="text-center text-xs text-gray-500 bg-[#282828]/30 backdrop-blur-sm rounded-lg p-2 border border-gray-700/30">
                                    <Crown size={12} className="inline mr-1 text-yellow-400" />
                                    Upgrade to Premium for full playback control
                                </div>
                            )}
                        </div>
                    </div>
                ) : view === 'playlists' ? (
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="space-y-2">
                            {playlists.map(playlist => (
                                <div
                                    key={playlist.id}
                                    onClick={() => playPlaylist(playlist.uri)}
                                    className="flex items-center gap-3 p-3 hover:bg-[#282828]/50 rounded-xl cursor-pointer group transition-all hover:scale-[1.02]"
                                >
                                    <img
                                        src={playlist.images?.[0]?.url || ''}
                                        className="w-14 h-14 rounded-lg shadow-lg"
                                        alt={playlist.name}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold truncate group-hover:text-[#1DB954] transition-colors">
                                            {playlist.name}
                                        </div>
                                        <div className="text-xs text-gray-400 truncate">
                                            {playlist.tracks?.total || 0} tracks
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="space-y-4">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input
                                    className="bg-[#282828]/50 backdrop-blur-sm border border-[#404040] rounded-full px-4 py-2.5 text-sm w-full text-white placeholder-gray-500 focus:ring-2 focus:ring-[#1DB954] focus:border-transparent transition-all"
                                    placeholder="Search songs, artists, albums..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </form>
                            <div className="space-y-1">
                                {searchResults.length === 0 && searchQuery && (
                                    <div className="text-center text-gray-500 py-8">
                                        <Search size={48} className="mx-auto mb-2 opacity-50" />
                                        <p>No results found for "{searchQuery}"</p>
                                    </div>
                                )}
                                {searchResults.map(track => (
                                    <div
                                        key={track.id}
                                        onClick={() => playTrack(track.uri)}
                                        className="flex items-center gap-3 p-2.5 hover:bg-[#282828]/50 rounded-lg cursor-pointer group transition-all relative"
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={track.album.images[1]?.url || track.album.images[0]?.url}
                                                className="w-14 h-14 rounded-md shadow-md"
                                                alt={track.name}
                                                onError={(e) => {
                                                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect fill="%23282828"/></svg>';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                                <Play size={20} fill="white" className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate group-hover:text-[#1DB954] transition-colors">
                                                {track.name}
                                            </div>
                                            <div className="text-xs text-gray-400 truncate">
                                                {track.artists.map((a: any) => a.name).join(', ')}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {track.album.name}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 flex-shrink-0">
                                            {formatTime(track.duration_ms)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Navigation */}
                <div className="h-12 bg-gradient-to-r from-[#181818]/80 to-[#1a1a1a]/80 backdrop-blur-md border-t border-[#282828]/50 flex justify-around items-center px-2">
                    <button
                        onClick={() => setView('player')}
                        className={`p-2.5 rounded-lg transition-all ${view === 'player' ? 'text-[#1DB954] bg-[#1DB954]/10' : 'text-gray-500 hover:text-white hover:bg-[#282828]/30'}`}
                        title="Player"
                    >
                        <Music2 size={20} />
                    </button>
                    <button
                        onClick={() => setView('playlists')}
                        className={`p-2.5 rounded-lg transition-all ${view === 'playlists' ? 'text-[#1DB954] bg-[#1DB954]/10' : 'text-gray-500 hover:text-white hover:bg-[#282828]/30'}`}
                        title="Playlists"
                    >
                        <ListMusic size={20} />
                    </button>
                    <button
                        onClick={() => setView('search')}
                        className={`p-2.5 rounded-lg transition-all ${view === 'search' ? 'text-[#1DB954] bg-[#1DB954]/10' : 'text-gray-500 hover:text-white hover:bg-[#282828]/30'}`}
                        title="Search"
                    >
                        <Search size={20} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default SpotifyWidget;
