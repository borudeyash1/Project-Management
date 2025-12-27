import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { spotifyService, SpotifyPlaybackState } from '../../services/spotifyService';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Search, Heart, Clock, Music } from 'lucide-react';

const MusicPage: React.FC = () => {
    const { state } = useApp();
    const isSpotifyConnected = state.userProfile.connectedAccounts?.spotify?.activeAccountId;
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [playback, setPlayback] = useState<SpotifyPlaybackState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isSpotifyConnected) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [isSpotifyConnected]);

    const loadData = async () => {
        try {
            const [playlistsData, playbackData] = await Promise.all([
                spotifyService.getPlaylists(),
                spotifyService.getPlaybackState()
            ]);
            setPlaylists(playlistsData?.items || []);
            setPlayback(playbackData);
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
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Music Library</h1>
                <p className="text-gray-400">Your playlists and saved tracks</p>
            </header>

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

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => playback.is_playing ? spotifyService.pause() : spotifyService.play()}
                                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center transition-transform hover:scale-105"
                            >
                                {playback.is_playing ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current pl-1" />}
                            </button>
                            <button onClick={() => spotifyService.toggleSaved(playback.item!.id, true)} className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                <Heart className="w-6 h-6" />
                            </button>
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
        </div>
    );
};

export default MusicPage;
