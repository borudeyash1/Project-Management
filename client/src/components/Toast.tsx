import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '@/types';
import { useTheme } from '../context/ThemeContext';

interface ToastProps {
  toast: ToastType;
  onRemove: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const { isDarkMode } = useTheme();
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-600' : 'text-green-600'}`} />;
      case 'error':
        return <XCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-600' : 'text-red-600'}`} />;
      case 'warning':
        return <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-yellow-600' : 'text-yellow-600'}`} />;
      case 'info':
      default:
        return <Info className={`w-5 h-5 ${isDarkMode ? 'text-accent-light' : 'text-accent-dark'}`} />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return isDarkMode ? 'bg-green-800 border-green-600' : 'bg-green-50 border-green-200';
      case 'error':
        return isDarkMode ? 'bg-red-800 border-red-600' : 'bg-red-50 border-red-200';
      case 'warning':
        return isDarkMode ? 'bg-yellow-800 border-yellow-600' : 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return isDarkMode ? 'bg-gray-800 border-accent' : 'bg-accent/10 border-accent';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return isDarkMode ? 'text-green-100' : 'text-green-800';
      case 'error':
        return isDarkMode ? 'text-red-100' : 'text-red-800';
      case 'warning':
        return isDarkMode ? 'text-yellow-100' : 'text-yellow-800';
      case 'info':
      default:
        return isDarkMode ? 'text-gray-100' : 'text-gray-900';
    }
  };

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getBackgroundColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={onRemove}
          className={`flex-shrink-0 p-1 rounded-md ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'} ${getTextColor()}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
