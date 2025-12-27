import React from 'react';
import ConnectionGuard from './ConnectionGuard';
import { Box } from 'lucide-react';

interface DropboxGuardProps {
    children: React.ReactNode;
}

const DropboxGuard: React.FC<DropboxGuardProps> = ({ children }) => {
    return (
        <ConnectionGuard
            service="dropbox"
            serviceName="Dropbox"
            serviceIcon={<Box size={32} className="text-blue-600 dark:text-blue-400" />}
        >
            {children}
        </ConnectionGuard>
    );
};

export default DropboxGuard;
