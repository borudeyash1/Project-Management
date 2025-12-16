import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DockPosition = 'top' | 'bottom' | 'left' | 'right';

interface DockContextType {
  dockPosition: DockPosition;
  setDockPosition: (position: DockPosition) => void;
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

const DOCK_POSITION_KEY = 'userDockPosition';

export const DockProvider: React.FC<DockProviderProps> = ({ children }) => {
  // Initialize from localStorage
  const [dockPosition, setDockPositionState] = useState<DockPosition>(() => {
    if (typeof window === 'undefined') return 'bottom';
    const stored = window.localStorage.getItem(DOCK_POSITION_KEY) as DockPosition | null;
    return stored ?? 'bottom';
  });

  // Listen for localStorage changes (when Dock component updates position)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = window.localStorage.getItem(DOCK_POSITION_KEY) as DockPosition | null;
      if (stored && stored !== dockPosition) {
        setDockPositionState(stored);
      }
    };

    // Poll for changes every 100ms (since localStorage events don't fire in same window)
    const interval = setInterval(handleStorageChange, 100);

    return () => clearInterval(interval);
  }, [dockPosition]);

  const setDockPosition = (position: DockPosition) => {
    setDockPositionState(position);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DOCK_POSITION_KEY, position);
    }
  };

  return (
    <DockContext.Provider value={{ dockPosition, setDockPosition }}>
      {children}
    </DockContext.Provider>
  );
};
