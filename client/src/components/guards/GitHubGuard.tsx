import React from 'react';
import ConnectionGuard from './ConnectionGuard';
import { Github } from 'lucide-react';

interface GitHubGuardProps {
    children: React.ReactNode;
}

const GitHubGuard: React.FC<GitHubGuardProps> = ({ children }) => {
    return (
        <ConnectionGuard
            service="github"
            serviceName="GitHub"
            serviceIcon={<Github size={32} className="text-gray-900 dark:text-white" />}
        >
            {children}
        </ConnectionGuard>
    );
};

export default GitHubGuard;
