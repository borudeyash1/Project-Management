import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import SubscriptionBadge from './SubscriptionBadge';
import { useNavigate } from 'react-router-dom';

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
  const { userPlan, canUseAI } = useFeatureAccess();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
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

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockQuickTasks: QuickTask[] = [
      {
        _id: '1',
        title: 'Review design mockups',
        type: 'task',
        priority: 'high',
        dueDate: new Date('2024-03-25'),
        project: 'E-commerce Platform',
        assignee: 'John Doe',
        completed: false
      },
      {
        _id: '2',
        title: 'Update project documentation',
        type: 'note',
        priority: 'medium',
        dueDate: new Date('2024-03-30'),
        project: 'Mobile App',
        assignee: 'Jane Smith',
        completed: false
      },
      {
        _id: '3',
        title: 'Prepare client presentation',
        type: 'checklist',
        priority: 'urgent',
        dueDate: new Date('2024-03-22'),
        project: 'Marketing Campaign',
        assignee: 'Bob Wilson',
        completed: true
      }
    ];

    const mockNotifications: Notification[] = [
      {
        _id: '1',
        title: 'New task assigned',
        message: 'You have been assigned to "Review design mockups"',
        type: 'info',
        timestamp: new Date('2024-03-20T10:30:00'),
        read: false
      },
      {
        _id: '2',
        title: 'Deadline approaching',
        message: 'Task "Prepare client presentation" is due tomorrow',
        type: 'warning',
        timestamp: new Date('2024-03-21T09:00:00'),
        read: false
      },
      {
        _id: '3',
        title: 'Task completed',
        message: 'John Doe completed "Review design mockups"',
        type: 'success',
        timestamp: new Date('2024-03-20T15:45:00'),
        read: true
      }
    ];

    const mockRecentActivity: RecentActivity[] = [
      {
        _id: '1',
        type: 'task_completed',
        title: 'Task completed',
        description: 'Review design mockups was completed',
        timestamp: new Date('2024-03-20T10:30:00'),
        user: {
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        }
      },
      {
        _id: '2',
        type: 'project_created',
        title: 'Project created',
        description: 'New project "Mobile App" was created',
        timestamp: new Date('2024-03-19T14:20:00'),
        user: {
          name: 'Jane Smith',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
        }
      },
      {
        _id: '3',
        type: 'milestone_reached',
        title: 'Milestone reached',
        description: 'UI/UX Design milestone completed',
        timestamp: new Date('2024-03-18T16:45:00'),
        user: {
          name: 'Bob Wilson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
        }
      }
    ];

    const mockProjects: Project[] = [
      {
        _id: '1',
        name: 'E-commerce Platform',
        description: 'Building a modern e-commerce platform',
        progress: 75,
        status: 'active',
        team: 5,
        dueDate: new Date('2024-06-30'),
        color: 'bg-blue-500'
      },
      {
        _id: '2',
        name: 'Mobile App',
        description: 'iOS and Android mobile application',
        progress: 45,
        status: 'active',
        team: 3,
        dueDate: new Date('2024-08-15'),
        color: 'bg-green-500'
      },
      {
        _id: '3',
        name: 'Marketing Campaign',
        description: 'Q2 marketing campaign launch',
        progress: 90,
        status: 'active',
        team: 4,
        dueDate: new Date('2024-04-30'),
        color: 'bg-purple-500'
      }
    ];

    const mockDeadlines: Deadline[] = [
      {
        _id: '1',
        title: 'Submit final design',
        project: 'E-commerce Platform',
        dueDate: new Date('2024-03-25'),
        priority: 'urgent',
        daysLeft: 2
      },
      {
        _id: '2',
        title: 'Code review completion',
        project: 'Mobile App',
        dueDate: new Date('2024-03-28'),
        priority: 'high',
        daysLeft: 5
      },
      {
        _id: '3',
        title: 'Client presentation',
        project: 'Marketing Campaign',
        dueDate: new Date('2024-04-01'),
        priority: 'medium',
        daysLeft: 9
      }
    ];

    const mockTeamActivity: TeamActivity[] = [
      {
        _id: '1',
        user: 'Sarah Johnson',
        action: 'completed',
        target: 'Homepage redesign task',
        timestamp: new Date('2024-03-20T14:30:00')
      },
      {
        _id: '2',
        user: 'Mike Chen',
        action: 'commented on',
        target: 'API integration issue',
        timestamp: new Date('2024-03-20T13:15:00')
      },
      {
        _id: '3',
        user: 'Emily Davis',
        action: 'uploaded',
        target: 'Design mockups v2.0',
        timestamp: new Date('2024-03-20T11:45:00')
      },
      {
        _id: '4',
        user: 'Alex Kumar',
        action: 'created',
        target: 'Sprint planning meeting',
        timestamp: new Date('2024-03-20T10:20:00')
      }
    ];

    const mockRecentFiles: RecentFile[] = [
      {
        _id: '1',
        name: 'Project_Requirements.pdf',
        type: 'PDF',
        size: '2.4 MB',
        uploadedBy: 'John Doe',
        uploadedAt: new Date('2024-03-20T15:30:00')
      },
      {
        _id: '2',
        name: 'Design_Mockups_v2.fig',
        type: 'Figma',
        size: '15.8 MB',
        uploadedBy: 'Emily Davis',
        uploadedAt: new Date('2024-03-20T11:45:00')
      },
      {
        _id: '3',
        name: 'Sprint_Report_Q1.xlsx',
        type: 'Excel',
        size: '856 KB',
        uploadedBy: 'Mike Chen',
        uploadedAt: new Date('2024-03-19T16:20:00')
      }
    ];

    setQuickTasks(mockQuickTasks);
    setRecentActivity(mockRecentActivity);
    setProjects(mockProjects);
    setNotifications(mockNotifications);
    setDeadlines(mockDeadlines);
    setTeamActivity(mockTeamActivity);
    setRecentFiles(mockRecentFiles);
  }, []);

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
      case 'medium': return 'text-yellow-600 bg-yellow-100';
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

  return (
    <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome back, {state.userProfile?.fullName}!
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Here's what's happening with your projects today
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Top Row - Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Tasks</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {quickTasks.filter(t => !t.completed).length}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                <Clock className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Projects</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {projects.length}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/50' : 'bg-green-50'}`}>
                <Target className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Team Members</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {projects.reduce((acc, p) => acc + p.team, 0)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
                <Users className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Progress</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-orange-900/50' : 'bg-orange-50'}`}>
                <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - 2 Equal Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Plan Status */}
            <PlanStatus />

            {/* Quick Actions */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
                <button
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              {/* Quick Add Task */}
              {showQuickAdd && (
                <div className={`mb-4 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setNewTaskType('task')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        newTaskType === 'task'
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      Task
                    </button>
                    <button
                      onClick={() => setNewTaskType('note')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        newTaskType === 'note'
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Type className="w-4 h-4" />
                      Note
                    </button>
                    <button
                      onClick={() => setNewTaskType('checklist')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        newTaskType === 'checklist'
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      Checklist
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder={`What ${newTaskType === 'note' ? 'note' : newTaskType === 'checklist' ? 'checklist' : 'task'} needs to be added?`}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddQuickTask()}
                    />
                    <button
                      onClick={handleAddQuickTask}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Tasks */}
              <div className="space-y-2">
                {quickTasks.map(task => (
                  <div
                    key={task._id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getTaskTypeIcon(task.type)}
                    </div>
                    <button
                      onClick={() => toggleTaskCompletion(task._id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : isDarkMode
                          ? 'border-gray-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {task.completed && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${
                        task.completed
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
                    <div className="flex items-center gap-2">
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
            </div>

            {/* Recent Activity */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h2>
                <button 
                  onClick={() => navigate('/activity')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity._id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activity.title}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activity.description}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Productivity Chart - Moved to Left */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Weekly Productivity</h2>
                <Flame className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
              </div>
              <div className="flex items-end justify-between h-32 gap-2">
                {productivityData.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ height: `${value}%` }}
                      />
                    </div>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </span>
                  </div>
                ))}
              </div>
              <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average: {Math.round(productivityData.reduce((a, b) => a + b, 0) / productivityData.length)}%</span>
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">+12% this week</span>
                </div>
              </div>
            </div>

            {/* Team Activity Feed - Moved to Left */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Team Activity</h2>
                <Activity className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <div className="space-y-4">
                {teamActivity.map(activity => (
                  <div key={activity._id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Assistant */}
            {canUseAI() && (
              <div className={`rounded-lg p-6 shadow-lg ${
                isDarkMode
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                  : 'bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-white bg-opacity-20 backdrop-blur-sm' : 'bg-purple-200'
                  }`}>
                    <Bot className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Assistant</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Get smart suggestions</p>
                  </div>
                </div>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  I can help you prioritize tasks, suggest project improvements, and provide insights.
                </p>
                <button 
                  onClick={() => navigate('/ai-assistant')}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium text-white drop-shadow-sm transition-colors border border-white border-opacity-20"
                >
                  Ask AI Assistant
                </button>
              </div>
            )}

            {/* Projects Overview */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Projects</h2>
                <button 
                  onClick={() => navigate('/workspace')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project._id} className={`p-4 border rounded-lg hover:shadow-sm transition-shadow ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${project.color}`} />
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.name}</h3>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{project.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.progress}%</span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <span>{project.team} team members</span>
                        {project.dueDate && (
                          <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upcoming Deadlines</h2>
                <button 
                  onClick={() => navigate('/tasks')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {deadlines.map(deadline => (
                  <div key={deadline._id} className={`p-3 rounded-lg border ${
                    isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
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
                          {deadline.priority}
                        </span>
                        <span className={`text-xs ${
                          deadline.daysLeft <= 2 ? 'text-red-500 font-medium' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {deadline.daysLeft} days left
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Files */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Files</h2>
                <button 
                  onClick={() => navigate('/files')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {recentFiles.map(file => (
                  <div key={file._id} className={`flex items-center gap-3 p-3 rounded-lg ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  } transition-colors cursor-pointer`}>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                        {file.name}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {file.size} • {file.uploadedBy}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Simulate file download
                        const link = document.createElement('a');
                        link.href = '#';
                        link.download = file.name;
                        dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `Downloading ${file.name}...` } });
                      }}
                      className={`p-2 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      } transition-colors`}
                    >
                      <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Quick Links</h2>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/calendar')}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Calendar</span>
                </button>
                <button 
                  onClick={() => navigate('/workspace')}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Users className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Team</span>
                </button>
                <button 
                  onClick={() => navigate('/analytics')}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reports</span>
                </button>
                <button 
                  onClick={() => navigate('/settings')}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Settings className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
