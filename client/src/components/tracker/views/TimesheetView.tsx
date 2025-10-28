import React, { useState } from 'react';
import { Clock, Check, X, Edit2, Trash2, Plus, Download } from 'lucide-react';
import { useTracker } from '../../../context/TrackerContext';

interface TimesheetViewProps {
  searchQuery: string;
}

const TimesheetView: React.FC<TimesheetViewProps> = ({ searchQuery }) => {
  const { timeEntries, addManualEntry, updateTimeEntry, deleteTimeEntry, submitWorklog, generateWorklog } = useTracker();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [editingEntry, setEditingEntry] = useState<string | null>(null);

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const weekEntries = timeEntries.filter(e =>
    e.startTime >= weekStart && e.startTime <= weekEnd
  );

  const getDayTotal = (date: Date) => {
    const dayEntries = weekEntries.filter(e =>
      e.startTime.toDateString() === date.toDateString()
    );
    return dayEntries.reduce((sum, e) => sum + e.duration / 60, 0);
  };

  const weekTotal = weekEntries.reduce((sum, e) => sum + e.duration / 60, 0);

  const handleSubmit = () => {
    const worklog = generateWorklog('current-user', weekStart);
    submitWorklog(worklog._id);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const prev = new Date(selectedWeek);
                prev.setDate(prev.getDate() - 7);
                setSelectedWeek(prev);
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              ←
            </button>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">
                {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: {weekTotal.toFixed(1)} hours
              </div>
            </div>
            <button
              onClick={() => {
                const next = new Date(selectedWeek);
                next.setDate(next.getDate() + 7);
                setSelectedWeek(next);
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              →
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Check className="w-4 h-4" />
              Submit for Approval
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Timesheet Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 w-48">
                  Task / Project
                </th>
                {weekDates.map(date => (
                  <th key={date.toISOString()} className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-xs text-gray-500">{date.getDate()}</div>
                  </th>
                ))}
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {weekEntries.map(entry => (
                <tr key={entry._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.taskTitle || 'No task'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {entry.projectName || 'No project'}
                    </div>
                  </td>
                  {weekDates.map(date => {
                    const isEntryDay = entry.startTime.toDateString() === date.toDateString();
                    return (
                      <td key={date.toISOString()} className="text-center py-3 px-4">
                        {isEntryDay && (
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {(entry.duration / 60).toFixed(1)}h
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center py-3 px-4">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {(entry.duration / 60).toFixed(1)}h
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingEntry(entry._id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTimeEntry(entry._id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold">
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  Daily Total
                </td>
                {weekDates.map(date => (
                  <td key={date.toISOString()} className="text-center py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {getDayTotal(date).toFixed(1)}h
                  </td>
                ))}
                <td className="text-center py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {weekTotal.toFixed(1)}h
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimesheetView;
