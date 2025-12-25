import React from 'react';

interface GlassmorphicCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
    hoverEffect?: boolean;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
    children,
    className = '',
    onClick,
    hover = false,
    hoverEffect = false
}) => {
    const baseClasses = `
        backdrop-blur-xl 
        bg-white/70 dark:bg-gray-800/70 
        rounded-2xl 
        border border-gray-300/60 dark:border-gray-700/70 
        ${hover || hoverEffect ? 'transition-all duration-300 hover:scale-[1.02]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
    `;

    return (
        <div
            className={`${baseClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default GlassmorphicCard;
