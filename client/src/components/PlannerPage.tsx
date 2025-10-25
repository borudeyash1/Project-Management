import React, { useState, useEffect } from 'react';
import {
  Plus, Calendar, Clock, Target, Users, CheckCircle,
  AlertCircle, Star, Flag, Tag, MessageSquare, FileText,
  ChevronLeft, ChevronRight, Filter, Search, MoreVertical,
  Edit, Trash2, Eye, Play, Pause, Square, Zap, Bot,
  Bell, X, Check, MapPin, Repeat, Link2, Paperclip,
  List, Grid, CalendarDays, CalendarCheck, CalendarX,
  Settings, ArrowRight, Hash, Type, AlignLeft,
  Save, RotateCcw, Copy, Share2, Download, Upload,
  Bookmark, Heart, ThumbsUp, Archive
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import AIChatbot from './AIChatbot';

interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  dueTime?: string;
  estimatedDuration?: number;
  actualDuration?: number;
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
  checklist: Array<{
    _id: string;
    text: string;
    completed: boolean;
  }>;
  attachments: Array<{
    _id: string;
    name: string;
    url: string;
    type: string;
  }>;
  reminders: Array<{
    _id: string;
    type: 'email' | 'push' | 'sms';
    time: Date;
    message: string;
    sent: boolean;
  }>;
  location?: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
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
  const { canUseAI } = useFeatureAccess();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAIChatbot, setShowAIChatbot] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskFormData, setTaskFormData] = useState<Partial<Task>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        _id: '1',
        title: 'Design review meeting',
        description: 'Review the new UI designs with the team',
        priority: 'high',
        status: 'pending',
        dueDate: new Date('2024-03-25'),
        dueTime: '10:00',
        estimatedDuration: 2,
        project: {
          _id: 'p1',
          name: 'E-commerce Platform',
          color: '#3B82F6'
        },
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          avatar: ''
        },
        tags: ['design', 'meeting'],
        subtasks: [
          { _id: 'st1', title: 'Prepare design files', completed: true },
          { _id: 'st2', title: 'Send meeting invite', completed: false }
        ],
        checklist: [
          { _id: 'ch1', text: 'Review mockups', completed: true },
          { _id: 'ch2', text: 'Prepare feedback', completed: false }
        ],
        attachments: [
          { _id: 'att1', name: 'design-mockups.pdf', url: '/files/mockups.pdf', type: 'pdf' }
        ],
        reminders: [
          { _id: 'rem1', type: 'email', time: new Date('2024-03-24T09:00:00'), message: 'Design review tomorrow', sent: false }
        ],
        location: 'Conference Room A',
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20')
      },
      {
        _id: '2',
        title: 'Weekly report preparation',
        description: 'Compile weekly progress report',
        priority: 'medium',
        status: 'in-progress',
        dueDate: new Date('2024-03-26'),
        dueTime: '17:00',
        recurring: {
          type: 'weekly',
          interval: 1,
          endDate: new Date('2024-06-01')
        },
        tags: ['report', 'weekly'],
        subtasks: [],
        checklist: [
          { _id: 'ch3', text: 'Gather metrics', completed: true },
          { _id: 'ch4', text: 'Write summary', completed: false },
          { _id: 'ch5', text: 'Review with team', completed: false }
        ],
        attachments: [],
        reminders: [
          { _id: 'rem2', type: 'push', time: new Date('2024-03-26T15:00:00'), message: 'Report due in 2 hours', sent: false }
        ],
        createdAt: new Date('2024-03-21'),
        updatedAt: new Date('2024-03-23')
      }
    ];

    const mockEvents: CalendarEvent[] = [
      {
        _id: 'e1',
        title: 'Team Standup',
        start: new Date('2024-03-25T09:00:00'),
        end: new Date('2024-03-25T09:30:00'),
        type: 'meeting',
        priority: 'medium',
        color: '#10B981'
      }
    ];

    setTasks(mockTasks);
    setEvents(mockEvents);
  }, []);

  const getWeekDays = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day;
    const monday = new Date(start.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month days
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const getYearMonths = () => {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentDate.getFullYear(), month, 1);
      months.push(date);
    }
    return months;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task =>
      task.dueDate &&
      new Date(task.dueDate).toDateString() === date.toDateString()
    );
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      new Date(event.start).toDateString() === date.toDateString()
    );
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

  const handleAddTask = (targetDate?: Date) => {
    setTaskFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: targetDate || selectedDate,
      dueTime: '09:00',
      tags: [],
      subtasks: [],
      checklist: [],
      attachments: [],
      reminders: []
    });
    setSelectedTask(null);
    setShowAddTask(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskFormData(task);
    setSelectedTask(task);
    setShowAddTask(true);
  };

  const handleSaveTask = () => {
    if (!taskFormData.title) return;

    const taskData: Task = {
      _id: selectedTask?._id || `task_${Date.now()}`,
      title: taskFormData.title,
      description: taskFormData.description || '',
      priority: taskFormData.priority || 'medium',
      status: taskFormData.status || 'pending',
      dueDate: taskFormData.dueDate,
      dueTime: taskFormData.dueTime,
      estimatedDuration: taskFormData.estimatedDuration,
      project: taskFormData.project,
      assignee: taskFormData.assignee,
      tags: taskFormData.tags || [],
      subtasks: taskFormData.subtasks || [],
      checklist: taskFormData.checklist || [],
      attachments: taskFormData.attachments || [],
      reminders: taskFormData.reminders || [],
      location: taskFormData.location,
      recurring: taskFormData.recurring,
      createdAt: selectedTask?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (selectedTask) {
      setTasks(tasks.map(t => t._id === selectedTask._id ? taskData : t));
    } else {
      setTasks([...tasks, taskData]);
    }

    setShowAddTask(false);
    setTaskFormData({});
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t._id !== taskId));
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task =>
      task._id === taskId
        ? {
            ...task,
            status: task.status === 'completed' ? 'pending' : 'completed',
            updatedAt: new Date()
          }
        : task
    ));
  };

  const addChecklistItem = () => {
    const newItem = {
      _id: `checklist_${Date.now()}`,
      text: '',
      completed: false
    };
    setTaskFormData({
      ...taskFormData,
      checklist: [...(taskFormData.checklist || []), newItem]
    });
  };

  const updateChecklistItem = (id: string, text: string) => {
    setTaskFormData({
      ...taskFormData,
      checklist: taskFormData.checklist?.map(item =>
        item._id === id ? { ...item, text } : item
      )
    });
  };

  const removeChecklistItem = (id: string) => {
    setTaskFormData({
      ...taskFormData,
      checklist: taskFormData.checklist?.filter(item => item._id !== id)
    });
  };

  const addReminder = () => {
    const newReminder = {
      _id: `reminder_${Date.now()}`,
      type: 'email' as const,
      time: new Date(),
      message: '',
      sent: false
    };
    setTaskFormData({
      ...taskFormData,
      reminders: [...(taskFormData.reminders || []), newReminder]
    });
  };

  const updateReminder = (id: string, updates: Partial<Task['reminders'][0]>) => {
    setTaskFormData({
      ...taskFormData,
      reminders: taskFormData.reminders?.map(reminder =>
        reminder._id === id ? { ...reminder, ...updates } : reminder
      )
    });
  };

  const removeReminder = (id: string) => {
    setTaskFormData({
      ...taskFormData,
      reminders: taskFormData.reminders?.filter(reminder => reminder._id !== id)
    });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const weekDays = getWeekDays();
  const monthDays = getMonthDays();
  const yearMonths = getYearMonths();

  const renderTaskModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedTask ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button
              onClick={() => setShowAddTask(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={taskFormData.title || ''}
                onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={taskFormData.description || ''}
                onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter task description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={taskFormData.priority || 'medium'}
                onChange={(e) => setTaskFormData({...taskFormData, priority: e.target.value as Task['priority']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={taskFormData.status || 'pending'}
                onChange={(e) => setTaskFormData({...taskFormData, status: e.target.value as Task['status']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={taskFormData.dueDate ? new Date(taskFormData.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setTaskFormData({...taskFormData, dueDate: new Date(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Time
              </label>
              <input
                type="time"
                value={taskFormData.dueTime || ''}
                onChange={(e) => setTaskFormData({...taskFormData, dueTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={taskFormData.location || ''}
                onChange={(e) => setTaskFormData({...taskFormData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (hours)
              </label>
              <input
                type="number"
                value={taskFormData.estimatedDuration || ''}
                onChange={(e) => setTaskFormData({...taskFormData, estimatedDuration: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Checklist
              </label>
              <button
                onClick={addChecklistItem}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {taskFormData.checklist?.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => {
                      setTaskFormData({
                        ...taskFormData,
                        checklist: taskFormData.checklist?.map(i =>
                          i._id === item._id ? { ...i, completed: e.target.checked } : i
                        )
                      });
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateChecklistItem(item._id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Checklist item"
                  />
                  <button
                    onClick={() => removeChecklistItem(item._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reminders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Reminders
              </label>
              <button
                onClick={addReminder}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Reminder
              </button>
            </div>
            <div className="space-y-3">
              {taskFormData.reminders?.map((reminder) => (
                <div key={reminder._id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <select
                    value={reminder.type}
                    onChange={(e) => updateReminder(reminder._id, { type: e.target.value as any })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="push">Push</option>
                    <option value="sms">SMS</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={reminder.time ? new Date(reminder.time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateReminder(reminder._id, { time: new Date(e.target.value) })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={reminder.message}
                    onChange={(e) => updateReminder(reminder._id, { message: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Reminder message"
                  />
                  <button
                    onClick={() => removeReminder(reminder._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={!!taskFormData.recurring}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTaskFormData({
                      ...taskFormData,
                      recurring: {
                        type: 'weekly',
                        interval: 1
                      }
                    });
                  } else {
                    setTaskFormData({
                      ...taskFormData,
                      recurring: undefined
                    });
                  }
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Recurring Task</span>
            </label>
            {taskFormData.recurring && (
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={taskFormData.recurring.type}
                  onChange={(e) => setTaskFormData({
                    ...taskFormData,
                    recurring: {
                      ...taskFormData.recurring!,
                      type: e.target.value as any
                    }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <input
                  type="number"
                  value={taskFormData.recurring.interval}
                  onChange={(e) => setTaskFormData({
                    ...taskFormData,
                    recurring: {
                      ...taskFormData.recurring!,
                      interval: parseInt(e.target.value)
                    }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Interval"
                  min="1"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => setShowAddTask(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTask}
            disabled={!taskFormData.title}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {selectedTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Planner</h1>
            <p className="text-gray-600 mt-1">Plan and organize your tasks and schedule</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              {[
                { id: 'day', label: 'Day' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
                { id: 'year', label: 'Year' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`px-3 py-2 text-sm font-medium ${
                    viewMode === mode.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleAddTask()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      if (viewMode === 'week') {
                        newDate.setDate(currentDate.getDate() - 7);
                      } else if (viewMode === 'month') {
                        newDate.setMonth(currentDate.getMonth() - 1);
                      } else if (viewMode === 'year') {
                        newDate.setFullYear(currentDate.getFullYear() - 1);
                      } else {
                        newDate.setDate(currentDate.getDate() - 1);
                      }
                      setCurrentDate(newDate);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {viewMode === 'week' && `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`}
                    {viewMode === 'day' && formatDate(currentDate)}
                    {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    {viewMode === 'year' && currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      if (viewMode === 'week') {
                        newDate.setDate(currentDate.getDate() + 7);
                      } else if (viewMode === 'month') {
                        newDate.setMonth(currentDate.getMonth() + 1);
                      } else if (viewMode === 'year') {
                        newDate.setFullYear(currentDate.getFullYear() + 1);
                      } else {
                        newDate.setDate(currentDate.getDate() + 1);
                      }
                      setCurrentDate(newDate);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Today
                </button>
              </div>

              {/* Week View */}
              {viewMode === 'week' && (
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-b">
                      {day}
                    </div>
                  ))}

                  {/* Day Cells */}
                  {weekDays.map((day, index) => {
                    const dayTasks = getTasksForDate(day);
                    const dayEvents = getEventsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isSelected = day.toDateString() === selectedDate.toDateString();

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={`min-h-32 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                          isToday ? 'bg-blue-50 border-blue-200' : ''
                        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {day.getDate()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTask(day);
                            }}
                            className="w-5 h-5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Tasks */}
                        <div className="space-y-1">
                          {dayTasks.slice(0, 3).map(task => (
                            <div
                              key={task._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task);
                              }}
                              className="text-xs p-2 rounded cursor-pointer hover:shadow-sm border-l-2"
                              style={{
                                backgroundColor: task.project?.color ? task.project.color + '20' : '#f3f4f6',
                                borderLeftColor: task.project?.color || '#9ca3af'
                              }}
                            >
                              <div className="font-medium truncate">{task.title}</div>
                              {task.dueTime && (
                                <div className="text-gray-500 mt-1">{task.dueTime}</div>
                              )}
                              {task.location && (
                                <div className="flex items-center gap-1 text-gray-500 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{task.location}</span>
                                </div>
                              )}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Month View */}
              {viewMode === 'month' && (
                <div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthDays.map(({ date, isCurrentMonth }, index) => {
                      const dayTasks = getTasksForDate(date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isSelected = date.toDateString() === selectedDate.toDateString();

                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(date)}
                          className={`group min-h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors ${
                            !isCurrentMonth ? 'opacity-40' : ''
                          } ${isToday ? 'bg-blue-50 border-blue-200' : ''} ${
                            isSelected ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${
                              isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {date.getDate()}
                            </span>
                            <div className="flex items-center gap-1">
                              {dayTasks.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-1 min-w-4 text-center">
                                  {dayTasks.length}
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddTask(date);
                                }}
                                className="w-4 h-4 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                title={`Add task for ${date.toLocaleDateString()}`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 min-h-16">
                            {dayTasks.slice(0, 2).map(task => (
                              <div
                                key={task._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task);
                                }}
                                className="text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm border-l-2"
                                style={{
                                  backgroundColor: task.project?.color ? task.project.color + '20' : '#f3f4f6',
                                  borderLeftColor: task.project?.color || '#9ca3af'
                                }}
                              >
                                {task.title}
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="text-xs text-gray-500 text-center py-1">
                                +{dayTasks.length - 2} more
                              </div>
                            )}
                            {dayTasks.length === 0 && (
                              <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity">
                                <div className="text-xs text-center text-gray-400 py-3">
                                  Click + to add task
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Year View */}
              {viewMode === 'year' && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {yearMonths.map((month, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setCurrentDate(month);
                        setViewMode('month');
                      }}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        {month.toLocaleDateString('en-US', { month: 'long' })}
                      </h3>
                      <div className="text-xs text-gray-600">
                        {tasks.filter(task =>
                          task.dueDate &&
                          new Date(task.dueDate).getMonth() === month.getMonth() &&
                          new Date(task.dueDate).getFullYear() === month.getFullYear()
                        ).length} tasks
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Day View */}
              {viewMode === 'day' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {formatDate(currentDate)}
                    </h3>
                    <button
                      onClick={() => handleAddTask(currentDate)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>

                  {/* Time slots */}
                  <div className="space-y-2">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                      const tasksAtTime = getTasksForDate(currentDate).filter(task =>
                        task.dueTime && task.dueTime.startsWith(timeSlot.slice(0, 2))
                      );

                      return (
                        <div key={hour} className="group flex items-start gap-4 border-b border-gray-100 pb-2 hover:bg-gray-50">
                          <div className="w-16 text-sm text-gray-600 font-mono flex items-center justify-between">
                            <span>{timeSlot}</span>
                            <button
                              onClick={() => {
                                setTaskFormData({
                                  ...taskFormData,
                                  dueDate: currentDate,
                                  dueTime: timeSlot
                                });
                                handleAddTask(currentDate);
                              }}
                              className="w-4 h-4 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded opacity-0 group-hover:opacity-100 ml-2"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex-1 min-h-12 relative">
                            {tasksAtTime.length === 0 && (
                              <div className="h-full flex items-center">
                                <button
                                  onClick={() => {
                                    setTaskFormData({
                                      ...taskFormData,
                                      dueDate: currentDate,
                                      dueTime: timeSlot
                                    });
                                    handleAddTask(currentDate);
                                  }}
                                  className="w-full h-10 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-600 text-sm transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add task at {timeSlot}
                                </button>
                              </div>
                            )}
                            {tasksAtTime.map(task => (
                              <div
                                key={task._id}
                                onClick={() => handleEditTask(task)}
                                className="p-2 mb-2 rounded-lg cursor-pointer hover:shadow-sm border-l-4"
                                style={{
                                  backgroundColor: task.project?.color ? task.project.color + '20' : '#f3f4f6',
                                  borderLeftColor: task.project?.color || '#9ca3af'
                                }}
                              >
                                <div className="font-medium">{task.title}</div>
                                <div className="text-sm text-gray-600">{task.dueTime}</div>
                                {task.location && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {task.location}
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant */}
            {canUseAI() && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5" />
                  <h3 className="font-semibold">AI Planner</h3>
                </div>
                <p className="text-sm text-purple-100 mb-3">
                  Get smart suggestions for your schedule and task prioritization.
                </p>
                <button
                  onClick={() => setShowAIChatbot(true)}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                >
                  Ask AI
                </button>
              </div>
            )}

            {/* Selected Day Tasks */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  {selectedDate.toDateString() === new Date().toDateString()
                    ? "Today's Tasks"
                    : `Tasks for ${formatDate(selectedDate)}`}
                </h3>
                <button
                  onClick={() => handleAddTask(selectedDate)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getTasksForDate(selectedDate).map(task => (
                  <div
                    key={task._id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEditTask(task)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task._id);
                      }}
                      className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {task.status === 'completed' && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.dueTime && (
                          <span className="text-xs text-gray-500">{task.dueTime}</span>
                        )}
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
                          task.priority === 'urgent' ? 'text-red-600 bg-red-100' :
                          task.priority === 'high' ? 'text-orange-600 bg-orange-100' :
                          task.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                          'text-gray-600 bg-gray-100'
                        }`}>
                          {task.priority}
                        </span>
                        {task.recurring && (
                          <Repeat className="w-3 h-3 text-gray-400" />
                        )}
                        {task.reminders && task.reminders.length > 0 && (
                          <Bell className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {getTasksForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks for this date</p>
                    <button
                      onClick={() => handleAddTask(selectedDate)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                    >
                      Add a task
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="text-sm font-medium">{filteredTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {filteredTasks.filter(t => t.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-medium text-blue-600">
                    {filteredTasks.filter(t => t.status === 'in-progress').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-green-600">
                    {filteredTasks.filter(t => t.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Overdue</span>
                  <span className="text-sm font-medium text-red-600">
                    {filteredTasks.filter(t =>
                      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
                    ).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Recurring Tasks */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Recurring Tasks</h3>
              <div className="space-y-2">
                {tasks.filter(task => task.recurring).slice(0, 3).map(task => (
                  <div key={task._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <Repeat className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Every {task.recurring?.interval} {task.recurring?.type}
                      </p>
                    </div>
                  </div>
                ))}
                {tasks.filter(task => task.recurring).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recurring tasks</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showAddTask && renderTaskModal()}

      {/* AI Chatbot Modal */}
      <AIChatbot isOpen={showAIChatbot} onClose={() => setShowAIChatbot(false)} />
    </div>
  );
};

export default PlannerPage;
