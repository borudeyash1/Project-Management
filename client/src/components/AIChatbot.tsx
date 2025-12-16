import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose }) => {
  const { state } = useApp();
  const { isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'ai',
        content: `${t('aiStudio.welcome.greeting', { name: state.userProfile?.fullName || 'there' })}

${t('aiStudio.welcome.intro')}

${t('aiStudio.features.smartAnswers')}
${t('aiStudio.features.smartEditor')}
${t('aiStudio.features.smartSummaries')}
${t('aiStudio.features.smartFields')}
${t('aiStudio.features.smartStatus')}

${t('aiStudio.welcome.question')}`,
        timestamp: new Date(),
        suggestions: [
          t('aiStudio.defaultSuggestions.summary'),
          t('aiStudio.defaultSuggestions.edit'),
          t('aiStudio.defaultSuggestions.status'),
          t('aiStudio.defaultSuggestions.fields')
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, state.userProfile?.fullName, messages.length, t]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const userContext = {
        profile: state.userProfile,
        projects: state.projects,
        tasks: state.tasks,
        workspaces: state.workspaces
      };

      const aiResponse = await aiService.getAIResponse(message, userContext, i18n.language);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: t('messages.tryAgain'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    sendMessage(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simple markdown renderer for AI responses
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <div key={index} className="ml-2">{renderedLine}</div>;
      }

      if (/^[✨📝📊🏷️🚀🎯💡🔴🟡🟢⚠️]/.test(line.trim())) {
        return <div key={index} className="ml-2">{renderedLine}</div>;
      }

      return <div key={index}>{renderedLine}</div>;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-2xl shadow-2xl rounded-2xl overflow-hidden ${
        isDarkMode ? 'bg-zinc-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-zinc-800'
                }`}>
                  {t('aiStudio.title')}
                </h2>
                <p className={`text-xs ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  {t('aiStudio.poweredBy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                Online
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-zinc-700 text-zinc-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className={`h-[500px] flex flex-col ${
          isDarkMode ? 'bg-zinc-900' : 'bg-gray-50'
        }`}>
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[75%] ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md'
                      : isDarkMode 
                        ? 'bg-zinc-700' 
                        : 'bg-white border-2 border-gray-200'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : isDarkMode 
                        ? 'bg-zinc-800 text-white border border-zinc-700' 
                        : 'bg-white text-zinc-800 border border-gray-200'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      {message.type === 'ai' ? renderMarkdown(message.content) : message.content}
                    </div>
                    <p className={`text-[10px] mt-1.5 ${
                      message.type === 'user' 
                        ? 'text-blue-100' 
                        : isDarkMode ? 'text-zinc-500' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[75%]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-zinc-700' : 'bg-white border-2 border-gray-200'
                  }`}>
                    <Bot className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                    isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Loader2 className={`w-4 h-4 animate-spin ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                      <span className={`text-sm ${
                        isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
                      }`}>
                        {t('aiStudio.thinking')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length > 0 && messages[messages.length - 1].suggestions && (
            <div className={`px-4 py-3 border-t ${
              isDarkMode ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-white'
            }`}>
              <p className={`text-xs mb-2 font-medium ${
                isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                {t('aiStudio.suggestions')}
              </p>
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className={`px-4 py-3 border-t ${
            isDarkMode ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('aiStudio.placeholder')}
                className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDarkMode 
                    ? 'bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400' 
                    : 'bg-white border-gray-300 text-zinc-900 placeholder-gray-400'
                }`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
