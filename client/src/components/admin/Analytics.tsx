import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, Target, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { validateAdminToken, clearExpiredTokens } from '../../utils/tokenUtils';
import AdminDockNavigation from './AdminDockNavigation';
import AdminChatbotButton from './AdminChatbotButton';
import AnalyticsCharts from './AnalyticsCharts';
import api from '../../services/api';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    usersToday: number;
    usersLast7Days: number;
    usersLast30Days: number;
    activeToday: number;
    activeLast7Days: number;
    activeLast30Days: number;
    inactive30Days: number;
    inactive90Days: number;
  };
  growth: {
    dailyGrowthRate: number;
    weeklyGrowthRate: number;
    avgDailyGrowth: string;
    userGrowthTrend: Array<{ date: string; users: number }>;
  };
  engagement: {
    engagementRate: number;
    retentionRate: number;
    churnRate: number;
    userDistribution: {
      veryActive: number;
      active: number;
      inactive: number;
      dormant: number;
    };
  };
  devices: {
    total: number;
    active: number;
    byRisk: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    suspicious: number;
    blacklisted: number;
    activityTrend: Array<{ date: string; active: number }>;
  };
  predictions: {
    nextMonthUsers: number;
    growthRate: number;
    trend: string;
  };
}

const Analytics: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    clearExpiredTokens();
    const token = localStorage.getItem('adminToken');
    if (!token || !validateAdminToken(token)) {
      navigate('/my-admin/login', { replace: true });
      return;
    }
    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics-data');
      if (response?.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      addToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen pb-32`}>
        <div className="text-center py-12">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No analytics data available</p>
        </div>
        <AdminDockNavigation />
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen pb-32`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Analytics Dashboard
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Comprehensive insights and predictions
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <span className={`text-sm font-medium ${analytics.growth.weeklyGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {analytics.growth.weeklyGrowthRate >= 0 ? '+' : ''}{analytics.growth.weeklyGrowthRate.toFixed(1)}%
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.overview.totalUsers.toLocaleString()}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Total Users
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              +{analytics.overview.usersLast30Days} this month
            </p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.overview.activeLast30Days.toLocaleString()}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Active Users (30d)
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              {analytics.engagement.engagementRate.toFixed(1)}% engagement rate
            </p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Target className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-purple-500">
                {analytics.engagement.retentionRate.toFixed(1)}%
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.predictions.nextMonthUsers.toLocaleString()}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Predicted Next Month
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              {analytics.predictions.trend === 'growing' ? '📈 Growing' : '📉 Declining'}
            </p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-500" />
              </div>
              <span className={`text-sm font-medium ${analytics.engagement.churnRate < 10 ? 'text-green-500' : 'text-red-500'}`}>
                {analytics.engagement.churnRate.toFixed(1)}%
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.overview.inactive90Days.toLocaleString()}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Dormant Users
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              Churn rate: {analytics.engagement.churnRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <AnalyticsCharts
          isDarkMode={isDarkMode}
          userGrowthTrend={analytics.growth.userGrowthTrend.map(t => ({ date: t.date, value: t.users }))}
          deviceActivityTrend={analytics.devices.activityTrend.map(t => ({ date: t.date, value: t.active }))}
          userDistribution={analytics.engagement.userDistribution}
          devicesByRisk={analytics.devices.byRisk}
        />

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Growth Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Daily Growth Rate</span>
                <span className={`font-semibold ${analytics.growth.dailyGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analytics.growth.dailyGrowthRate >= 0 ? '+' : ''}{analytics.growth.dailyGrowthRate.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Weekly Growth Rate</span>
                <span className={`font-semibold ${analytics.growth.weeklyGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analytics.growth.weeklyGrowthRate >= 0 ? '+' : ''}{analytics.growth.weeklyGrowthRate.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Avg Daily Growth</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.growth.avgDailyGrowth} users/day
                </span>
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Device Security
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Devices</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.devices.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Active Devices</span>
                <span className="font-semibold text-green-500">
                  {analytics.devices.active}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Suspicious Devices</span>
                <span className={`font-semibold ${analytics.devices.suspicious > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {analytics.devices.suspicious}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dock Navigation */}
      <AdminDockNavigation />

      {/* Admin AI Chatbot */}
      <AdminChatbotButton pageContext={analytics} />
    </div>
  );
};

export default Analytics;
