import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Smile } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { EmojiPicker } from '../ui/EmojiPicker';

interface QuickChatProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

interface Message {
  _id: string;
  content: string;
  sender: string;
  recipient: string;
  createdAt: Date;
  readBy: string[];
}

const QuickChat: React.FC<QuickChatProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientAvatar
}) => {
  const { state } = useApp();
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentUserId = state.userProfile?._id;

  // Get current workspace ID
  const workspaceId = typeof state.currentWorkspace === 'string'
    ? state.currentWorkspace
    : (state.currentWorkspace as any)?._id;

  // Fetch messages
  useEffect(() => {
    if (isOpen && recipientId && workspaceId) {
      loadMessages();
    }
  }, [isOpen, recipientId, workspaceId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!workspaceId || !recipientId) return;

    setLoading(true);
    try {
      const response = await apiService.get<any>(
        `/inbox/workspace/${workspaceId}/messages/${recipientId}`
      );
      const data = response.data?.data || response.data || [];
      setMessages(data);

      // Mark as read
      await apiService.post(
        `/inbox/workspace/${workspaceId}/messages/${recipientId}/read`
      );
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !workspaceId || !recipientId || sending) return;

    setSending(true);
    try {
      const response = await apiService.post(
        `/inbox/workspace/${workspaceId}/messages/${recipientId}`,
        { content: newMessage.trim() }
      );

      const sentMessage = response.data?.data || response.data;
      if (sentMessage) {
        setMessages([...messages, sentMessage]);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    // Focus back on textarea
    textareaRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col w-full max-w-sm h-[600px] rounded-xl shadow-2xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {recipientAvatar ? (
              <img
                src={recipientAvatar}
                alt={recipientName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`}
              >
                <span className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {recipientName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {recipientName}
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Direct Message
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender === currentUserId;
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                      isOwnMessage
                        ? isDarkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-900 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className={`p-4 border-t relative ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex gap-2 items-end">
            {/* Emoji Button */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className={`flex-1 px-4 py-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                !newMessage.trim() || sending
                  ? isDarkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickChat;
