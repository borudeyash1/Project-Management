/**
 * Audio Capture Logic for Meeting Notes
 * Handles microphone and system audio capture with stream merging
 */

export interface AudioStreams {
    micStream: MediaStream | null;
    systemStream: MediaStream | null;
    combinedStream: MediaStream | null;
}

export class AudioCaptureManager {
    private audioContext: AudioContext | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];
    private streams: AudioStreams = {
        micStream: null,
        systemStream: null,
        combinedStream: null,
    };

    /**
     * Initialize microphone stream
     */
    async initializeMicrophoneStream(): Promise<MediaStream> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            this.streams.micStream = stream;
            console.log('✅ Microphone stream initialized');
            return stream;
        } catch (error: any) {
            console.error('❌ Failed to initialize microphone:', error);

            if (error.name === 'NotAllowedError') {
                throw new Error('Microphone permission denied. Please allow microphone access to record meetings.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No microphone found. Please connect a microphone and try again.');
            } else {
                throw new Error('Failed to access microphone. Please check your device settings.');
            }
        }
    }

    /**
     * Initialize system audio stream via screen/tab sharing
     */
    async initializeSystemAudioStream(): Promise<MediaStream> {
        try {
            // Request display media with audio
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true, // Required for getDisplayMedia
                audio: true, // This captures system audio
            });

            // Remove video track (we only need audio)
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => {
                track.stop();
                stream.removeTrack(track);
            });

            // Check if audio track is present
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('No audio track found in the shared content. Please ensure "Share audio" is checked when sharing.');
            }

            this.streams.systemStream = stream;
            console.log('✅ System audio stream initialized');
            return stream;
        } catch (error: any) {
            console.error('❌ Failed to initialize system audio:', error);

            if (error.name === 'NotAllowedError') {
                throw new Error('Screen sharing permission denied. System audio capture requires screen/tab sharing.');
            } else if (error.message?.includes('audio')) {
                throw new Error('No audio track detected. Please select "Share audio" when choosing what to share.');
            } else {
                throw new Error('Failed to capture system audio. Please try again.');
            }
        }
    }

    /**
     * Merge microphone and system audio streams using Web Audio API
     */
    mergeAudioStreams(micStream: MediaStream, systemStream?: MediaStream): MediaStream {
        try {
            // Create audio context
            this.audioContext = new AudioContext();

            // Create destination for merged audio
            const destination = this.audioContext.createMediaStreamDestination();

            // Connect microphone stream
            const micSource = this.audioContext.createMediaStreamSource(micStream);
            micSource.connect(destination);

            // Connect system audio stream if provided
            if (systemStream) {
                const systemSource = this.audioContext.createMediaStreamSource(systemStream);
                systemSource.connect(destination);
                console.log('✅ Merged microphone + system audio');
            } else {
                console.log('✅ Using microphone only');
            }

            this.streams.combinedStream = destination.stream;
            return destination.stream;
        } catch (error) {
            console.error('❌ Failed to merge audio streams:', error);
            throw new Error('Failed to merge audio streams. Using microphone only.');
        }
    }

    /**
     * Start recording the combined audio stream
     */
    startRecording(stream: MediaStream, onDataAvailable?: (blob: Blob) => void): void {
        try {
            this.recordedChunks = [];

            // Create MediaRecorder
            const options: MediaRecorderOptions = {
                mimeType: 'audio/webm;codecs=opus',
            };

            // Fallback to other formats if webm is not supported
            if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
                options.mimeType = 'audio/webm';
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options.mimeType = 'audio/ogg;codecs=opus';
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        delete options.mimeType; // Use default
                    }
                }
            }

            this.mediaRecorder = new MediaRecorder(stream, options);

            // Handle data available event
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                    if (onDataAvailable) {
                        onDataAvailable(event.data);
                    }
                }
            };

            // Start recording
            this.mediaRecorder.start(1000); // Collect data every second
            console.log('🎙️ Recording started');
        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            throw new Error('Failed to start recording. Please try again.');
        }
    }

    /**
     * Stop recording and return the recorded audio blob
     */
    async stopRecording(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('No active recording'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, {
                    type: this.mediaRecorder?.mimeType || 'audio/webm',
                });
                console.log('⏹️ Recording stopped, blob size:', blob.size);
                resolve(blob);
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Cleanup all streams and resources
     */
    cleanup(): void {
        // Stop all tracks
        if (this.streams.micStream) {
            this.streams.micStream.getTracks().forEach(track => track.stop());
            this.streams.micStream = null;
        }

        if (this.streams.systemStream) {
            this.streams.systemStream.getTracks().forEach(track => track.stop());
            this.streams.systemStream = null;
        }

        if (this.streams.combinedStream) {
            this.streams.combinedStream.getTracks().forEach(track => track.stop());
            this.streams.combinedStream = null;
        }

        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        // Clear recorder
        this.mediaRecorder = null;
        this.recordedChunks = [];

        console.log('🧹 Audio capture cleaned up');
    }

    /**
     * Get the current recording state
     */
    getRecordingState(): RecordingState {
        return this.mediaRecorder?.state || 'inactive';
    }

    /**
     * Check if browser supports required APIs
     */
    static checkBrowserSupport(): BrowserSupport {
        const support: BrowserSupport = {
            mediaDevices: !!navigator.mediaDevices,
            getUserMedia: !!navigator.mediaDevices?.getUserMedia,
            getDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia,
            mediaRecorder: !!window.MediaRecorder,
            audioContext: !!(window.AudioContext || (window as any).webkitAudioContext),
        };

        return support;
    }
}

// Types
export type RecordingState = 'inactive' | 'recording' | 'paused';

export interface BrowserSupport {
    mediaDevices: boolean;
    getUserMedia: boolean;
    getDisplayMedia: boolean;
    mediaRecorder: boolean;
    audioContext: boolean;
}

// Export singleton instance
export const audioCaptureManager = new AudioCaptureManager();
export default AudioCaptureManager;
