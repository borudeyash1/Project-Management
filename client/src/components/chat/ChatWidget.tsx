import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Hash, X, Send } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { chatSocket } from '../../services/chatSocket';
import { ChatServer, ChatMessage } from '../../types/chat';

const ChatWidget: React.FC = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [servers, setServers] = useState<ChatServer[]>([]);
    const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

    // Listen for toggle event
    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('TOGGLE_CHAT_WIDGET', handleToggle);
        return () => window.removeEventListener('TOGGLE_CHAT_WIDGET', handleToggle);
    }, []);

    // Get active workspace ID from URL
    useEffect(() => {
        const path = window.location.pathname;
        const match = path.match(/\/workspace\/([^\/]+)/);
        if (match) {
            setActiveWorkspaceId(match[1]);
        }
    }, []);

    // Load servers and recent messages
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Load ALL servers where user is a member (not workspace-specific)
                const serversData = await chatService.getAllServers();
                setServers(serversData);

                // Load recent messages from first server's first channel
                if (serversData.length > 0 && serversData[0].channels.length > 0) {
                    const firstChannelId = serversData[0].channels[0];
                    const messages = await chatService.getChannelMessages(firstChannelId as any, 5);
                    setRecentMessages(messages.reverse());
                }
            } catch (error) {
                console.error('Failed to load chat data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []); // No dependencies - load once on mount

    // Initialize Socket.IO
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !chatSocket.isConnected()) {
            chatSocket.connect(token);
        }
    }, []);

    const handleNavigateToChat = () => {
        if (activeWorkspaceId) {
            navigate(`/workspace/${activeWorkspaceId}/chat`);
            setIsOpen(false);
        }
    };

    const formatTime = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed right-24 bottom-4 w-96 h-[500px] bg-white dark:bg-[#2f3136] rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-[#202225]">
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between bg-gradient-to-r from-[#5865f2] to-[#7289da] text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                    <MessageSquare size={20} />
                    <h3 className="font-bold">CHAT</h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/20 p-1.5 rounded transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5865f2]"></div>
                    </div>
                ) : servers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">
                            No Chat Servers
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                            Create a server to start chatting with your team
                        </p>
                        <button
                            onClick={handleNavigateToChat}
                            className="px-4 py-2 bg-[#5865f2] text-white rounded-md hover:bg-[#4752c4] transition-colors"
                        >
                            Go to Chat
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Servers */}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                Your Servers ({servers.length})
                            </h4>
                            <div className="space-y-2">
                                {servers.slice(0, 3).map(server => (
                                    <div
                                        key={server._id}
                                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-[#36393f] cursor-pointer transition-colors"
                                        onClick={handleNavigateToChat}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {server.icon ? (
                                                <img src={server.icon} alt={server.name} className="w-full h-full rounded-full" />
                                            ) : (
                                                server.name[0].toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                {server.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {server.members.length} members
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Messages */}
                        {recentMessages.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                    Recent Messages
                                </h4>
                                <div className="space-y-3">
                                    {recentMessages.map(message => (
                                        <div
                                            key={message._id}
                                            className="flex gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-[#36393f] cursor-pointer transition-colors"
                                            onClick={handleNavigateToChat}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {message.authorId.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                                        {message.authorId.username}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatTime(message.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                    {message.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-[#202225]">
                <button
                    onClick={handleNavigateToChat}
                    className="w-full px-4 py-2 bg-[#5865f2] text-white rounded-md hover:bg-[#4752c4] transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                    <Send size={16} />
                    Open Chat
                </button>
            </div>
        </div>
    );
};

export default ChatWidget;
