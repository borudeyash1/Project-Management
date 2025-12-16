import React, { createContext, useContext, useState, ReactNode } from 'react';

type DockPosition = 'top' | 'bottom' | 'left' | 'right';

interface DockContextType {
  dockPosition: DockPosition;
  setDockPosition: (position: DockPosition) => void;
  isMobile: boolean;
}

const DockContext = createContext<DockContextType | undefined>(undefined);

export const useDock = () => {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within DockProvider');
  }
  return context;
};

interface DockProviderProps {
  children: ReactNode;
}

export const DockProvider: React.FC<DockProviderProps> = ({ children }) => {
  const [dockPosition, setDockPosition] = useState<DockPosition>(() => {
    if (typeof window === 'undefined') return 'bottom';
    const stored = window.localStorage.getItem('userDockPosition') as DockPosition | null;
    return stored ?? 'bottom';
  });

  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('userDockPosition', dockPosition);
  }, [dockPosition]);

  // Handle Resize for Mobile View
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force 'bottom' on mobile, otherwise use user preference
  const effectiveDockPosition = isMobile ? 'bottom' : dockPosition;

  return (
    <DockContext.Provider value={{ dockPosition: effectiveDockPosition, setDockPosition, isMobile }}>
      {children}
    </DockContext.Provider>
  );
};
