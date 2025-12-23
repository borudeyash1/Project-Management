import React from 'react';
import { Target, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Goal } from '../../services/goalService';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface GoalsWidgetProps {
    goals: Goal[];
    loading?: boolean;
}

const GoalsWidget: React.FC<GoalsWidgetProps> = ({ goals, loading }) => {
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const activeGoals = goals.filter(g => g.status === 'in_progress' || g.status === 'not_started').slice(0, 3);

    if (loading) {
        return (
            <div className={`rounded-2xl border p-6 h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border p-6 h-full flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('goals.title')}</h3>
                </div>
                <button
                    onClick={() => navigate('/goals')}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                    {t('home.viewAll')}
                </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {activeGoals.length > 0 ? (
                    activeGoals.map(goal => (
                        <div
                            key={goal._id}
                            onClick={() => navigate('/goals')}
                            className={`p-3 rounded-xl border transition-all cursor-pointer group ${isDarkMode
                                ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                                : 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-purple-200'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`text-sm font-semibold line-clamp-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{goal.title}</h4>
                                <div className="flex items-center gap-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${goal.priority === 'high' || goal.priority === 'urgent'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        }`}>
                                        {goal.progress}%
                                    </span>
                                </div>
                            </div>

                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-purple-500 rounded-full transition-all group-hover:bg-purple-400"
                                    style={{ width: `${goal.progress}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(goal.targetDate).toLocaleDateString()}
                                </span>
                                <span className="capitalize">{goal.category}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center opacity-60">
                        <Target className="w-10 h-10 mb-2 text-gray-400" />
                        <p className="text-sm">{t('home.noActiveGoals')}</p>
                        <button
                            onClick={() => navigate('/goals')}
                            className="mt-2 text-xs text-purple-600 font-medium hover:underline"
                        >
                            {t('home.createOne')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoalsWidget;
