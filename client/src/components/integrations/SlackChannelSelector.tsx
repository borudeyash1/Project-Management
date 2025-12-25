import React, { useState, useEffect } from 'react';
import { Hash, Loader, Check, X, Plus, Star } from 'lucide-react';
import { apiService } from '../../services/api';

interface SlackChannel {
    id: string;
    name: string;
    is_private: boolean;
}

interface SelectedChannel {
    id: string;
    name: string;
    isPrimary: boolean;
}

interface SlackChannelSelectorProps {
    projectId: string;
    currentChannels?: SelectedChannel[];
    onUpdate: (channels: SelectedChannel[]) => void;
    canEdit: boolean;
}

const SlackChannelSelector: React.FC<SlackChannelSelectorProps> = ({
    projectId,
    currentChannels = [],
    onUpdate,
    canEdit
}) => {
    const [channels, setChannels] = useState<SlackChannel[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedChannels, setSelectedChannels] = useState<SelectedChannel[]>(currentChannels);

    useEffect(() => {
        setSelectedChannels(currentChannels);
    }, [currentChannels]);

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

    const handleAddChannel = (channel: SlackChannel) => {
        const isAlreadyAdded = selectedChannels.some(c => c.id === channel.id);
        if (isAlreadyAdded) return;

        const newChannel: SelectedChannel = {
            id: channel.id,
            name: channel.name,
            isPrimary: selectedChannels.length === 0 // First channel is primary by default
        };

        const updated = [...selectedChannels, newChannel];
        setSelectedChannels(updated);
        onUpdate(updated);
        setIsOpen(false);
    };

    const handleRemoveChannel = (channelId: string) => {
        const updated = selectedChannels.filter(c => c.id !== channelId);

        // If we removed the primary channel, make the first remaining channel primary
        if (updated.length > 0 && !updated.some(c => c.isPrimary)) {
            updated[0].isPrimary = true;
        }

        setSelectedChannels(updated);
        onUpdate(updated);
    };

    const handleSetPrimary = (channelId: string) => {
        const updated = selectedChannels.map(c => ({
            ...c,
            isPrimary: c.id === channelId
        }));
        setSelectedChannels(updated);
        onUpdate(updated);
    };

    const availableChannels = channels.filter(
        c => !selectedChannels.some(sc => sc.id === c.id)
    );

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slack Channels
            </label>

            {/* Selected Channels List */}
            {selectedChannels.length > 0 && (
                <div className="space-y-2 mb-3">
                    {selectedChannels.map((channel) => (
                        <div
                            key={channel.id}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                            {channel.isPrimary && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" title="Primary channel" />
                            )}
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span className="flex-1 text-gray-900 dark:text-white">{channel.name}</span>
                            {channel.isPrimary && (
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                                    Primary
                                </span>
                            )}
                            {canEdit && (
                                <div className="flex items-center gap-1">
                                    {!channel.isPrimary && (
                                        <button
                                            onClick={() => handleSetPrimary(channel.id)}
                                            className="p-1 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
                                            title="Set as primary"
                                        >
                                            <Star className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRemoveChannel(channel.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        title="Remove channel"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Channel Button */}
            {canEdit && (
                <button
                    onClick={handleOpen}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Slack Channel
                </button>
            )}

            {!canEdit && selectedChannels.length === 0 && (
                <div className="px-4 py-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    No channels configured
                </div>
            )}

            {/* Channel Selector Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Add Slack Channel
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
                            ) : availableChannels.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p>
                                        {channels.length === 0
                                            ? 'No Slack channels found.'
                                            : 'All available channels have been added.'}
                                    </p>
                                    {channels.length === 0 && (
                                        <p className="text-sm mt-2">
                                            Make sure you've connected your Slack account in Settings.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {availableChannels.map((channel) => (
                                        <button
                                            key={channel.id}
                                            onClick={() => handleAddChannel(channel)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                                        >
                                            <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="flex-1 text-gray-900 dark:text-white">{channel.name}</span>
                                            {channel.is_private && (
                                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">
                                                    Private
                                                </span>
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
