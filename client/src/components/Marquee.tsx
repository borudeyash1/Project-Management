import React from 'react';
import { cn } from '../lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  className?: string;
  repeat?: number;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  className = '',
  repeat = 4,
}) => {
  return (
    <div
      className={cn(
        'group flex overflow-hidden',
        vertical ? 'flex-col gap-4' : 'flex-row gap-4',
        pauseOnHover && 'hover:[animation-play-state:paused]',
        className
      )}
      style={{ '--gap': '1rem' } as React.CSSProperties}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 justify-around gap-4',
            vertical ? 'flex-col' : 'flex-row',
            vertical
              ? reverse ? 'animate-marquee-vertical-reverse' : 'animate-marquee-vertical'
              : reverse ? 'animate-marquee-reverse' : 'animate-marquee'
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
};

export default Marquee;
