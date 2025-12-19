import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface GlassmorphicCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
    children,
    className = '',
    hoverEffect = false,
    onClick
}) => {
    const { isDarkMode } = useTheme();

    return (
        <div
            onClick={onClick}
            className={`rounded-2xl border ${isDarkMode
                ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                : 'bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-lg'
                } ${hoverEffect ? 'transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

export default GlassmorphicCard;
