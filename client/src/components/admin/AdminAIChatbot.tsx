import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2, Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { adminAIService } from '../../services/adminAIService';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  severity?: 'info' | 'warning' | 'critical';
}

interface AdminAIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext?: any;
}

const AdminAIChatbot: React.FC<AdminAIChatbotProps> = ({ isOpen, onClose, pageContext }) => {
  const location = useLocation();
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

  // Get page-specific welcome message
  const getWelcomeMessage = () => {
    const path = location.pathname;
    
    if (path.includes('/admin/dashboard')) {
      return {
        content: `🛡️ **Admin Dashboard AI Assistant**

I can help you with:
• Real-time system health monitoring
• User activity analysis
• Security threat detection
• Performance optimization suggestions
• Anomaly detection in user behavior

What would you like to know about your system?`,
        suggestions: [
          'Analyze current system health',
          'Show me security threats',
          'Check for unusual user activity',
          'Performance recommendations'
        ]
      };
    } else if (path.includes('/admin/users')) {
      return {
        content: `👥 **User Management AI Assistant**

I can help you with:
• User behavior analysis
• Account security assessment
• Subscription pattern insights
• User engagement metrics
• Suspicious activity detection

How can I assist with user management?`,
        suggestions: [
          'Find inactive users',
          'Detect suspicious accounts',
          'Analyze user growth trends',
          'Check subscription health'
        ]
      };
    } else if (path.includes('/admin/analytics')) {
      return {
        content: `📊 **Analytics AI Assistant**

I can help you with:
• Deep dive into metrics
• Trend analysis and predictions
• Revenue optimization insights
• User retention strategies
• Performance benchmarking

What analytics would you like to explore?`,
        suggestions: [
          'Predict next month revenue',
          'Analyze user retention',
          'Show growth opportunities',
          'Compare period performance'
        ]
      };
    } else if (path.includes('/admin/releases')) {
      return {
        content: `📦 **Release Management AI Assistant**

I can help you with:
• Download pattern analysis
• Platform distribution insights
• Version adoption rates
• Release impact assessment
• Update recommendations

How can I help with releases?`,
        suggestions: [
          'Analyze download trends',
          'Check version adoption',
          'Platform performance',
          'Release recommendations'
        ]
      };
    } else if (path.includes('/admin/devices')) {
      return {
        content: `🔒 **Device Security AI Assistant**

I can help you with:
• Security vulnerability detection
• Suspicious device identification
• Access pattern analysis
• IP reputation checking
• Device fingerprint analysis

What security aspect would you like to check?`,
        suggestions: [
          'Scan for vulnerabilities',
          'Check suspicious devices',
          'Analyze login patterns',
          'IP threat assessment'
        ]
      };
    } else if (path.includes('/admin/settings')) {
      return {
        content: `⚙️ **Settings AI Assistant**

I can help you with:
• Configuration optimization
• Security policy recommendations
• System performance tuning
• Best practice suggestions
• Compliance checking

How can I help with settings?`,
        suggestions: [
          'Optimize configurations',
          'Security recommendations',
          'Performance tuning tips',
          'Check compliance'
        ]
      };
    }
    
    return {
      content: `🛡️ **Admin AI Assistant**

I'm your intelligent admin assistant. I can help you with system monitoring, security analysis, and data insights.

What would you like to know?`,
      suggestions: [
        'System overview',
        'Security status',
        'Performance metrics',
        'User insights'
      ]
    };
  };

  // Initialize with page-specific welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = getWelcomeMessage();
      const welcomeMessage: Message = {
        id: '1',
        type: 'ai',
        content: welcome.content,
        timestamp: new Date(),
        suggestions: welcome.suggestions
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, location.pathname, messages.length]);

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
      // Get page context
      const currentPage = location.pathname.split('/').pop() || 'dashboard';
      
      // Use Admin AI service to get response
      const aiResponse = await adminAIService.getAdminAIResponse(
        message,
        currentPage,
        pageContext
      );
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
        severity: aiResponse.severity
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error analyzing the data. Please try again.',
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

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative flex flex-col h-full max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-600 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Admin AI Assistant</h3>
              <p className="text-sm text-orange-100">Intelligent Security & Analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-orange-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-2xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-accent text-gray-900 ml-2' 
                    : 'bg-orange-500 text-white mr-2'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`rounded-lg px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-accent text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md'
                }`}>
                  {message.severity && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-300 dark:border-gray-600">
                      {getSeverityIcon(message.severity)}
                      <span className="text-xs font-semibold uppercase">
                        {message.severity}
                      </span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert">
                    {message.content}
                  </div>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-600 dark:text-gray-200'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-2xl">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white mr-2 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-md">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-700">Analyzing data...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length > 0 && messages[messages.length - 1].suggestions && !isLoading && (
          <div className="p-4 border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Quick actions:
            </p>
            <div className="flex flex-wrap gap-2">
              {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-orange-50 dark:hover:bg-gray-600 hover:border-orange-300 transition-colors text-gray-700 dark:text-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about security, analytics, or system insights..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAIChatbot;
