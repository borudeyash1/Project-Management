import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Search, Plus, Users, User, Paperclip, Smile, MoreVertical } from 'lucide-react';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Chat {
  _id: string;
  name: string;
  type: 'direct' | 'group';
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  members?: number;
}

const WorkspaceInbox: React.FC = () => {
  const { state } = useApp();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock chats data
  const chats: Chat[] = [
    {
      _id: '1',
      name: 'Team General',
      type: 'group',
      lastMessage: 'Great work on the project!',
      lastMessageTime: new Date('2024-03-20T14:30:00'),
      unreadCount: 3,
      members: 12
    },
    {
      _id: '2',
      name: 'John Doe',
      type: 'direct',
      lastMessage: 'Can you review the design?',
      lastMessageTime: new Date('2024-03-20T13:15:00'),
      unreadCount: 1
    },
    {
      _id: '3',
      name: 'Project Alpha',
      type: 'group',
      lastMessage: 'Meeting at 3 PM',
      lastMessageTime: new Date('2024-03-20T10:00:00'),
      unreadCount: 0,
      members: 5
    }
  ];

  // Mock messages data
  const messages: Message[] = [
    {
      _id: '1',
      sender: {
        _id: '2',
        name: 'John Doe'
      },
      content: 'Hey, how is the project coming along?',
      timestamp: new Date('2024-03-20T14:00:00'),
      isOwn: false
    },
    {
      _id: '2',
      sender: {
        _id: state.userProfile._id,
        name: state.userProfile.fullName
      },
      content: 'Going well! Just finished the main features.',
      timestamp: new Date('2024-03-20T14:05:00'),
      isOwn: true
    },
    {
      _id: '3',
      sender: {
        _id: '2',
        name: 'John Doe'
      },
      content: 'Awesome! Can you share the latest build?',
      timestamp: new Date('2024-03-20T14:10:00'),
      isOwn: false
    }
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle send message
      setMessageInput('');
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
          {filteredChats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => setSelectedChat(chat._id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                selectedChat === chat._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  {chat.type === 'group' ? (
                    <Users className="w-6 h-6 text-blue-600" />
                  ) : (
                    <User className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                {chat.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {chat.unreadCount}
                  </div>
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {chat.name}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {chat.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {chat.lastMessage}
                </p>
                {chat.type === 'group' && chat.members && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {chat.members} members
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  {chats.find(c => c._id === selectedChat)?.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {chats.find(c => c._id === selectedChat)?.type === 'group' ? 'Group Chat' : 'Direct Message'}
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[70%] ${message.isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    {!message.isOwn && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{message.sender.name}</p>
                    )}
                    <div className={`rounded-lg px-4 py-2 ${
                      message.isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
