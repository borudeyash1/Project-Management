import React, { useState } from 'react';

interface StarBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  speed?: number;
}

const StarBorder: React.FC<StarBorderProps> = ({ 
  children, 
  className = '',
  color = '#FFD700',
  speed = 3
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={`relative group ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle 100px at ${mousePosition.x}px ${mousePosition.y}px, ${color}, transparent)`,
          }}
        />
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-400/50 rounded-xl transition-all duration-300" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default StarBorder;
