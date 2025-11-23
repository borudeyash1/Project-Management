import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import {
  Activity as ActivityIcon,
  CheckCircle,
  Target,
  Users,
  Flag,
  FileText,
  Upload,
  Award,
  MessageSquare,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import DockNavigation from './DockNavigation';
import api from '../services/api';

interface Activity {
  _id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  metadata?: any;
}

const ActivityPage: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/activities');
      setActivities(response.data || []);
    } catch (error: any) {
      console.error('Failed to load activities:', error);
      addToast('Failed to load activities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'task_created':
      case 'task_updated':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'project_created':
      case 'project_updated':
        return <Target className="w-5 h-5 text-purple-500" />;
      case 'team_joined':
        return <Users className="w-5 h-5 text-indigo-500" />;
      case 'milestone_reached':
        return <Flag className="w-5 h-5 text-orange-500" />;
      case 'file_uploaded':
        return <Upload className="w-5 h-5 text-cyan-500" />;
      case 'goal_achieved':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'comment_added':
        return <MessageSquare className="w-5 h-5 text-pink-500" />;
      default:
        return <ActivityIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return isDarkMode ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200';
      case 'task_created':
      case 'task_updated':
        return isDarkMode ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200';
      case 'project_created':
      case 'project_updated':
        return isDarkMode ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50 border-purple-200';
      case 'team_joined':
        return isDarkMode ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200';
      case 'milestone_reached':
        return isDarkMode ? 'bg-orange-900/20 border-orange-500/30' : 'bg-orange-50 border-orange-200';
      case 'file_uploaded':
        return isDarkMode ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200';
      case 'goal_achieved':
        return isDarkMode ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200';
      default:
        return isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('activity.time.justNow');
    if (diffMins < 60) return t('activity.time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('activity.time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('activity.time.daysAgo', { count: diffDays });
    return activityDate.toLocaleDateString();
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type.includes(filter);
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { value: 'all', label: t('activity.filters.all') },
    { value: 'task', label: t('activity.filters.task') },
    { value: 'project', label: t('activity.filters.project') },
    { value: 'team', label: t('activity.filters.team') },
    { value: 'goal', label: t('activity.filters.goal') },
    { value: 'file', label: t('activity.filters.file') },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-10 backdrop-blur-sm bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                <ActivityIcon className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('activity.title')}
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('activity.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('activity.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === option.value
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activities List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">{t('activity.loading')}</p>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-12 text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <ActivityIcon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('activity.empty.title')}
            </h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {t('activity.empty.description')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity._id}
                className={`${getActivityColor(activity.type)} border rounded-xl p-6 hover:shadow-lg transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {activity.title}
                    </h3>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar className="w-3 h-3" />
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dock Navigation */}
      <DockNavigation />
    </div>
  );
};

export default ActivityPage;
