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

const DiscordPage: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const { state, addToast } = useApp();
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
            <div className="flex items-center justify-center h-screen bg-[#36393f] text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#36393f] text-white">
            {/* Server List */}
            <div className="w-[72px] bg-[#202225] flex flex-col items-center py-3 gap-2 overflow-y-auto">
                {servers.map(server => (
                    <button
                        key={server._id}
                        onClick={() => {
                            if (activeServer) chatSocket.leaveServer(activeServer._id);
                            setActiveServer(server);
                            chatSocket.joinServer(server._id);
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeServer?._id === server._id
                            ? 'bg-[#5865f2] rounded-2xl'
                            : 'bg-[#36393f] hover:bg-[#5865f2] hover:rounded-2xl'
                            }`}
                        title={server.name}
                    >
                        {server.icon ? (
                            <img src={server.icon} alt={server.name} className="w-full h-full rounded-full" />
                        ) : (
                            <span className="text-lg font-bold">{server.name[0].toUpperCase()}</span>
                        )}
                    </button>
                ))}
                <button
                    onClick={handleCreateServer}
                    className="w-12 h-12 rounded-full bg-[#36393f] hover:bg-[#3ba55d] hover:rounded-2xl flex items-center justify-center transition-all"
                    title="Create Server"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Channel List */}
            <div className="w-60 bg-[#2f3136] flex flex-col">
                {/* Server Header */}
                <div className="h-12 px-4 flex items-center justify-between border-b border-[#202225] shadow-md">
                    <h2 className="font-bold truncate">{activeServer?.name || 'Select a server'}</h2>
                    <button className="hover:bg-[#36393f] p-1 rounded">
                        <Settings size={18} />
                    </button>
                </div>

                {/* Channels */}
                <div className="flex-1 overflow-y-auto p-2">
                    <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-400 uppercase font-semibold">
                        <span>Text Channels</span>
                        <button onClick={handleCreateChannel} className="hover:text-white">
                            <Plus size={14} />
                        </button>
                    </div>
                    {channels.filter(c => c.type === 'text').map(channel => (
                        <button
                            key={channel._id}
                            onClick={() => setActiveChannel(channel)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#36393f] ${activeChannel?._id === channel._id ? 'bg-[#36393f] text-white' : 'text-gray-400'
                                }`}
                        >
                            <Hash size={18} />
                            <span className="truncate">{channel.name}</span>
                        </button>
                    ))}

                    {channels.filter(c => c.type === 'voice').length > 0 && (
                        <>
                            <div className="flex items-center px-2 py-1 text-xs text-gray-400 uppercase font-semibold mt-4">
                                Voice Channels
                            </div>
                            {channels.filter(c => c.type === 'voice').map(channel => (
                                <button
                                    key={channel._id}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#36393f] text-gray-400"
                                >
                                    <Volume2 size={18} />
                                    <span className="truncate">{channel.name}</span>
                                </button>
                            ))}
                        </>
                    )}
                </div>

                {/* User Panel */}
                <div className="h-14 bg-[#292b2f] px-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center flex-shrink-0">
                            {state.userProfile.profilePicture ? (
                                <img src={state.userProfile.profilePicture} alt="" className="w-full h-full rounded-full" />
                            ) : (
                                <span className="text-sm font-bold">{state.userProfile.username?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{state.userProfile.username}</div>
                            <div className="text-xs text-gray-400">Online</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Channel Header */}
                <div className="h-12 px-4 flex items-center justify-between border-b border-[#202225] shadow-md">
                    <div className="flex items-center gap-2">
                        <Hash size={20} className="text-gray-400" />
                        <h3 className="font-bold">{activeChannel?.name || 'Select a channel'}</h3>
                        {activeChannel?.topic && (
                            <>
                                <div className="w-px h-6 bg-gray-600"></div>
                                <span className="text-sm text-gray-400">{activeChannel.topic}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hover:text-gray-300">
                            <Users size={20} />
                        </button>
                        <button className="hover:text-gray-300">
                            <Search size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <MessageSquare size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-semibold">No messages yet</p>
                            <p className="text-sm">Be the first to send a message in #{activeChannel?.name}</p>
                        </div>
                    ) : (
                        messages.map(message => (
                            <div key={message._id} className="flex gap-3 hover:bg-[#32353b] px-2 py-1 rounded group">
                                <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center flex-shrink-0">
                                    {message.authorId.profilePicture ? (
                                        <img src={message.authorId.profilePicture} alt="" className="w-full h-full rounded-full" />
                                    ) : (
                                        <span className="text-sm font-bold">{message.authorId.username[0].toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-semibold">{message.authorId.username}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(message.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-100 break-words">{message.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                    <div className="px-4 py-1 text-sm text-gray-400">
                        {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                    </div>
                )}

                {/* Message Input */}
                <div className="p-4">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-[#40444b] rounded-lg px-4 py-3">
                        <button type="button" className="text-gray-400 hover:text-white">
                            <Plus size={20} />
                        </button>
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => {
                                setMessageInput(e.target.value);
                                handleTyping();
                            }}
                            placeholder={`Message #${activeChannel?.name || 'channel'}`}
                            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                        />
                        <button type="button" className="text-gray-400 hover:text-white">
                            <Smile size={20} />
                        </button>
                        <button
                            type="submit"
                            disabled={!messageInput.trim()}
                            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DiscordPage;
