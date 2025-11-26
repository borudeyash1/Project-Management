import { useState, useEffect } from 'react';

export const useTour = (tourKey: string) => {
    const [isTourOpen, setIsTourOpen] = useState(false);

    useEffect(() => {
        // Check if tour has been completed
        const isCompleted = localStorage.getItem(`tour-${tourKey}-completed`);

        // Only show tour if not completed and user is new (optional)
        if (!isCompleted) {
            // Delay tour start slightly for better UX
            const timer = setTimeout(() => {
                setIsTourOpen(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [tourKey]);

    const startTour = () => {
        setIsTourOpen(true);
    };

    const closeTour = () => {
        setIsTourOpen(false);
    };

    const resetTour = () => {
        localStorage.removeItem(`tour-${tourKey}-completed`);
        setIsTourOpen(true);
    };

    return {
        isTourOpen,
        startTour,
        closeTour,
        resetTour
    };
};
