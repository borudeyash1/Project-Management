import React, { useState } from 'react';
import { AlertTriangle, Plus, Clock, User } from 'lucide-react';
import { useTracker } from '../../../context/TrackerContext';
import { useTranslation } from 'react-i18next';

interface IssueBoardProps {
  searchQuery: string;
}

const IssueBoard: React.FC<IssueBoardProps> = ({ searchQuery }) => {
  const { t } = useTranslation();
  const { issues, createIssue, updateIssue, resolveIssue } = useTracker();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns = [
    { id: 'reported', label: t('tracker.issueBoard.columns.reported'), color: 'bg-gray-300' },
    { id: 'investigating', label: t('tracker.issueBoard.columns.investigating'), color: 'bg-yellow-200' },
    { id: 'in_progress', label: t('tracker.issueBoard.columns.inProgress'), color: 'bg-blue-200' },
    { id: 'resolved', label: t('tracker.issueBoard.columns.resolved'), color: 'bg-green-200' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const filteredIssues = (status: string) => {
    return issues.filter(issue => {
      if (issue.status !== status) return false;
      if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  return (
    <div className="h-full overflow-x-auto p-6">
      <div className="flex gap-4 h-full min-w-max">
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="p-4 border-b border-gray-300 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{column.label}</h3>
                  <span className="text-sm text-gray-600">{filteredIssues(column.id).length}</span>
                </div>
                {column.id === 'reported' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-1 text-accent-dark hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {filteredIssues(column.id).map(issue => (
                <div
                  key={issue._id}
                  className={`bg-white dark:bg-gray-700 rounded-lg border-l-4 ${getSeverityColor(issue.severity)} p-4 cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {issue.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      issue.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-600' :
                      issue.severity === 'high' ? 'bg-orange-200 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-600' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {issue.description}
                  </p>
                  {issue.linkedTaskTitle && (
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                      {t('tracker.issueBoard.taskLabel')} {issue.linkedTaskTitle}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-200">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {issue.assigneeName || t('tracker.issueBoard.unassigned')}
                    </div>
                    {issue.slaDeadline && (
                      <div className={`flex items-center gap-1 ${issue.slaBreached ? 'text-red-600' : ''}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(issue.slaDeadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueBoard;
