import React from 'react';

interface PixelCardProps {
  variant?: 'default' | 'blue' | 'yellow' | 'pink';
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
  className?: string;
  children?: React.ReactNode;
}

declare const PixelCard: React.FC<PixelCardProps>;

export default PixelCard;
