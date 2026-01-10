import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
    Volume2, VolumeX, Heart, Search, Clock, TrendingUp,
    ListMusic, Disc, ChevronLeft, Monitor, Smartphone, Speaker,
    Crown, Music
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { spotifyService, SpotifyPlaybackState } from '../services/spotifyService';
import { SpotifyLogo } from '../components/icons/BrandLogos';


const formatTime = (ms: number) => {
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / 1000) / 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const MusicPage: React.FC = () => {
    const { state, addToast } = useApp();
    const navigate = useNavigate();

    const [view, setView] = useState<'player' | 'playlists' | 'search' | 'recent'>('player');
    const [isPremium, setIsPremium] = useState(true);
    const [playback, setPlayback] = useState<SpotifyPlaybackState | null>(null);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [volume, setVolume] = useState(50);
    const [devices, setDevices] = useState<any[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [showDevices, setShowDevices] = useState(false);

    // Check if connected
    useEffect(() => {
        if (!state.userProfile?.connectedAccounts?.spotify?.activeAccountId) {
            navigate('/settings', { state: { activeTab: 'connected-accounts', service: 'spotify' } });
        }
    }, [state.userProfile, navigate]);

    // Fetch playback state
    useEffect(() => {
        if (!state.userProfile?.connectedAccounts?.spotify?.activeAccountId) return;

        const fetchPlayback = async () => {
            try {
                const data = await spotifyService.getPlaybackState();
                setPlayback(data || null);
                if (data?.item?.id) {
                    const [saved] = await spotifyService.checkSaved(data.item.id);
                    setIsLiked(saved);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchPlayback();
        const interval = setInterval(fetchPlayback, 3000);
        return () => clearInterval(interval);
    }, [state.userProfile]);

    // Check premium status
    useEffect(() => {
        const checkPremium = async () => {
            try {
                const profile = await spotifyService.getProfile();
                setIsPremium(profile.product === 'premium');
            } catch (error) {
                console.error(error);
            }
        };
        checkPremium();
    }, []);

    // Load playlists and devices
    useEffect(() => {
        const loadData = async () => {
            try {
                const [playlistData, deviceData] = await Promise.all([
                    spotifyService.getPlaylists(),
                    spotifyService.getDevices()
                ]);
                setPlaylists(playlistData.items || []);
                setDevices(deviceData?.devices || []);
                const active = deviceData?.devices?.find((d: any) => d.is_active);
                if (active) setSelectedDevice(active.id);
            } catch (error) {
                console.error(error);
            }
        };
        loadData();
    }, []);

    const togglePlay = async () => {
        try {
            if (playback?.is_playing) await spotifyService.pause();
            else await spotifyService.play();
        } catch (error: any) {
            if (error?.response?.data?.error?.reason === 'NO_ACTIVE_DEVICE') {
                addToast('Please select a device first', 'warning');
                setShowDevices(true);
            } else {
                addToast('Playback error', 'error');
            }
        }
    };

    const handleSkip = async (dir: 'next' | 'prev') => {
        try {
            if (dir === 'next') await spotifyService.next();
            else await spotifyService.previous();
        } catch (error) {
            addToast('Skip error', 'error');
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
            if (selectedDevice) {
                await spotifyService.play({ uris: [uri], transfer_device_id: selectedDevice });
            } else {
                await spotifyService.play({ uris: [uri] });
            }
            setView('player');
            addToast('Playing track...', 'success');
        } catch (error: any) {
            if (error?.response?.data?.error?.reason === 'NO_ACTIVE_DEVICE') {
                addToast('Please select a device first', 'warning');
                setShowDevices(true);
            }
        }
    };

    const playPlaylist = async (uri: string) => {
        try {
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
            addToast('Failed to switch device', 'error');
        }
    };

    const getDeviceIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'computer': return <Monitor size={16} />;
            case 'smartphone': return <Smartphone size={16} />;
            case 'speaker': return <Speaker size={16} />;
            default: return <Speaker size={16} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">


            <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <SpotifyLogo size={32} className="text-[#1DB954]" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spotify</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isPremium ? (
                                    <span className="flex items-center gap-1">
                                        <Crown size={14} className="text-yellow-500" />
                                        Premium
                                    </span>
                                ) : 'Free'}
                            </p>
                        </div>
                    </div>

                    {/* Device Selector */}
                    {devices.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowDevices(!showDevices)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                {getDeviceIcon(devices.find(d => d.id === selectedDevice)?.type || 'speaker')}
                                <span className="text-sm font-medium">
                                    {devices.find(d => d.id === selectedDevice)?.name || 'Select Device'}
                                </span>
                            </button>

                            {showDevices && (
                                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700 min-w-[250px] z-50">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Select Device</p>
                                    </div>
                                    {devices.map(device => (
                                        <button
                                            key={device.id}
                                            onClick={() => switchDevice(device.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${device.id === selectedDevice ? 'bg-green-50 dark:bg-green-900/20' : ''
                                                }`}
                                        >
                                            {getDeviceIcon(device.type)}
                                            <div className="flex-1 text-left">
                                                <div className="text-sm font-medium">{device.name}</div>
                                                <div className="text-xs text-gray-500 capitalize">{device.type}</div>
                                            </div>
                                            {device.is_active && (
                                                <div className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-300 dark:border-gray-700">
                    <button
                        onClick={() => setView('player')}
                        className={`px-4 py-2 font-medium transition-colors ${view === 'player'
                            ? 'text-[#1DB954] border-b-2 border-[#1DB954]'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <Music size={18} className="inline mr-2" />
                        Now Playing
                    </button>
                    <button
                        onClick={() => setView('search')}
                        className={`px-4 py-2 font-medium transition-colors ${view === 'search'
                            ? 'text-[#1DB954] border-b-2 border-[#1DB954]'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <Search size={18} className="inline mr-2" />
                        Search
                    </button>
                    <button
                        onClick={() => setView('playlists')}
                        className={`px-4 py-2 font-medium transition-colors ${view === 'playlists'
                            ? 'text-[#1DB954] border-b-2 border-[#1DB954]'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <ListMusic size={18} className="inline mr-2" />
                        Playlists
                    </button>
                </div>

                {/* Content */}
                {view === 'player' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                        <div className="max-w-2xl mx-auto">
                            {/* Album Art */}
                            <div className="aspect-square w-full max-w-md mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl">
                                {playback?.item?.album?.images?.[0]?.url ? (
                                    <img
                                        src={playback.item.album.images[0].url}
                                        alt="Album"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                        <Disc size={96} className="text-gray-500 dark:text-gray-600" />
                                    </div>
                                )}
                            </div>

                            {/* Track Info */}
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {playback?.item?.name || 'Nothing Playing'}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    {playback?.item?.artists.map((a: any) => a.name).join(', ')}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                    {playback?.item?.album?.name}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <input
                                    type="range"
                                    min={0}
                                    max={playback?.item?.duration_ms || 100}
                                    value={playback?.progress_ms || 0}
                                    className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#1DB954]"
                                    style={{
                                        background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${((playback?.progress_ms || 0) / (playback?.item?.duration_ms || 1)) * 100}%, #d1d5db ${((playback?.progress_ms || 0) / (playback?.item?.duration_ms || 1)) * 100}%, #d1d5db 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    <span>{formatTime(playback?.progress_ms || 0)}</span>
                                    <span>{formatTime(playback?.item?.duration_ms || 0)}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-center gap-6 mb-4">
                                <button
                                    onClick={toggleLike}
                                    className={`p-3 rounded-full transition-all ${isLiked ? 'text-[#1DB954]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                                </button>
                                <button className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                    <Shuffle size={24} />
                                </button>
                                <button onClick={() => handleSkip('prev')} className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                    <SkipBack size={32} fill="currentColor" />
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="p-6 bg-[#1DB954] hover:bg-[#1ed760] rounded-full text-white shadow-xl hover:scale-105 transition-all"
                                >
                                    {playback?.is_playing ?
                                        <Pause size={32} fill="currentColor" /> :
                                        <Play size={32} fill="currentColor" className="ml-1" />
                                    }
                                </button>
                                <button onClick={() => handleSkip('next')} className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                    <SkipForward size={32} fill="currentColor" />
                                </button>
                                <button className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                    <Repeat size={24} />
                                </button>
                                <button className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                    <Volume2 size={24} />
                                </button>
                            </div>

                            {!isPremium && (
                                <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                                    <Crown size={16} className="inline mr-2 text-yellow-500" />
                                    Upgrade to Spotify Premium for full playback control
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'search' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                        <form onSubmit={handleSearch} className="mb-6">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search for songs, artists, or albums..."
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1DB954] focus:border-transparent"
                            />
                        </form>

                        <div className="space-y-2">
                            {searchResults.map(track => (
                                <div
                                    key={track.id}
                                    onClick={() => playTrack(track.uri)}
                                    className="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer group transition-all"
                                >
                                    <div className="relative">
                                        <img
                                            src={track.album.images[1]?.url || track.album.images[0]?.url}
                                            alt={track.name}
                                            className="w-16 h-16 rounded-md"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                            <Play size={24} fill="white" className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-white truncate group-hover:text-[#1DB954]">
                                            {track.name}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {track.artists.map((a: any) => a.name).join(', ')}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {track.album.name}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatTime(track.duration_ms)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'playlists' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {playlists.map(playlist => (
                            <div
                                key={playlist.id}
                                onClick={() => playPlaylist(playlist.uri)}
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer group transition-all"
                            >
                                <img
                                    src={playlist.images?.[0]?.url}
                                    alt={playlist.name}
                                    className="w-full aspect-square rounded-md mb-3 shadow-lg"
                                />
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#1DB954]">
                                    {playlist.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {playlist.tracks?.total || 0} tracks
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MusicPage;
