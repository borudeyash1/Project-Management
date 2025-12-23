import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { getReportsSummary } from '../../services/reportsService';
import { useTranslation } from 'react-i18next';

interface ReportMetric {
    label: string;
    value: number | string;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

const ReportsWidget: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [metrics, setMetrics] = useState<ReportMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        loadReports();
    }, [t]);

    const loadReports = async () => {
        try {
            setLoading(true);
            setHasError(false);
            const data = await getReportsSummary();

            setMetrics([
                {
                    label: t('home.tasksCompletedWidget'),
                    value: data.tasksCompletedThisWeek || 0,
                    change: data.tasksCompletedChange || 0,
                    icon: CheckCircle,
                    color: 'text-green-600'
                },
                {
                    label: t('home.projectsOnTrack'),
                    value: `${data.projectsOnTrack || 0}/${data.totalProjects || 0}`,
                    icon: Target,
                    color: 'text-blue-600'
                },
                {
                    label: t('home.atRisk'),
                    value: data.projectsAtRisk || 0,
                    icon: AlertTriangle,
                    color: 'text-red-600'
                },
                {
                    label: t('home.productivityWidget'),
                    value: `${data.productivityScore || 0}%`,
                    change: data.productivityChange || 0,
                    icon: TrendingUp,
                    color: 'text-purple-600'
                }
            ]);
        } catch (error) {
            console.error('Failed to load reports:', error);
            setHasError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    // Show empty state when no data
    if (hasError || metrics.length === 0) {
        return (
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('home.weeklyReports')}
                    </h2>
                    <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center py-8">
                    <BarChart3 className={`w-12 h-12 mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('home.noReportsAvailable')}
                    </p>
                    <p className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {t('home.startWorkingMessage')}
                    </p>
                </div>

                {/* View Full Report Button */}
                <button
                    onClick={() => navigate('/reports')}
                    className="w-full py-2 px-4 bg-accent text-gray-900 rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
                >
                    {t('home.viewFullReport')}
                </button>
            </div>
        );
    }

    return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('home.weeklyReports')}
                </h2>
                <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <div
                            key={index}
                            className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={`w-4 h-4 ${metric.color}`} />
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {metric.label}
                                </span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {metric.value}
                                </span>
                                {metric.change !== undefined && (
                                    <span className={`text-xs font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {metric.change >= 0 ? '+' : ''}{metric.change}%
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View Full Report Button */}
            <button
                onClick={() => navigate('/reports')}
                className="w-full py-2 px-4 bg-accent text-gray-900 rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
            >
                {t('home.viewFullReport')}
            </button>
        </div>
    );
};

export default ReportsWidget;
