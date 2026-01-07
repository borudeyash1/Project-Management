import React, { useState } from 'react';
import { MessageCircle, X, Shield } from 'lucide-react';
import AdminAIChatbot from './AdminAIChatbot';

interface AdminChatbotButtonProps {
  pageContext?: any;
}

const AdminChatbotButton: React.FC<AdminChatbotButtonProps> = ({ pageContext }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Admin Chatbot Button */}
      <div className="fixed bottom-20 right-28 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
        >
          <div className="flex items-center justify-center">
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </div>
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-20"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Admin AI Assistant
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
        
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
          <Shield className="w-3 h-3" />
        </div>
      </div>

      {/* Admin Chatbot Modal */}
      <AdminAIChatbot 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        pageContext={pageContext}
      />
    </>
  );
};

export default AdminChatbotButton;
