import React from 'react';
import { Download, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const DownloadAppWidget: React.FC = () => {
    const { isDarkMode, preferences } = useTheme();
    const { t } = useTranslation();
    const accentColor = preferences.accentColor || '#3b82f6';

    return (
        <div className={`rounded-2xl border p-6 overflow-hidden relative ${isDarkMode
            ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 border-gray-700'
            : 'border-gray-200'
            }`}
            style={!isDarkMode ? { background: `linear-gradient(135deg, #ffffff 60%, ${accentColor}15 100%)` } : undefined}
        >
            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1 pr-4">
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('home.sartthiDesktop')}
                    </h3>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                        {t('home.downloadSartthiDesktop')}
                    </p>
                    <button className={`px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 border ${isDarkMode
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600-500/50 border-transparent'
                        : 'text-gray-900 border-gray-200/50'
                        }`}
                        style={!isDarkMode ? { background: `linear-gradient(135deg, #ffffff 20%, ${accentColor}15 100%)` } : undefined}
                    >
                        {t('home.downloadNow')}
                    </button>
                </div>
                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/10' : ''}`}
                    style={!isDarkMode ? { backgroundColor: `${accentColor}15` } : undefined}
                >
                    <Monitor
                        className={`w-8 h-8 ${isDarkMode ? 'text-indigo-300' : ''}`}
                        style={{ color: isDarkMode ? undefined : accentColor }}
                    />
                </div>
            </div>

            {/* Decorative circles */}
            <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl ${isDarkMode ? 'bg-white/10' : ''}`}
                style={!isDarkMode ? { backgroundColor: `${accentColor}10` } : undefined}
            ></div>
            <div className={`absolute top-0 right-1/2 w-32 h-32 rounded-full blur-3xl ${isDarkMode ? 'bg-purple-500/20' : ''}`}
                style={!isDarkMode ? { backgroundColor: `${accentColor}05` } : undefined}
            ></div>
        </div>
    );
};

export default DownloadAppWidget;
