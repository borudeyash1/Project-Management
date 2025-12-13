import React, { createContext, useContext, useState, ReactNode } from 'react';

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

export const DockProvider: React.FC<DockProviderProps> = ({ children }) => {
  const [dockPosition, setDockPosition] = useState<DockPosition>('bottom');

  return (
    <DockContext.Provider value={{ dockPosition, setDockPosition }}>
      {children}
    </DockContext.Provider>
  );
};
