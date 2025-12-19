import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface GlassmorphicPageHeaderProps {
    icon: React.ElementType;
    iconGradient?: string; // Optional, will use accent color if not provided
    title: string;
    subtitle: string;
    decorativeGradients?: {
        topRight: string;
        bottomLeft: string;
    };
    className?: string;
}

const GlassmorphicPageHeader: React.FC<GlassmorphicPageHeaderProps & { children?: React.ReactNode }> = ({
    icon: Icon,
    iconGradient,
    title,
    subtitle,
    decorativeGradients,
    className = '',
    children
}) => {
    const { isDarkMode, preferences } = useTheme();
    const accentColor = preferences.accentColor;

    // Convert hex accent color to RGB for gradient opacity
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 251, g: 191, b: 36 }; // Default yellow
    };

    const rgb = hexToRgb(accentColor);
    const accentRgb = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

    // Use accent color for decorative gradients if not provided
    const defaultDecorative = {
        topRight: `rgba(${accentRgb}, 0.2)`,
        bottomLeft: `rgba(${accentRgb}, 0.15)`
    };

    return (
        <div className={`relative overflow-hidden rounded-3xl p-8 mb-8 ${isDarkMode
            ? 'bg-gradient-to-br from-gray-800/50 via-gray-700/50 to-gray-800/50 border border-white/10 backdrop-blur-xl'
            : 'bg-gradient-to-br from-white/80 via-gray-50/80 to-white/80 border border-white/50 backdrop-blur-xl shadow-2xl'
            } ${className}`}>
            {/* Decorative blur orbs using accent color */}
            <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -mr-48 -mt-48"
                style={{ background: `radial-gradient(circle, ${decorativeGradients?.topRight || defaultDecorative.topRight} 0%, transparent 70%)` }}
            />
            <div
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl -ml-48 -mb-48"
                style={{ background: `radial-gradient(circle, ${decorativeGradients?.bottomLeft || defaultDecorative.bottomLeft} 0%, transparent 70%)` }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div
                        className="p-3 rounded-2xl shadow-lg"
                        style={{
                            background: iconGradient || `linear-gradient(135deg, ${accentColor} 0%, rgba(${accentRgb}, 0.7) 100%)`
                        }}
                    >
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {title}
                        </h1>
                        <p className={`text-base md:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>
                    </div>
                </div>

                {/* Actions/Children */}
                {children && (
                    <div className="flex items-center gap-3">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlassmorphicPageHeader;
