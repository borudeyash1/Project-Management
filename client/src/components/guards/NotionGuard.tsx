import React from 'react';
import ConnectionGuard from './ConnectionGuard';
import { FileText } from 'lucide-react';

interface NotionGuardProps {
    children: React.ReactNode;
}

const NotionGuard: React.FC<NotionGuardProps> = ({ children }) => {
    return (
        <ConnectionGuard
            service="notion"
            serviceName="Notion"
            serviceIcon={<FileText size={32} className="text-gray-900 dark:text-white" />}
        >
            {children}
        </ConnectionGuard>
    );
};

export default NotionGuard;
