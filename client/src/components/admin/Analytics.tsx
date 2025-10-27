import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, CreditCard, Activity, Calendar, 
  DollarSign, UserPlus, UserMinus, Award, Target,
  BarChart3, PieChart, LineChart
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { validateAdminToken, clearExpiredTokens } from '../../utils/tokenUtils';
import api from '../../services/api';

interface AnalyticsData {
  userGrowth: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
  subscriptions: {
    free: number;
    pro: number;
    ultra: number;
    revenue: {
      monthly: number;
      yearly: number;
    };
  };
  activity: {
    activeToday: number;
    activeThisWeek: number;
    activeThisMonth: number;
  };
  engagement: {
    avgSessionDuration: number;
    avgTasksPerUser: number;
    avgProjectsPerUser: number;
  };
}

const Analytics: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // Clear expired tokens first
    clearExpiredTokens();
    
    // Check admin token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken || !validateAdminToken(adminToken)) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/my-admin/login';
      return;
    }
    localStorage.setItem('accessToken', adminToken);
    
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('🔍 [ANALYTICS] Fetching analytics data...');
      
      const response = await api.get(`/admin/analytics?range=${timeRange}`);
      
      console.log('🔍 [ANALYTICS] Response:', response);
      
      if (response?.success) {
        console.log('✅ [ANALYTICS] Analytics fetched successfully');
        setAnalytics(response.data);
      }
    } catch (error: any) {
      console.error('❌ [ANALYTICS] Failed to fetch analytics:', error);
      addToast(error?.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        <div className="text-center py-12">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Analytics Dashboard
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Comprehensive insights and metrics
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {range === '7d' && 'Last 7 Days'}
                {range === '30d' && 'Last 30 Days'}
                {range === '90d' && 'Last 90 Days'}
                {range === '1y' && 'Last Year'}
              </button>
            ))}
          </div>
        </div>

        {/* User Growth Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <span className={`text-sm font-medium ${analytics.userGrowth.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {analytics.userGrowth.growthRate >= 0 ? '+' : ''}{analytics.userGrowth.growthRate.toFixed(1)}%
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.userGrowth.total.toLocaleString()}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Total Users
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              +{analytics.userGrowth.thisMonth} this month
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
              {analytics.activity.activeToday.toLocaleString()}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Active Today
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              {analytics.activity.activeThisWeek} this week
            </p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-purple-500">
                {analytics.subscriptions.pro + analytics.subscriptions.ultra} paid
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {((analytics.subscriptions.pro + analytics.subscriptions.ultra) / analytics.userGrowth.total * 100).toFixed(1)}%
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Conversion Rate
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              Pro: {analytics.subscriptions.pro}, Ultra: {analytics.subscriptions.ultra}
            </p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${analytics.subscriptions.revenue.monthly.toLocaleString()}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Monthly Revenue
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              ${analytics.subscriptions.revenue.yearly.toLocaleString()} yearly
            </p>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <PieChart className={`w-6 h-6 ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Subscription Distribution
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Free Plan
                  </span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.subscriptions.free} ({((analytics.subscriptions.free / analytics.userGrowth.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(analytics.subscriptions.free / analytics.userGrowth.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Pro Plan
                  </span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.subscriptions.pro} ({((analytics.subscriptions.pro / analytics.userGrowth.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(analytics.subscriptions.pro / analytics.userGrowth.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ultra Plan
                  </span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.subscriptions.ultra} ({((analytics.subscriptions.ultra / analytics.userGrowth.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(analytics.subscriptions.ultra / analytics.userGrowth.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className={`w-6 h-6 ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                User Engagement
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg. Session Duration
                  </span>
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Math.floor(analytics.engagement.avgSessionDuration / 60)}m {analytics.engagement.avgSessionDuration % 60}s
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg. Tasks Per User
                  </span>
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.engagement.avgTasksPerUser.toFixed(1)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg. Projects Per User
                  </span>
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.engagement.avgProjectsPerUser.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <LineChart className={`w-6 h-6 ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Activity Overview
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {analytics.activity.activeToday}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Today
              </div>
            </div>

            <div className="text-center">
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {analytics.activity.activeThisWeek}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active This Week
              </div>
            </div>

            <div className="text-center">
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {analytics.activity.activeThisMonth}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active This Month
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
