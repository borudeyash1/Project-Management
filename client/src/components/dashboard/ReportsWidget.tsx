import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, AlertTriangle, Target, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { getReportsSummary } from '../../services/reportsService';
import { reportService, Report } from '../../services/reportService';
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
    const [recentReports, setRecentReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        loadReports();
    }, [t]);

    const loadReports = async () => {
        try {
            setLoading(true);
            setHasError(false);

            // Allow failing gracefully if one service fails
            const [summaryRes, reportsRes] = await Promise.allSettled([
                getReportsSummary(),
                reportService.getReports()
            ]);

            // Process Summary Data
            if (summaryRes.status === 'fulfilled') {
                const data = summaryRes.value || {};
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
            }

            // Process Reports List
            if (reportsRes.status === 'fulfilled') {
                const reports = reportsRes.value || [];
                // Sort by createdAt descending if not already sorted
                const sortedReports = reports.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setRecentReports(sortedReports); // Show all reports, scrollable
            } else {
                console.error('Failed to load reports list:', reportsRes.reason);
            }

        } catch (error) {
            console.error('Failed to load reports widget data:', error);
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

    // Show empty state only if BOTH metrics and reports are missing
    if (metrics.length === 0 && recentReports.length === 0) {
        return (
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('home.weeklyReports')}
                    </h2>
                    <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>

                <div className="flex flex-col items-center justify-center py-8">
                    <BarChart3 className={`w-12 h-12 mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('home.noReportsAvailable')}
                    </p>
                    <button
                        onClick={() => navigate('/reports')}
                        className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
                    >
                        {t('reports.createReport', 'Create Report')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 flex flex-col overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('home.weeklyReports')}
                </h2>
                <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>

            {/* Metrics Grid */}
            {metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
                    {metrics.map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                            <div
                                key={index}
                                className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
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
                                        <span className={`text-xs font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {metric.change >= 0 ? '+' : ''}{metric.change}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Recent Reports List */}
            {recentReports.length > 0 && (
                <div className="flex-1 min-h-0 flex flex-col">
                    <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('reports.recent', 'Recent Reports')}
                    </h3>
                    <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1 max-h-[180px]">
                        {recentReports.map((report) => (
                            <button
                                key={report._id}
                                onClick={() => navigate('/reports')}
                                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors group ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`p-2 rounded-md shrink-0 ${isDarkMode ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-100 group-hover:bg-white'
                                        }`}>
                                        <FileText className="w-4 h-4 text-accent" />
                                    </div>
                                    <div className="flex flex-col items-start overflow-hidden">
                                        <span className={`text-sm font-medium truncate w-full text-left ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                            }`}>
                                            {report.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer Action */}
            <button
                onClick={() => navigate('/reports')}
                className="w-full mt-4 py-2 px-4 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium shadow-sm hover:shadow"
            >
                {t('home.viewFullReport')}
            </button>
        </div>
    );
};

export default ReportsWidget;
