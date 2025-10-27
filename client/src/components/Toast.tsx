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
        return <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />;
      case 'error':
        return <XCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />;
      case 'warning':
        return <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />;
      case 'info':
      default:
        return <Info className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return isDarkMode ? 'bg-green-900/90 border-green-700' : 'bg-green-50 border-green-200';
      case 'error':
        return isDarkMode ? 'bg-red-900/90 border-red-700' : 'bg-red-50 border-red-200';
      case 'warning':
        return isDarkMode ? 'bg-yellow-900/90 border-yellow-700' : 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return isDarkMode ? 'bg-blue-900/90 border-blue-700' : 'bg-blue-50 border-blue-200';
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
        return isDarkMode ? 'text-blue-100' : 'text-blue-800';
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
