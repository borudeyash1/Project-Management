import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
  useDragControls,
  PanInfo
} from 'framer-motion';
import { GripVertical, Lock, Unlock } from 'lucide-react';
import { ProgressiveBlur } from './progressive-blur';

interface AdminDockProps {
  children: React.ReactNode;
  direction?: 'middle' | 'left' | 'right';
  className?: string;
}

type AdminDockPosition = 'top' | 'bottom' | 'left' | 'right';

const ADMIN_DOCK_POSITION_KEY = 'adminDockPosition';
const ADMIN_DOCK_LOCK_KEY = 'adminDockLocked';
const ADMIN_DOCK_SAFE_OFFSET = 132;
const MotionAdminDockWrapper = motion.div as React.ComponentType<any>;

interface AdminDockIconProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  tooltip?: string;
}

const AdminDockComponent: React.FC<AdminDockProps> = ({ children, direction = 'middle', className = '' }) => {
  const mouseX = useMotionValue(Infinity);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const bodyPaddingRef = useRef<{ top: string; bottom: string; left: string; right: string } | null>(null);
  const [dockPosition, setDockPosition] = useState<AdminDockPosition>(() => {
    if (typeof window === 'undefined') return 'bottom';
    const stored = window.localStorage.getItem(ADMIN_DOCK_POSITION_KEY) as AdminDockPosition | null;
    return stored ?? 'bottom';
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(ADMIN_DOCK_LOCK_KEY) === 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ADMIN_DOCK_POSITION_KEY, dockPosition);
  }, [dockPosition]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ADMIN_DOCK_LOCK_KEY, isLocked ? 'true' : 'false');
  }, [isLocked]);

  const getPositionClasses = useCallback(() => {
    switch (dockPosition) {
      case 'top':
        return 'top-6 left-1/2 -translate-x-1/2';
      case 'left':
        return 'left-6 top-1/2 -translate-y-1/2';
      case 'right':
        return 'right-6 top-1/2 -translate-y-1/2';
      case 'bottom':
      default:
        return 'bottom-6 left-1/2 -translate-x-1/2';
    }
  }, [dockPosition]);

  const determineClosestEdge = (point: { x: number; y: number }): AdminDockPosition => {
    const { innerWidth, innerHeight } = window;
    const distances: Record<AdminDockPosition, number> = {
      top: point.y,
      bottom: innerHeight - point.y,
      left: point.x,
      right: innerWidth - point.x
    };

    return (Object.keys(distances) as AdminDockPosition[]).reduce((closest, edge) => {
      return distances[edge] < distances[closest] ? edge : closest;
    }, 'bottom');
  };

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (isLocked || typeof window === 'undefined') return;
      const next = determineClosestEdge(info.point);
      setDockPosition(next);
      x.set(0);
      y.set(0);
    },
    [isLocked, x, y]
  );

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      if (isLocked) return;
      dragControls.start(event);
    },
    [dragControls, isLocked]
  );

  const isVertical = dockPosition === 'left' || dockPosition === 'right';
  const blurPosition = dockPosition === 'top' ? 'top' : dockPosition === 'bottom' ? 'bottom' : null;
  const controlsAlignment = isVertical ? 'top-2 right-2 flex-col' : 'top-2 right-2 flex-row';
  const dockStyle = useMemo(() => ({ cursor: isLocked ? 'default' : 'grab', x, y }), [isLocked, x, y]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (!bodyPaddingRef.current) {
      bodyPaddingRef.current = {
        top: body.style.paddingTop,
        bottom: body.style.paddingBottom,
        left: body.style.paddingLeft,
        right: body.style.paddingRight
      };
    }

    const base = bodyPaddingRef.current;
    const offsetValue = `${ADMIN_DOCK_SAFE_OFFSET}px`;
    body.style.paddingTop = dockPosition === 'top' ? offsetValue : base?.top || '';
    body.style.paddingBottom = dockPosition === 'bottom' ? offsetValue : base?.bottom || '';
    body.style.paddingLeft = dockPosition === 'left' ? offsetValue : base?.left || '';
    body.style.paddingRight = dockPosition === 'right' ? offsetValue : base?.right || '';
  }, [dockPosition]);

  useEffect(() => {
    return () => {
      if (typeof document === 'undefined' || !bodyPaddingRef.current) return;
      const body = document.body;
      const base = bodyPaddingRef.current;
      body.style.paddingTop = base.top;
      body.style.paddingBottom = base.bottom;
      body.style.paddingLeft = base.left;
      body.style.paddingRight = base.right;
    };
  }, []);

  return (
    <>
      {/* Progressive Blur Background */}
      {blurPosition && (
        <div
          className={`fixed ${blurPosition === 'bottom' ? 'bottom-0' : 'top-0'} left-0 right-0 h-40 pointer-events-none z-40`}
        >
          <ProgressiveBlur position={blurPosition} height="100%" />
        </div>
      )}

      {/* Admin Dock Container */}
      <MotionAdminDockWrapper
        className={`fixed z-50 transform ${getPositionClasses()} ${className}`}
        drag={!isLocked}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={dockStyle as any}
        onMouseMove={(e: React.MouseEvent) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.95) 0%, rgba(249, 115, 22, 0.85) 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: isVertical ? 'center' : 'flex-end',
            justifyContent: 'center',
            flexDirection: isVertical ? 'column' : 'row',
            gap: '0.25rem',
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgb(249 115 22 / 0.4)',
            overflow: 'visible'
          }}
        >
          <div className={`absolute ${controlsAlignment} gap-2 z-20`}>
            <button
              type="button"
              onPointerDown={startDrag}
              className="p-1.5 rounded-full bg-white/70 text-orange-700 shadow hover:bg-white"
              title={isLocked ? 'Unlock to drag' : 'Drag dock'}
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsLocked((prev) => !prev)}
              className="p-1.5 rounded-full bg-white/70 text-orange-700 shadow hover:bg-white"
              title={isLocked ? 'Unlock dock' : 'Lock dock'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/40 via-orange-500/20 to-transparent backdrop-blur-2xl" />
          
          {/* Border Gradient */}
          <div 
            className="absolute inset-0 rounded-2xl border border-orange-300/50" 
            style={{
              background: 'linear-gradient(135deg, rgba(251,146,60,0.2) 0%, rgba(249,115,22,0.1) 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '1px'
            }} 
          />
          
          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: isVertical ? 'center' : 'flex-end',
              justifyContent: 'center',
              flexDirection: isVertical ? 'column' : 'row',
              gap: '0.25rem'
            }}
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { mouseX } as any);
              }
              return child;
            })}
          </div>
          
          {/* Bottom Glow - Orange for Admin */}
          {dockPosition === 'bottom' && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-orange-500/30 to-transparent blur-xl" />
          )}
          {dockPosition === 'top' && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-orange-500/30 to-transparent blur-xl" />
          )}
        </div>
      </MotionAdminDockWrapper>
    </>
  );
};

// Memoize to prevent re-animation on navigation
export const AdminDock = React.memo(AdminDockComponent);

export const AdminDockIcon: React.FC<AdminDockIconProps & { mouseX?: MotionValue<number> }> = ({ 
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
  
  // Add margin to push adjacent icons away
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
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-2xl z-[9999]">
            {tooltip}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px]">
              <div className="border-[7px] border-transparent border-t-orange-600" />
            </div>
          </div>
        )}
        
        <button
        onClick={onClick}
        className={`relative w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${
          active 
            ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg shadow-orange-500/50' 
            : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-md'
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
          <div className="absolute inset-0 bg-gradient-to-t from-orange-400/30 to-transparent blur-sm" />
        )}
      </button>
      </motion.div>
    </div>
  );
};

export const AdminDockDivider: React.FC = () => {
  return (
    <div className="relative w-px h-10 mx-2">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-300 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/50 blur-sm" />
    </div>
  );
};
