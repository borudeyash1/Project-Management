import React, { useState } from 'react';
import { MessageCircle, X, Bot } from 'lucide-react';
import AIChatbot from './AIChatbot';
import { useDock } from '../context/DockContext';

const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { dockPosition } = useDock();

  // Determine position based on dock
  const getPositionClasses = () => {
    if (dockPosition === 'left') {
      return 'bottom-6 right-6'; // Bottom right when dock is left
    } else if (dockPosition === 'right') {
      return 'bottom-6 left-6'; // Bottom left when dock is right
    } else if (dockPosition === 'top') {
      return 'bottom-6 right-6'; // Bottom right when dock is top
    } else {
      return 'bottom-6 right-6'; // Default bottom right for bottom dock (will be in dock footer)
    }
  };

  // Hide button when dock is at bottom (it's in the dock footer)
  const shouldShowButton = dockPosition !== 'bottom';

  if (!shouldShowButton) return <AIChatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />;

  return (
    <>
      {/* Floating Chatbot Button */}
      <div className={`fixed ${getPositionClasses()} z-40`}>
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
            Ask AI Assistant
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
