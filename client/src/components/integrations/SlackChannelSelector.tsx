import React, { useState, useEffect } from 'react';
import { Hash, Loader, Check, X } from 'lucide-react';
import { apiService } from '../../services/api';

interface SlackChannel {
    id: string;
    name: string;
    is_private: boolean;
}

interface SlackChannelSelectorProps {
    projectId: string;
    currentChannelId?: string;
    currentChannelName?: string;
    onSelect: (channelId: string, channelName: string) => void;
    canEdit: boolean;
}

const SlackChannelSelector: React.FC<SlackChannelSelectorProps> = ({
    projectId,
    currentChannelId,
    currentChannelName,
    onSelect,
    canEdit
}) => {
    const [channels, setChannels] = useState<SlackChannel[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<SlackChannel | null>(null);

    useEffect(() => {
        if (currentChannelId && currentChannelName) {
            setSelectedChannel({
                id: currentChannelId,
                name: currentChannelName,
                is_private: false
            });
        }
    }, [currentChannelId, currentChannelName]);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/slack/channels');
            if (response.success) {
                setChannels(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch Slack channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        if (canEdit) {
            setIsOpen(true);
            if (channels.length === 0) {
                fetchChannels();
            }
        }
    };

    const handleSelect = (channel: SlackChannel) => {
        setSelectedChannel(channel);
        onSelect(channel.id, channel.name);
        setIsOpen(false);
    };

    const handleRemove = () => {
        setSelectedChannel(null);
        onSelect('', '');
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slack Channel
            </label>

            {selectedChannel ? (
                <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{selectedChannel.name}</span>
                        {selectedChannel.is_private && (
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">Private</span>
                        )}
                    </div>
                    {canEdit && (
                        <button
                            onClick={handleRemove}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove channel"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ) : (
                <button
                    onClick={handleOpen}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {canEdit ? 'Select a Slack channel...' : 'No channel selected'}
                </button>
            )}

            {/* Channel Selector Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Select Slack Channel
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Channel List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader className="w-6 h-6 animate-spin text-indigo-600" />
                                </div>
                            ) : channels.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p>No Slack channels found.</p>
                                    <p className="text-sm mt-2">Make sure you've connected your Slack account in Settings.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {channels.map((channel) => (
                                        <button
                                            key={channel.id}
                                            onClick={() => handleSelect(channel)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                                        >
                                            <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="flex-1 text-gray-900 dark:text-white">{channel.name}</span>
                                            {channel.is_private && (
                                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">
                                                    Private
                                                </span>
                                            )}
                                            {selectedChannel?.id === channel.id && (
                                                <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlackChannelSelector;
