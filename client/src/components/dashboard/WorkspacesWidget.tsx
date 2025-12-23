import React from 'react';
import { Briefcase, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface Workspace {
    _id: string;
    name: string;
    role: string;
    memberCount: number;
}

interface WorkspacesWidgetProps {
    workspaces: Workspace[];
    loading?: boolean;
}

const WorkspacesWidget: React.FC<WorkspacesWidgetProps> = ({ workspaces, loading }) => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className={`rounded-2xl border p-6 h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border p-6 h-full flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('home.workspaces')}</h3>
                </div>
                <button
                    onClick={() => navigate('/workspace')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                    {t('home.viewAll')}
                </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
                {workspaces && workspaces.length > 0 ? (
                    workspaces.map(ws => (
                        <div
                            key={ws._id}
                            className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${isDarkMode
                                ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                                : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                                }`}
                            onClick={() => navigate(`/workspace`)}
                        >
                            <div>
                                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{ws.name}</h4>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ws.role}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="w-3 h-3" />
                                {ws.memberCount}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={`text-center text-sm py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No workspaces found</p>
                )}
            </div>
        </div>
    );
};

export default WorkspacesWidget;
