import React, { useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  style?: React.CSSProperties;
}

export const MagicCard: React.FC<MagicCardProps> = ({
  children,
  className = '',
  gradientSize = 200,
  gradientColor,
  gradientOpacity = 0.8,
  style = {},
}) => {
  const { isDarkMode } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const defaultGradientColor = gradientColor || (isDarkMode ? '#262626' : '#D9D9D955');

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        background: isHovering
          ? `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${defaultGradientColor}, transparent)`
          : style.backgroundColor || 'transparent',
      }}
    >
      {children}
    </div>
  );
};

export default MagicCard;
