import React from 'react';
import { Download, Monitor, HardDrive, Cpu, Hash } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface DownloadAppWidgetProps {
    release?: {
        _id?: string;
        version: string;
        versionName?: string;
        platform: string;
        architecture?: string;
        downloadUrl: string;
        releaseNotes?: string;
        fileSize?: number;
        downloadCount?: number;
    } | null;
}

const DownloadAppWidget: React.FC<DownloadAppWidgetProps> = ({ release }) => {
    const { isDarkMode, preferences } = useTheme();
    const { t } = useTranslation();
    const accentColor = preferences.accentColor || '#3b82f6';

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    return (
        <div className={`rounded-2xl border p-6 overflow-hidden relative ${isDarkMode
            ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 border-gray-700'
            : 'border-gray-200'
            }`}
            style={!isDarkMode ? { background: `linear-gradient(135deg, #ffffff 60%, ${accentColor}15 100%)` } : undefined}
        >
            <div className="flex flex-col relative z-10 h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {t('home.sartthiDesktop')}
                            </h3>
                            {release?.versionName && (
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {release.versionName}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            {release && (
                                <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full bg-white/20">
                                    v{release.version}
                                </span>
                            )}
                        </div>
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

                {release && (
                    <div className={`grid grid-cols-2 gap-3 mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-black/20' : 'bg-white/50'} flex items-center gap-2`}>
                            <Monitor className="w-4 h-4 opacity-70" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase opacity-70">Platform</span>
                                <span className="text-xs font-semibold capitalize">{release.platform}</span>
                            </div>
                        </div>
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-black/20' : 'bg-white/50'} flex items-center gap-2`}>
                            <Cpu className="w-4 h-4 opacity-70" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase opacity-70">Arch</span>
                                <span className="text-xs font-semibold">{release.architecture || 'x64'}</span>
                            </div>
                        </div>
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-black/20' : 'bg-white/50'} flex items-center gap-2`}>
                            <HardDrive className="w-4 h-4 opacity-70" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase opacity-70">Size</span>
                                <span className="text-xs font-semibold">{formatFileSize(release.fileSize)}</span>
                            </div>
                        </div>
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-black/20' : 'bg-white/50'} flex items-center gap-2`}>
                            <Download className="w-4 h-4 opacity-70" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase opacity-70">Downloads</span>
                                <span className="text-xs font-semibold">{release.downloadCount || 0}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-auto">
                    {release?.downloadUrl ? (
                        <div className="flex flex-col gap-2">
                            <a
                                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/releases/${release['_id']}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] border shadow-lg ${isDarkMode
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 border-transparent'
                                    : 'text-gray-900 border-gray-200/50'
                                    }`}
                                style={!isDarkMode ? { background: `linear-gradient(135deg, #ffffff 40%, ${accentColor}15 100%)` } : undefined}
                            >
                                <Download className="w-4 h-4" />
                                {t('home.downloadNow')}
                            </a>
                        </div>
                    ) : (
                        <button className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-[1.02] border ${isDarkMode
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 border-transparent'
                            : 'text-gray-900 border-gray-200/50'
                            }`}
                            style={!isDarkMode ? { background: `linear-gradient(135deg, #ffffff 40%, ${accentColor}15 100%)` } : undefined}
                        >
                            <Download className="w-4 h-4" />
                            {t('home.downloadNow')}
                        </button>
                    )}
                    {release?.fileSize && (
                        <div className={`mt-3 text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center bg-yellow-500/10 rounded-lg p-2 border border-yellow-500/20`}>
                            <p className="font-semibold text-yellow-600 dark:text-yellow-500 mb-0.5">Note on Download:</p>
                            Google Drive may show a "virus scan warning" for files &gt;100MB. This is normal; the file is safe.
                        </div>
                    )}
                </div>
            </div>

            {/* Decorative circles */}
            <div className={`absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl ${isDarkMode ? 'bg-white/5' : ''}`}
                style={!isDarkMode ? { backgroundColor: `${accentColor}10` } : undefined}
            ></div>
            <div className={`absolute top-0 right-1/2 w-32 h-32 rounded-full blur-3xl ${isDarkMode ? 'bg-purple-500/10' : ''}`}
                style={!isDarkMode ? { backgroundColor: `${accentColor}05` } : undefined}
            ></div>
        </div>
    );
};

export default DownloadAppWidget;
