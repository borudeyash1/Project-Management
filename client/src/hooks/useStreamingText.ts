import { useState, useEffect, useRef } from 'react';

interface UseStreamingTextOptions {
    speed?: number; // milliseconds per character
    onComplete?: () => void;
}

interface UseStreamingTextReturn {
    displayedText: string;
    isStreaming: boolean;
    startStreaming: (text: string) => void;
    skipToEnd: () => void;
    reset: () => void;
}

/**
 * Custom hook for ChatGPT-style streaming text animation
 * Displays text character-by-character with a typewriter effect
 */
export const useStreamingText = (
    options: UseStreamingTextOptions = {}
): UseStreamingTextReturn => {
    const { speed = 20, onComplete } = options;

    const [displayedText, setDisplayedText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [fullText, setFullText] = useState('');

    const currentIndexRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startStreaming = (text: string) => {
        cleanup();
        setFullText(text);
        setDisplayedText('');
        setIsStreaming(true);
        currentIndexRef.current = 0;
    };

    const skipToEnd = () => {
        cleanup();
        setDisplayedText(fullText);
        setIsStreaming(false);
        currentIndexRef.current = fullText.length;
        onComplete?.();
    };

    const reset = () => {
        cleanup();
        setDisplayedText('');
        setFullText('');
        setIsStreaming(false);
        currentIndexRef.current = 0;
    };

    useEffect(() => {
        if (!isStreaming || !fullText) return;

        intervalRef.current = setInterval(() => {
            if (currentIndexRef.current < fullText.length) {
                currentIndexRef.current++;
                setDisplayedText(fullText.substring(0, currentIndexRef.current));
            } else {
                cleanup();
                setIsStreaming(false);
                onComplete?.();
            }
        }, speed);

        return cleanup;
    }, [isStreaming, fullText, speed, onComplete]);

    return {
        displayedText,
        isStreaming,
        startStreaming,
        skipToEnd,
        reset
    };
};
