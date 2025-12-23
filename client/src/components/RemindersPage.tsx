import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Calendar, Clock, Bell, AlertCircle, CheckCircle,
  Star, Flag, Tag, MessageSquare, FileText, Users,
  ChevronLeft, ChevronRight, Filter, Search,
  Edit, Trash2, Eye, Play, Pause, Square, Zap, Bot,
  Target, TrendingUp, BarChart3, List, Download, Volume2, Repeat
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useDock } from '../context/DockContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import ReminderModal from './ReminderModal';
import { useReminderNotifications, useReminderSnooze } from '../hooks/useReminderNotifications';
import reminderService from '../services/reminderService';
import { exportRemindersToPDF } from '../utils/pdfExport';
import ReminderCard from './reminders/ReminderCard';
import CustomSelect from './ui/CustomSelect';
import GlassmorphicCard from './ui/GlassmorphicCard';
import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';

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
    minutesBefore: number;
    sent?: boolean;
  }>;
  snoozedUntil?: Date;
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
  const { isDarkMode } = useTheme();
  const { state, dispatch } = useApp();
  const { dockPosition } = useDock();
  const { canUseAI } = useFeatureAccess();
  const { t, i18n } = useTranslation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSnoozeMenu, setShowSnoozeMenu] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{ _id: string; name: string; avatar?: string }>>([]);
  const [projects, setProjects] = useState<Array<{ _id: string; name: string; color: string }>>([]);

  // Notification system
  const { permission, requestPermission } = useReminderNotifications(reminders, {
    sound: true,
    volume: 0.7,
    vibrate: true
  });

  // Snooze functionality
  const { snoozeOptions, snoozeReminder } = useReminderSnooze();

  // Request notification permission on mount
  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Fetch reminders from API
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        setError(null);
        const workspaceId = state.currentWorkspace; // currentWorkspace is already a string ID

        // Fetch reminders
        const fetchedReminders = await reminderService.getReminders(workspaceId);
        setReminders(fetchedReminders);

        // Fetch team members from workspace
        if (workspaceId) {
          try {
            const workspace = state.workspaces.find(w => w._id === workspaceId);
            if (workspace?.members) {
              const members = workspace.members.map((member: any) => ({
                _id: member.user?._id || member._id,
                name: member.user?.fullName || member.name || 'Unknown',
                avatar: member.user?.avatar || member.avatar
              }));
              setTeamMembers(members);
            }
          } catch (err) {
            console.error('Failed to fetch team members:', err);
          }
        }

        // Fetch projects
        if (state.projects && state.projects.length > 0) {
          const projectList = state.projects.map((project: any) => ({
            _id: project._id,
            name: project.name,
            color: project.color || 'bg-blue-500'
          }));
          setProjects(projectList);
        }

        // Convert reminders to calendar events
        const calendarEvents: CalendarEvent[] = fetchedReminders.map(reminder => ({
          _id: reminder._id,
          title: reminder.title,
          start: new Date(reminder.dueDate),
          end: new Date(reminder.dueDate),
          type: reminder.type as any,
          priority: reminder.priority,
          project: reminder.project?.name,
          color: reminder.project?.color || 'bg-blue-500',
          allDay: false
        }));
        setEvents(calendarEvents);
      } catch (err: any) {
        console.error('Failed to fetch reminders:', err);
        setError(err.message || 'Failed to load reminders');
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [state.currentWorkspace, state.workspaces, state.projects]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 dark:text-gray-400 bg-gray-100';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100';
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

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
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

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query)) ||
        r.project?.name.toLowerCase().includes(query)
      );
    }

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

  const toggleReminderCompletion = async (reminderId: string) => {
    try {
      // Find the reminder to get current completion status
      const reminder = reminders.find(r => r._id === reminderId);
      if (!reminder) return;

      // Call API to toggle completion
      await reminderService.toggleCompletion(reminderId);

      // Update local state
      setReminders(reminders.map(r => {
        if (r._id === reminderId) {
          return {
            ...r,
            completed: !r.completed,
            completedAt: !r.completed ? new Date() : undefined
          };
        }
        return r;
      }));
    } catch (err: any) {
      console.error('Failed to toggle reminder completion:', err);
      alert('Failed to update reminder status. Please try again.');
    }
  };

  const handleSaveReminder = async (reminderData: Partial<Reminder>) => {
    try {
      // Transform the data to match backend schema
      const transformedData: any = {
        ...reminderData,
        // Transform notifications from minutesBefore to time
        notifications: reminderData.notifications?.map(notif => ({
          type: notif.type,
          time: new Date(new Date(reminderData.dueDate!).getTime() - (notif.minutesBefore || 0) * 60 * 1000),
          sent: notif.sent || false
        })),
        // Transform assignee to assignedTo (backend field name)
        assignedTo: reminderData.assignee?._id,
        // Transform project to just the ID
        project: reminderData.project?._id,
        // Remove frontend-only fields
        assignee: undefined
      };

      if (selectedReminder) {
        // Update existing
        const updated = await reminderService.updateReminder(selectedReminder._id, transformedData);
        setReminders(reminders.map(r =>
          r._id === selectedReminder._id ? updated : r
        ));
      } else {
        // Create new
        const newReminder = await reminderService.createReminder(transformedData);
        setReminders([...reminders, newReminder]);
      }
    } catch (err: any) {
      console.error('Failed to save reminder:', err);
      alert('Failed to save reminder. Please try again.');
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowAddModal(true);
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await reminderService.deleteReminder(reminderId);
        setReminders(reminders.filter(r => r._id !== reminderId));
      } catch (err: any) {
        console.error('Failed to delete reminder:', err);
        alert('Failed to delete reminder. Please try again.');
      }
    }
  };

  const handleSnooze = (reminderId: string, minutes: number) => {
    snoozeReminder(reminderId, minutes, (id, snoozedUntil) => {
      setReminders(reminders.map(r =>
        r._id === id ? { ...r, snoozedUntil } : r
      ));
    });
    setShowSnoozeMenu(null);
  };

  const handleExport = (type: 'all' | 'pending' | 'completed') => {
    let remindersToExport = reminders;

    if (type === 'pending') {
      remindersToExport = reminders.filter(r => !r.completed);
    } else if (type === 'completed') {
      remindersToExport = reminders.filter(r => r.completed);
    }

    exportRemindersToPDF(remindersToExport, `reminders-${type}.pdf`);
    setShowExportMenu(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20'}`}>
      {/* Header & Toolbar */}
      <GlassmorphicPageHeader
        title={t('reminders.title')}
        subtitle={t('reminders.subtitle')}
        icon={Bell}
        className="w-full !rounded-none !border-x-0 !mb-0"
        decorativeGradients={{
          topRight: 'rgba(239, 68, 68, 0.2)',
          bottomLeft: 'rgba(245, 158, 11, 0.2)'
        }}
      />

      <div className={`pt-6 pr-6 transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px]' :
        dockPosition === 'right' ? 'pr-[71px]' :
          'pl-6'
        }`}>

        <GlassmorphicCard className="p-4 mb-6 flex flex-wrap items-center justify-between gap-4 relative z-20">
          <div className="flex items-center gap-3">
            {/* Notification Permission */}
            {permission === 'default' && (
              <button
                onClick={requestPermission}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-accent-dark text-accent-dark rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {t('reminders.enableNotifications')}
              </button>
            )}
            {permission === 'granted' && (
              <span className="inline-flex items-center gap-2 px-3 py-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Bell className="w-4 h-4" />
                {t('reminders.notificationsOn')}
              </span>
            )}

            {/* Export Button */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('buttons.export')}
              </button>
              {showExportMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 py-1 z-50 shadow-xl">
                  <button
                    onClick={() => handleExport('all')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('reminders.exportAll')}
                  </button>
                  <button
                    onClick={() => handleExport('pending')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('reminders.exportPending')}
                  </button>
                  <button
                    onClick={() => handleExport('completed')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('reminders.exportCompleted')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedReminder(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover/20 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            {t('reminders.addReminder')}
          </button>
        </GlassmorphicCard>
      </div>

      <div
        className={`px-6 pb-6 transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px]' :
          dockPosition === 'right' ? 'pr-[71px]' :
            ''
          }`}
      >
        {/* Search and Filters */}
        <GlassmorphicCard className="p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('reminders.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                    ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <CustomSelect
                value={filterStatus}
                onChange={(value) => setFilterStatus(value as any)}
                placeholder={t('common.allStatus')}
                options={[
                  { id: 'all', label: t('common.allStatus'), value: 'all' },
                  { id: 'pending', label: t('common.pending'), value: 'pending' },
                  { id: 'completed', label: t('common.completed'), value: 'completed' },
                  { id: 'overdue', label: t('reminders.overdue'), value: 'overdue' }
                ]}
              />

              <CustomSelect
                value={filterPriority}
                onChange={(value) => setFilterPriority(value as any)}
                placeholder={t('common.allPriority')}
                options={[
                  { id: 'all', label: t('common.allPriority'), value: 'all' },
                  { id: 'urgent', label: t('common.urgent'), value: 'urgent' },
                  { id: 'high', label: t('common.high'), value: 'high' },
                  { id: 'medium', label: t('common.medium'), value: 'medium' },
                  { id: 'low', label: t('common.low'), value: 'low' }
                ]}
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg ml-auto bg-gray-50 dark:bg-gray-800/50">
              {[
                { id: 'list', label: t('reminders.views.list'), icon: List },
                { id: 'calendar', label: t('reminders.views.calendar'), icon: Calendar },
                { id: 'kanban', label: t('reminders.views.kanban'), icon: Target }
              ].map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all ${viewMode === mode.id
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-md m-0.5'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
        </GlassmorphicCard>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">


            {/* Content Area */}
            {viewMode === 'list' && (
              <GlassmorphicCard className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('reminders.title')}</h2>

                {filteredReminders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
                    {filteredReminders.map(reminder => (
                      <ReminderCard
                        key={reminder._id}
                        reminder={reminder}
                        onToggleComplete={toggleReminderCompletion}
                        onClick={() => handleEditReminder(reminder)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {t('reminders.noReminders')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                      {t('reminders.noRemindersDesc')}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedReminder(null);
                        setShowAddModal(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover"
                    >
                      <Plus className="w-4 h-4" />
                      {t('reminders.addReminder')}
                    </button>
                  </div>
                )}
              </GlassmorphicCard>
            )}

            {viewMode === 'calendar' && (
              <GlassmorphicCard className="p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
                    </h2>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700"
                  >
                    {t('common.today')}
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t(`common.days.short.${day}`)}
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
                        className={`min-h-24 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:bg-gray-700 ${isToday ? 'bg-blue-50 border-blue-200' : ''
                          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${isToday ? 'text-accent-dark' : 'text-gray-900 dark:text-gray-100'}`}>
                            {day.getDate()}
                          </span>
                          {(dayReminders.length + dayEvents.length) > 0 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {dayReminders.length + dayEvents.length}
                            </span>
                          )}
                        </div>

                        {/* Reminders */}
                        <div className="space-y-1">
                          {dayReminders.slice(0, 2).map(reminder => (
                            <div
                              key={reminder._id}
                              className={`text-xs p-1 rounded truncate ${reminder.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                              {reminder.title}
                            </div>
                          ))}
                          {dayReminders.length > 2 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {t('reminders.more', { count: dayReminders.length - 2 })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassmorphicCard>
            )}

            {viewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { status: 'pending', title: t('common.pending'), color: 'bg-yellow-50 border-yellow-200' },
                  { status: 'completed', title: t('common.completed'), color: 'bg-green-50 border-green-200' },
                  { status: 'overdue', title: t('reminders.overdue'), color: 'bg-red-50 border-red-200' }
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
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{column.title}</h3>
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                          {columnReminders.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {columnReminders.map(reminder => (
                          <div
                            key={reminder._id}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-3"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              {getTypeIcon(reminder.type)}
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{reminder.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{reminder.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400">
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
              <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.aiAssistant')}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('dashboard.aiDescription')}
                </p>
                <button className="w-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
                  {t('dashboard.askAI')}
                </button>
              </div>
            )}

            {/* Quick Stats */}
            {/* Quick Stats */}
            <GlassmorphicCard className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('reminders.quickStats')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.pending')}</span>
                  <span className="text-sm font-medium">{reminders.filter(r => !r.completed).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('reminders.completedToday')}</span>
                  <span className="text-sm font-medium">
                    {reminders.filter(r => r.completed && r.completedAt && new Date(r.completedAt).toDateString() === new Date().toDateString()).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('reminders.overdue')}</span>
                  <span className="text-sm font-medium text-red-600">
                    {reminders.filter(r => isOverdue(r.dueDate, r.completed)).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('reminders.thisWeek')}</span>
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
            </GlassmorphicCard>

            {/* Upcoming Deadlines */}
            {/* Upcoming Deadlines */}
            <GlassmorphicCard className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('reminders.upcomingDeadlines')}</h3>
              <div className="space-y-2">
                {reminders
                  .filter(r => !r.completed && new Date(r.dueDate) >= new Date())
                  .slice(0, 5)
                  .map(reminder => (
                    <div key={reminder._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:bg-gray-700">
                      <div className={`w-2 h-2 rounded-full ${reminder.priority === 'urgent' ? 'bg-red-500' :
                        reminder.priority === 'high' ? 'bg-orange-500' :
                          reminder.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{reminder.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(reminder.dueDate)} at {formatTime(reminder.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                {reminders.filter(r => !r.completed && new Date(r.dueDate) >= new Date()).length === 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">{t('reminders.noUpcomingDeadlines')}</p>
                )}
              </div>
            </GlassmorphicCard>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      {
        showAddModal && (
          <ReminderModal
            reminder={selectedReminder}
            onSave={handleSaveReminder}
            onClose={() => {
              setShowAddModal(false);
              setSelectedReminder(null);
            }}
            projects={projects}
            teamMembers={teamMembers}
          />
        )
      }
    </div >
  );
};

export default RemindersPage;
