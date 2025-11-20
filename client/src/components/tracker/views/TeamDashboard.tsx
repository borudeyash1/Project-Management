import React from 'react';
import { Clock, TrendingUp, DollarSign, AlertCircle, Users, Activity, BarChart2, Timer } from 'lucide-react';
import { useTracker } from '../../../context/TrackerContext';

interface TeamDashboardProps {
  searchQuery: string;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ searchQuery }) => {
  const { teamMetrics, timeEntries, issues, activeTimer } = useTracker();

  const stats = [
    {
      label: 'Hours Today',
      value: teamMetrics.totalHoursToday.toFixed(1),
      icon: Clock,
      color: 'blue',
      trend: '+12%'
    },
    {
      label: 'Hours This Week',
      value: teamMetrics.totalHoursWeek.toFixed(1),
      icon: BarChart2,
      color: 'green',
      trend: '+8%'
    },
    {
      label: 'Utilization',
      value: `${teamMetrics.utilizationPercent.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'purple',
      trend: teamMetrics.utilizationPercent > 80 ? 'High' : 'Normal'
    },
    {
      label: 'Billable %',
      value: `${teamMetrics.billablePercent.toFixed(0)}%`,
      icon: DollarSign,
      color: 'yellow',
      trend: teamMetrics.billablePercent > 70 ? 'Good' : 'Low'
    },
    {
      label: 'Active Timers',
      value: teamMetrics.activeTimers.toString(),
      icon: Timer,
      color: 'green',
      trend: activeTimer ? 'Running' : 'Idle'
    },
    {
      label: 'Open Issues',
      value: issues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length.toString(),
      icon: AlertCircle,
      color: 'red',
      trend: issues.filter(i => i.severity === 'critical').length + ' Critical'
    },
    {
      label: 'Overtime Hours',
      value: teamMetrics.overtimeHours.toFixed(1),
      icon: Clock,
      color: 'orange',
      trend: teamMetrics.overtimeHours > 5 ? 'High' : 'Normal'
    },
    {
      label: 'Avg Cycle Time',
      value: `${teamMetrics.avgCycleTime}h`,
      icon: Activity,
      color: 'indigo',
      trend: 'Target: 20h'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-accent-dark dark:text-accent-light',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-600',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-600',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-600',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-600',
      orange: 'bg-orange-200 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Recent time entries
  const recentEntries = timeEntries
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, 10);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-200">
                    {stat.trend}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-200">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Utilization Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Utilization
            </h3>
            <div className="space-y-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => {
                const hours = 6 + Math.random() * 4;
                const percent = (hours / 8) * 100;
                return (
                  <div key={day}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-700">
                        {day}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-200">
                        {hours.toFixed(1)}h / 8h
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percent > 90 ? 'bg-green-500' : percent > 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Billable vs Non-Billable */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Billable Breakdown
            </h3>
            <div className="flex items-center justify-center h-48">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeDasharray={`${(teamMetrics.billablePercent / 100) * 502.4} 502.4`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {teamMetrics.billablePercent.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-200">
                    Billable
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-600">
                  {((teamMetrics.totalHoursWeek * teamMetrics.billablePercent) / 100).toFixed(1)}h
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-200">Billable</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-200">
                  {(teamMetrics.totalHoursWeek * (1 - teamMetrics.billablePercent / 100)).toFixed(1)}h
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-200">Non-Billable</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Time Entries
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-700">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-700">
                    Task
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-700">
                    Project
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-700">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-700">
                    Billable
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map(entry => (
                  <tr
                    key={entry._id}
                    className="border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {entry.userName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-200">
                      {entry.taskTitle || 'No task'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-200">
                      {entry.projectName || 'No project'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                      {(entry.duration / 60).toFixed(1)}h
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'running' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-600' :
                        entry.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-accent-light' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {entry.billable ? (
                        <span className="text-green-600 dark:text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
