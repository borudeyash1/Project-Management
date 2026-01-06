import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { useDock } from '../../context/DockContext';
import { Send, Users, User, Smile } from 'lucide-react';
import apiService from '../../services/api';
import { EmojiPicker } from '../ui/EmojiPicker';

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

interface WorkspaceInboxProps {
  projectId?: string; // Optional: if provided, only show project members
}

const WorkspaceInbox: React.FC<WorkspaceInboxProps> = ({ projectId }) => {
  const { t } = useTranslation();
  const { state } = useApp();
  const { dockPosition } = useDock();
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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
        // If projectId is provided, fetch only project members, otherwise fetch all workspace members
        const endpoint = projectId 
          ? `/inbox/project/${projectId}/threads`
          : `/inbox/workspace/${currentWorkspaceId}/threads`;
        
        const response = await apiService.get<any>(endpoint);
        // Backend returns { success: true, data: [...] }, so access response.data.data
        const data = response.data?.data || response.data || [];
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
        console.error('Failed to load inbox threads', error);
      } finally {
        setIsLoadingThreads(false);
      }
    };

    loadThreads();
  }, [currentWorkspaceId, projectId]);

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
        const data = messagesResp.data?.data || messagesResp.data || [];
        setMessages(data as InboxMessage[]);

        // Mark all as read for current user
        await apiService.post(`/inbox/workspace/${currentWorkspaceId}/messages/${selectedUserId}/read`);

        // Refresh threads so unread counts update
        const threadsResp = await apiService.get<any>(`/inbox/workspace/${currentWorkspaceId}/threads`);
        const updatedThreads = threadsResp.data?.data || threadsResp.data || [];
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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentWorkspaceId || !selectedUserId) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      const response = await apiService.post<any>(
        `/inbox/workspace/${currentWorkspaceId}/messages/${selectedUserId}`,
        { content },
      );
      const created = response.data?.data || response.data;

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
    <div className={`h-[calc(100vh-12rem)] transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px] pr-4 py-4' :
        dockPosition === 'right' ? 'pr-[71px] pl-4 py-4' :
          'p-4'
      }`}>
      <div className="h-full flex bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-gray-300 dark:border-gray-600 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-300 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('workspace.inbox.title') || 'Team Inbox'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('workspace.inbox.subtitle') || 'Chat with your workspace members'}
            </p>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingThreads && (
              <div className="p-4 text-sm text-gray-600">{t('workspace.inbox.loadingConversations')}</div>
            )}
            {!isLoadingThreads && threads.length === 0 && (
              <div className="p-4 text-sm text-gray-600">{t('workspace.inbox.noMembers')}</div>
            )}
            {threads.map((thread) => (
              <button
                key={thread.userId}
                onClick={() => setSelectedUserId(thread.userId)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-300 dark:border-gray-600 ${selectedUserId === thread.userId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-accent-dark" />
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
                    <span className="text-xs text-gray-600 dark:text-gray-200">
                      {thread.lastMessageTime
                        ? new Date(thread.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
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
            <div className="p-4 border-b border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-dark" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                    {threads.find((t) => t.userId === selectedUserId)?.name || t('workspace.inbox.conversationDefault')}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-200">
                    {t('workspace.inbox.directMessage')}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages && (
                <div className="text-sm text-gray-600">{t('workspace.inbox.loadingMessages')}</div>
              )}
              {!isLoadingMessages && messages.length === 0 && (
                <div className="text-sm text-gray-600">{t('workspace.inbox.noMessages')}</div>
              )}
              {messages.map((message) => {
                const isOwn = message.sender === currentUserId;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-200" />
                      </div>
                      <div>
                        {!isOwn && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                            {threads.find((t) => t.userId === selectedUserId)?.name}
                          </p>
                        )}
                        <div className={`rounded-lg px-4 py-2 ${isOwn
                            ? 'bg-accent text-gray-900'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-300 dark:border-gray-600 relative z-10">
              <div className="flex items-end gap-2">
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
                    placeholder={t('workspace.inbox.typeMessage')}
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative z-20"
                    title="Add emoji"
                    type="button"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  {showEmojiPicker && (
                    <EmojiPicker
                      onEmojiSelect={handleEmojiSelect}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}
                </div>
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors relative z-20"
                  type="button"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium">{t('workspace.inbox.selectChat')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceInbox;
