import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Filter, Calendar, Clock, Target, Users,
  TrendingUp, BarChart3, Bell, Settings, User,
  ChevronRight, ChevronDown, Star, Flag, Tag,
  MessageSquare, FileText, Zap, Bot, Crown,
  CheckCircle, AlertCircle, Play, Pause, Square, X,
  CheckSquare, Type, List, Activity, Folder, Download,
  Upload, Link as LinkIcon, Award, Flame, ArrowUp, ArrowDown, RefreshCw,
  Sparkles, Rocket, TrendingDown, Monitor, Package, Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PlanStatus } from './FeatureRestriction';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useTheme } from '../context/ThemeContext';
import { useRefreshData } from '../hooks/useRefreshData';
import SubscriptionBadge from './SubscriptionBadge';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../services/homeService';
import { goalService, Goal } from '../services/goalService';
import { apiService } from '../services/api';
import CalendarWidget from './dashboard/CalendarWidget';
import ReportsWidget from './dashboard/ReportsWidget';
import PendingTasksWidget from './dashboard/PendingTasksWidget';
import ExpandedStatCard from './dashboard/ExpandedStatCard';
import SartthiAppsWidget from './dashboard/SartthiAppsWidget';
import DashboardSkeleton from './dashboard/DashboardSkeleton';
import WorkspacesWidget from './dashboard/WorkspacesWidget';
import DownloadAppWidget from './dashboard/DownloadAppWidget';
import GoalsWidget from './dashboard/GoalsWidget';
import ContentBanner from './ContentBanner';
import { useTranslation } from 'react-i18next';
import AIChatbot from './AIChatbot';
import ProfileSummaryWidget from './dashboard/ProfileSummaryWidget';
import { useDock } from '../context/DockContext';
import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';

