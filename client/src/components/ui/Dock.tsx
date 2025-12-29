import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
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

import { useDock } from '../../context/DockContext';

interface DockProps {
  children: React.ReactNode;
  direction?: 'middle' | 'left' | 'right';
  className?: string;
}

type DockPosition = 'top' | 'bottom' | 'left' | 'right';

const DOCK_LOCK_KEY = 'userDockLocked';
const DOCK_EDGE_GAP = 8; // Increased to 8 to match global px-2 padding
const DOCK_TOP_OFFSET = 8;
const DOCK_BOTTOM_OFFSET = 0; // Changed from 8 to 0 to sit flush at bottom
const MotionDockWrapper = motion.div as React.ComponentType<any>;

interface DockIconProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  tooltip?: string;
  orientation?: 'horizontal' | 'vertical';
}

const DockComponent: React.FC<DockProps> = ({ children, direction = 'middle', className = '' }) => {
  const mouseX = useMotionValue(Infinity);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dockRef = useRef<HTMLDivElement>(null);
  const [dockSize, setDockSize] = useState({ width: 0, height: 0 });

  const { dockPosition, setDockPosition, isMobile } = useDock();

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(DOCK_LOCK_KEY) === 'true';
  });

  // Dock position persistence handled by DockContext now

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DOCK_LOCK_KEY, isLocked ? 'true' : 'false');
  }, [isLocked]);

  const getPositionClasses = useCallback(() => {
    switch (dockPosition) {
      case 'top':
        return 'top-0 left-1/2 -translate-x-1/2';
      case 'left':
        return 'left-6 top-1/2 -translate-y-1/2';
      case 'right':
        return 'right-6 top-1/2 -translate-y-1/2';
      case 'bottom':
      default:
        return 'bottom-0 left-1/2 -translate-x-1/2';
    }
  }, [dockPosition]);

  const determineClosestEdge = (point: { x: number; y: number }): DockPosition => {
    const { innerWidth, innerHeight } = window;
    const distances: Record<DockPosition, number> = {
      top: point.y,
      bottom: innerHeight - point.y,
      left: point.x,
      right: innerWidth - point.x
    };

    return (Object.keys(distances) as DockPosition[]).reduce((closest, edge) => {
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
      event.preventDefault();
      dragControls.start(event);
    },
    [dragControls, isLocked]
  );

  const isVertical = dockPosition === 'left' || dockPosition === 'right';
  const isTopOrBottom = dockPosition === 'top' || dockPosition === 'bottom';
  const blurPosition = dockPosition === 'top' ? 'top' : dockPosition === 'bottom' ? 'bottom' : null;
  const controlPositionStyles = useMemo(() => {
    if (isVertical) {
      return { top: '0.75rem', right: '-2.5rem', flexDirection: 'column' as const };
    }
    return { top: '-2.25rem', right: '1rem', flexDirection: 'row' as const };
  }, [isVertical]);

  const anchorStyle = useMemo(() => {
    const base: React.CSSProperties = {
      cursor: isLocked ? 'default' : 'grab',
      pointerEvents: 'none',
      x,
      y
    } as any as React.CSSProperties;

    if (dockPosition === 'top') {
      return {
        ...base,
        top: 0,
        left: 0,
        right: 0,
        width: '100%', // Full width
        margin: 0
      };
    }
    if (dockPosition === 'bottom') {
      return {
        ...base,
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%', // Full width
        margin: 0
      };
    }


    if (dockPosition === 'left') {
      return { ...base, left: DOCK_EDGE_GAP + 6, top: '166px', bottom: 'auto' }; // Start below header (6px lower)
    }
    return { ...base, right: DOCK_EDGE_GAP + 6, top: '166px', bottom: 'auto' }; // Start below header (6px lower)
  }, [dockPosition, dockSize.width, isLocked, x, y]);

  useEffect(() => {
    if (!dockRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDockSize({ width, height });
    });
    observer.observe(dockRef.current);
    return () => observer.disconnect();
  }, []);

  // Removed body padding logic to allow full-width headers
  // The layout spacing is now handled by the parent container in AppLayout

  useEffect(() => {
    if (!dockRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDockSize({ width, height });
    });
    observer.observe(dockRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Progressive Blur Background */}
      {blurPosition && !isTopOrBottom && (
        <div
          className={`fixed ${blurPosition === 'bottom' ? 'bottom-0' : 'top-0'} left-0 right-0 h-40 pointer-events-none z-40`}
        >
          <ProgressiveBlur position={blurPosition} height="100%" />
        </div>
      )}

      {/* Dock Container */}
      <MotionDockWrapper
        className={`fixed z-50 ${className}`}
        drag={!isLocked && !isMobile}
        dragControls={dragControls}
        dragListener={!isLocked && !isMobile}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={anchorStyle as any}
        onMouseMove={(e: React.MouseEvent) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        <div
          ref={dockRef}
          className={`${isTopOrBottom
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm'
            : ''
            }`}
          style={{
            background: (isTopOrBottom || isVertical)
              ? undefined
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            position: 'relative',
            display: 'flex',
            alignItems: isVertical ? 'flex-start' : 'center',
            justifyContent: isTopOrBottom ? 'center' : 'flex-start',
            flexDirection: isVertical ? 'column' : 'row',
            gap: isVertical ? '0.5rem' : '0.5rem',
            padding: isTopOrBottom ? '0 1rem' : (isVertical ? '5rem 0.25rem 1.5rem 0.25rem' : '0.85rem 1.5rem 0.85rem 3.5rem'),
            borderRadius: isTopOrBottom ? '0' : '1.5rem',
            boxShadow: (isTopOrBottom || isVertical)
              ? 'none'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            minWidth: isVertical ? '60px' : undefined,
            width: isTopOrBottom ? '100%' : undefined,
            height: isTopOrBottom ? '48px' : undefined,
            maxHeight: isVertical ? '70vh' : undefined,
            pointerEvents: 'auto',
            cursor: (isLocked || isTopOrBottom) ? 'default' : 'grab',
            border: (isTopOrBottom || isVertical) ? undefined : '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <div
            className="absolute gap-2 z-20 pointer-events-auto"
            style={{
              display: (isTopOrBottom || isVertical) ? 'none' : 'flex',
              alignItems: 'center',
              ...controlPositionStyles
            }}
          >
            <button
              type="button"
              onClick={() => setIsLocked((prev) => !prev)}
              className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 shadow-lg hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 transition-all"
              title={isLocked ? 'Lock dock' : 'Unlock dock'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>

          {/* Glass Effect Overlay - Enhanced for modern look */}
          {!isTopOrBottom && !isVertical && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent dark:from-gray-800/60 dark:via-gray-900/30 dark:to-transparent backdrop-blur-3xl rounded-[1.5rem]" />
          )}

          {/* Border Gradient - Enhanced */}
          {!isTopOrBottom && (
            <div
              className="absolute inset-0 rounded-[1.5rem]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                padding: '1px'
              }}
            />
          )}

          {/* Content */}
          <div
            ref={(node) => {
              if (node) {
                // Attach wheel listener directly to support non-passive behavior if needed, 
                // though React onWheel is usually fine. Native listener gives more control.
                node.onwheel = (e) => {
                  if (e.deltaY !== 0) {
                    node.scrollLeft += e.deltaY;
                    e.preventDefault();
                  }
                };
              }
            }}
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: isVertical ? 'flex-start' : 'center',
              justifyContent: isTopOrBottom ? 'flex-start' : 'flex-start',
              flexDirection: isVertical ? 'column' : 'row',
              flexWrap: 'nowrap',
              gap: isTopOrBottom ? 0 : '0.75rem', // Gap handled by inner wrapper for Top/Bottom
              overflowX: isVertical ? 'hidden' : 'auto', // Always auto for horizontal to allow scroll
              overflowY: isVertical ? 'auto' : 'hidden',
              scrollbarWidth: 'none',
              width: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              // Padding handled by inner wrapper for Top/Bottom
              paddingLeft: (isTopOrBottom) ? '1rem' : '0',
              paddingRight: (isTopOrBottom) ? '1rem' : '0',
              WebkitOverflowScrolling: 'touch'
            }}
            className="scrollbar-hide"
          >

            {/* Inner centering wrapper for horizontal docks */}
            {isTopOrBottom ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center', // Items inside align center
                  gap: isMobile ? '0.5rem' : '0.75rem',
                  margin: '0 auto', // Centers this wrapper in the parent scroll view if space allows
                  minWidth: 'min-content', // Allows growing
                  // padding handled by parent scroll container
                }}
              >
                {React.Children.map(children, (child) => {
                  if (React.isValidElement(child)) {
                    return React.cloneElement(child, { mouseX, dockPosition } as any);
                  }
                  return child;
                })}
              </div>
            ) : (
              // Vertical or other layouts remain direct children (preserving existing Vertical behavior)
              React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, { mouseX, dockPosition } as any);
                }
                return child;
              })
            )}
          </div>

          {/* Bottom Glow */}
          {/* Bottom Glow */}
          {dockPosition === 'bottom' && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-blue-500/20 to-transparent blur-xl" />
          )}
          {dockPosition === 'top' && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-blue-500/20 to-transparent blur-xl" />
          )}
        </div>
      </MotionDockWrapper>
    </>
  );
};

