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

interface AdminDockProps {
  children: React.ReactNode;
  direction?: 'middle' | 'left' | 'right';
  className?: string;
}

type AdminDockPosition = 'top' | 'bottom' | 'left' | 'right';

const ADMIN_DOCK_POSITION_KEY = 'adminDockPosition';
const ADMIN_DOCK_LOCK_KEY = 'adminDockLocked';
const DOCK_EDGE_GAP = 12;
const DOCK_TOP_OFFSET = 48;
const DOCK_BOTTOM_OFFSET = 50;
const MotionAdminDockWrapper = motion.div as React.ComponentType<any>;

interface AdminDockIconProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  tooltip?: string;
  orientation?: 'horizontal' | 'vertical';
}

const TooltipPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
};

const AdminDockComponent: React.FC<AdminDockProps> = ({ children, direction = 'middle', className = '' }) => {
  const mouseX = useMotionValue(Infinity);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dockRef = useRef<HTMLDivElement>(null);
  const [dockSize, setDockSize] = useState({ width: 0, height: 0 });
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
      event.preventDefault();
      dragControls.start(event);
    },
    [dragControls, isLocked]
  );

  const isVertical = dockPosition === 'left' || dockPosition === 'right';
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
    } as React.CSSProperties;
    if (dockPosition === 'top') {
      return {
        ...base,
        top: DOCK_TOP_OFFSET,
        left: '50%',
        marginLeft: dockSize.width ? `${-dockSize.width / 2}px` : undefined
      };
    }
    if (dockPosition === 'bottom') {
      return {
        ...base,
        bottom: DOCK_BOTTOM_OFFSET,
        left: '50%',
        marginLeft: dockSize.width ? `${-dockSize.width / 2}px` : undefined
      };
    }
    if (dockPosition === 'left') {
      return { ...base, left: DOCK_EDGE_GAP, top: '15%', bottom: '15%' };
    }
    return { ...base, right: DOCK_EDGE_GAP, top: '15%', bottom: '15%' };
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

  const safeOffset = useMemo(() => {
    const measured = dockSize.width ? dockSize.width + DOCK_EDGE_GAP * 2 : 96;
    return `${Math.max(measured, 96)}px`;
  }, [dockSize.width]);

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
    const isSideDock = dockPosition === 'left' || dockPosition === 'right';
    body.style.paddingTop = base?.top || '';
    body.style.paddingBottom = base?.bottom || '';
    body.style.paddingLeft = dockPosition === 'left' ? safeOffset : base?.left || '';
    body.style.paddingRight = dockPosition === 'right' ? safeOffset : base?.right || '';
    if (!isSideDock) {
      body.style.paddingLeft = base?.left || '';
      body.style.paddingRight = base?.right || '';
    }
  }, [dockPosition, safeOffset]);

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
      {blurPosition && dockPosition !== 'top' && (
        <div
          className={`fixed ${blurPosition === 'bottom' ? 'bottom-0' : 'top-0'} left-0 right-0 h-40 pointer-events-none z-40`}
        >
          <ProgressiveBlur position={blurPosition} height="100%" />
        </div>
      )}

      {/* Admin Dock Container */}
      <MotionAdminDockWrapper
        className={`fixed z-50 ${className}`}
        drag={!isLocked}
        dragControls={dragControls}
        dragListener={!isLocked}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={anchorStyle as any}
      >
        <div
          ref={dockRef}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: isVertical ? 'flex-start' : 'center',
            justifyContent: 'flex-start',
            flexDirection: isVertical ? 'column' : 'row',
            gap: isVertical ? '0.75rem' : '0.75rem',
            padding: isVertical ? '5rem 1.15rem 1.5rem 1.15rem' : '0.85rem 1.5rem 0.85rem 3.5rem',
            borderRadius: isVertical ? '1.5rem' : '1rem',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            overflow: 'hidden',
            minWidth: isVertical ? '80px' : undefined,
            maxHeight: isVertical ? '70vh' : undefined,
            pointerEvents: 'auto',
            cursor: isLocked ? 'default' : 'grab'
          }}
        >
          <div
            className="absolute gap-2 z-20 pointer-events-auto"
            style={{
              display: 'flex',
              alignItems: 'center',
              ...controlPositionStyles
            }}
          >
            <button
              type="button"
              onClick={() => setIsLocked((prev) => !prev)}
              className="p-1.5 rounded-full bg-white/70 text-gray-700 shadow hover:bg-white"
              title={isLocked ? 'Lock dock' : 'Unlock dock'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
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
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: isVertical ? 'flex-start' : 'flex-end',
              justifyContent: isVertical ? 'flex-start' : 'center',
              flexDirection: isVertical ? 'column' : 'row',
              gap: '0.75rem',
              overflowX: isVertical ? 'hidden' : 'auto',
              overflowY: isVertical ? 'auto' : 'hidden',
              scrollbarWidth: 'none',
              width: '100%',
              maxHeight: '100%'
            }}
            className="scrollbar-hide"
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { mouseX, orientation: isVertical ? 'vertical' : 'horizontal' } as any);
              }
              return child;
            })}
          </div>

          {/* Bottom Glow - Orange for Admin */}
          {dockPosition === 'bottom' && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-orange-500/20 to-transparent blur-xl" />
          )}
          {dockPosition === 'top' && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-orange-500/20 to-transparent blur-xl" />
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
  mouseX: parentMouseX,
  orientation = 'horizontal'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState<{ x: number; y: number; placement: 'left' | 'right' | 'top' | 'bottom' } | null>(null);
  const defaultMouseX = useMotionValue(Infinity);

  const distance = useTransform(parentMouseX || defaultMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Keep width constant, base size
  const width = 56;

  const scaleSync = useTransform(distance, [-150, 0, 150], [1, 1.1, 1]);
  const scale = useSpring(scaleSync, { mass: 0.1, stiffness: 200, damping: 10 });

  // Add margin to push adjacent icons away
  const marginSync = useTransform(distance, [-150, 0, 150], [0, 16, 0]);
  const marginLeft = useSpring(orientation === 'horizontal' ? marginSync : 0, { mass: 1, stiffness: 80, damping: 20 });
  const marginRight = useSpring(orientation === 'horizontal' ? marginSync : 0, { mass: 1, stiffness: 80, damping: 20 });

  return (
    <div className="group relative">
      <motion.div
        ref={ref}
        style={{
          width,
          marginLeft,
          marginRight,
          scale
        }}
        onHoverStart={() => {
          setShowTooltip(true);
          const bounds = ref.current?.getBoundingClientRect();
          if (bounds) {
            if (parentMouseX) {
              parentMouseX.set(bounds.x + bounds.width / 2);
            }

            // Calculate tooltip position
            let placement: 'left' | 'right' | 'top' | 'bottom' = 'top';
            let x = 0;
            let y = 0;
            const gap = 12;

            if (orientation === 'vertical') {
              if (bounds.left > window.innerWidth / 2) {
                placement = 'left';
                x = bounds.left - gap;
                y = bounds.top + bounds.height / 2;
              } else {
                placement = 'right';
                x = bounds.right + gap;
                y = bounds.top + bounds.height / 2;
              }
            } else {
              if (bounds.top < window.innerHeight / 2) {
                placement = 'bottom';
                x = bounds.left + bounds.width / 2;
                y = bounds.bottom + gap;
              } else {
                placement = 'top';
                x = bounds.left + bounds.width / 2;
                y = bounds.top - gap;
              }
            }
            setTooltipCoords({ x, y, placement });
          }
        }}
        onHoverEnd={() => {
          setShowTooltip(false);
          if (parentMouseX) {
            parentMouseX.set(Infinity);
          }
        }}
      >
        {/* Tooltip - Uses Portal to escape overflow clipping */}
        {tooltip && showTooltip && tooltipCoords && (
          <TooltipPortal>
            <div
              className="fixed px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-2xl z-[9999] pointer-events-none whitespace-nowrap transition-opacity duration-200"
              style={{
                left: tooltipCoords.x,
                top: tooltipCoords.y,
                transform:
                  tooltipCoords.placement === 'left' ? 'translate(-100%, -50%)' :
                    tooltipCoords.placement === 'right' ? 'translate(0, -50%)' :
                      tooltipCoords.placement === 'top' ? 'translate(-50%, -100%)' :
                        'translate(-50%, 0)',
                opacity: showTooltip ? 1 : 0
              }}
            >
              {tooltip}
              {/* Arrow */}
              <div
                className={`absolute w-0 h-0 border-[6px] border-transparent ${tooltipCoords.placement === 'left' ? 'border-l-orange-600 left-full top-1/2 -translate-y-1/2' :
                  tooltipCoords.placement === 'right' ? 'border-r-orange-600 right-full top-1/2 -translate-y-1/2' :
                    tooltipCoords.placement === 'top' ? 'border-t-orange-600 top-full left-1/2 -translate-x-1/2' :
                      'border-b-orange-600 bottom-full left-1/2 -translate-x-1/2'
                  }`}
              />
            </div>
          </TooltipPortal>
        )}

        <button
          onClick={onClick}
          className={`relative w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${active
            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50'
            : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-700 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-md'
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