interface QuickTask {
  _id: string;
  title: string;
  type: 'task' | 'note' | 'checklist' | 'reminder' | 'milestone' | 'event';
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
  status: 'active' | 'on-hold' | 'completed' | 'planning' | 'in_progress' | 'cancelled';
  team: number;
  teamMembers?: {
    _id: string;
    name: string;
    avatar?: string;
    email?: string;
    role?: string;
  }[];
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

interface DesktopRelease {
  _id: string;
  version: string;
  platform: string;
  downloadUrl: string;
  releaseNotes: string;
  isLatest: boolean;
  createdAt: string;
}

const HomePage: React.FC = () => {
  const { state, dispatch } = useApp();
  const { userPlan, canUseAI } = useFeatureAccess();
  const { isDarkMode, preferences } = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { dockPosition } = useDock();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([]);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [latestRelease, setLatestRelease] = useState<DesktopRelease | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<'task' | 'note' | 'checklist' | 'reminder' | 'milestone' | 'event'>('task');
  const [productivityData, setProductivityData] = useState<number[]>([65, 72, 68, 85, 78, 90, 88]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<'tasks' | 'projects' | 'team' | 'progress' | null>(null);
  const [totalTeamMembers, setTotalTeamMembers] = useState(0);

  // Get accent color from preferences
  const accentColor = preferences.accentColor || '#FBBF24';

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [response, goalsResponse, releasesResponse] = await Promise.all([
        getDashboardData(),
        goalService.getGoals().catch(e => ({ data: [] })),
        apiService.get('/releases/latest').catch(e => ({ data: [] }))
      ]);

      if (goalsResponse && Array.isArray(goalsResponse.data)) {
        setGoals(goalsResponse.data);
      } else if (Array.isArray(goalsResponse)) {
        setGoals(goalsResponse);
      }


      if ('success' in releasesResponse && releasesResponse.success && releasesResponse.data && releasesResponse.data.length > 0) {
        const windowsRelease = releasesResponse.data.find((r: DesktopRelease) => r.platform === 'windows' && r.isLatest);
        if (windowsRelease) setLatestRelease(windowsRelease);
      }


      setQuickTasks(
        (response.quickTasks || []).map((task: any) => ({
          ...task,
          // Map category to type if it's one of our special types
          type: (task.category && ['reminder', 'milestone', 'event'].includes(task.category))
            ? task.category
            : (task.type || 'task'),
          priority: task.priority || 'medium',
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        })),
      );

      setRecentActivity(
        (response.recentActivity || []).map((activity: any) => ({
          ...activity,
          type: activity.type || 'task_completed',
          title: activity.title || activity.message || 'Activity',
          description: activity.description || activity.message || '',
          timestamp: new Date(activity.timestamp),
        })),
      );

      setProjects(
        (response.projects || []).map((project: any) => ({
          ...project,
          color: project.color || '#6366f1',
          team: project.team?.length || project.team || 0,
          teamMembers: project.team || [],
          dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
        })),
      );

      setNotifications(
        (response.notifications || []).map((notification: any) => ({
          ...notification,
          title: notification.title || 'Notification',
          timestamp: new Date(notification.timestamp || notification.createdAt),
        })),
      );

      setDeadlines(
        (response.deadlines || []).map((deadline: any) => ({
          ...deadline,
          priority: deadline.priority || 'medium',
          daysLeft: deadline.daysLeft || 0,
          dueDate: new Date(deadline.dueDate),
        })),
      );

      setTeamActivity(
        (response.teamActivity || []).map((activity: any) => ({
          ...activity,
          target: activity.target || '',
          timestamp: new Date(activity.timestamp),
        })),
      );

      setRecentFiles(
        (response.recentFiles || []).map((file: any) => ({
          ...file,
          size: `${((file.size || 0) / (1024 * 1024)).toFixed(1)} MB`,
          uploadedBy: file.name,
          uploadedAt: file.updatedAt ? new Date(file.updatedAt) : new Date(),
        })),
      );

      setWorkspaces(response.workspaces || []);

      // Set total team members from backend calculation
      setTotalTeamMembers(response.totalUniqueTeamMembers || 0);
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

  useRefreshData(loadDashboardData, [loadDashboardData]);

  const handleAddQuickTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const payload: any = {
        title: newTaskTitle,
        type: 'task', // Backend requirement
        category: newTaskType === 'task' ? 'general' : newTaskType, // Use category to store the specific type
      };

      if (state.currentWorkspace) {
        payload.workspace = state.currentWorkspace;
      }

      const createdTask = await apiService.createTask(payload);

      const newTask: QuickTask = {
        _id: createdTask._id,
        title: createdTask.title,
        type: newTaskType,
        priority: 'medium',
        completed: false,
      };

      setQuickTasks([newTask, ...quickTasks]);
      setNewTaskTitle('');
      setNewTaskType('task');
      setShowQuickAdd(false);

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Task created successfully',
          duration: 3000,
        },
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to create task',
          duration: 3000,
        },
      });
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = quickTasks.find((t) => t._id === taskId);
    if (!task) return;

    try {
      await apiService.updateTask(taskId, { status: task.completed ? 'pending' : 'completed' } as any);
      setQuickTasks(
        quickTasks.map((t) =>
          t._id === taskId ? { ...t, completed: !t.completed } : t,
        ),
      );
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <Type className="w-4 h-4 text-gray-500" />;
      case 'checklist': return <List className="w-4 h-4 text-gray-500" />;
      case 'reminder': return <Bell className="w-4 h-4 text-orange-500" />;
      case 'milestone': return <Flag className="w-4 h-4 text-red-500" />;
      case 'event': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'task':
      default: return <CheckSquare className="w-4 h-4 text-accent" />;
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to load dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-500/30"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning' || p.status === 'in_progress');
  const completedTasks = quickTasks.filter(t => t.completed).length;
  const totalTasks = quickTasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={`min-h-screen pb-8 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20'}`}>
      <ContentBanner route="/" />

      {/* Glassmorphic Page Header - Same as Notes Page */}
      <GlassmorphicPageHeader
        icon={Home}
        title={t('home.welcomeBack', { name: state.userProfile?.fullName?.split(' ')[0] })}
        subtitle={new Date().toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        className="w-full !rounded-none !border-x-0 !mb-0"
      >
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="group relative px-6 py-3 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
            boxShadow: `0 10px 25px -5px ${accentColor}40`
          }}
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          <Bot className="w-5 h-5 relative z-10" />
          <span className="relative z-10">{t('home.aiAssistant')}</span>
        </button>
        <button
          onClick={loadDashboardData}
          className={`p-3 rounded-2xl border transition-all ${isDarkMode
            ? 'bg-white/5 border-gray-700/70 text-gray-300 hover:bg-white/10'
            : 'bg-white/50 border-white/50 text-gray-600 hover:bg-white shadow-sm'
            }`}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </GlassmorphicPageHeader>

      <div className={`w-full space-y-6 transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px] pr-4 sm:pr-6' :
        dockPosition === 'right' ? 'pr-[71px] pl-4 sm:pl-6' :
          'px-4 sm:px-6'
        } py-4 sm:py-6`}>

        {/* Stats Grid - Beautiful Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'tasks',
              label: t('home.activeTasks'),
              value: quickTasks.filter(t => !t.completed).length,
              total: totalTasks,
              icon: CheckSquare,
              gradient: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
              trend: t('home.percentCompleted', { percent: taskCompletionRate }),
              trendUp: taskCompletionRate > 50
            },
            {
              id: 'projects',
              label: t('home.activeProjects'),
              value: activeProjects.length,
              total: projects.length,
              icon: Rocket,
              gradient: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
              trend: t('home.tasksCompleted', { count: projects.filter(p => p.status === 'completed').length }),
              trendUp: true
            },
            {
              id: 'team',
              label: t('home.teamMembers'),
              value: totalTeamMembers,
              icon: Users,
              gradient: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
              trend: t('home.projectsActive', { count: activeProjects.length }),
              trendUp: true
            },
            {
              id: 'progress',
              label: t('home.avgProgress'),
              value: `${Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / (projects.length || 1))}%`,
              icon: TrendingUp,
              gradient: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
              trend: t('home.onTrack'),
              trendUp: true
            }
          ].map((stat, index) => (
            <div
              key={index}
              onClick={() => setExpandedCard(stat.id as any)}
              className={`group relative overflow-hidden rounded-2xl p-6 border transition-all duration-500 hover:scale-105 cursor-pointer ${isDarkMode
                ? 'bg-gray-800/50 border-gray-700/70 hover:border-gray-600 backdrop-blur-sm'
                : 'bg-white/80 border-gray-300/60 hover:shadow-2xl backdrop-blur-sm'
                }`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `${stat.gradient}10` }} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl shadow-lg" style={{ background: stat.gradient }}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.trendUp
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.trend}
                  </div>
                </div>
                <h3 className={`text-4xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </h3>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sartthi Desktop Download Card */}
        {latestRelease && (
          <div className={`relative overflow-hidden rounded-2xl border ${isDarkMode
            ? 'bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-indigo-500/20'
            : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200/50 shadow-lg'
            }`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="relative z-10 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl">
                    <Monitor className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('home.sartthiDesktop')}
                    </h3>
                    <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full">
                      v{latestRelease.version}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                      Latest
                    </span>
                  </div>

                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('home.downloadSartthiDesktop')}
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    <div className={`px-3 py-2 rounded-lg text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <div className="text-lg mb-1">⚡</div>
                      <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Lightning Fast
                      </div>
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <div className="text-lg mb-1">📴</div>
                      <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Offline Mode
                      </div>
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <div className="text-lg mb-1">🔔</div>
                      <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Notifications
                      </div>
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <div className="text-lg mb-1">🔒</div>
                      <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Secure
                      </div>
                    </div>
                  </div>

                  {/* Release Notes */}
                  {latestRelease.releaseNotes && (
                    <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'}`}>
                      <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        What's New:
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                        {latestRelease.releaseNotes}
                      </p>
                    </div>
                  )}

                  {/* Download Button */}
                  <div className="flex items-center gap-3">
                    <a
                      href={latestRelease.downloadUrl}
                      download
                      className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                      <Download className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">{t('home.downloadNow')}</span>
                    </a>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="font-medium">Windows 10/11</div>
                      <div>64-bit</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sartthi Ecosystem */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('home.sartthiEcosystem')}
            </h2>
          </div>
          <SartthiAppsWidget />
        </section>

        {/* Professional Profile - Full Width */}
        <section className="mt-8 mb-8">
          <ProfileSummaryWidget />
        </section>

        {/* Main Content - Bento Box Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column - Tasks & Projects */}
          <div className="lg:col-span-7 space-y-6 min-h-[600px]">

            {/* Quick Tasks */}
            <div className={`rounded-2xl border p-6 ${isDarkMode
              ? 'bg-gray-800/50 border-gray-700/70 backdrop-blur-sm'
              : 'bg-white/80 border-gray-300/60 backdrop-blur-sm shadow-lg'
              }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)` }}>
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('home.quickTasks')}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {quickTasks.filter(t => !t.completed).length} pending
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="px-4 py-2 text-white rounded-xl text-sm font-semibold transition-all shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                    boxShadow: `0 4px 12px -2px ${accentColor}40`
                  }}
                >
                  <Plus className="w-4 h-4 inline mr-1.5" />
                  {t('home.addTask')}
                </button>
              </div>

              {showQuickAdd && (
                <div className={`mb-4 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddQuickTask()}
                    placeholder="What needs to be done?"
                    className={`w-full px-4 py-3 rounded-lg border mb-3 ${isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:border-transparent transition-all`}
                    style={{
                      outlineColor: accentColor
                    }}
                    autoFocus
                  />

                  {/* Type Selectors */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { id: 'task', label: 'Task', icon: CheckSquare },
                      { id: 'reminder', label: 'Reminder', icon: Bell },
                      { id: 'milestone', label: 'Milestone', icon: Flag },
                      { id: 'event', label: 'Event', icon: Calendar }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setNewTaskType(type.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${newTaskType === type.id
                          ? 'bg-accent text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        style={{
                          backgroundColor: newTaskType === type.id ? accentColor : undefined
                        }}
                      >
                        <type.icon className="w-3 h-3" />
                        {type.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddQuickTask}
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: accentColor }}
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowQuickAdd(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {quickTasks.slice(0, 8).map((task) => (
                  <div
                    key={task._id}
                    className={`group p-4 rounded-xl border transition-all hover:scale-[1.02] ${task.completed
                      ? isDarkMode
                        ? 'bg-gray-700/20 border-gray-700/70 opacity-60'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                      : isDarkMode
                        ? 'bg-gray-700/30 border-gray-600'
                        : 'bg-white border-gray-200 hover:shadow-md'
                      }`}
                    style={{
                      borderColor: !task.completed ? `${accentColor}20` : undefined
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTask(task._id)}
                        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all ${task.completed
                          ? 'border-green-500'
                          : isDarkMode
                            ? 'border-gray-600'
                            : 'border-gray-300'
                          } flex items-center justify-center`}
                        style={{
                          backgroundColor: task.completed ? '#10b981' : 'transparent',
                          borderColor: task.completed ? '#10b981' : (!task.completed ? accentColor : undefined)
                        }}
                      >
                        {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                        {!task.completed && task.type !== 'task' && (
                          <div className="flex items-center justify-center w-full h-full">
                            {/* Small icon inside checkbox for special types if not completed */}
                            {getTaskTypeIcon(task.type)}
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${task.completed
                            ? 'line-through text-gray-500'
                            : isDarkMode
                              ? 'text-gray-200'
                              : 'text-gray-900'
                            }`}>
                            {task.title}
                          </p>
                          {task.type !== 'task' && (
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${task.type === 'reminder' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              task.type === 'milestone' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                task.type === 'event' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {task.type}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
                {quickTasks.length === 0 && (
                  <div className="text-center py-12">
                    <CheckSquare className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('home.noTasksYet')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Projects */}
            <div className={`rounded-2xl border p-6 ${isDarkMode
              ? 'bg-gray-800/50 border-gray-700/70 backdrop-blur-sm'
              : 'bg-white/80 border-gray-300/60 backdrop-blur-sm shadow-lg'
              }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('home.activeProjects')}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('home.activeProjectsCount', { count: activeProjects.length })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/projects')}
                  className={`text-sm font-medium flex items-center gap-1 transition-colors`}
                  style={{ color: accentColor }}
                >
                  {t('home.viewAll')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProjects.slice(0, 4).map((project) => (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/project/${project._id}`)}
                    className={`group p-5 rounded-xl border cursor-pointer transition-all hover:scale-105 ${isDarkMode
                      ? 'bg-gray-700/30 border-gray-600 hover:border-purple-500/50'
                      : 'bg-white border-gray-200 hover:border-purple-500/50 hover:shadow-xl'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {project.name}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>
                          {project.description}
                        </p>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
                        style={{ backgroundColor: project.color }}
                      />
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {project.progress}%
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {Array.isArray(project.teamMembers) && project.teamMembers.slice(0, 3).map((member, idx) => (
                          <div
                            key={idx}
                            className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'
                              } bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold`}
                            title={member.name}
                          >
                            {member.name?.charAt(0) || '?'}
                          </div>
                        ))}
                        {((Array.isArray(project.teamMembers) ? project.teamMembers.length : (typeof project.team === 'number' ? project.team : 0)) > 3) && (
                          <div className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'border-gray-800 bg-gray-700' : 'border-white bg-gray-200'
                            } flex items-center justify-center text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            +{(Array.isArray(project.teamMembers) ? project.teamMembers.length : (typeof project.team === 'number' ? project.team : 0)) - 3}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {Array.isArray(project.teamMembers) ? project.teamMembers.length : (typeof project.team === 'number' ? project.team : 0)} members
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity (Moved to Left) */}
            <div className={`rounded-2xl border p-6 ${isDarkMode
              ? 'bg-gray-800/50 border-gray-700/70 backdrop-blur-sm'
              : 'bg-white/80 border-gray-300/60 backdrop-blur-sm shadow-lg'
              }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('home.recentActivity')}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('home.latestUpdates')}
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {recentActivity.slice(0, 6).map((activity) => (
                  <div
                    key={activity._id}
                    className={`p-4 rounded-xl border ${isDarkMode
                      ? 'bg-gray-700/30 border-gray-600'
                      : 'bg-white border-gray-200'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {activity.type === 'project_created' ? (
                          <Folder className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        ) : activity.type === 'task_completed' ? (
                          <CheckSquare className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        ) : (
                          <Activity className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activity.title}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reports Widget */}
            <ReportsWidget />
          </div>

          {/* Right Column - Download, Calendar, Workspaces */}
          <div className="lg:col-span-5 flex flex-col gap-6 min-h-[600px]">

            <DownloadAppWidget />

            {/* Calendar Widget */}
            <div className="h-[600px] shrink-0">
              <CalendarWidget />
            </div>

            <div className="flex-1 min-h-[200px]">
              <WorkspacesWidget workspaces={workspaces} loading={loading} />
            </div>

          </div>
        </div>

        {/* Bottom Section - Pending Tasks & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Pending Tasks (Left) */}
          <div className="h-[400px]">
            <PendingTasksWidget />
          </div>

          {/* Goals (Right) */}
          <div className="h-[400px]">
            <GoalsWidget goals={goals} loading={loading} />
          </div>
        </div>
      </div>

      {/* AI Chatbot Modal */}
      {isAIModalOpen && (
        <AIChatbot isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      )}

      {/* Expanded Stat Card Modal */}
      {expandedCard && (
        <ExpandedStatCard
          type={expandedCard}
          onClose={() => setExpandedCard(null)}
          data={{
            tasks: quickTasks.filter(t => !t.completed),
            projects: activeProjects,
            teamMembers: projects.flatMap(p => Array.isArray(p.teamMembers) ? p.teamMembers : []),
            avgProgress: Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / (projects.length || 1))
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
