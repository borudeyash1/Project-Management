import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useApp } from '../../context/AppContext';
import { spotifyService } from '../../services/spotifyService';

const Player = ReactPlayer as any;

interface YouTubePlayerProps {
    isPlaying: boolean;
    volume: number;
    onProgress: (progress: any) => void;
    onEnded: () => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ isPlaying, volume, onProgress, onEnded }) => {
    const { state } = useApp();
    const playback = state.playback;
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const lastTrackId = useRef<string | null>(null);

    useEffect(() => {
        const fetchVideo = async () => {
            const track = playback?.item;
            if (!track || track.id === lastTrackId.current) return;

            // Only fetch if we are in "Preview/Free" mode logic (checked by parent usually, but safe to do here)
            // Construct query: "Artist - Track Name Audio"
            const query = `${track.artists[0].name} - ${track.name} Audio`;

            setIsLoading(true);
            try {
                const video = await spotifyService.searchVideo(query);
                if (video && video.url) {
                    console.log('YouTube Bridge: Playing', video.url);
                    setVideoUrl(video.url);
                    lastTrackId.current = track.id;
                }
            } catch (error) {
                console.error('YouTube Bridge Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (playback?.is_playing) {
            fetchVideo();
        }
    }, [playback?.item?.id, playback?.is_playing]);

    if (!videoUrl) return null;

    return (
        <div className="hidden">
            <Player
                url={videoUrl}
                playing={isPlaying}
                volume={volume}
                onProgress={onProgress}
                onEnded={onEnded}
                width="0"
                height="0"
                config={{
                    youtube: {
                        playerVars: { showinfo: 0, controls: 0, autoplay: 1 }
                    } as any
                }}
            />
        </div>
    );
};

export default YouTubePlayer;
