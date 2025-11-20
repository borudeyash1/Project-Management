import React, { useState } from 'react';
import { Activity, Clock, FileUp, MessageSquare, CheckCircle, AlertTriangle, GitCommit, Calendar, Filter } from 'lucide-react';
import { useTracker } from '../../../context/TrackerContext';

interface ActivityFeedProps {
  searchQuery: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ searchQuery }) => {
  const { activityEvents, logActivity } = useTracker();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'timer_start':
      case 'timer_stop':
        return Clock;
      case 'file_upload':
        return FileUp;
      case 'comment':
        return MessageSquare;
      case 'approval':
        return CheckCircle;
      case 'issue_created':
      case 'issue_resolved':
        return AlertTriangle;
      case 'commit':
      case 'pr_merge':
        return GitCommit;
      case 'meeting':
        return Calendar;
      default:
        return Activity;
    }
  };

  const getColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'text-accent-dark bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const filteredEvents = activityEvents.filter(event => {
    if (searchQuery && !event.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.actorName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && event.type !== filterType) {
      return false;
    }
    if (filterSeverity !== 'all' && event.severity !== filterSeverity) {
      return false;
    }
    return true;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="timer_start">Timer Start</option>
              <option value="timer_stop">Timer Stop</option>
              <option value="task_status_change">Task Status</option>
              <option value="issue_created">Issue Created</option>
              <option value="commit">Code Commit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredEvents.map(event => {
            const Icon = getIcon(event.type);
            return (
              <div
                key={event._id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getColor(event.severity)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {event.actorName}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300 mx-2">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-200">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      {event.severity && event.severity !== 'info' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-600' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-600'
                        }`}>
                          {event.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 dark:text-white mb-2">
                      {event.description}
                    </p>
                    {(event.taskTitle || event.projectName) && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-200">
                        {event.taskTitle && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {event.taskTitle}
                          </span>
                        )}
                        {event.projectName && (
                          <span className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            {event.projectName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-200">No activity events found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
