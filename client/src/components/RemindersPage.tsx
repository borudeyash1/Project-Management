import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Clock, Bell, AlertCircle, CheckCircle, 
  Star, Flag, Tag, MessageSquare, FileText, Users,
  ChevronLeft, ChevronRight, Filter, Search, MoreVertical,
  Edit, Trash2, Eye, Play, Pause, Square, Zap, Bot,
  Target, TrendingUp, BarChart3, List
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface Reminder {
  _id: string;
  title: string;
  description?: string;
  type: 'task' | 'meeting' | 'deadline' | 'milestone' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
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
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  notifications: Array<{
    type: 'email' | 'push' | 'sms';
    time: Date;
    sent: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarEvent {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'reminder' | 'meeting' | 'deadline' | 'milestone';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project?: string;
  color: string;
  allDay: boolean;
}

const RemindersPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const { canUseAI } = useFeatureAccess();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockReminders: Reminder[] = [
      {
        _id: '1',
        title: 'Design review meeting',
        description: 'Review the new UI designs with the team',
        type: 'meeting',
        priority: 'high',
        dueDate: new Date('2024-03-25T10:00:00'),
        completed: false,
        project: {
          _id: 'p1',
          name: 'E-commerce Platform',
          color: 'bg-blue-500'
        },
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['design', 'meeting'],
        notifications: [
          { type: 'email', time: new Date('2024-03-25T09:30:00'), sent: false },
          { type: 'push', time: new Date('2024-03-25T09:45:00'), sent: false }
        ],
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20')
      },
      {
        _id: '2',
        title: 'Submit project proposal',
        description: 'Finalize and submit the Q2 project proposal',
        type: 'deadline',
        priority: 'urgent',
        dueDate: new Date('2024-03-22T17:00:00'),
        completed: false,
        project: {
          _id: 'p2',
          name: 'Mobile App',
          color: 'bg-green-500'
        },
        assignee: {
          _id: 'u2',
          name: 'Jane Smith',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['deadline', 'proposal'],
        notifications: [
          { type: 'email', time: new Date('2024-03-22T16:00:00'), sent: false },
          { type: 'push', time: new Date('2024-03-22T16:30:00'), sent: false }
        ],
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },
      {
        _id: '3',
        title: 'Code review for authentication',
        description: 'Review the JWT authentication implementation',
        type: 'task',
        priority: 'medium',
        dueDate: new Date('2024-03-26T14:00:00'),
        completed: true,
        completedAt: new Date('2024-03-25T15:30:00'),
        project: {
          _id: 'p1',
          name: 'E-commerce Platform',
          color: 'bg-blue-500'
        },
        assignee: {
          _id: 'u3',
          name: 'Bob Wilson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['code', 'review'],
        notifications: [
          { type: 'email', time: new Date('2024-03-26T13:30:00'), sent: true }
        ],
        createdAt: new Date('2024-03-18'),
        updatedAt: new Date('2024-03-25')
      },
      {
        _id: '4',
        title: 'Team standup',
        description: 'Daily team standup meeting',
        type: 'meeting',
        priority: 'low',
        dueDate: new Date('2024-03-27T09:00:00'),
        completed: false,
        recurring: {
          frequency: 'daily',
          interval: 1,
          endDate: new Date('2024-12-31')
        },
        project: {
          _id: 'p1',
          name: 'E-commerce Platform',
          color: 'bg-blue-500'
        },
        tags: ['standup', 'daily'],
        notifications: [
          { type: 'push', time: new Date('2024-03-27T08:45:00'), sent: false }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-03-20')
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
        color: 'bg-blue-500',
        allDay: false
      },
      {
        _id: 'e2',
        title: 'Project deadline',
        start: new Date('2024-03-22T17:00:00'),
        end: new Date('2024-03-22T17:00:00'),
        type: 'deadline',
        priority: 'urgent',
        project: 'Mobile App',
        color: 'bg-red-500',
        allDay: false
      },
      {
        _id: 'e3',
        title: 'Sprint Planning',
        start: new Date('2024-03-26T09:00:00'),
        end: new Date('2024-03-26T11:00:00'),
        type: 'meeting',
        priority: 'medium',
        project: 'E-commerce Platform',
        color: 'bg-purple-500',
        allDay: false
      }
    ];

    setReminders(mockReminders);
    setEvents(mockEvents);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <Target className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'deadline': return <AlertCircle className="w-4 h-4" />;
      case 'milestone': return <Flag className="w-4 h-4" />;
      case 'personal': return <Star className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
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

  const isOverdue = (dueDate: Date, completed: boolean) => {
    return !completed && new Date(dueDate) < new Date();
  };

  const getFilteredReminders = () => {
    let filtered = reminders;

    // Status filter
    if (filterStatus === 'pending') {
      filtered = filtered.filter(r => !r.completed);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(r => r.completed);
    } else if (filterStatus === 'overdue') {
      filtered = filtered.filter(r => isOverdue(r.dueDate, r.completed));
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(r => r.priority === filterPriority);
    }

    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const toggleReminderCompletion = (reminderId: string) => {
    setReminders(reminders.map(reminder => {
      if (reminder._id === reminderId) {
        return {
          ...reminder,
          completed: !reminder.completed,
          completedAt: !reminder.completed ? new Date() : undefined
        };
      }
      return reminder;
    }));
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

  const getRemindersForDate = (date: Date) => {
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.dueDate);
      return reminderDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const weekDays = getWeekDays(currentDate);
  const filteredReminders = getFilteredReminders();

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reminders & Calendar</h1>
            <p className="text-gray-600 mt-1">Stay on top of your tasks and deadlines</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters and View Toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Filters */}
                <div className="flex items-center gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg ml-auto">
                  {[
                    { id: 'list', label: 'List', icon: List },
                    { id: 'calendar', label: 'Calendar', icon: Calendar },
                    { id: 'kanban', label: 'Kanban', icon: Target }
                  ].map(mode => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id as any)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                          viewMode === mode.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content Area */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Reminders</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {filteredReminders.map(reminder => (
                    <div key={reminder._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleReminderCompletion(reminder._id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                            reminder.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {reminder.completed && <CheckCircle className="w-3 h-3" />}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(reminder.type)}
                              <h3 className={`font-medium ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {reminder.title}
                              </h3>
                            </div>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                              {reminder.priority}
                            </span>
                            {isOverdue(reminder.dueDate, reminder.completed) && (
                              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                                Overdue
                              </span>
                            )}
                          </div>
                          
                          {reminder.description && (
                            <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatDate(reminder.dueDate)} at {formatTime(reminder.dueDate)}</span>
                            {reminder.project && (
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${reminder.project.color}`} />
                                <span>{reminder.project.name}</span>
                              </div>
                            )}
                            {reminder.recurring && (
                              <span className="text-blue-600">Recurring</span>
                            )}
                          </div>
                        </div>
                        
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'calendar' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
                    </h2>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
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

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  
                  {/* Day Cells */}
                  {weekDays.map((day, index) => {
                    const dayReminders = getRemindersForDate(day);
                    const dayEvents = getEventsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={`min-h-24 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          isToday ? 'bg-blue-50 border-blue-200' : ''
                        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {day.getDate()}
                          </span>
                          {(dayReminders.length + dayEvents.length) > 0 && (
                            <span className="text-xs text-gray-500">
                              {dayReminders.length + dayEvents.length}
                            </span>
                          )}
                        </div>
                        
                        {/* Reminders */}
                        <div className="space-y-1">
                          {dayReminders.slice(0, 2).map(reminder => (
                            <div
                              key={reminder._id}
                              className={`text-xs p-1 rounded truncate ${
                                reminder.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {reminder.title}
                            </div>
                          ))}
                          {dayReminders.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayReminders.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { status: 'pending', title: 'Pending', color: 'bg-yellow-50 border-yellow-200' },
                  { status: 'completed', title: 'Completed', color: 'bg-green-50 border-green-200' },
                  { status: 'overdue', title: 'Overdue', color: 'bg-red-50 border-red-200' }
                ].map(column => {
                  const columnReminders = filteredReminders.filter(reminder => {
                    if (column.status === 'pending') return !reminder.completed && !isOverdue(reminder.dueDate, reminder.completed);
                    if (column.status === 'completed') return reminder.completed;
                    if (column.status === 'overdue') return isOverdue(reminder.dueDate, reminder.completed);
                    return false;
                  });

                  return (
                    <div key={column.status} className={`rounded-lg border-2 border-dashed ${column.color} p-4`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">{column.title}</h3>
                        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                          {columnReminders.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {columnReminders.map(reminder => (
                          <div
                            key={reminder._id}
                            className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              {getTypeIcon(reminder.type)}
                              <h4 className="font-medium text-gray-900 text-sm">{reminder.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{reminder.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatDate(reminder.dueDate)} {formatTime(reminder.dueDate)}
                              </span>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                                {reminder.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant */}
            {canUseAI() && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5" />
                  <h3 className="font-semibold">AI Reminder Assistant</h3>
                </div>
                <p className="text-sm text-purple-100 mb-3">
                  Get smart suggestions for task prioritization and deadline management.
                </p>
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
                  Ask AI
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium">{reminders.filter(r => !r.completed).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed Today</span>
                  <span className="text-sm font-medium">
                    {reminders.filter(r => r.completed && r.completedAt && new Date(r.completedAt).toDateString() === new Date().toDateString()).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Overdue</span>
                  <span className="text-sm font-medium text-red-600">
                    {reminders.filter(r => isOverdue(r.dueDate, r.completed)).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="text-sm font-medium">
                    {reminders.filter(r => {
                      const reminderDate = new Date(r.dueDate);
                      const today = new Date();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay());
                      return reminderDate >= startOfWeek;
                    }).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Upcoming Deadlines</h3>
              <div className="space-y-2">
                {reminders
                  .filter(r => !r.completed && new Date(r.dueDate) >= new Date())
                  .slice(0, 5)
                  .map(reminder => (
                    <div key={reminder._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                      <div className={`w-2 h-2 rounded-full ${
                        reminder.priority === 'urgent' ? 'bg-red-500' :
                        reminder.priority === 'high' ? 'bg-orange-500' :
                        reminder.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(reminder.dueDate)} at {formatTime(reminder.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                {reminders.filter(r => !r.completed && new Date(r.dueDate) >= new Date()).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming deadlines</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;
