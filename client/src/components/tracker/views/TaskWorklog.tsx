import React from 'react';
import { Clock, Play } from 'lucide-react';
import { useTracker } from '../../../context/TrackerContext';

interface TaskWorklogProps {
  searchQuery: string;
}

const TaskWorklog: React.FC<TaskWorklogProps> = ({ searchQuery }) => {
  const { timeEntries, startTimer } = useTracker();

  // Group entries by task
  const taskGroups = timeEntries.reduce((acc, entry) => {
    const key = entry.taskId || 'no-task';
    if (!acc[key]) {
      acc[key] = {
        taskId: entry.taskId,
        taskTitle: entry.taskTitle || 'No Task',
        projectName: entry.projectName,
        entries: []
      };
    }
    acc[key].entries.push(entry);
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {Object.values(taskGroups).map((group: any) => {
          const totalHours = group.entries.reduce((sum: number, e: any) => sum + e.duration / 60, 0);
          return (
            <div key={group.taskId || 'no-task'} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {group.taskTitle}
                  </h3>
                  {group.projectName && (
                    <p className="text-sm text-gray-600 dark:text-gray-200">{group.projectName}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalHours.toFixed(1)}h
                  </div>
                  <button
                    onClick={() => startTimer(group.taskId)}
                    className="mt-2 flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <Play className="w-3 h-3" />
                    Start Timer
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {group.entries.map((entry: any) => (
                  <div key={entry._id} className="flex items-center justify-between py-2 border-t border-gray-300 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {entry.startTime.toLocaleDateString()} {entry.startTime.toLocaleTimeString()}
                        </div>
                        {entry.notes && (
                          <div className="text-xs text-gray-600 dark:text-gray-200">{entry.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {(entry.duration / 60).toFixed(1)}h
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskWorklog;
