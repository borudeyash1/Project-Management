import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Hash, MessageSquare, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { slackService, SlackChannel, SlackMessage } from '../../services/slackService';
import { useApp } from '../../context/AppContext';
import { SlackLogo } from '../icons/BrandLogos';

export const toggleSlackWidget = () => {
    window.dispatchEvent(new CustomEvent('TOGGLE_SLACK_WIDGET'));
};

interface ChannelWithMessages extends SlackChannel {
    recentMessages?: SlackMessage[];
    loading?: boolean;
}

const SlackWidget: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState<ChannelWithMessages[]>([]);
    const [loading, setLoading] = useState(false);
    const widgetRef = useRef<HTMLDivElement>(null);

    const slackConnected = !!state.userProfile?.connectedAccounts?.slack?.activeAccountId;

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
            fetchChannelsWithMessages();
        }
    }, [isOpen, slackConnected]);

    const fetchChannelsWithMessages = async () => {
        setLoading(true);
        try {
            const channelData = await slackService.getChannels();
            const channelsWithMessages: ChannelWithMessages[] = channelData.map(ch => ({
                ...ch,
                recentMessages: [],
                loading: true
            }));
            setChannels(channelsWithMessages);

            // Fetch messages for each channel
            for (let i = 0; i < channelsWithMessages.length; i++) {
                const channel = channelsWithMessages[i];
                try {
                    const messages = await slackService.getChannelMessages(channel.id);
                    // Get last 2 messages
                    const recentMessages = messages.slice(-2);
                    setChannels(prev => prev.map(ch =>
                        ch.id === channel.id
                            ? { ...ch, recentMessages, loading: false }
                            : ch
                    ));
                } catch (error) {
                    console.error(`Failed to fetch messages for channel ${channel.id}:`, error);
                    setChannels(prev => prev.map(ch =>
                        ch.id === channel.id
                            ? { ...ch, loading: false }
                            : ch
                    ));
                }
            }
        } catch (error) {
            console.error('Failed to fetch Slack channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChannelClick = (channelId: string) => {
        if (state.currentWorkspace) {
            navigate(`/workspace/${state.currentWorkspace}/slack?channel=${channelId}`);
            setIsOpen(false);
        }
    };

    const formatTimestamp = (ts: string) => {
        const date = new Date(parseFloat(ts) * 1000);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
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
                    className="fixed bottom-24 right-6 w-[420px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden flex flex-col max-h-[600px]"
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
                            <div className="space-y-3">
                                {channels.map(channel => (
                                    <div
                                        key={channel.id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-[#3F0E40] dark:hover:border-[#5d2c5d] transition-colors"
                                    >
                                        {/* Channel Header */}
                                        <button
                                            onClick={() => handleChannelClick(channel.id)}
                                            className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                <Hash className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {channel.name}
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-400" />
                                        </button>

                                        {/* Recent Messages */}
                                        {channel.loading ? (
                                            <div className="p-3 flex items-center justify-center text-gray-400 text-xs">
                                                <Loader className="w-3 h-3 animate-spin mr-2" />
                                                Loading messages...
                                            </div>
                                        ) : channel.recentMessages && channel.recentMessages.length > 0 ? (
                                            <div className="bg-white dark:bg-gray-800">
                                                {channel.recentMessages.map((msg, idx) => (
                                                    <button
                                                        key={msg.ts}
                                                        onClick={() => handleChannelClick(channel.id)}
                                                        className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${idx > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-baseline gap-2 mb-0.5">
                                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                                                        {msg.user || 'Unknown'}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                                        {formatTimestamp(msg.ts)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                    {msg.text || '(No text)'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 text-center text-xs text-gray-400">
                                                No recent messages
                                            </div>
                                        )}
                                    </div>
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
