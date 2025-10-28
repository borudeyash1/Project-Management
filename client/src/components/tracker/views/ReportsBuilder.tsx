import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, DollarSign } from 'lucide-react';
import { useTracker } from '../../../context/TrackerContext';

interface ReportsBuilderProps {
  searchQuery: string;
}

const ReportsBuilder: React.FC<ReportsBuilderProps> = ({ searchQuery }) => {
  const { timeEntries, issues, teamMetrics } = useTracker();
  const [reportType, setReportType] = useState('time-by-project');

  const reports = [
    { id: 'time-by-project', label: 'Time by Project', icon: BarChart3 },
    { id: 'time-by-user', label: 'Time by User', icon: Users },
    { id: 'billable-summary', label: 'Billable Summary', icon: DollarSign },
    { id: 'overtime-trends', label: 'Overtime Trends', icon: Calendar }
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
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {report.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {reports.find(r => r.id === reportType)?.label}
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Report Content */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Hours</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teamMetrics.totalHoursWeek.toFixed(1)}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Billable %</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {teamMetrics.billablePercent.toFixed(0)}%
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overtime</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {teamMetrics.overtimeHours.toFixed(1)}h
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hours
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Billable
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Non-Billable
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {['Project A', 'Project B', 'Project C'].map(project => (
                    <tr key={project} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{project}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                        {(Math.random() * 40).toFixed(1)}h
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-green-600 dark:text-green-400">
                        {(Math.random() * 30).toFixed(1)}h
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
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
