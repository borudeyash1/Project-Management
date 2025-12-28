import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Hash, Lock, Search, Plus, MoreVertical, Phone, Video,
    Info, Smile, Paperclip, Send, User, MessageSquare
} from 'lucide-react';
import { slackService, SlackChannel, SlackMessage } from '../../services/slackService';
import { useApp } from '../../context/AppContext';
import { SlackLogo } from '../icons/BrandLogos';
import LoadingAnimation from '../LoadingAnimation';

interface WorkspaceSlackTabProps {
    workspaceId: string;
}

const WorkspaceSlackTab: React.FC<WorkspaceSlackTabProps> = ({ workspaceId }) => {
    const { t } = useTranslation();
    const { state } = useApp();
    const [channels, setChannels] = useState<SlackChannel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<SlackChannel | null>(null);
    const [messages, setMessages] = useState<SlackMessage[]>([]);
    const [loadingChannels, setLoadingChannels] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const slackConnected = !!state.userProfile?.connectedAccounts?.slack?.activeAccountId;

    useEffect(() => {
        if (slackConnected) {
            fetchChannels();
        }
    }, [slackConnected]);

    useEffect(() => {
        if (selectedChannel) {
            fetchMessages(selectedChannel.id);
        }
    }, [selectedChannel]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChannels = async () => {
        setLoadingChannels(true);
        try {
            const data = await slackService.getChannels();
            setChannels(data);
            if (data.length > 0 && !selectedChannel) {
                setSelectedChannel(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch Slack channels:', error);
        } finally {
            setLoadingChannels(false);
        }
    };

    const fetchMessages = async (channelId: string) => {
        setLoadingMessages(true);
        try {
            console.log('[Slack] Fetching messages for channel:', channelId);
            const data = await slackService.getChannelMessages(channelId);
            console.log('[Slack] Received messages:', data);
            // API returns newest first, reverse for chat UI
            setMessages([...data].reverse());
        } catch (error) {
            console.error('Failed to fetch Slack messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !selectedChannel || sendingMessage) return;

        const text = newMessage.trim();
        const tempId = `temp-${Date.now()}`;
        setNewMessage('');
        setSendingMessage(true);

        try {
            // Optimistic update with current user info
            const tempMessage: SlackMessage = {
                type: 'message',
                user: state.userProfile?.fullName || 'You',
                text: text,
                ts: tempId
            };
            setMessages(prev => [...prev, tempMessage]);

            // Send message
            const result = await slackService.postMessage(selectedChannel.id, text);

            // Replace temp message with actual message
            setMessages(prev => prev.map(msg =>
                msg.ts === tempId
                    ? { ...msg, ts: result.ts || msg.ts }
                    : msg
            ));

            // Focus back on input
            inputRef.current?.focus();
        } catch (error) {
            console.error('Failed to send message:', error);
            // Revert optimistic update and restore message
            setMessages(prev => prev.filter(msg => msg.ts !== tempId));
            setNewMessage(text);
            // TODO: Show error toast
        } finally {
            setSendingMessage(false);
        }
    };

    if (!slackConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <SlackLogo size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Slack Not Connected
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    Connect your Slack workspace to chat and collaborate directly from here.
                </p>
            </div>
        );
    }

    if (loadingChannels) {
        return <div className="h-full flex items-center justify-center"><LoadingAnimation message="Loading Slack..." /></div>;
    }

    return (
        <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden border-l border-gray-200 dark:border-gray-700 select-none">
            {/* Sidebar */}
            <div className="w-64 bg-[#3F0E40] flex flex-col flex-shrink-0">
                {/* Header */}
                <div className="h-12 border-b border-[#5d2c5d] flex items-center px-4 hover:bg-[#350d36] transition-colors cursor-pointer">
                    <h2 className="text-white font-bold text-sm truncate flex-1">sartthi-app</h2>
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#3F0E40] text-xs font-bold">
                        S
                    </div>
                </div>

                {/* Scroller */}
                <div className="flex-1 overflow-y-auto custom-scrollbar-dark py-2">
                    <div className="px-4 py-2">
                        <div className="flex items-center justify-between group mb-1">
                            <span className="text-[#bfabbf] text-sm font-medium group-hover:text-white cursor-pointer transition-colors">
                                Channels
                            </span>
                            <Plus className="w-4 h-4 text-[#bfabbf] opacity-0 group-hover:opacity-100 cursor-pointer hover:text-white transition-all" />
                        </div>
                        <div className="space-y-0.5">
                            {channels.map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => setSelectedChannel(channel)}
                                    className={`w-full flex items-center px-2 py-1 rounded transition-colors ${selectedChannel?.id === channel.id
                                        ? 'bg-[#1164A3] text-white'
                                        : 'text-[#cfc3cf] hover:bg-[#350d36]'
                                        }`}
                                >
                                    {channel.isPrivate ? (
                                        <Lock className="w-3.5 h-3.5 mr-2 opacity-70" />
                                    ) : (
                                        <Hash className="w-3.5 h-3.5 mr-2 opacity-70" />
                                    )}
                                    <span className="text-sm truncate">{channel.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1A1D21]">
                {/* Header */}
                <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-[#1A1D21]">
                    <div className="flex items-center min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white truncate flex items-center">
                            {selectedChannel?.isPrivate ? <Lock className="w-4 h-4 mr-1.5 text-gray-500" /> : <Hash className="w-4 h-4 mr-1.5 text-gray-500" />}
                            {selectedChannel?.name}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-[#1A1D21]" />
                            ))}
                        </div>
                        <span className="text-xs">24</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {loadingMessages ? (
                        <div className="h-full flex items-center justify-center">
                            <LoadingAnimation message="" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="max-w-md text-center p-6">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No Messages Yet
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    To view messages from this channel, you need to invite the Sartthi bot first.
                                </p>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                        📝 How to add the bot:
                                    </p>
                                    <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                                        <li>Open <strong>#{selectedChannel?.name}</strong> in Slack</li>
                                        <li>Type: <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">/invite @Sartthi</code></li>
                                        <li>Press Enter and refresh this page</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            // Basic block rendering for "Rich Task Notification"
                            const isTaskNotification = msg.text?.includes('New Task Created');

                            return (
                                <div key={msg.ts} className="group flex gap-3 hover:bg-gray-50 dark:hover:bg-[#222529] -mx-4 px-4 py-1.5 transition-colors">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="w-9 h-9 rounded bg-[#E01E5A] flex items-center justify-center text-white font-bold text-sm">
                                            {/* Avatar Placeholder */}
                                            {(msg.user || 'U')[0].toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white text-[15px] hover:underline cursor-pointer">
                                                {msg.user || 'Unknown User'}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:opacity-100 opacity-0 transition-opacity">
                                                {new Date(parseFloat(msg.ts) * 1000).toLocaleTimeString()}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="text-[15px] text-gray-900 dark:text-[#D1D2D3] leading-relaxed">
                                            {isTaskNotification ? (
                                                <div className="ml-1 pl-3 border-l-4 border-[#2EB67D] mt-1 space-y-1">
                                                    <div className="flex items-center gap-2 font-semibold">
                                                        <span className="text-[#1A1D21] dark:text-white">📋 New Task Created</span>
                                                    </div>
                                                    <div className="text-gray-600 dark:text-gray-300">
                                                        {msg.text.replace('📋 New Task: ', '')}
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <button className="px-3 py-1 bg-[#2EB67D] text-white text-xs font-medium rounded hover:bg-[#259667]">Mark Complete</button>
                                                        <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">View in Sartthi</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                msg.text
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-4 pb-4 bg-white dark:bg-[#1A1D21]">
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-gray-400 dark:focus-within:ring-gray-500 transition-all bg-white dark:bg-[#222529]">
                        <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-[#222529] border-b border-gray-200 dark:border-gray-600">
                            <IconButton icon={<b className="serif font-bold">B</b>} />
                            <IconButton icon={<i className="serif italic">I</i>} />
                            <IconButton icon={<s className="serif line-through">S</s>} />
                            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                            <IconButton icon={<Hash className="w-4 h-4" />} />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder={`Message #${selectedChannel?.name || 'channel'}`}
                            disabled={sendingMessage}
                            className="w-full h-12 px-3 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex items-center justify-between p-1">
                            <div className="flex items-center gap-1">
                                <IconButton icon={<Plus className="w-4 h-4" />} />
                                <IconButton icon={<Smile className="w-4 h-4" />} />
                                <IconButton icon={<User className="w-4 h-4" />} />
                                {sendingMessage && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex items-center gap-1">
                                        <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-pulse"></span>
                                        Sending...
                                    </span>
                                )}
                                {!sendingMessage && newMessage.trim() && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                                        Press <kbd className="px-1 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Enter</kbd> to send
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!newMessage.trim() || sendingMessage}
                                className={`p-1.5 rounded transition-all ${newMessage.trim() && !sendingMessage
                                    ? 'bg-[#007a5a] text-white hover:bg-[#148567] hover:scale-105'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                                title="Send message"
                            >
                                {sendingMessage ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <button className="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        {icon}
    </button>
);

export default WorkspaceSlackTab;
