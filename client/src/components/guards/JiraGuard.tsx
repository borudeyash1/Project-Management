import React from 'react';
import ConnectionGuard from './ConnectionGuard';
import { Trello } from 'lucide-react';

interface JiraGuardProps {
    children: React.ReactNode;
}

const JiraGuard: React.FC<JiraGuardProps> = ({ children }) => {
    return (
        <ConnectionGuard
            service="jira"
            serviceName="Jira"
            serviceIcon={<Trello size={32} className="text-blue-600 dark:text-blue-400" />}
        >
            {children}
        </ConnectionGuard>
    );
};

export default JiraGuard;
