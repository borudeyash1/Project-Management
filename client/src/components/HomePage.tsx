import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Filter, Calendar, Clock, Target, Users,
  TrendingUp, BarChart3, Bell, Settings, User,
  ChevronRight, ChevronDown, Star, Flag, Tag,
  MessageSquare, FileText, Zap, Bot, Crown,
  CheckCircle, AlertCircle, Play, Pause, Square, X,
  CheckSquare, Type, List, Activity, Folder, Download,
  Upload, Link as LinkIcon, Award, Flame, ArrowUp, ArrowDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PlanStatus } from './FeatureRestriction';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useDock } from '../context/DockContext';
import { useTheme } from '../context/ThemeContext';
import SubscriptionBadge from './SubscriptionBadge';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../services/homeService';
import CalendarWidget from './dashboard/CalendarWidget';
import ReportsWidget from './dashboard/ReportsWidget';
import ExpandedStatCard from './dashboard/ExpandedStatCard';
import ContentBanner from './ContentBanner';
import { useTranslation } from 'react-i18next';
import AIChatbot from './AIChatbot';
import DashboardSkeleton from './dashboard/DashboardSkeleton';
import SartthiAppsWidget from './dashboard/SartthiAppsWidget';

interface QuickTask {
  _id: string;
  title: string;
  type: 'task' | 'note' | 'checklist';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  project?: string;
  assignee?: string;
  completed: boolean;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface RecentActivity {
  _id: string;
  type: 'task_completed' | 'project_created' | 'team_joined' | 'milestone_reached';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface Project {
  _id: string;
  name: string;
  description: string;
  progress: number;
  status: 'active' | 'on-hold' | 'completed';
  team: number;
  dueDate?: Date;
  color: string;
}

interface Deadline {
  _id: string;
  title: string;
  project: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  daysLeft: number;
}

interface TeamActivity {
  _id: string;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  avatar?: string;
}

interface RecentFile {
  _id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: Date;
}

const HomePage: React.FC = () => {
  const { state, dispatch } = useApp();
  const { dockPosition } = useDock();
  const { userPlan, canUseAI } = useFeatureAccess();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([]);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<'task' | 'note' | 'checklist'>('task');
  const [productivityData, setProductivityData] = useState<number[]>([65, 72, 68, 85, 78, 90, 88]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<'tasks' | 'projects' | 'team' | 'progress' | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardData();

      setQuickTasks(
        (response.quickTasks || []).map((task) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          type: 'task',
          priority: (task as any).priority || 'medium',
          project: (task as any).project?.name,
        })),
      );
      setRecentActivity(
        (response.recentActivity || []).map((activity) => {
          const rawActivity = activity as any;
          const rawUser = rawActivity.user || {};
          return {
            _id: activity._id,
            type: rawActivity.type || 'task_updated',
            title: rawActivity.title || rawActivity.message || 'Activity',
            description: rawActivity.description || rawActivity.message || 'Recent update',
            timestamp: activity.timestamp ? new Date(activity.timestamp) : new Date(),
            user: rawUser.name
              ? {
                name: rawUser.name,
                avatar: rawUser.avatar,
              }
              : undefined,
          } as RecentActivity;
        }),
      );
      setProjects(
        (response.projects || []).map((project) => {
          // Ensure _id is preserved from the API response
          const projectData = project as any;
          const projectId = projectData._id || projectData.id;
          return {
            _id: projectId,
            name: projectData.name,
            description: projectData.description,
            progress: projectData.progress || 0,
            dueDate: projectData.dueDate || projectData.endDate ? new Date(projectData.dueDate || projectData.endDate) : undefined,
            team: Array.isArray(projectData.teamMembers) ? projectData.teamMembers.length : (projectData.team?.length || 0),
            color: 'bg-blue-500',
            status: (projectData.status || 'active') as Project['status'],
          };
        }),
      );
      setNotifications(
        (response.notifications || []).map((notification) => ({
          _id: notification._id,
          title: 'Notification',
          message: notification.message,
          type: (notification as any).type || 'info',
          timestamp: notification.createdAt ? new Date(notification.createdAt) : new Date(),
          read: notification.read,
        })),
      );
      setDeadlines(
        (response.deadlines || []).map((deadline) => {
          const dueDate = deadline.dueDate ? new Date(deadline.dueDate) : new Date();
          return {
            _id: deadline._id,
            title: deadline.title,
            project: deadline.project?.name || 'General',
            dueDate,
            priority: ((deadline as any).priority || 'medium') as Deadline['priority'],
            daysLeft: Math.max(
              0,
              Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            ),
          };
        }),
      );
      setTeamActivity(
        (response.teamActivity || []).map((activity) => {
          const raw = activity as any;
          return {
            _id: activity._id,
            user: raw.user?.name || 'User',
            action: raw.action || 'updated',
            target: raw.target || 'Task',
            timestamp: activity.timestamp ? new Date(activity.timestamp) : new Date(),
          } as TeamActivity;
        }),
      );
      setRecentFiles(
        (response.recentFiles || []).map((file) => ({
          ...file,
          size: `${((file.size || 0) / (1024 * 1024)).toFixed(1)} MB`,
          uploadedBy: file.name,
          uploadedAt: file.updatedAt ? new Date(file.updatedAt) : new Date(),
        })),
      );
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleAddQuickTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: QuickTask = {
      _id: Date.now().toString(),
      title: newTaskTitle,
      type: newTaskType,
      priority: 'medium',
      completed: false
    };

    setQuickTasks([newTask, ...quickTasks]);
    setNewTaskTitle('');
    setNewTaskType('task');
    setShowQuickAdd(false);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif =>
      notif._id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const toggleTaskCompletion = (taskId: string) => {
    setQuickTasks(tasks =>
      tasks.map(task =>
        task._id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    if (isDarkMode) {
      switch (priority) {
        case 'urgent': return 'text-red-400 bg-red-900/50';
        case 'high': return 'text-orange-400 bg-orange-900/50';
        case 'medium': return 'text-yellow-400 bg-yellow-900/50';
        case 'low': return 'text-gray-400 bg-gray-800/50';
        default: return 'text-gray-400 bg-gray-800/50';
      }
    }
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-800 bg-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <Type className="w-4 h-4" />;
      case 'checklist': return <List className="w-4 h-4" />;
      case 'task':
      default: return <CheckSquare className="w-4 h-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'project_created': return <Target className="w-4 h-4 text-blue-600" />;
      case 'team_joined': return <Users className="w-4 h-4 text-purple-600" />;
      case 'milestone_reached': return <Flag className="w-4 h-4 text-orange-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (isDarkMode) {
      switch (status) {
        case 'active': return 'bg-green-900/50 text-green-400';
        case 'on-hold': return 'bg-yellow-900/50 text-yellow-400';
        case 'completed': return 'bg-gray-800/50 text-gray-400';
        default: return 'bg-gray-800/50 text-gray-400';
      }
    }
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'figma': return <Folder className="w-5 h-5 text-purple-500" />;
      case 'excel': return <FileText className="w-5 h-5 text-green-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'completed': return 'text-green-600';
      case 'commented on': return 'text-blue-600';
      case 'uploaded': return 'text-purple-600';
      case 'created': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };


  if (loading) {
    return (
      <div
        className="h-full transition-all duration-300"
        style={{
          paddingLeft: dockPosition === 'left' ? '100px' : undefined,
          paddingRight: dockPosition === 'right' ? '100px' : undefined
        }}
      >
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-red-200 dark:border-red-900 mt-10 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Unable to load dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div
        className="p-4 sm:p-6 space-y-8 max-w-[1600px] mx-auto transition-all duration-300"
        style={{
          paddingLeft: dockPosition === 'left' ? '100px' : undefined,
          paddingRight: dockPosition === 'right' ? '100px' : undefined
        }}
      >
        <ContentBanner route="/home" />

        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h1>
            <p className={`mt-1 text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Here's what's happening in your workspace today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <Search className="w-5 h-5" />
            </button>
            <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sartthi Suite Apps */}
        <SartthiAppsWidget isDarkMode={isDarkMode} />

        {/* Top Row - Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            onClick={() => setExpandedCard('tasks')}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} border cursor-pointer transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.pendingTasks')}</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {quickTasks.filter(t => !t.completed).length}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                <Clock className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>
          <div
            onClick={() => setExpandedCard('projects')}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} border cursor-pointer transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('projects.active')}</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {projects.length}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/50' : 'bg-green-50'}`}>
                <Target className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
          </div>
          <div
            onClick={() => setExpandedCard('team')}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} border cursor-pointer transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('team.members')}</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {projects.reduce((acc, p) => acc + p.team, 0)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
                <Users className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </div>
          <div
            onClick={() => setExpandedCard('progress')}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} border cursor-pointer transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('dashboard.avgProgress')}</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / (projects.length || 1))}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-orange-900/50' : 'bg-orange-50'}`}>
                <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Plan Status */}
            <PlanStatus />

            {/* Quick Actions */}
            {quickTasks.length > 0 || showQuickAdd ? (
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.quickActions')}</h2>
                  <button
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tasks.newTask')}
                  </button>
                </div>

                {/* Quick Add Task */}
                {showQuickAdd && (
                  <div className={`mb-4 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setNewTaskType('task')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${newTaskType === 'task'
                          ? 'bg-accent text-white'
                          : isDarkMode
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        <CheckSquare className="w-4 h-4" />
                        {t('tasks.title')}
                      </button>
                      <button
                        onClick={() => setNewTaskType('note')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${newTaskType === 'note'
                          ? 'bg-accent text-white'
                          : isDarkMode
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        <Type className="w-4 h-4" />
                        {t('common.note', { defaultValue: 'Note' })}
                      </button>
                      <button
                        onClick={() => setNewTaskType('checklist')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${newTaskType === 'checklist'
                          ? 'bg-accent text-white'
                          : isDarkMode
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        <List className="w-4 h-4" />
                        {t('tasks.checklist')}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder={`What ${newTaskType === 'note' ? 'note' : newTaskType === 'checklist' ? 'checklist' : 'task'} needs to be added?`}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddQuickTask()}
                      />
                      <button
                        onClick={handleAddQuickTask}
                        className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Tasks */}
                {quickTasks.length > 0 ? (
                  <div className="space-y-2">
                    {quickTasks.slice(0, 5).map(task => (
                      <div
                        key={task._id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}
                      >
                        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {getTaskTypeIcon(task.type)}
                        </div>
                        <button
                          onClick={() => toggleTaskCompletion(task._id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : isDarkMode
                              ? 'border-gray-500'
                              : 'border-gray-300'
                            }`}
                        >
                          {task.completed && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${task.completed
                            ? isDarkMode
                              ? 'line-through text-gray-500'
                              : 'line-through text-gray-500'
                            : isDarkMode
                              ? 'text-gray-200'
                              : 'text-gray-900'
                            }`}>
                            {task.title}
                          </p>
                          {task.project && (
                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{task.project}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No tasks yet. Click "New Task" to get started!</p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.recentActivity')}</h2>
                  <button
                    onClick={() => navigate('/activity')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('buttons.viewAll')}
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map(activity => (
                    <div key={activity._id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {t(`activity.types.${activity.type}`, { defaultValue: activity.title })}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activity.description}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Activity Feed */}
            {teamActivity.length > 0 && (
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.teamActivity')}</h2>
                  <Activity className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <div className="space-y-4">
                  {teamActivity.slice(0, 5).map(activity => (
                    <div key={activity._id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                        <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className="font-medium">{activity.user}</span>{' '}
                          <span className={getActionColor(activity.action)}>{activity.action}</span>{' '}
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{activity.target}</span>
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Deadlines */}
            {deadlines.length > 0 && (
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.upcomingTasks')}</h2>
                  <button
                    onClick={() => navigate('/tasks')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('buttons.viewAll')}
                  </button>
                </div>
                <div className="space-y-3">
                  {deadlines.slice(0, 5).map(deadline => (
                    <div key={deadline._id} className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                      } transition-colors`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {deadline.title}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            {deadline.project}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                            {t('tasks.' + deadline.priority.toLowerCase())}
                          </span>
                          <span className={`text-xs ${deadline.daysLeft <= 2 ? 'text-red-500 font-medium' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {t('tasks.daysLeft', { count: deadline.daysLeft })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Overview */}
            {projects.length > 0 && (
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('projects.title')}</h2>
                  <button
                    onClick={() => navigate('/projects')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('buttons.viewAll')}
                  </button>
                </div>
                <div className="space-y-4">
                  {projects.slice(0, 3).map(project => {
                    if (!project._id) {
                      console.warn('Project missing _id:', project);
                      return null;
                    }
                    return (
                      <div key={project._id} className={`p-4 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer ${isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                        }`} onClick={() => {
                          console.log('Navigating to project:', project._id);
                          navigate(`/project/${project._id}/overview`);
                        }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${project.color}`} />
                          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.name}</h3>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {t('projects.' + project.status.toLowerCase().replace(' ', ''))}
                        </span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2`}>{project.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{t('projects.progress')}</span>
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.progress}%</span>
                        </div>
                        <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="bg-accent h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          <span>{t('projects.teamMembers', { count: project.team })}</span>
                          {project.dueDate && (
                            <span>{t('projects.due', { date: new Date(project.dueDate).toLocaleDateString() })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Assistant */}
            {canUseAI() && (
              <div className={`rounded-lg p-6 shadow-lg ${isDarkMode
                ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50'
                }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-white bg-opacity-20 backdrop-blur-sm' : 'bg-accent/20'
                    }`}>
                    <Bot className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-yellow-700'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.aiAssistant')}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{t('dashboard.aiSuggestions')}</p>
                  </div>
                </div>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  {t('dashboard.aiDescription')}
                </p>
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className={`w-full rounded-lg px-4 py-2 text-sm font-medium drop-shadow-sm transition-colors border ${isDarkMode
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-20'
                    : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-200'}`}
                >
                  {t('dashboard.askAI')}
                </button>
              </div>
            )}

            {/* AI Chatbot Modal */}
            <AIChatbot
              isOpen={isAIModalOpen}
              onClose={() => setIsAIModalOpen(false)}
            />

            {/* Calendar Widget */}
            <CalendarWidget />

            {/* Reports Widget */}
            <ReportsWidget />
          </div>
        </div>
      </div>
      {expandedCard && (
        <ExpandedStatCard
          type={expandedCard}
          onClose={() => setExpandedCard(null)}
          data={{
            tasks: quickTasks.filter(t => !t.completed),
            projects: projects,
            teamMembers: projects.flatMap(p => Array(p.team).fill({ role: 'Member' })), // Mock team data for now
            avgProgress: Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / (projects.length || 1))
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
