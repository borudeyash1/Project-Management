import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Search, Plus, Users, User, Paperclip, Smile, MoreVertical } from 'lucide-react';
import apiService from '../../services/api';

interface InboxThread {
  userId: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string | null;
  unreadCount: number;
}

interface InboxMessage {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  createdAt: string;
}

const WorkspaceInbox: React.FC = () => {
  const { state } = useApp();
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const currentWorkspaceId = state.currentWorkspace;
  const currentUserId = state.userProfile._id;

  const currentWorkspace = useMemo(
    () => state.workspaces.find((w) => w._id === currentWorkspaceId),
    [state.workspaces, currentWorkspaceId]
  );

  // Load workspace threads (one per other member) from backend
  useEffect(() => {
    const loadThreads = async () => {
      if (!currentWorkspaceId) return;
      setIsLoadingThreads(true);
      try {
        const response = await apiService.get<any>(`/inbox/workspace/${currentWorkspaceId}/threads`);
        const data = (response.data as any[]) || [];
        setThreads(
          (data || []).map((t: any) => ({
            userId: t.userId,
            name: t.name,
            avatarUrl: t.avatarUrl,
            lastMessage: t.lastMessage || '',
            lastMessageTime: t.lastMessageTime || null,
            unreadCount: t.unreadCount || 0,
          }))
        );
      } catch (error) {
        console.error('Failed to load workspace inbox threads', error);
      } finally {
        setIsLoadingThreads(false);
      }
    };

    loadThreads();
  }, [currentWorkspaceId]);

  // Load messages when a thread is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentWorkspaceId || !selectedUserId) {
        setMessages([]);
        return;
      }
      setIsLoadingMessages(true);
      try {
        const messagesResp = await apiService.get<any>(`/inbox/workspace/${currentWorkspaceId}/messages/${selectedUserId}`);
        const data = (messagesResp.data as any[]) || [];
        setMessages(data as InboxMessage[]);

        // Mark all as read for current user
        await apiService.post(`/inbox/workspace/${currentWorkspaceId}/messages/${selectedUserId}/read`);

        // Refresh threads so unread counts update
        const threadsResp = await apiService.get<any>(`/inbox/workspace/${currentWorkspaceId}/threads`);
        const updatedThreads = (threadsResp.data as any[]) || [];
        setThreads(
          (updatedThreads || []).map((t: any) => ({
            userId: t.userId,
            name: t.name,
            avatarUrl: t.avatarUrl,
            lastMessage: t.lastMessage || '',
            lastMessageTime: t.lastMessageTime || null,
            unreadCount: t.unreadCount || 0,
          }))
        );
      } catch (error) {
        console.error('Failed to load conversation messages', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [currentWorkspaceId, selectedUserId]);

  const filteredThreads = threads.filter((thread) =>
    thread.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentWorkspaceId || !selectedUserId) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      const response = await apiService.post<any>(
        `/inbox/workspace/${currentWorkspaceId}/messages/${selectedUserId}`,
        { content },
      );
      const created = response.data as InboxMessage;

      setMessages((prev) => [
        ...prev,
        created,
      ]);

      setThreads((prev) =>
        prev.map((t) =>
          t.userId === selectedUserId
            ? {
                ...t,
                lastMessage: content,
                lastMessageTime: created.createdAt,
                unreadCount: 0,
              }
            : t,
        ),
      );
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingThreads && (
            <div className="p-4 text-sm text-gray-500">Loading conversations...</div>
          )}
          {!isLoadingThreads && filteredThreads.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No other members in this workspace yet.</div>
          )}
          {filteredThreads.map((thread) => (
            <button
              key={thread.userId}
              onClick={() => setSelectedUserId(thread.userId)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                selectedUserId === thread.userId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                {thread.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {thread.unreadCount}
                  </div>
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {thread.name}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {thread.lastMessageTime
                      ? new Date(thread.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {thread.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedUserId ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  {threads.find((t) => t.userId === selectedUserId)?.name || 'Conversation'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Direct Message
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoadingMessages && (
              <div className="text-sm text-gray-500">Loading messages...</div>
            )}
            {!isLoadingMessages && messages.length === 0 && (
              <div className="text-sm text-gray-500">No messages yet. Say hello!</div>
            )}
            {messages.map((message) => {
              const isOwn = message.sender === currentUserId;
              return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    {!isOwn && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {threads.find((t) => t.userId === selectedUserId)?.name}
                      </p>
                    )}
                    <div className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-end gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceInbox;
