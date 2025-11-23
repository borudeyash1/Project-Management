import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, DollarSign } from 'lucide-react';
import { useTracker } from '../../../context/TrackerContext';
import { useTranslation } from 'react-i18next';

interface ReportsBuilderProps {
  searchQuery: string;
}

const ReportsBuilder: React.FC<ReportsBuilderProps> = ({ searchQuery }) => {
  const { t } = useTranslation();
  const { timeEntries, issues, teamMetrics } = useTracker();
  const [reportType, setReportType] = useState('time-by-project');

  const reports = [
    { id: 'time-by-project', label: t('tracker.reportsBuilder.types.timeByProject'), icon: BarChart3 },
    { id: 'time-by-user', label: t('tracker.reportsBuilder.types.timeByUser'), icon: Users },
    { id: 'billable-summary', label: t('tracker.reportsBuilder.types.billableSummary'), icon: DollarSign },
    { id: 'overtime-trends', label: t('tracker.reportsBuilder.types.overtimeTrends'), icon: Calendar }
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {reports.map(report => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setReportType(report.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reportType === report.id
                    ? 'border-accent bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2 text-accent-dark dark:text-accent-light" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {report.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {reports.find(r => r.id === reportType)?.label}
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover">
              <Download className="w-4 h-4" />
              {t('tracker.reportsBuilder.exportCSV')}
            </button>
          </div>

          {/* Report Content */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('tracker.reportsBuilder.metrics.totalHours')}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teamMetrics.totalHoursWeek.toFixed(1)}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('tracker.reportsBuilder.metrics.billablePercent')}</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-600">
                  {teamMetrics.billablePercent.toFixed(0)}%
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('tracker.reportsBuilder.metrics.overtime')}</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                  {teamMetrics.overtimeHours.toFixed(1)}h
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-700">
                      {t('tracker.reportsBuilder.table.project')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-700">
                      {t('tracker.reportsBuilder.table.hours')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-700">
                      {t('tracker.reportsBuilder.table.billable')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-700">
                      {t('tracker.reportsBuilder.table.nonBillable')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {['Project A', 'Project B', 'Project C'].map(project => (
                    <tr key={project} className="border-t border-gray-300 dark:border-gray-600">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{project}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                        {(Math.random() * 40).toFixed(1)}h
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-green-600 dark:text-green-600">
                        {(Math.random() * 30).toFixed(1)}h
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-200">
                        {(Math.random() * 10).toFixed(1)}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsBuilder;
