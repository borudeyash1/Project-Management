import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../context/ToastContext';

interface ToastProps {
  toast: ToastType;
  onRemove: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-900/20 border-green-500/30 text-green-100';
      case 'error':
        return 'bg-red-900/20 border-red-500/30 text-red-100';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-100';
      case 'info':
      default:
        return 'bg-blue-900/20 border-blue-500/30 text-blue-100';
    }
  };

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 backdrop-blur-sm ${getStyles()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
