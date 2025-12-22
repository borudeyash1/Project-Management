/* eslint-disable no-restricted-globals */
import { pipeline, env } from '@xenova/transformers';

// Configure environment
env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * Singleton class for Whisper transcription pipeline
 * Ensures the model is loaded only once and reused
 */
class WhisperPipeline {
    static task = 'automatic-speech-recognition' as const;
    static model = 'Xenova/whisper-base.en'; // Upgraded from tiny for better accuracy
    static instance: any = null;

    /**
     * Get or create the pipeline instance
     * @param {Function} progress_callback - Called with download progress
     */
    static async getInstance(progress_callback?: Function) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task as any, this.model, {
                ...(progress_callback && { progress_callback }),
                quantized: true, // Use quantized model for faster inference
            } as any);
        }
        return this.instance;
    }
}

/**
 * Message handler for the worker
 */
self.addEventListener('message', async (event) => {
    const { type, audio } = event.data;

    try {
        if (type === 'load') {
            // Load the model with progress updates
            await WhisperPipeline.getInstance((progress: any) => {
                // Send progress updates to main thread
                self.postMessage({
                    status: 'loading',
                    progress: progress,
                });
            });

            // Model loaded successfully
            self.postMessage({ status: 'ready' });

        } else if (type === 'generate') {
            // Get the transcriber instance
            const transcriber = await WhisperPipeline.getInstance();

            // Run inference on the audio with optimized parameters
            const output = await transcriber(audio, {
                language: 'english',
                task: 'transcribe',
                return_timestamps: false,
                chunk_length_s: 30, // Process in 30-second chunks
                stride_length_s: 5,  // 5-second overlap for better continuity
            });

            // Send the transcription result back
            self.postMessage({
                status: 'complete',
                output: output,
            });

        } else {
            throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        // Send error back to main thread
        self.postMessage({
            status: 'error',
            error: (error as Error).message,
        });
    }
});

// Log when worker is initialized
console.log('🎤 Whisper Worker initialized');
