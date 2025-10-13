import React from 'react';
import Toast from './Toast';
import { useApp } from '../context/AppContext';

const ToastContainer = () => {
  const { state, dispatch } = useApp();

  const removeToast = (index) => {
    dispatch({ type: 'REMOVE_TOAST', payload: index });
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3">
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
