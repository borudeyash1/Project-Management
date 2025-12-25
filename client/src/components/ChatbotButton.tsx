import React, { useState } from 'react';
import { MessageCircle, X, Bot } from 'lucide-react';
import AIChatbot from './AIChatbot';
import { useDock } from '../context/DockContext';
import { useTranslation } from 'react-i18next';

const ChatbotButton: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { dockPosition } = useDock();

  return (
    <>
      {/* Floating Chatbot Button */}
      <div className={`fixed right-6 z-40 transition-all duration-300 ${dockPosition === 'bottom' ? 'bottom-20' : 'bottom-6'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
        >
          <div className="flex items-center justify-center">
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </div>

          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-20"></div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {t('home.askAIAssistant')}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>

        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
          <Bot className="w-3 h-3" />
        </div>
      </div>

      {/* Chatbot Modal */}
      <AIChatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatbotButton;
