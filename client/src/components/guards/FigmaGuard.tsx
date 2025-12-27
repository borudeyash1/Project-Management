import React from 'react';
import ConnectionGuard from './ConnectionGuard';
import { Palette } from 'lucide-react';

interface FigmaGuardProps {
    children: React.ReactNode;
}

const FigmaGuard: React.FC<FigmaGuardProps> = ({ children }) => {
    return (
        <ConnectionGuard
            service="figma"
            serviceName="Figma"
            serviceIcon={<Palette size={32} className="text-purple-600 dark:text-purple-400" />}
        >
            {children}
        </ConnectionGuard>
    );
};

export default FigmaGuard;
