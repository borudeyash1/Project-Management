import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { usePlanner } from '../../../context/PlannerContext';
import { Task } from '../../../context/PlannerContext';

interface CalendarViewProps {
  searchQuery: string;
  onDateClick?: (date: Date, time?: string) => void;
}

type CalendarMode = 'month' | 'week' | 'day';

const CalendarView: React.FC<CalendarViewProps> = ({ searchQuery, onDateClick }) => {
  const { tasks, updateTask } = usePlanner();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter(task =>
    !searchQuery ||
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get month days
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get week days
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get tasks for date
  const getTasksForDate = (date: Date) => {
    return filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Get time slots for day view
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const handleDateClick = (date: Date, time?: string) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date, time);
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (mode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (mode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (mode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (mode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const monthDays = mode === 'month' ? getMonthDays() : [];
  const weekDays = mode === 'week' ? getWeekDays() : [];
  const timeSlots = mode === 'day' ? getTimeSlots() : [];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Navigation */}
            <button
              onClick={handlePrevious}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric',
                ...(mode === 'day' && { day: 'numeric' })
              })}
            </span>

            {/* Mode Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg ml-4">
              {(['month', 'week', 'day'] as CalendarMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-2 text-sm font-medium ${
                    mode === m
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-6">
        {/* Month View */}
        {mode === 'month' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day, idx) => {
                const dayTasks = getTasksForDate(day);
                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    className={`min-h-32 p-2 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 hover:shadow-inner transition-colors relative group ${
                      isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${
                      !isCurrentMonth(day) ? 'opacity-40' : ''
                    }`}
                  >
                    {/* Add Task Indicator on Hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task._id}
                          className={`text-xs p-1 rounded truncate border ${getPriorityColor(task.priority)}`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">+{dayTasks.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {mode === 'week' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              {weekDays.map((day, idx) => (
                <div key={idx} className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-semibold mt-1 ${
                    isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {weekDays.map((day, idx) => {
                const dayTasks = getTasksForDate(day);
                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    className={`min-h-96 p-3 border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors relative group ${
                      isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    {/* Add Task Indicator on Hover */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-2">
                      {dayTasks.map(task => (
                        <div
                          key={task._id}
                          className={`text-sm p-2 rounded border ${getPriorityColor(task.priority)}`}
                        >
                          <div className="font-medium truncate">{task.title}</div>
                          {task.dueDate && (
                            <div className="text-xs mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day View */}
        {mode === 'day' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="space-y-px">
              {timeSlots.map(time => {
                const tasksAtTime = filteredTasks.filter(task => {
                  if (!task.dueDate) return false;
                  const taskDate = new Date(task.dueDate);
                  const taskTime = `${taskDate.getHours().toString().padStart(2, '0')}:00`;
                  return taskDate.toDateString() === currentDate.toDateString() && taskTime === time;
                });

                return (
                  <div key={time} className="flex border-b border-gray-200 dark:border-gray-700">
                    <div className="w-20 flex-shrink-0 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                      {time}
                    </div>
                    <div
                      onClick={() => handleDateClick(currentDate, time)}
                      className="flex-1 p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 min-h-16 transition-colors relative group"
                    >
                      {/* Add Task Indicator on Hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        {tasksAtTime.map(task => (
                          <div
                            key={task._id}
                            className={`text-sm p-2 rounded border ${getPriorityColor(task.priority)}`}
                          >
                            <div className="font-medium">{task.title}</div>
                            {task.estimatedTime && (
                              <div className="text-xs mt-1">{task.estimatedTime}h</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
