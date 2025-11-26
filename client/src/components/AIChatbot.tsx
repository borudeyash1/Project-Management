import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { X, Send, Bot, User, Loader2, Sparkles, Target, Clock, TrendingUp, BookOpen } from 'lucide-react';
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
      // Use AI service to get response
      const userContext = {
        profile: state.userProfile,
        projects: state.projects,
        tasks: state.tasks,
        workspaces: state.workspaces
      };

      console.log('[AIChatbot] Sending language:', i18n.language);
      console.log('[AIChatbot] Message:', message);

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
        content: t('messages.tryAgain'), // Or a specific error message
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
      // Handle bold text **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Handle bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <div key={index} className="ml-2">{renderedLine}</div>;
      }

      // Handle emoji bullets (✨, 📝, etc.)
      if (/^[✨📝📊🏷️🚀🎯💡🔴🟡🟢⚠️]/.test(line.trim())) {
        return <div key={index} className="ml-2">{renderedLine}</div>;
      }

      return <div key={index}>{renderedLine}</div>;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className={`relative flex flex-col h-full max-w-4xl mx-auto shadow-xl ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-300'
        } bg-accent`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{t('aiStudio.title')}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-900 text-white rounded-full uppercase tracking-wider">
                  {t('aiStudio.badge')}
                </span>
              </div>
              <p className="text-sm text-gray-800">{t('aiStudio.poweredBy')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-900 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-accent text-gray-900 ml-2' 
                    : isDarkMode ? 'bg-gray-800 text-gray-300 mr-2' : 'bg-gray-200 text-gray-700 mr-2'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`rounded-lg px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-accent text-gray-900'
                    : isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="text-sm">
                    {message.type === 'ai' ? renderMarkdown(message.content) : message.content}
                  </div>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' 
                      ? 'text-gray-800' 
                      : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-xs lg:max-w-md">
                <div className={`w-8 h-8 rounded-full mr-2 flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div className={`rounded-lg px-4 py-2 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Loader2 className={`w-4 h-4 animate-spin ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{t('aiStudio.thinking')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length > 0 && messages[messages.length - 1].suggestions && (
          <div className={`p-4 border-t ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
          }`}>
            <p className={`text-sm mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{t('aiStudio.suggestions')}</p>
            <div className="flex flex-wrap gap-2">
              {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-3 py-1 text-xs border rounded-full transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className={`p-4 border-t ${
          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t('aiStudio.placeholder')}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;
