import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Target,
    CheckSquare,
    Users,
    Calendar,
    BarChart3,
    FileText,
    Folder,
    Settings,
    Bell,
    Zap
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface QuickLink {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    color: string;
    bgColor: string;
}

const QuickLinks: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const quickLinks: QuickLink[] = [
        {
            id: 'projects',
            label: 'Projects',
            icon: Target,
            path: '/workspace',
            color: 'text-blue-600',
            bgColor: isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'
        },
        {
            id: 'tasks',
            label: 'Tasks',
            icon: CheckSquare,
            path: '/tasks',
            color: 'text-green-600',
            bgColor: isDarkMode ? 'bg-green-900/50' : 'bg-green-50'
        },
        {
            id: 'team',
            label: 'Team',
            icon: Users,
            path: '/team',
            color: 'text-purple-600',
            bgColor: isDarkMode ? 'bg-purple-900/50' : 'bg-purple-50'
        },
        {
            id: 'calendar',
            label: 'Calendar',
            icon: Calendar,
            path: '/planner',
            color: 'text-orange-600',
            bgColor: isDarkMode ? 'bg-orange-900/50' : 'bg-orange-50'
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: BarChart3,
            path: '/analytics',
            color: 'text-red-600',
            bgColor: isDarkMode ? 'bg-red-900/50' : 'bg-red-50'
        },
        {
            id: 'files',
            label: 'Files',
            icon: FileText,
            path: '/files',
            color: 'text-indigo-600',
            bgColor: isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-50'
        },
        {
            id: 'goals',
            label: 'Goals',
            icon: Zap,
            path: '/goals',
            color: 'text-yellow-600',
            bgColor: isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-50'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            path: '/settings',
            color: 'text-gray-600',
            bgColor: isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        }
    ];

    return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 mb-6`}>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Quick Links
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <button
                            key={link.id}
                            onClick={() => navigate(link.path)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all hover:scale-105 ${link.bgColor
                                } ${isDarkMode ? 'hover:bg-opacity-70' : 'hover:shadow-md'}`}
                        >
                            <div className={`${link.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {link.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickLinks;
