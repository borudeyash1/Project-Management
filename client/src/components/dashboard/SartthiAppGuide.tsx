import React, { useState } from 'react';
import { Mail, Calendar as CalendarIcon, HardDrive, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { getAppUrl } from '../../utils/appUrls';

interface SartthiAppGuideProps {
    service: 'mail' | 'calendar' | 'vault';
    isOpen: boolean;
    onClose: () => void;
}

const SartthiAppGuide: React.FC<SartthiAppGuideProps> = ({ service, isOpen, onClose }) => {
    const { t } = useTranslation();
    const { isDarkMode } = useTheme();

    const appConfig = {
        mail: {
            icon: <Mail className="w-12 h-12" />,
            title: 'Sartthi Mail',
            description: 'Your secure file storage powered by Google Drive. Store files in a dedicated "Sartthi Vault" folder with complete privacy.',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
            features: [
                'Dedicated Google Drive folder',
                'Your personal files stay private',
                'Upload and organize files',
                'Secure file management',
                'You control your data'
            ],
            privacyNote: '🔒 Privacy First: We only access files in your "Sartthi Mail" folder. Your personal files remain completely private.',
            port: 3001
        },
        calendar: {
            icon: <CalendarIcon className="w-12 h-12" />,
            title: 'Sartthi Calendar',
            description: 'Your secure calendar powered by Google Calendar. Manage events in a dedicated calendar with complete privacy.',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
            features: [
                'Dedicated Google Calendar',
                'Your personal events stay private',
                'Create and manage events',
                'Sync with your workflow',
                'You control your data'
            ],
            privacyNote: '🔒 Privacy First: We only access events in your "Sartthi Calendar". Your personal calendar remains completely private.',
            port: 3002
        },
        vault: {
            icon: <HardDrive className="w-12 h-12" />,
            title: 'Sartthi Vault',
            description: 'Your secure file storage powered by Google Drive. Store files in a dedicated "Sartthi Vault" folder with complete privacy.',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
            features: [
                'Dedicated Google Drive folder',
                'Your personal files stay private',
                'Upload and organize files',
                'Secure file management',
                'You control your data'
            ],
            privacyNote: '🔒 Privacy First: We only access files in your "Sartthi Vault" folder. Your personal files remain completely private.',
            port: 3003
        }
    };

    const config = appConfig[service];

    const handleConnect = () => {
        const token = localStorage.getItem('accessToken');
        const appUrl = getAppUrl(service);
        window.location.href = `${appUrl}/api/auth/sartthi/connect-${service}?token=${encodeURIComponent(token || '')}`;
    };

    const handleOpenApp = () => {
        const token = localStorage.getItem('accessToken');
        const appUrl = getAppUrl(service);
        if (token) {
            const separator = appUrl.includes('?') ? '&' : '?';
            window.open(`${appUrl}${separator}token=${encodeURIComponent(token)}`, '_blank');
        } else {
            window.open(appUrl, '_blank');
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`relative w-full max-w-md mx-4 rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
                {/* Header with gradient */}
                <div className={`${config.bgColor} p-6 text-white relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            {config.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{config.title}</h2>
                            <p className="text-white/80 text-sm">Not connected yet</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                    <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {config.description}
                    </p>

                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">Features</h3>
                        <ul className="space-y-2">
                            {config.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">•</span>
                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                            {config.privacyNote}
                        </p>
                    </div>

                    {/* Action Button */}
                    <div>
                        <button
                            onClick={handleOpenApp}
                            className={`w-full py-3 rounded-xl font-medium text-white transition-all ${config.bgColor} hover:shadow-lg`}
                        >
                            Open App
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SartthiAppGuide;
