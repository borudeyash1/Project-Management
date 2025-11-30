import React from 'react';
import './LoadingAnimation.css';

interface LoadingAnimationProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  if (fullScreen) {
    return (
      <div className="loading-container-fullscreen">
        <div className="loader"></div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className="loader"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingAnimation;
