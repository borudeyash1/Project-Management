import React, { useState, useEffect } from 'react';
import {
  Activity, Clock, FileText, Users, AlertTriangle, BarChart3,
  Settings, Play, Pause, StopCircle, Search, Bell, Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDock } from '../../context/DockContext';
import { useTracker } from '../../context/TrackerContext';
import { useRefreshData } from '../../hooks/useRefreshData';
import ActivityFeed from './views/ActivityFeed';
import TimesheetView from './views/TimesheetView';
import TeamDashboard from './views/TeamDashboard';
import IssueBoard from './views/IssueBoard';
import TaskWorklog from './views/TaskWorklog';
import ReportsBuilder from './views/ReportsBuilder';
import SLAMonitor from './views/SLAMonitor';

type ViewType = 'activity' | 'timesheet' | 'dashboard' | 'issues' | 'worklog' | 'reports' | 'sla';

const TrackerLayout: React.FC = () => {
  const { activeTimer, startTimer, stopTimer, teamMetrics, alerts, fetchData } = useTracker();
  const { dockPosition } = useDock();
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);

  // Enable refresh button
  useRefreshData(fetchData, [fetchData]);

  // Update timer duration every second
  useEffect(() => {
    if (!activeTimer) {
      setTimerDuration(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeTimer.startTime.getTime()) / 1000);
      setTimerDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { id: 'dashboard' as ViewType, label: t('navigation.dashboard'), icon: BarChart3, badge: null },
    { id: 'activity' as ViewType, label: t('tracker.recentActivity'), icon: Activity, badge: null },
    { id: 'timesheet' as ViewType, label: t('tracker.entries'), icon: FileText, badge: null },
    { id: 'issues' as ViewType, label: t('tracker.running'), icon: AlertTriangle, badge: teamMetrics.idleAlerts },
    { id: 'worklog' as ViewType, label: t('tracker.task'), icon: Clock, badge: null },
    { id: 'reports' as ViewType, label: t('tracker.reports'), icon: BarChart3, badge: null },
    { id: 'sla' as ViewType, label: t('tracker.slaMonitor'), icon: Bell, badge: alerts.filter(a => !a.acknowledged).length }
  ];

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tracker.title')}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {t('tracker.subtitle')}
            </p>
          </div>

          {/* Timer Widget */}
          <div className="flex items-center gap-4">
            {/* Alerts Badge */}
            {unacknowledgedAlerts > 0 && (
              <button
                onClick={() => setCurrentView('sla')}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unacknowledgedAlerts}
                </span>
              </button>
            )}

            {/* Timer Display */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Clock className={`w-5 h-5 ${activeTimer ? 'text-green-600 animate-pulse' : 'text-gray-600'}`} />
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                  {formatDuration(timerDuration)}
                </div>
                {activeTimer && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-32">
                    {activeTimer.taskTitle || 'No task'}
                  </div>
                )}
              </div>

              {/* Timer Controls */}
              <div className="flex gap-2 ml-2">
                {!activeTimer ? (
                  <button
                    onClick={() => startTimer()}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Start Timer"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={stopTimer}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Stop Timer"
                    >
                      <StopCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Toolbar */}
      <div
        className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-3 transition-all duration-300"
        style={{
          paddingLeft: dockPosition === 'left' ? '100px' : undefined,
          paddingRight: dockPosition === 'right' ? '100px' : undefined
        }}
      >
        <div className="flex items-center justify-between">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentView === item.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-accent-dark dark:text-accent-light'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('forms.searchPlaceholder')}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters
                ? 'bg-blue-100 dark:bg-blue-900/30 text-accent-dark dark:text-accent-light'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1">
                  Date Range
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1">
                  Project
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>All Projects</option>
                  <option>Project A</option>
                  <option>Project B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1">
                  User
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>All Users</option>
                  <option>Current User</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1">
                  Status
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>All Status</option>
                  <option>Running</option>
                  <option>Stopped</option>
                  <option>Submitted</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className="flex-1 overflow-hidden transition-all duration-300"
        style={{
          paddingLeft: dockPosition === 'left' ? '100px' : undefined,
          paddingRight: dockPosition === 'right' ? '100px' : undefined
        }}
      >
        {currentView === 'dashboard' && <TeamDashboard searchQuery={searchQuery} />}
        {currentView === 'activity' && <ActivityFeed searchQuery={searchQuery} />}
        {currentView === 'timesheet' && <TimesheetView searchQuery={searchQuery} />}
        {currentView === 'issues' && <IssueBoard searchQuery={searchQuery} />}
        {currentView === 'worklog' && <TaskWorklog searchQuery={searchQuery} />}
        {currentView === 'reports' && <ReportsBuilder searchQuery={searchQuery} />}
        {currentView === 'sla' && <SLAMonitor searchQuery={searchQuery} />}
      </div>
    </div>
  );
};

export default TrackerLayout;
