import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Hash, MessageSquare, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { slackService, SlackChannel } from '../../services/slackService';
import { useApp } from '../../context/AppContext';
import { SlackLogo } from '../icons/BrandLogos';

export const toggleSlackWidget = () => {
    window.dispatchEvent(new CustomEvent('TOGGLE_SLACK_WIDGET'));
};

const SlackWidget: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState<SlackChannel[]>([]);
    const [loading, setLoading] = useState(false);
    const widgetRef = useRef<HTMLDivElement>(null);

    const slackConnected = !!state.userProfile?.connectedAccounts?.slack?.isActive;

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('TOGGLE_SLACK_WIDGET', handleToggle);

        const handleClickOutside = (event: MouseEvent) => {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('TOGGLE_SLACK_WIDGET', handleToggle);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen && slackConnected) {
            fetchChannels();
        }
    }, [isOpen, slackConnected]);

    const fetchChannels = async () => {
        setLoading(true);
        try {
            const data = await slackService.getChannels();
            setChannels(data);
        } catch (error) {
            console.error('Failed to fetch Slack channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChannelClick = (channelId: string) => {
        if (state.currentWorkspace) {
            navigate(`/workspace/${state.currentWorkspace}/slack`);
            setIsOpen(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={widgetRef}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-24 right-6 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden flex flex-col max-h-[600px]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-[#3F0E40] text-white">
                        <div className="flex items-center gap-2">
                            <SlackLogo className="w-5 h-5 text-white" />
                            <h3 className="font-semibold">Slack</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {!slackConnected ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Connect Slack to see your channels here.
                                </p>
                                <button
                                    onClick={() => {
                                        navigate('/profile?tab=integrations');
                                        setIsOpen(false);
                                    }}
                                    className="px-4 py-2 bg-[#3F0E40] text-white rounded-lg hover:bg-[#5d2c5d] transition-colors text-sm font-medium"
                                >
                                    Connect Slack
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="flex justify-center py-8">
                                <Loader className="w-6 h-6 animate-spin text-[#3F0E40]" />
                            </div>
                        ) : channels.length > 0 ? (
                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                                    Channels
                                </h4>
                                {channels.map(channel => (
                                    <button
                                        key={channel.id}
                                        onClick={() => handleChannelClick(channel.id)}
                                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                                            <Hash className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {channel.name}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                Open channel <ExternalLink className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No channels found
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SlackWidget;
