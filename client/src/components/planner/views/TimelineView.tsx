import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlanner } from '../../../context/PlannerContext';
import { Task } from '../../../context/PlannerContext';

interface TimelineViewProps {
  searchQuery: string;
}

type ZoomLevel = 'day' | 'week' | 'month';

const TimelineView: React.FC<TimelineViewProps> = ({ searchQuery }) => {
  const { tasks } = usePlanner();
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');

  // Filter tasks
  const filteredTasks = tasks.filter(task =>
    task.dueDate &&
    (!searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Generate timeline dates
  const getTimelineDates = () => {
    const dates = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    const daysToShow = zoomLevel === 'day' ? 7 : zoomLevel === 'week' ? 28 : 90;
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i); // Fixed: use date instead of start
      dates.push(date);
    }
    return dates;
  };

  const timelineDates = getTimelineDates();

  const getTaskPosition = (task: Task) => {
    if (!task.dueDate) return null;
    
    const taskEndDate = new Date(task.dueDate);
    const startDate = timelineDates[0];
    
    // Calculate task start date based on estimated time
    const duration = task.estimatedTime ? Math.max(1, Math.ceil(task.estimatedTime / 8)) : 1;
    const taskStartDate = new Date(taskEndDate);
    taskStartDate.setDate(taskStartDate.getDate() - duration + 1);
    
    // Calculate position
    const totalDays = timelineDates.length;
    const startDiff = Math.floor((taskStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const endDiff = Math.floor((taskEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if task is in visible range
    if (endDiff < 0 || startDiff >= totalDays) return null;
    
    // Clamp to visible range
    const visibleStart = Math.max(0, startDiff);
    const visibleEnd = Math.min(totalDays - 1, endDiff);
    const visibleDuration = visibleEnd - visibleStart + 1;
    
    return {
      left: `${(visibleStart / totalDays) * 100}%`,
      width: `${(visibleDuration / totalDays) * 100}%`,
      startDate: taskStartDate,
      endDate: taskEndDate,
      duration: duration
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 border-red-600';
      case 'high': return 'bg-orange-500 border-orange-600';
      case 'medium': return 'bg-yellow-500 border-yellow-600';
      case 'low': return 'bg-gray-400 border-gray-500';
      default: return 'bg-accent border-accent-dark';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'opacity-60';
      case 'in-progress': return 'opacity-90';
      case 'review': return 'opacity-80';
      default: return 'opacity-100';
    }
  };

  const getCompletionPercentage = (task: Task) => {
    if (task.status === 'done') return 100;
    if (task.status === 'review') return 75;
    if (task.status === 'in-progress') return 50;
    return 0;
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (zoomLevel === 'day') newDate.setDate(newDate.getDate() - 7);
    else if (zoomLevel === 'week') newDate.setDate(newDate.getDate() - 28);
    else newDate.setMonth(newDate.getMonth() - 3);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (zoomLevel === 'day') newDate.setDate(newDate.getDate() + 7);
    else if (zoomLevel === 'week') newDate.setDate(newDate.getDate() + 28);
    else newDate.setMonth(newDate.getMonth() + 3);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getTodayPosition = () => {
    const today = new Date();
    const startDate = timelineDates[0];
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0 || daysDiff >= timelineDates.length) return null;
    
    return `${(daysDiff / timelineDates.length) * 100}%`;
  };

  const todayPosition = getTodayPosition();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('planner.timeline.title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {t('planner.timeline.subtitle', { count: filteredTasks.length })}
            </p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-200">{t('planner.timeline.legend.urgent')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-gray-600 dark:text-gray-200">{t('planner.timeline.legend.high')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500"></div>
              <span className="text-gray-600 dark:text-gray-200">{t('planner.timeline.legend.medium')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-400"></div>
              <span className="text-gray-600 dark:text-gray-200">{t('planner.timeline.legend.low')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Navigation */}
            <button
              onClick={handlePrevious}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              {t('planner.timeline.controls.today')}
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              {(['day', 'week', 'month'] as ZoomLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => setZoomLevel(level)}
                  className={`px-3 py-2 text-sm font-medium ${
                    zoomLevel === level
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-700'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {t(`planner.timeline.controls.${level}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
          {/* Timeline Header */}
          <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <div className="flex">
              <div className="w-48 flex-shrink-0 px-4 py-3 border-r border-gray-300 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-700">{t('planner.timeline.task.title')}</span>
              </div>
              <div className="flex-1 relative">
                <div className="flex h-full">
                  {timelineDates.map((date, idx) => {
                    const showDate = zoomLevel === 'day' || idx % 7 === 0;
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 px-2 py-3 text-center border-r border-gray-300 dark:border-gray-600 ${
                          isToday(date) ? 'bg-blue-100 dark:bg-blue-900/30' : 
                          isWeekend ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                      >
                        {showDate && (
                          <div>
                            <div className={`text-xs font-medium ${
                              isToday(date) ? 'text-accent-dark dark:text-accent-light' : 'text-gray-600 dark:text-gray-200'
                            }`}>
                              {date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            {zoomLevel === 'day' && (
                              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Body */}
          <div className="relative">
            {/* Today Line */}
            {todayPosition && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{ left: `calc(12rem + ${todayPosition})` }}
              />
            )}

            {/* Tasks */}
            {filteredTasks.map((task, idx) => {
              const position = getTaskPosition(task);
              if (!position) return null;

              return (
                <div
                  key={task._id}
                  className="flex border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="w-48 flex-shrink-0 px-4 py-3 border-r border-gray-300 dark:border-gray-600">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {task.assignees.length > 0 && task.assignees[0]}
                    </div>
                  </div>
                  <div className="flex-1 relative py-2 px-2">
                    <div
                      className={`absolute h-10 rounded-lg border-2 ${
                        getPriorityColor(task.priority)
                      } ${getStatusColor(task.status)} hover:shadow-lg cursor-pointer transition-all group`}
                      style={{
                        left: position.left,
                        width: position.width
                      }}
                      title={`${task.title}\n${t('planner.timeline.task.start')}: ${position.startDate.toLocaleDateString()}\n${t('planner.timeline.task.end')}: ${position.endDate.toLocaleDateString()}\n${t('planner.timeline.task.duration')}: ${position.duration} ${t('planner.timeline.task.days')}`}
                    >
                      {/* Progress Bar */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-white/30 rounded-l-lg transition-all"
                        style={{ width: `${getCompletionPercentage(task)}%` }}
                      />
                      
                      {/* Task Content */}
                      <div className="relative h-full flex items-center px-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {task.title}
                          </div>
                          <div className="text-xs text-white/80 truncate">
                            {position.duration}d • {task.status}
                          </div>
                        </div>
                        
                        {/* Assignee Badge */}
                        {task.assignees.length > 0 && (
                          <div className="ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium text-white">
                            {task.assignees[0][0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      {/* Hover Info */}
                      <div className="absolute -top-16 left-0 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-20 min-w-64">
                        <div className="font-semibold mb-2">{task.title}</div>
                        <div className="space-y-1 text-gray-700">
                          <div>{t('planner.timeline.task.start')}: {position.startDate.toLocaleDateString()}</div>
                          <div>{t('planner.timeline.task.end')}: {position.endDate.toLocaleDateString()}</div>
                          <div>{t('planner.timeline.task.duration')}: {position.duration} {t('planner.timeline.task.days')}</div>
                          <div>{t('planner.list.columns.status')}: {task.status}</div>
                          <div>{t('planner.list.columns.priority')}: {task.priority}</div>
                          {task.assignees.length > 0 && (
                            <div>{t('planner.list.columns.assignee')}: {task.assignees[0]}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-200">{t('planner.timeline.task.noTasks')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
