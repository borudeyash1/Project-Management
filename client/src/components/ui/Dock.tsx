import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';

interface DockProps {
  children: React.ReactNode;
  direction?: 'middle' | 'left' | 'right';
  className?: string;
}

interface DockIconProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  tooltip?: string;
}

const DockComponent: React.FC<DockProps> = ({ children, direction = 'middle', className = '' }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <>
      {/* Backdrop Blur Area */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 via-black/5 to-transparent dark:from-black/30 dark:via-black/15 backdrop-blur-sm pointer-events-none z-40" />
      
      {/* Dock Container */}
      <div 
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
        onMouseMove={(e: React.MouseEvent) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        <motion.div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '0.25rem',
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            overflow: 'visible'
          }}
        >
          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:from-gray-700/40 dark:via-gray-800/20 dark:to-transparent backdrop-blur-2xl" />
          
          {/* Border Gradient */}
          <div 
            className="absolute inset-0 rounded-2xl border border-white/30 dark:border-gray-600/30" 
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '1px'
            }} 
          />
          
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'flex-end', gap: '0.25rem' }}>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { mouseX } as any);
              }
              return child;
            })}
          </div>
          
          {/* Bottom Glow */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-blue-500/20 to-transparent blur-xl" />
        </motion.div>
      </div>
    </>
  );
};

// Memoize to prevent re-animation on navigation
export const Dock = React.memo(DockComponent);

export const DockIcon: React.FC<DockIconProps & { mouseX?: MotionValue<number> }> = ({ 
  children, 
  className = '', 
  onClick, 
  active = false,
  tooltip,
  mouseX: parentMouseX
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const defaultMouseX = useMotionValue(Infinity);

  const distance = useTransform(parentMouseX || defaultMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Keep width constant, only change margins to push icons apart
  const width = 56; // Fixed size, no enlargement
  
  // Add margin to push adjacent icons away (left and right separately for better control)
  const marginSync = useTransform(distance, [-150, 0, 150], [0, 16, 0]);
  const marginLeft = useSpring(marginSync, { mass: 0.1, stiffness: 150, damping: 12 });
  const marginRight = useSpring(marginSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <div className="group relative">
      <motion.div
        ref={ref}
        style={{ 
          width,
          marginLeft,
          marginRight
        }}
      >
        {/* Tooltip - Shows on hover */}
        {tooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-2xl z-[9999]">
            {tooltip}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px]">
              <div className="border-[7px] border-transparent border-t-black" />
            </div>
          </div>
        )}
        
        <button
        onClick={onClick}
        className={`relative w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${
          active 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50' 
            : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-md'
        } ${className}`}
        aria-label={tooltip}
      >
        {/* Glass shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Icon content */}
        <div className="relative z-10 pointer-events-none">
          {children}
        </div>
        
        {/* Active indicator glow */}
        {active && (
          <div className="absolute inset-0 bg-gradient-to-t from-blue-400/30 to-transparent blur-sm" />
        )}
      </button>
      </motion.div>
    </div>
  );
};

export const DockDivider: React.FC = () => {
  return (
    <div className="relative w-px h-10 mx-2">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/50 blur-sm" />
    </div>
  );
};
