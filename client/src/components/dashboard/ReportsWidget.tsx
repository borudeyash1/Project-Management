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

    useEffect(() => {
        loadReports();
    }, [t]);

    const loadReports = async () => {
        try {
            setLoading(true);
            const data = await getReportsSummary();

            setMetrics([
                {
                    label: t('widgets.tasksCompleted'),
                    value: data.tasksCompletedThisWeek || 0,
                    change: data.tasksCompletedChange || 0,
                    icon: CheckCircle,
                    color: 'text-green-600'
                },
                {
                    label: t('widgets.projectsOnTrack'),
                    value: `${data.projectsOnTrack || 0}/${data.totalProjects || 0}`,
                    icon: Target,
                    color: 'text-blue-600'
                },
                {
                    label: t('widgets.atRisk'),
                    value: data.projectsAtRisk || 0,
                    icon: AlertTriangle,
                    color: 'text-red-600'
                },
                {
                    label: t('widgets.productivity'),
                    value: `${data.productivityScore || 0}%`,
                    change: data.productivityChange || 0,
                    icon: TrendingUp,
                    color: 'text-purple-600'
                }
            ]);
        } catch (error) {
            console.error('Failed to load reports:', error);
            // Set default metrics on error
            setMetrics([
                { label: t('widgets.tasksCompleted'), value: 0, icon: CheckCircle, color: 'text-green-600' },
                { label: t('widgets.projectsOnTrack'), value: '0/0', icon: Target, color: 'text-blue-600' },
                { label: t('widgets.atRisk'), value: 0, icon: AlertTriangle, color: 'text-red-600' },
                { label: t('widgets.productivity'), value: '0%', icon: TrendingUp, color: 'text-purple-600' }
            ]);
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

    return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('widgets.weeklyReports')}
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
                onClick={() => navigate('/analytics')}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                {t('widgets.viewFullReport')}
            </button>
        </div>
    );
};

export default ReportsWidget;
