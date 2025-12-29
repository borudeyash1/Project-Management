import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { chatService } from '../../services/chatService';
import { chatSocket } from '../../services/chatSocket';
import { ChatServer, ChatChannel, ChatMessage } from '../../types/chat';
import {
    Hash, Volume2, Plus, Settings, Users, Search,
    Send, Smile, Paperclip, MoreVertical, Pin, Edit2, Trash2,
    MessageSquare, UserPlus, LogOut
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DiscordPage: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const { state, addToast } = useApp();
    const { isDarkMode } = useTheme();
    const [servers, setServers] = useState<ChatServer[]>([]);
    const [activeServer, setActiveServer] = useState<ChatServer | null>(null);
    const [channels, setChannels] = useState<ChatChannel[]>([]);
    const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Socket.IO connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !chatSocket.isConnected()) {
            chatSocket.connect(token);
        }

        return () => {
            if (activeChannel) {
                chatSocket.leaveChannel(activeChannel._id);
            }
            if (activeServer) {
                chatSocket.leaveServer(activeServer._id);
            }
        };
    }, []);

    // Load servers
    useEffect(() => {
        const loadServers = async () => {
            try {
                setLoading(true);
                // Load ALL servers where user is a member (not workspace-specific)
                const data = await chatService.getAllServers();
                setServers(data);

                // Auto-select first server
                if (data.length > 0 && !activeServer) {
                    setActiveServer(data[0]);
                    chatSocket.joinServer(data[0]._id);
                }
            } catch (error: any) {
                console.error('Failed to load servers:', error);
                addToast('Failed to load chat servers', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadServers();
    }, []); // Remove workspaceId dependency

    // Load channels when server changes
    useEffect(() => {
        if (!activeServer) return;

        const loadChannels = async () => {
            try {
                const data = await chatService.getChannelsByServer(activeServer._id);
                setChannels(data);

                // Auto-select first channel
                if (data.length > 0 && !activeChannel) {
                    setActiveChannel(data[0]);
                }
            } catch (error: any) {
                console.error('Failed to load channels:', error);
                addToast('Failed to load channels', 'error');
            }
        };

        loadChannels();
    }, [activeServer]);

    // Load messages when channel changes
    useEffect(() => {
        if (!activeChannel) return;

        // Leave previous channel
        const previousChannel = activeChannel;

        const loadMessages = async () => {
            try {
                chatSocket.joinChannel(activeChannel._id);
                const data = await chatService.getChannelMessages(activeChannel._id);
                setMessages(data.reverse()); // Reverse to show oldest first
                scrollToBottom();
            } catch (error: any) {
                console.error('Failed to load messages:', error);
                addToast('Failed to load messages', 'error');
            }
        };

        loadMessages();

        return () => {
            if (previousChannel) {
                chatSocket.leaveChannel(previousChannel._id);
            }
        };
    }, [activeChannel]);

    // Socket.IO event listeners
    useEffect(() => {
        const handleNewMessage = (message: ChatMessage) => {
            if (message.channelId === activeChannel?._id) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        };

        const handleTypingStart = (data: { channelId: string; userId: string; username: string }) => {
            if (data.channelId === activeChannel?._id && data.userId !== state.userProfile._id) {
                setTypingUsers(prev => new Set(prev).add(data.username));
            }
        };

        const handleTypingStop = (data: { channelId: string; userId: string }) => {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                // Remove by userId (we need to map username to userId)
                return newSet;
            });
        };

        chatSocket.onNewMessage(handleNewMessage);
        chatSocket.onTypingStart(handleTypingStart);
        chatSocket.onTypingStop(handleTypingStop);

        return () => {
            chatSocket.off('message:new', handleNewMessage);
            chatSocket.off('typing:start', handleTypingStart);
            chatSocket.off('typing:stop', handleTypingStop);
        };
    }, [activeChannel, state.userProfile._id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChannel) return;

        try {
            await chatService.sendMessage(activeChannel._id, {
                content: messageInput.trim()
            });
            setMessageInput('');
            chatSocket.stopTyping(activeChannel._id);
        } catch (error: any) {
            console.error('Failed to send message:', error);
            addToast('Failed to send message', 'error');
        }
    };

    const handleTyping = () => {
        if (!activeChannel) return;

        chatSocket.startTyping(activeChannel._id);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            chatSocket.stopTyping(activeChannel._id);
        }, 3000);
    };

    const handleCreateServer = async () => {
        const name = prompt('Enter server name:');
        if (!name || !workspaceId) return;

        try {
            const server = await chatService.createServer({
                name,
                workspaceId
            });
            setServers(prev => [...prev, server]);
            setActiveServer(server);
            chatSocket.joinServer(server._id);
            addToast('Server created successfully', 'success');
        } catch (error: any) {
            console.error('Failed to create server:', error);
            addToast('Failed to create server', 'error');
        }
    };

    const handleCreateChannel = async () => {
        if (!activeServer) return;

        const name = prompt('Enter channel name:');
        if (!name) return;

        try {
            const channel = await chatService.createChannel(activeServer._id, {
                name,
                type: 'text'
            });
            setChannels(prev => [...prev, channel]);
            setActiveChannel(channel);
            addToast('Channel created successfully', 'success');
        } catch (error: any) {
            console.error('Failed to create channel:', error);
            addToast('Failed to create channel', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Server List */}
            <div className="w-[72px] bg-gray-50 dark:bg-[#0b0c14] flex flex-col items-center py-3 space-y-2 overflow-y-auto no-scrollbar border-r border-gray-200 dark:border-white/5 z-20">
                {servers.map(server => (
                    <button
                        key={server._id}
                        onClick={() => {
                            if (activeServer) chatSocket.leaveServer(activeServer._id);
                            setActiveServer(server);
                            chatSocket.joinServer(server._id);
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 group relative ${activeServer?._id === server._id
                                ? 'bg-primary rounded-2xl shadow-lg shadow-primary/30'
                                : 'bg-gray-200 dark:bg-[#36393f] hover:bg-primary hover:rounded-2xl hover:text-white'
                            }`}
                        title={server.name}
                    >
                        {server.icon ? (
                            <img src={server.icon} alt={server.name} className="w-full h-full rounded-2xl transition-all" />
                        ) : (
                            <span className={`text-sm font-bold transition-colors ${activeServer?._id === server._id ? 'text-white' : 'text-gray-600 dark:text-gray-200 group-hover:text-white'
                                }`}>
                                {server.name.substring(0, 2).toUpperCase()}
                            </span>
                        )}
                        {/* Selected Indicator */}
                        {activeServer?._id === server._id && (
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-10 bg-primary rounded-r-lg" />
                        )}
                    </button>
                ))}
                <button
                    onClick={handleCreateServer}
                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#36393f] text-green-600 dark:text-green-500 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 hover:rounded-2xl flex items-center justify-center transition-all duration-200"
                    title="Create Server"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Channel List */}
            <div className="w-60 bg-gray-100 dark:bg-[#2f3136] flex flex-col border-r border-gray-200 dark:border-gray-800">
                {/* Server Header */}
                <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-[#202225] shadow-sm bg-gray-100/50 dark:bg-[#2f3136]">
                    <h2 className="font-bold truncate text-gray-800 dark:text-gray-100">{activeServer?.name || 'Select a server'}</h2>
                    <button className="hover:bg-gray-200 dark:hover:bg-[#36393f] p-1 rounded transition-colors text-gray-500 dark:text-gray-400">
                        <Settings size={18} />
                    </button>
                </div>

                {/* Channels */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    <div className="flex items-center justify-between px-2 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer group">
                        <span>Text Channels</span>
                        <button onClick={handleCreateChannel} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-0.5 rounded">
                            <Plus size={14} />
                        </button>
                    </div>
                    {channels.filter(c => c.type === 'text').map(channel => (
                        <button
                            key={channel._id}
                            onClick={() => setActiveChannel(channel)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-100 group ${activeChannel?._id === channel._id
                                    ? 'bg-gray-200 dark:bg-[#393c43] text-gray-900 dark:text-white font-medium'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#34373c] hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <Hash size={18} className={`${activeChannel?._id === channel._id ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="truncate">{channel.name}</span>
                        </button>
                    ))}

                    {channels.filter(c => c.type === 'voice').length > 0 && (
                        <>
                            <div className="flex items-center px-2 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide mt-4">
                                Voice Channels
                            </div>
                            {channels.filter(c => c.type === 'voice').map(channel => (
                                <button
                                    key={channel._id}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#34373c] hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                >
                                    <Volume2 size={18} />
                                    <span className="truncate">{channel.name}</span>
                                </button>
                            ))}
                        </>
                    )}
                </div>

                {/* User Panel */}
                <div className="h-14 bg-gray-200 dark:bg-[#292b2f] px-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                            {state.userProfile.profilePicture ? (
                                <img src={state.userProfile.profilePicture} alt="" className="w-full h-full rounded-full" />
                            ) : (
                                <span className="text-sm font-bold">{state.userProfile.username?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-semibold truncate text-gray-900 dark:text-white">{state.userProfile.username}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Online</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#36393f] relative z-10 transition-colors">
                {/* Channel Header */}
                <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-[#202225] shadow-sm bg-white dark:bg-[#36393f]">
                    <div className="flex items-center gap-2">
                        <Hash size={24} className="text-gray-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white">{activeChannel?.name || 'Select a channel'}</h3>
                        {activeChannel?.topic && (
                            <>
                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{activeChannel.topic}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                        <button className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                            <Users size={24} />
                        </button>
                        <button className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                            <Search size={24} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 selection:bg-none">
                            <div className="bg-gray-100 dark:bg-[#40444b] p-6 rounded-full mb-4">
                                <MessageSquare size={48} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Welcome to #{activeChannel?.name}!</p>
                            <p className="text-gray-500 dark:text-gray-400">This is the start of the #{activeChannel?.name} channel.</p>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isSameAuthor = index > 0 && messages[index - 1].authorId._id === message.authorId._id;
                            const isCloseInTime = index > 0 && (new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() < 60000);
                            const isCompact = isSameAuthor && isCloseInTime;

                            return (
                                <div
                                    key={message._id}
                                    className={`flex gap-4 hover:bg-gray-50 dark:hover:bg-[#32353b]/60 px-4 py-1 -mx-4 rounded group transition-colors ${isCompact ? 'mt-0.5' : 'mt-4'}`}
                                >
                                    {!isCompact ? (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-[#5865f2] flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                                            {message.authorId.profilePicture ? (
                                                <img src={message.authorId.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-primary dark:text-white">{message.authorId.username[0].toUpperCase()}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-10 w-[40px] text-xs text-gray-400 opacity-0 group-hover:opacity-100 text-right pr-1 select-none flex items-center justify-end">
                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        {!isCompact && (
                                            <div className="flex items-baseline gap-2">
                                                <span className={`font-medium text-[15px] cursor-pointer hover:underline ${message.authorId._id === state.userProfile._id ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                                    {message.authorId.username}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                                    {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        )}
                                        <p className={`text-[15px] leading-[1.375rem] break-words ${isCompact ? '' : 'mt-0.5'} text-gray-800 dark:text-gray-100/90`}>
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                    <div className="absolute bottom-20 left-4 text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                        {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                    </div>
                )}

                {/* Message Input */}
                <div className="p-4 px-4 bg-white dark:bg-[#36393f]">
                    <div className="bg-gray-100 dark:bg-[#40444b] rounded-lg p-2.5">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                            <button type="button" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-200/50 dark:bg-transparent rounded-full p-1 transition-colors">
                                <Plus size={16} strokeWidth={2.5} />
                            </button>
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => {
                                    setMessageInput(e.target.value);
                                    handleTyping();
                                }}
                                placeholder={`Message #${activeChannel?.name || 'channel'}`}
                                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-[15px]"
                            />
                            <div className="flex items-center gap-2">
                                <button type="button" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                                    <Smile size={20} />
                                </button>
                                {messageInput.trim() && (
                                    <button
                                        type="submit"
                                        className="text-primary hover:text-primary-dark transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscordPage;
