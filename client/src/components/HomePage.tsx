import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, Clock, Target, Users, 
  TrendingUp, BarChart3, Bell, Settings, User, 
  ChevronRight, ChevronDown, Star, Flag, Tag,
  MessageSquare, FileText, Zap, Bot, Crown,
  CheckCircle, AlertCircle, Play, Pause, Square
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PlanStatus } from './FeatureRestriction';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface QuickTask {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  project?: string;
  assignee?: string;
  completed: boolean;
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

const HomePage: React.FC = () => {
  const { state, dispatch } = useApp();
  const { userPlan, canUseAI } = useFeatureAccess();
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockQuickTasks: QuickTask[] = [
      {
        _id: '1',
        title: 'Review design mockups',
        priority: 'high',
        dueDate: new Date('2024-03-25'),
        project: 'E-commerce Platform',
        assignee: 'John Doe',
        completed: false
      },
      {
        _id: '2',
        title: 'Update project documentation',
        priority: 'medium',
        dueDate: new Date('2024-03-30'),
        project: 'Mobile App',
        assignee: 'Jane Smith',
        completed: false
      },
      {
        _id: '3',
        title: 'Prepare client presentation',
        priority: 'urgent',
        dueDate: new Date('2024-03-22'),
        project: 'Marketing Campaign',
        assignee: 'Bob Wilson',
        completed: true
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

    setQuickTasks(mockQuickTasks);
    setRecentActivity(mockRecentActivity);
    setProjects(mockProjects);
  }, []);

  const handleAddQuickTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: QuickTask = {
      _id: Date.now().toString(),
      title: newTaskTitle,
      priority: 'medium',
      completed: false
    };

    setQuickTasks([newTask, ...quickTasks]);
    setNewTaskTitle('');
    setShowQuickAdd(false);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setQuickTasks(tasks =>
      tasks.map(task =>
        task._id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
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
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {state.userProfile?.fullName}!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your projects today</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Status */}
            <PlanStatus />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
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
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <button
                      onClick={() => toggleTaskCompletion(task._id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {task.completed && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      {task.project && (
                        <p className="text-xs text-gray-500">{task.project}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity._id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
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
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-sm text-purple-100">Get smart suggestions</p>
                  </div>
                </div>
                <p className="text-sm text-purple-100 mb-4">
                  I can help you prioritize tasks, suggest project improvements, and provide insights.
                </p>
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                  Ask AI Assistant
                </button>
              </div>
            )}

            {/* Projects Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${project.color}`} />
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
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

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{quickTasks.filter(t => !t.completed).length}</div>
                  <div className="text-sm text-gray-600">Pending Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
                  <div className="text-sm text-gray-600">Active Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{projects.reduce((acc, p) => acc + p.team, 0)}</div>
                  <div className="text-sm text-gray-600">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
