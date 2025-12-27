import React from 'react';
import ConnectionGuard from './ConnectionGuard';
import { Slack } from 'lucide-react';

interface SlackGuardProps {
    children: React.ReactNode;
}

const SlackGuard: React.FC<SlackGuardProps> = ({ children }) => {
    return (
        <ConnectionGuard
            service="slack"
            serviceName="Slack"
            serviceIcon={<Slack size={32} className="text-purple-600 dark:text-purple-400" />}
        >
            {children}
        </ConnectionGuard>
    );
};

export default SlackGuard;
