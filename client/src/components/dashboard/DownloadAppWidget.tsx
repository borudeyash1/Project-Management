import React from 'react';
import { Download, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DownloadAppWidget: React.FC = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`rounded-2xl border p-6 overflow-hidden relative ${isDarkMode
            ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 border-gray-700'
            : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white border-transparent shadow-lg'
            }`}>
            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1 pr-4">
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                        Sartthi Desktop
                    </h3>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-200' : 'text-indigo-100'}`}>
                        Download Sartthi Desktop for efficient use and better performance.
                    </p>
                    <button className={`px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${isDarkMode
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/50'
                        : 'bg-white text-indigo-600 hover:bg-gray-50 shadow-md'
                        }`}>
                        Download Now
                    </button>
                </div>
                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/10' : 'bg-white/20'}`}>
                    <Monitor className={`w-8 h-8 ${isDarkMode ? 'text-indigo-300' : 'text-white'}`} />
                </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-0 right-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
    );
};

export default DownloadAppWidget;
