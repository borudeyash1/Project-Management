import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWhisperReturn {
    isModelLoading: boolean;
    loadingProgress: number;
    isRecording: boolean;
    transcript: string;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    isWhisperMode: boolean;
}

export const useWhisper = (): UseWhisperReturn => {
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isWhisperMode, setIsWhisperMode] = useState(false);

    const workerRef = useRef<Worker | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioBufferRef = useRef<Float32Array[]>([]);
    const lastProcessTimeRef = useRef<number>(0);

    // Initialize worker on mount
    useEffect(() => {
        try {
            const worker = new Worker(
                new URL('../workers/whisper.worker.ts', import.meta.url),
                { type: 'module' }
            );

            workerRef.current = worker;
            const fileProgress = new Map<string, number>();

            worker.onmessage = (event) => {
                const { status, progress, output, error: workerError } = event.data;

                if (status === 'loading') {
                    if (progress?.file) {
                        fileProgress.set(progress.file, progress.progress || 0);
                        const values = Array.from(fileProgress.values());
                        const avgProgress = values.reduce((a, b) => a + b, 0) / values.length;
                        setLoadingProgress(Math.min(Math.round(avgProgress * 100), 99));
                    }
                } else if (status === 'ready') {
                    setIsModelLoading(false);
                    setLoadingProgress(100);
                    console.log('✅ Whisper model loaded (fallback ready)');
                } else if (status === 'complete') {
                    const newText = output?.text || '';
                    if (newText.trim()) {
                        setTranscript((prev) => prev + ' ' + newText.trim());
                        console.log('📝 Whisper transcription:', newText);
                    }
                } else if (status === 'error') {
                    setError(workerError);
                    console.error('❌ Worker error:', workerError);
                }
            };

            worker.onerror = (err) => {
                setError('Worker error: ' + err.message);
                console.error('❌ Worker error:', err);
            };

            // Load the model in background
            worker.postMessage({ type: 'load' });

            return () => {
                worker.terminate();
            };
        } catch (err: any) {
            setError('Failed to initialize worker: ' + err.message);
            setIsModelLoading(false);
        }
    }, []);

    const processAudioBuffer = useCallback(() => {
        if (audioBufferRef.current.length === 0 || !workerRef.current) return;

        const totalLength = audioBufferRef.current.reduce((acc, arr) => acc + arr.length, 0);
        const combinedAudio = new Float32Array(totalLength);
        let offset = 0;
        for (const buffer of audioBufferRef.current) {
            combinedAudio.set(buffer, offset);
            offset += buffer.length;
        }

        workerRef.current.postMessage({
            type: 'generate',
            audio: combinedAudio,
        });

        audioBufferRef.current = [];
    }, []);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setTranscript('');
            setIsWhisperMode(true);
            audioBufferRef.current = [];
            lastProcessTimeRef.current = Date.now();

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000,
                },
            });

            streamRef.current = stream;

            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const audioData = new Float32Array(inputData);
                audioBufferRef.current.push(audioData);

                // Process every 1 second for faster response
                const now = Date.now();
                if (now - lastProcessTimeRef.current >= 1000) {
                    processAudioBuffer();
                    lastProcessTimeRef.current = now;
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsRecording(true);
            console.log('🎤 Whisper recording started (1-second chunks)');
        } catch (err: any) {
            setError(err.message || 'Failed to start recording');
            console.error('❌ Recording error:', err);
        }
    }, [processAudioBuffer]);

    const stopRecording = useCallback(() => {
        if (audioBufferRef.current.length > 0) {
            processAudioBuffer();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        setIsRecording(false);
        console.log('⏹️ Recording stopped');
    }, [processAudioBuffer]);

    useEffect(() => {
        return () => {
            if (isRecording) {
                stopRecording();
            }
        };
    }, [isRecording, stopRecording]);

    return {
        isModelLoading,
        loadingProgress,
        isRecording,
        transcript,
        error,
        startRecording,
        stopRecording,
        isWhisperMode,
    };
};
