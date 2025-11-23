import React from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';
import { useTracker } from '../../../context/TrackerContext';
import { useTranslation } from 'react-i18next';

interface SLAMonitorProps {
  searchQuery: string;
}

const SLAMonitor: React.FC<SLAMonitorProps> = ({ searchQuery }) => {
  const { t } = useTranslation();
  const { alerts, slaRules, acknowledgeAlert, resolveAlert, issues } = useTracker();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-600 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-600 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-accent-light border-blue-200';
    }
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged && !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  const breachedIssues = issues.filter(i => i.slaBreached);
  const atRiskIssues = issues.filter(i => {
    if (!i.slaDeadline || i.slaBreached) return false;
    const hoursUntilDeadline = (i.slaDeadline.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilDeadline < 4 && hoursUntilDeadline > 0;
  });

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('tracker.sla.stats.activeAlerts')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {unacknowledgedAlerts.length}
                </div>
              </div>
              <Bell className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('tracker.sla.stats.slaBreached')}</div>
                <div className="text-3xl font-bold text-red-600">
                  {breachedIssues.length}
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('tracker.sla.stats.atRisk')}</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {atRiskIssues.length}
                </div>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('tracker.sla.stats.activeRules')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {slaRules.filter(r => r.enabled).length}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Unacknowledged Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('tracker.sla.unacknowledged')}
            </h3>
            <div className="space-y-3">
              {unacknowledgedAlerts.map(alert => (
                <div
                  key={alert._id}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{alert.ruleName}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-200 text-red-900' :
                          alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-900' :
                          'bg-blue-200 text-blue-900'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <div className="text-xs text-gray-600 dark:text-gray-200">
                        Triggered {new Date(alert.triggeredAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => acknowledgeAlert(alert._id, 'current-user')}
                        className="px-3 py-1 bg-accent text-gray-900 rounded text-sm hover:bg-accent-hover"
                      >
                        {t('tracker.sla.actions.acknowledge')}
                      </button>
                      <button
                        onClick={() => resolveAlert(alert._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        {t('tracker.sla.actions.resolve')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLA Rules */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('tracker.sla.rules.title')}
          </h3>
          <div className="space-y-3">
            {slaRules.map(rule => (
              <div
                key={rule._id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {rule.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-200">
                      {t('tracker.sla.rules.threshold')} {rule.threshold} {rule.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rule.enabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-600'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {rule.enabled ? t('tracker.sla.rules.enabled') : t('tracker.sla.rules.disabled')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breached & At-Risk Issues */}
        {(breachedIssues.length > 0 || atRiskIssues.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('tracker.sla.status.title')}
            </h3>
            <div className="space-y-3">
              {breachedIssues.map(issue => (
                <div key={issue._id} className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {issue.title}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-600">
                        {t('tracker.sla.status.breachedDeadline')} {issue.slaDeadline?.toLocaleString()}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
                      {t('tracker.sla.status.breachedTag')}
                    </span>
                  </div>
                </div>
              ))}
              {atRiskIssues.map(issue => (
                <div key={issue._id} className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {issue.title}
                      </div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-600">
                        {t('tracker.sla.status.atRiskDeadline')} {issue.slaDeadline?.toLocaleString()}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm font-medium">
                      {t('tracker.sla.status.atRiskTag')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SLAMonitor;
