import React from 'react';

interface ProgressiveBlurProps {
  className?: string;
  height?: string;
  position?: 'top' | 'bottom' | 'both';
  blurLevels?: number[];
  children?: React.ReactNode;
}

export const ProgressiveBlur: React.FC<ProgressiveBlurProps> = ({
  className = '',
  height = '30%',
  position = 'bottom',
  blurLevels = [32],  // Increased blur for stronger effect
  children
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return { top: 0 };
      case 'bottom':
        return { bottom: 0 };
      case 'both':
        return { top: 0, bottom: 0 };
      default:
        return { bottom: 0 };
    }
  };

  const positionStyles = getPositionStyles();

  // Get mask gradient for progressive effect
  const getMaskGradient = () => {
    if (position === 'bottom') {
      return 'linear-gradient(to top, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)';
    } else if (position === 'top') {
      return 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)';
    } else {
      return 'linear-gradient(to bottom, black 0%, transparent 50%, black 100%)';
    }
  };

  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none ${className}`}
      style={{
        height,
        ...positionStyles
      }}
    >
      {/* Single optimized blur layer with gradient mask */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: `blur(${blurLevels[0]}px)`,
          WebkitBackdropFilter: `blur(${blurLevels[0]}px)`,
          maskImage: getMaskGradient(),
          WebkitMaskImage: getMaskGradient(),
          willChange: 'transform',
          transform: 'translateZ(0)', // Force GPU acceleration
          isolation: 'isolate', // Create stacking context for better performance
        }}
      />
      
      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: position === 'bottom'
            ? 'linear-gradient(to top, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 40%, transparent 100%)'
            : position === 'top'
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 40%, transparent 100%)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)',
          pointerEvents: 'none'
        }}
      />
      
      {children}
    </div>
  );
};

export default ProgressiveBlur;
