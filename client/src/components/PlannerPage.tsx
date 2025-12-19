import React, { useState, useEffect } from 'react';
import {
  Plus, Calendar, Clock, Target, Users, CheckCircle,
  AlertCircle, Star, Flag, Tag, MessageSquare, FileText,
  ChevronLeft, ChevronRight, Filter, Search, MoreVertical,
  Edit, Trash2, Eye, Play, Pause, Square, Zap, Bot, X, Bell,
  Layout, List as ListIcon, BarChart2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDock } from '../context/DockContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import GlassmorphicCard from './ui/GlassmorphicCard';
import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';

interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  estimatedDuration?: number; // in hours
  actualDuration?: number; // in hours
  project?: {
    _id: string;
    name: string;
    color: string;
  };
  assignee?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  subtasks: Array<{
    _id: string;
    title: string;
    completed: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarEvent {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'meeting' | 'deadline' | 'milestone';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project?: string;
  color: string;
}

const PlannerPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const { dockPosition } = useDock();
  const { t } = useTranslation();
  const { canUseAI } = useFeatureAccess();
  const { isDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'gantt' | 'calendar'>('calendar');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; time?: string } | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
    dueTime: '',
    estimatedDuration: 1,
    reminder: '15min' as '15min' | '30min' | '1hour' | '1day',
    tags: [] as string[]
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        _id: '1',
        title: 'Design review meeting',
        description: 'Review the new UI designs with the team',
        priority: 'high',
        status: 'pending',
        dueDate: new Date('2024-03-25T10:00:00'),
        estimatedDuration: 2,
        project: {
          _id: 'p1',
          name: 'E-commerce Platform',
          color: 'bg-accent'
        },
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['design', 'meeting'],
        subtasks: [
          { _id: 'st1', title: 'Prepare design files', completed: true },
          { _id: 'st2', title: 'Send meeting invite', completed: false },
          { _id: 'st3', title: 'Review feedback', completed: false }
        ],
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20')
      },
      {
        _id: '2',
        title: 'Code review for authentication module',
        description: 'Review the JWT authentication implementation',
        priority: 'medium',
        status: 'in-progress',
        dueDate: new Date('2024-03-26T14:00:00'),
        estimatedDuration: 3,
        actualDuration: 1.5,
        project: {
          _id: 'p1',
          name: 'E-commerce Platform',
          color: 'bg-accent'
        },
        assignee: {
          _id: 'u2',
          name: 'Jane Smith',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['code', 'review', 'backend'],
        subtasks: [
          { _id: 'st4', title: 'Test authentication flow', completed: true },
          { _id: 'st5', title: 'Review security implementation', completed: false }
        ],
        createdAt: new Date('2024-03-18'),
        updatedAt: new Date('2024-03-22')
      },
      {
        _id: '3',
        title: 'Client presentation preparation',
        description: 'Prepare slides and demo for client meeting',
        priority: 'urgent',
        status: 'pending',
        dueDate: new Date('2024-03-27T09:00:00'),
        estimatedDuration: 4,
        project: {
          _id: 'p2',
          name: 'Mobile App',
          color: 'bg-green-500'
        },
        assignee: {
          _id: 'u3',
          name: 'Bob Wilson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['presentation', 'client', 'demo'],
        subtasks: [
          { _id: 'st6', title: 'Create presentation slides', completed: false },
          { _id: 'st7', title: 'Prepare demo environment', completed: false },
          { _id: 'st8', title: 'Rehearse presentation', completed: false }
        ],
        createdAt: new Date('2024-03-21'),
        updatedAt: new Date('2024-03-21')
      }
    ];

    const mockEvents: CalendarEvent[] = [
      {
        _id: 'e1',
        title: 'Design review meeting',
        start: new Date('2024-03-25T10:00:00'),
        end: new Date('2024-03-25T12:00:00'),
        type: 'meeting',
        priority: 'high',
        project: 'E-commerce Platform',
        color: 'bg-accent'
      },
      {
        _id: 'e2',
        title: 'Sprint Planning',
        start: new Date('2024-03-26T09:00:00'),
        end: new Date('2024-03-26T11:00:00'),
        type: 'meeting',
        priority: 'medium',
        project: 'E-commerce Platform',
        color: 'bg-purple-500'
      },
      {
        _id: 'e3',
        title: 'Client Presentation',
        start: new Date('2024-03-27T09:00:00'),
        end: new Date('2024-03-27T11:00:00'),
        type: 'meeting',
        priority: 'urgent',
        project: 'Mobile App',
        color: 'bg-green-500'
      },
      {
        _id: 'e4',
        title: 'Project Deadline',
        start: new Date('2024-03-30T17:00:00'),
        end: new Date('2024-03-30T17:00:00'),
        type: 'deadline',
        priority: 'high',
        project: 'E-commerce Platform',
        color: 'bg-red-500'
      }
    ];

    setTasks(mockTasks);
    setEvents(mockEvents);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in-progress': return 'text-accent-dark bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <Target className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'deadline': return <AlertCircle className="w-4 h-4" />;
      case 'milestone': return <Flag className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
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

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task._id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task._id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask =>
            subtask._id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          )
        };
      }
      return task;
    }));
  };

  const handleDateClick = (date: Date, time?: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot({ date, time });
    const dateStr = date.toISOString().split('T')[0];
    setNewTask({
      ...newTask,
      dueDate: dateStr,
      dueTime: time || '09:00'
    });
    setShowTaskModal(true);
  };

  const handleCreateTask = () => {
    const task: Task = {
      _id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'pending',
      dueDate: new Date(`${newTask.dueDate}T${newTask.dueTime}`),
      estimatedDuration: newTask.estimatedDuration,
      actualDuration: 0,
      tags: newTask.tags,
      subtasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks([...tasks, task]);
    setShowTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      dueTime: '',
      estimatedDuration: 1,
      reminder: '15min',
      tags: []
    });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Task created successfully!', type: 'success' } });
  };

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);
  const timeSlots = getTimeSlots();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20'}`}>
      {/* Header & Controls */}
      <div
        className="pt-6 px-6 transition-all duration-300"
        style={{
          paddingLeft: dockPosition === 'left' ? '100px' : '24px',
          paddingRight: dockPosition === 'right' ? '100px' : '24px'
        }}
      >
        <GlassmorphicPageHeader
          title={t('planner.myWork')}
          subtitle={t('planner.description')}
          icon={Target}
          className="w-full mb-8"
          decorativeGradients={{
            topRight: 'rgba(124, 58, 237, 0.2)',
            bottomLeft: 'rgba(59, 130, 246, 0.2)'
          }}
        />

        {/* Toolbar */}
        <GlassmorphicCard className="p-4 mb-6 flex flex-col xl:flex-row items-center justify-between gap-4">
          {/* View Tab Toggle */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl overflow-x-auto w-full xl:w-auto">
            {[
              { id: 'board', label: 'Board', icon: Layout },
              { id: 'list', label: 'List', icon: ListIcon },
              { id: 'gantt', label: 'Gantt', icon: BarChart2 },
              { id: 'calendar', label: 'Calendar', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
            {activeTab === 'calendar' && (
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                {[
                  { id: 'day', label: t('planner.day') },
                  { id: 'week', label: t('planner.week') },
                  { id: 'month', label: t('planner.month') }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setCalendarView(mode.id as any)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${calendarView === mode.id
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setNewTask({
                  ...newTask,
                  dueDate: today.toISOString().split('T')[0],
                  dueTime: '09:00'
                });
                setShowTaskModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover shadow-lg shadow-accent/20 transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('planner.addTask')}
            </button>
          </div>
        </GlassmorphicCard>
      </div>

      <div
        className="px-6 pb-6 transition-all duration-300"
        style={{
          paddingLeft: dockPosition === 'left' ? '100px' : '24px',
          paddingRight: dockPosition === 'right' ? '100px' : '24px'
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {activeTab === 'calendar' && (
              <GlassmorphicCard className="p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getTime() - (calendarView === 'week' ? 7 : 1) * 24 * 60 * 60 * 1000))}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {calendarView === 'week' && `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`}
                      {calendarView === 'day' && formatDate(currentDate)}
                      {calendarView === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getTime() + (calendarView === 'week' ? 7 : 1) * 24 * 60 * 60 * 1000))}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('planner.today')}
                  </button>
                </div>

                {/* Calendar Grid */}
                {calendarView === 'week' && (
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                        {day}
                      </div>
                    ))}

                    {/* Day Cells */}
                    {weekDays.map((day, index) => {
                      const dayTasks = getTasksForDate(day);
                      const isToday = day.toDateString() === new Date().toDateString();
                      const isSelected = day.toDateString() === selectedDate.toDateString();

                      return (
                        <div
                          key={index}
                          onClick={() => handleDateClick(day)}
                          className={`min-h-32 p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : ''
                            } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${isToday ? 'text-accent-dark dark:text-accent-light' : 'text-gray-900 dark:text-white'}`}>
                              {day.getDate()}
                            </span>
                            {dayTasks.length > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">{dayTasks.length}</span>
                            )}
                          </div>

                          {/* Tasks */}
                          <div className="space-y-1">
                            {dayTasks.slice(0, 3).map(task => (
                              <div
                                key={task._id}
                                className={`text-[10px] p-1.5 rounded truncate transition-opacity hover:opacity-80 ${!task.project?.color?.includes('bg-') ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : ''
                                  }`}
                                style={{
                                  backgroundColor: (task.project?.color || 'bg-gray-200').replace('bg-', '') === 'accent' ? 'var(--accent-color)' : undefined
                                }}
                              >
                                <span className={task.project?.color === 'bg-accent' ? 'text-gray-900' : ''}>{task.title}</span>
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1">
                                +{dayTasks.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {calendarView === 'day' && (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {timeSlots.map((time) => {
                      const tasksAtTime = tasks.filter(task => {
                        if (!task.dueDate) return false;
                        const taskDate = new Date(task.dueDate);
                        // Using explicit strict equality for the date string comparison
                        if (taskDate.toDateString() !== currentDate.toDateString()) return false;

                        const taskHour = taskDate.getHours().toString().padStart(2, '0');
                        const taskMinute = taskDate.getMinutes() < 30 ? '00' : '30';
                        const taskTime = `${taskHour}:${taskMinute}`;
                        return taskTime === time;
                      });

                      return (
                        <div key={time} className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                          <div className="w-16 text-sm text-gray-500 dark:text-gray-400 pt-1 font-mono">{time}</div>
                          <div
                            className="flex-1 min-h-[3rem] border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            onClick={() => handleDateClick(currentDate, time)}
                          >
                            {tasksAtTime.map(task => (
                              <div key={task._id} className="mb-1 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-sm group relative">
                                <div className="font-medium text-gray-900 dark:text-gray-100">{task.title}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                  <span>{task.estimatedDuration}h</span>
                                  <span>•</span>
                                  <span className={`capitalize ${getPriorityColor(task.priority)} px-1.5 rounded-sm bg-opacity-20`}>{task.priority}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {calendarView === 'month' && (
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                        {day}
                      </div>
                    ))}

                    {monthDays.map((day, index) => {
                      const dayTasks = getTasksForDate(day);
                      const isToday = day.toDateString() === new Date().toDateString();
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const isSelected = day.toDateString() === selectedDate.toDateString();

                      return (
                        <div
                          key={index}
                          onClick={() => handleDateClick(day)}
                          className={`min-h-[100px] p-1 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : ''
                            } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${!isCurrentMonth ? 'opacity-40' : ''
                            }`}
                        >
                          <div className={`text-xs font-medium mb-1 p-1 ${isToday ? 'text-accent-dark dark:text-accent-light bg-accent/10 rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700 dark:text-gray-300 pl-1'
                            }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-0.5">
                            {dayTasks.slice(0, 3).map(task => (
                              <div
                                key={task._id}
                                className="text-[10px] p-1 rounded truncate bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              >
                                {task.title}
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 pl-1">+{dayTasks.length - 3} more</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassmorphicCard>
            )}

            {activeTab === 'board' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full overflow-x-auto pb-4">
                {['pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
                  <div key={status} className="flex flex-col h-full min-w-[280px]">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-yellow-400' :
                          status === 'in-progress' ? 'bg-blue-500' :
                            status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        {status.replace('-', ' ')}
                      </h3>
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {tasks.filter(t => t.status === status).length}
                      </span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                      {tasks.filter(t => t.status === status).map(task => (
                        <GlassmorphicCard key={task._id} className="p-3 cursor-grab active:cursor-grabbing hover:translate-y-[-2px] transition-transform">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{task.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{task.description}</p>

                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {task.tags.map(tag => (
                                <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">#{tag}</span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                            </div>
                            {task.assignee && (
                              <img src={task.assignee.avatar} alt={task.assignee.name} className="w-6 h-6 rounded-full border border-white dark:border-gray-700" />
                            )}
                          </div>
                        </GlassmorphicCard>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'list' && (
              <GlassmorphicCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {tasks.map((task) => (
                        <tr key={task._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleTaskStatus(task._id)}
                              className="flex items-center gap-2"
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <div className={`w-5 h-5 rounded-full border-2 ${task.priority === 'urgent' || task.priority === 'high' ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                                  }`} />
                              )}
                              <span className={`text-sm capitalize ${getStatusColor(task.status).replace('bg-', 'text-').split(' ')[0]}`}>{task.status}</span>
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{task.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)} bg-opacity-20`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {task.project ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {task.project.name}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassmorphicCard>
            )}

            {activeTab === 'gantt' && (
              <GlassmorphicCard className="p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Timeline</h3>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm font-medium">March 2024</span>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Timeline Header */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 pb-2">
                      <div className="w-1/4 font-medium text-sm text-gray-500 dark:text-gray-400">Task</div>
                      <div className="w-3/4 flex justify-between text-xs text-gray-400">
                        {Array.from({ length: 14 }).map((_, i) => (
                          <div key={i} className="flex-1 text-center border-l border-gray-100 dark:border-gray-800">{i + 20}</div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Rows */}
                    <div className="space-y-4">
                      {tasks.map((task, index) => (
                        <div key={task._id} className="flex items-center gap-4 group">
                          <div className="w-1/4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{task.estimatedDuration}h estimation</div>
                          </div>
                          <div className="w-3/4 h-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg relative overflow-hidden">
                            {task.dueDate && (
                              <div
                                className={`absolute top-1 bottom-1 rounded-md ${task.status === 'completed' ? 'bg-green-500/50' :
                                  task.priority === 'urgent' ? 'bg-red-500/50' : 'bg-blue-500/50'
                                  } opacity-80 backdrop-blur-sm border border-white/10`}
                                style={{
                                  left: `${(index * 15) % 60}%`,
                                  width: `${Math.max(10, task.estimatedDuration ? task.estimatedDuration * 5 : 20)}%`
                                }}
                              >
                                <div className="w-full h-full flex items-center px-2">
                                  <span className="text-[10px] font-medium text-white truncate">{task.status}</span>
                                </div>
                              </div>
                            )}
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex">
                              {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i} className="flex-1 border-r border-gray-200/20 dark:border-gray-700/20"></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant */}
            {canUseAI() && (
              <GlassmorphicCard className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('planner.aiPlanner')}</h3>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                  {t('planner.aiSuggestion')}
                </p>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition-all shadow-lg shadow-purple-500/20">
                  {t('planner.askAI')}
                </button>
              </GlassmorphicCard>
            )}

            {/* Today's Tasks */}
            <GlassmorphicCard className="p-4">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{t('planner.todaysTasks')}</h3>
              <div className="space-y-2">
                {getTasksForDate(new Date()).slice(0, 5).map(task => (
                  <div
                    key={task._id}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                  >
                    <button
                      onClick={() => toggleTaskStatus(task._id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}
                    >
                      {task.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.status === 'completed' ? `line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}` : isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.project && (
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.project.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {getTasksForDate(new Date()).length === 0 && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center py-4`}>{t('planner.noTasksToday')}</p>
                )}
              </div>
            </GlassmorphicCard>

            {/* Upcoming Events */}
            <GlassmorphicCard className="p-4">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{t('planner.upcomingEvents')}</h3>
              <div className="space-y-2">
                {events.slice(0, 5).map(event => (
                  <div key={event._id} className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <div className={`w-2 h-2 rounded-full ${event.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{event.title}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(event.start)} at {formatTime(event.start)}
                      </p>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center py-4`}>{t('planner.noUpcomingEvents')}</p>
                )}
              </div>
            </GlassmorphicCard>

            {/* Quick Stats */}
            <GlassmorphicCard className="p-4">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{t('planner.quickStats')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('planner.pendingTasks')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{tasks.filter(t => t.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('planner.inProgress')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{tasks.filter(t => t.status === 'in-progress').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('planner.completedToday')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{tasks.filter(t => t.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('planner.overdue')}</span>
                  <span className="text-sm font-medium text-red-600">
                    {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length}
                  </span>
                </div>
              </div>
            </GlassmorphicCard>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassmorphicCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('planner.createNewTask')}</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('planner.taskTitle')}</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  placeholder={t('planner.enterTaskTitle')}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('planner.taskDescription')}</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  rows={3}
                  placeholder={t('planner.addTaskDescription')}
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('planner.dueDate')}</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('planner.time')}</label>
                  <input
                    type="time"
                    value={newTask.dueTime}
                    onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Priority and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('planner.priority')}</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('planner.duration')}</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newTask.estimatedDuration}
                    onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Reminder */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  <Bell className="w-4 h-4 inline mr-1" />
                  {t('planner.reminder')}
                </label>
                <select
                  value={newTask.reminder}
                  onChange={(e) => setNewTask({ ...newTask, reminder: e.target.value as any })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="15min">15 minutes before</option>
                  <option value="30min">30 minutes before</option>
                  <option value="1hour">1 hour before</option>
                  <option value="1day">1 day before</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Tags</label>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas"
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowTaskModal(false)}
                className={`px-4 py-2 border rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 border-gray-600 hover:bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title || !newTask.dueDate || !newTask.dueTime}
                className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20"
              >
                Create Task
              </button>
            </div>
          </GlassmorphicCard>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
