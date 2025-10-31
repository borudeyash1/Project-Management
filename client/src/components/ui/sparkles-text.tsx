import React, { CSSProperties, ReactNode, useMemo } from 'react';

interface SparklesTextProps {
  children: ReactNode;
  className?: string;
  colors?: {
    first: string;
    second: string;
  };
  sparklesCount?: number;
}

interface Sparkle {
  id: number;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
}

export const SparklesText: React.FC<SparklesTextProps> = ({
  children,
  className = '',
  colors = {
    first: '#fbbf24',  // yellow-400
    second: '#f59e0b',  // yellow-500
  },
  sparklesCount = 8,
}) => {
  const sparkles: Sparkle[] = useMemo(() => {
    return Array.from({ length: sparklesCount }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 1,
    }));
  }, [sparklesCount]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute pointer-events-none"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animation: `sparkle ${sparkle.duration}s ease-in-out ${sparkle.delay}s infinite`,
          }}
        >
          <svg
            width={sparkle.size}
            height={sparkle.size}
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
              fill={sparkle.id % 2 === 0 ? colors.first : colors.second}
            />
          </svg>
        </span>
      ))}

      {/* Text */}
      <span className="relative z-10">{children}</span>

      {/* Animation styles */}
      <style>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SparklesText;