// Memoize to prevent re-animation on navigation
export const Dock = React.memo(DockComponent);

export const DockIcon: React.FC<DockIconProps & { mouseX?: MotionValue<number>; dockPosition?: DockPosition }> = ({
  children,
  className = '',
  onClick,
  active = false,
  tooltip,
  mouseX: parentMouseX,
  orientation = 'horizontal',
  dockPosition = 'bottom' // Default if not passed
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const defaultMouseX = useMotionValue(Infinity);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const distance = useTransform(parentMouseX || defaultMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Keep width constant, base size
  const width = 56;

  // Retrieve isMobile from context (via parent passing or duplicate hook usage? - Context is cleaner)
  // Since this component is outside the Provider in some usages possibly? No, always inside.
  // Actually, simpler to just pass isMobile as prop or use hook if we are sure it's inside provider.
  // We'll use the hook.
  const { isMobile } = useDock();

  const scaleSync = useTransform(distance, [-150, 0, 150], [1, 1.1, 1]);
  const scale = useSpring(isMobile ? 1 : scaleSync, { mass: 0.1, stiffness: 150, damping: 12 });

  // Removed split-apart animation - icons stay in place
  const marginLeft = useMotionValue(0);
  const marginRight = useMotionValue(0);

  const handleMouseEnter = () => {
    if (ref.current && tooltip) {
      const rect = ref.current.getBoundingClientRect();
      let x = 0;
      let y = 0;

      switch (dockPosition) {
        case 'top':
          x = rect.left + rect.width / 2;
          y = rect.bottom + 8; // 8px below the icon
          break;
        case 'left':
          x = rect.right + 8; // 8px to the right of the icon
          y = rect.top + rect.height / 2;
          break;
        case 'right':
          x = rect.left - 8; // 8px to the left of the icon
          y = rect.top + rect.height / 2;
          break;
        case 'bottom':
        default:
          x = rect.left + rect.width / 2;
          y = rect.top - 8; // 8px above the icon
          break;
      }

      setTooltipPos({ x, y });
    }
  };

  return (
    <div
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setTooltipPos(null)}
    >
      <motion.div
        ref={ref}
        style={{
          width,
          marginLeft,
          marginRight,
          scale
        }}
      >
        {/* Tooltip Portal */}
        {tooltip && tooltipPos && createPortal(
          <div
            className="fixed px-4 py-2 bg-black/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/10 dark:border-gray-700/50 text-white text-sm font-medium rounded-lg shadow-xl z-[9999] pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform:
                dockPosition === 'left'
                  ? 'translateY(-50%)'
                  : dockPosition === 'right'
                    ? 'translateX(-100%) translateY(-50%)'
                    : dockPosition === 'top'
                      ? 'translateX(-50%)'
                      : 'translateX(-50%) translateY(-100%)'
            }}
          >
            {tooltip}
            {/* Arrow */}
            <div
              className={`absolute w-3 h-3 bg-black/90 dark:bg-gray-900/90 border-t border-l border-white/10 dark:border-gray-700/50 transform rotate-45 ${dockPosition === 'left'
                ? 'left-[-5px] top-1/2 -translate-y-1/2 -rotate-45 border-t-0 border-l-0 border-b border-r'
                : dockPosition === 'right'
                  ? 'right-[-5px] top-1/2 -translate-y-1/2 rotate-135 border-t-0 border-l-0 border-b border-r'
                  : dockPosition === 'top'
                    ? 'top-[-5px] left-1/2 -translate-x-1/2 rotate-45'
                    : 'bottom-[-5px] left-1/2 -translate-x-1/2 rotate-225'
                }`}
            />
          </div>,
          document.body
        )}

        <button
          onClick={onClick}
          className={`relative w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${active
            ? 'bg-accent text-white shadow-lg'
            : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-md'
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
            <div className="absolute inset-0 bg-accent/30 blur-sm" />
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
