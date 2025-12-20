import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Sparkles, AlertCircle, Download, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWhisper } from '../../hooks/useWhisper';
import AudioCaptureManager from './AudioCaptureLogic';
import AIResultDisplay from './AIResultDisplay';

// Declare SpeechRecognition types
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface MeetingRecorderProps {
    onTranscriptChange?: (transcript: string) => void;
    manualNotes?: string;
    onManualNotesChange?: (notes: string) => void;
}

interface MeetingAnalysis {
    summary: string;
    agendaItems: string[];
    decisions: string[];
    actionItems: Array<{
        task: string;
        assignee: string;
        priority: 'High' | 'Medium' | 'Low';
    }>;
}

const MeetingRecorder: React.FC<MeetingRecorderProps> = ({
    onTranscriptChange,
    manualNotes = '',
    onManualNotesChange
}) => {
    const { isDarkMode, preferences } = useTheme();

    // Whisper hook (fallback mode)
    const whisper = useWhisper();

    // State
    const [useWebSpeech, setUseWebSpeech] = useState(true);
    const [webSpeechFailed, setWebSpeechFailed] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiResult, setAiResult] = useState<MeetingAnalysis | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [includeSystemAudio, setIncludeSystemAudio] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for Web Speech API
    const recognitionRef = useRef<any>(null);
    const audioCaptureRef = useRef<AudioCaptureManager | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const isRecordingRef = useRef(false);
    const webSpeechAttempts = useRef(0);

    // Sync Whisper transcript
    useEffect(() => {
        if (!useWebSpeech && whisper.transcript) {
            setTranscript(whisper.transcript);
        }
    }, [whisper.transcript, useWebSpeech]);

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    // Update parent
    useEffect(() => {
        if (onTranscriptChange && transcript) {
            onTranscriptChange(transcript);
        }
    }, [transcript, onTranscriptChange]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (audioCaptureRef.current) {
                audioCaptureRef.current.cleanup();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Start with Web Speech API, fallback to Whisper
    const startRecording = async () => {
        try {
            setError(null);
            setTranscript('');
            setAiResult(null);
            setRecordingDuration(0);
            isRecordingRef.current = true;

            // Only start audio capture if system audio is needed
            if (includeSystemAudio) {
                audioCaptureRef.current = new AudioCaptureManager();
                const micStream = await audioCaptureRef.current.initializeMicrophoneStream();

                try {
                    const systemStream = await audioCaptureRef.current.initializeSystemAudioStream();
                    const combinedStream = audioCaptureRef.current.mergeAudioStreams(micStream, systemStream);
                    audioCaptureRef.current.startRecording(combinedStream);
                } catch (err: any) {
                    console.warn('⚠️ System audio failed:', err.message);
                }
            }

            // Try Web Speech API first
            if (useWebSpeech && !webSpeechFailed) {
                try {
                    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                    recognitionRef.current = new SpeechRecognition();
                    recognitionRef.current.continuous = true;
                    recognitionRef.current.interimResults = true;
                    recognitionRef.current.lang = 'en-US';

                    let finalTranscript = '';

                    recognitionRef.current.onresult = (event: any) => {
                        let interimTranscript = '';
                        for (let i = event.resultIndex; i < event.results.length; i++) {
                            const text = event.results[i][0].transcript;
                            if (event.results[i].isFinal) {
                                finalTranscript += text + ' ';
                            } else {
                                interimTranscript += text;
                            }
                        }
                        setTranscript(finalTranscript + interimTranscript);
                    };

                    recognitionRef.current.onerror = (event: any) => {
                        if (event.error === 'network') {
                            webSpeechAttempts.current++;
                            if (webSpeechAttempts.current >= 2) {
                                console.log('🔄 Web Speech failed, switching to Whisper...');
                                setWebSpeechFailed(true);
                                setUseWebSpeech(false);
                                recognitionRef.current?.stop();
                                recognitionRef.current = null;
                                // Start Whisper
                                whisper.startRecording();
                                setError('Switched to offline mode (Whisper) - transcription every 1 second');
                            }
                        } else if (event.error === 'no-speech') {
                            setTimeout(() => {
                                if (isRecordingRef.current && recognitionRef.current) {
                                    try {
                                        recognitionRef.current.start();
                                    } catch (e) { }
                                }
                            }, 100);
                        }
                    };

                    recognitionRef.current.onend = () => {
                        if (isRecordingRef.current && recognitionRef.current) {
                            setTimeout(() => {
                                try {
                                    recognitionRef.current?.start();
                                } catch (e) { }
                            }, 100);
                        }
                    };

                    recognitionRef.current.start();
                    console.log('🎤 Web Speech API started (real-time)');
                } catch (err) {
                    console.log('Web Speech failed, using Whisper');
                    setUseWebSpeech(false);
                    await whisper.startRecording();
                }
            } else {
                // Use Whisper directly
                await whisper.startRecording();
            }

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);

            setIsRecording(true);
        } catch (err: any) {
            console.error('❌ Failed to start:', err);
            setError(err.message);
            isRecordingRef.current = false;
        }
    };

    const stopRecording = () => {
        isRecordingRef.current = false;

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        if (whisper.isRecording) {
            whisper.stopRecording();
        }

        // Only stop if it was started
        if (audioCaptureRef.current) {
            try {
                audioCaptureRef.current.stopRecording();
                audioCaptureRef.current.cleanup();
            } catch (err) {
                console.log('Audio capture already stopped');
            }
            audioCaptureRef.current = null;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsRecording(false);
    };

    const processWithAI = async () => {
        if (!transcript.trim()) {
            setError('No transcript to process');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/meeting-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: transcript.trim() }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to process');
            }

            setAiResult(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Show model loading
    if (whisper.isModelLoading) {
        return (
            <div className={`p-8 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-lg'
                }`}>
                <div className="flex flex-col items-center justify-center py-12">
                    <Download className={`w-16 h-16 mb-4 animate-bounce ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Loading Offline Speech Model
                    </h3>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        First-time: ~140MB (fallback for when Web Speech fails)
                    </p>
                    <div className="w-full max-w-md">
                        <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                                className="h-full transition-all duration-300"
                                style={{
                                    width: `${whisper.loadingProgress}%`,
                                    background: `linear-gradient(90deg, ${preferences.accentColor} 0%, ${preferences.accentColor}dd 100%)`,
                                }}
                            />
                        </div>
                        <p className={`text-center mt-2 text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {whisper.loadingProgress}%
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                {/* Controls */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-lg'
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            {!isRecording ? (
                                <button
                                    onClick={startRecording}
                                    style={{
                                        background: `linear-gradient(135deg, ${preferences.accentColor} 0%, ${preferences.accentColor}dd 100%)`,
                                    }}
                                    className="p-4 rounded-full text-white hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <Mic className="w-6 h-6" />
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg"
                                >
                                    <Square className="w-6 h-6" />
                                </button>
                            )}

                            <div>
                                <div className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {isRecording ? 'Recording...' : 'Ready'}
                                    {!useWebSpeech && <Zap className="w-4 h-4 text-yellow-500" title="Offline mode" />}
                                </div>
                                <div className={`text-2xl font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {formatDuration(recordingDuration)}
                                </div>
                            </div>
                        </div>

                        {!isRecording && transcript && (
                            <button
                                onClick={processWithAI}
                                disabled={isProcessing}
                                style={{
                                    background: `linear-gradient(135deg, ${preferences.accentColor} 0%, ${preferences.accentColor}dd 100%)`,
                                }}
                                className="px-6 py-3 text-white rounded-xl hover:opacity-90 transition-all shadow-lg font-semibold flex items-center disabled:opacity-50"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Process with AI
                            </button>
                        )}
                    </div>

                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeSystemAudio}
                            onChange={(e) => setIncludeSystemAudio(e.target.checked)}
                            disabled={isRecording}
                            className="mr-3 h-4 w-4 rounded cursor-pointer"
                            style={{ accentColor: preferences.accentColor }}
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Include System Audio
                        </span>
                    </label>
                </div>

                {error && (
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                        }`}>
                        <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                            {error}
                        </p>
                    </div>
                )}

                {/* Live Transcript */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-lg'
                    }`}>
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Live Transcript {!useWebSpeech && '(Offline Mode)'}
                    </h3>
                    <div className={`h-64 overflow-y-auto p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                        {transcript ? (
                            <>
                                <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transcript}
                                </p>
                                <div ref={transcriptEndRef} />
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className={`mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {isRecording ? (
                                        <>
                                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                                            Listening... {useWebSpeech ? '(Real-time)' : '(1-second updates)'}
                                        </>
                                    ) : (
                                        'Start recording'
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manual Notes */}
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-lg'
                    }`}>
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Manual Notes
                    </h3>
                    <textarea
                        value={manualNotes}
                        onChange={(e) => onManualNotesChange?.(e.target.value)}
                        placeholder="Type additional notes..."
                        className={`w-full h-32 p-4 rounded-lg border resize-none ${isDarkMode
                            ? 'bg-gray-900/50 border-gray-700 text-gray-300 placeholder-gray-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                            }`}
                    />
                </div>
            </div>

            <div>
                <AIResultDisplay result={aiResult} isProcessing={isProcessing} />
            </div>
        </div>
    );
};

export default MeetingRecorder;
