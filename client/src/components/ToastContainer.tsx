import React from 'react';
import { useApp } from '../context/AppContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { state, dispatch } = useApp();

  const removeToast = (index: number) => {
    dispatch({ type: 'REMOVE_TOAST', payload: index });
  };

  if (state.toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {state.toasts.map((toast, index) => (
        <Toast
          key={index}
          toast={toast}
          onRemove={() => removeToast(index)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
