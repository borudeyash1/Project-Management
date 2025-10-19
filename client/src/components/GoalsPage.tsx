import React, { useState, useEffect } from 'react';
import { 
  Target, Plus, Search, Filter, MoreVertical, Edit, Trash2, 
  Eye, CheckCircle, Clock, AlertCircle, Star, Flag, Calendar,
  TrendingUp, BarChart3, Users, Zap, Bot, Crown, Award,
  ArrowUp, ArrowDown, Minus, Play, Pause, Square, RotateCcw,
  MessageSquare, FileText, Share2, Download, Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface Goal {
  _id: string;
  title: string;
  description: string;
  type: 'personal' | 'team' | 'project' | 'company';
  category: 'productivity' | 'learning' | 'health' | 'financial' | 'career' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  startDate: Date;
  targetDate: Date;
  completedDate?: Date;
  createdBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  project?: {
    _id: string;
    name: string;
    color: string;
  };
  milestones: Array<{
    _id: string;
    title: string;
    description?: string;
    completed: boolean;
    completedDate?: Date;
    dueDate: Date;
  }>;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  overdueGoals: number;
  averageProgress: number;
  completionRate: number;
  topCategories: Array<{
    category: string;
    count: number;
    completed: number;
  }>;
  recentActivity: Array<{
    _id: string;
    type: 'created' | 'updated' | 'completed' | 'milestone_achieved';
    goal: string;
    user: string;
    timestamp: Date;
  }>;
}

const GoalsPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const { canUseAI, canCreateGoals, canManageGoals } = useFeatureAccess();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalStats, setGoalStats] = useState<GoalStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'team' | 'project' | 'company'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'productivity' | 'learning' | 'health' | 'financial' | 'career' | 'other'>('all');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [sortBy, setSortBy] = useState<'created' | 'due_date' | 'progress' | 'priority'>('due_date');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockGoals: Goal[] = [
      {
        _id: '1',
        title: 'Complete React Certification',
        description: 'Finish the advanced React course and pass the certification exam',
        type: 'personal',
        category: 'learning',
        priority: 'high',
        status: 'in_progress',
        progress: 65,
        startDate: new Date('2024-01-15'),
        targetDate: new Date('2024-04-15'),
        createdBy: {
          _id: 'u1',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        project: {
          _id: 'p1',
          name: 'E-commerce Platform',
          color: 'bg-blue-500'
        },
        milestones: [
          { _id: 'm1', title: 'Complete Module 1', description: 'React Fundamentals', completed: true, completedDate: new Date('2024-02-01'), dueDate: new Date('2024-02-01') },
          { _id: 'm2', title: 'Complete Module 2', description: 'State Management', completed: true, completedDate: new Date('2024-02-15'), dueDate: new Date('2024-02-15') },
          { _id: 'm3', title: 'Complete Module 3', description: 'Advanced Patterns', completed: false, dueDate: new Date('2024-03-15') },
          { _id: 'm4', title: 'Pass Certification Exam', description: 'Final certification test', completed: false, dueDate: new Date('2024-04-15') }
        ],
        tags: ['react', 'certification', 'learning'],
        isPublic: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20')
      },
      {
        _id: '2',
        title: 'Launch Mobile App MVP',
        description: 'Complete and launch the minimum viable product for our mobile application',
        type: 'project',
        category: 'productivity',
        priority: 'urgent',
        status: 'in_progress',
        progress: 80,
        startDate: new Date('2024-02-01'),
        targetDate: new Date('2024-03-31'),
        createdBy: {
          _id: 'u2',
          name: 'Jane Smith',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
        },
        assignedTo: {
          _id: 'u1',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        project: {
          _id: 'p2',
          name: 'Mobile App',
          color: 'bg-green-500'
        },
        milestones: [
          { _id: 'm5', title: 'UI/UX Design Complete', description: 'Finalize all screen designs', completed: true, completedDate: new Date('2024-02-15'), dueDate: new Date('2024-02-15') },
          { _id: 'm6', title: 'Backend API Complete', description: 'All API endpoints implemented', completed: true, completedDate: new Date('2024-03-01'), dueDate: new Date('2024-03-01') },
          { _id: 'm7', title: 'Frontend Development', description: 'Complete mobile app frontend', completed: false, dueDate: new Date('2024-03-20') },
          { _id: 'm8', title: 'Testing & QA', description: 'Comprehensive testing phase', completed: false, dueDate: new Date('2024-03-25') },
          { _id: 'm9', title: 'App Store Submission', description: 'Submit to app stores', completed: false, dueDate: new Date('2024-03-31') }
        ],
        tags: ['mobile', 'mvp', 'launch'],
        isPublic: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-03-20')
      },
      {
        _id: '3',
        title: 'Increase Team Productivity by 20%',
        description: 'Implement new processes and tools to improve overall team efficiency',
        type: 'team',
        category: 'productivity',
        priority: 'medium',
        status: 'in_progress',
        progress: 45,
        startDate: new Date('2024-01-01'),
        targetDate: new Date('2024-06-30'),
        createdBy: {
          _id: 'u3',
          name: 'Bob Wilson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
        },
        milestones: [
          { _id: 'm10', title: 'Process Audit', description: 'Analyze current workflows', completed: true, completedDate: new Date('2024-01-15'), dueDate: new Date('2024-01-15') },
          { _id: 'm11', title: 'Tool Implementation', description: 'Deploy new productivity tools', completed: true, completedDate: new Date('2024-02-01'), dueDate: new Date('2024-02-01') },
          { _id: 'm12', title: 'Team Training', description: 'Train team on new processes', completed: false, dueDate: new Date('2024-03-15') },
          { _id: 'm13', title: 'Performance Review', description: 'Measure productivity improvements', completed: false, dueDate: new Date('2024-06-15') }
        ],
        tags: ['productivity', 'team', 'process'],
        isPublic: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-03-20')
      },
      {
        _id: '4',
        title: 'Learn Machine Learning',
        description: 'Complete a comprehensive machine learning course and build a project',
        type: 'personal',
        category: 'learning',
        priority: 'low',
        status: 'not_started',
        progress: 0,
        startDate: new Date('2024-04-01'),
        targetDate: new Date('2024-08-31'),
        createdBy: {
          _id: 'u1',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        milestones: [
          { _id: 'm14', title: 'Course Enrollment', description: 'Enroll in ML course', completed: false, dueDate: new Date('2024-04-01') },
          { _id: 'm15', title: 'Complete Theory', description: 'Finish theoretical modules', completed: false, dueDate: new Date('2024-06-01') },
          { _id: 'm16', title: 'Build Project', description: 'Create ML project', completed: false, dueDate: new Date('2024-08-01') },
          { _id: 'm17', title: 'Portfolio Update', description: 'Add to portfolio', completed: false, dueDate: new Date('2024-08-31') }
        ],
        tags: ['ml', 'learning', 'ai'],
        isPublic: true,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },
      {
        _id: '5',
        title: 'Reduce Customer Support Tickets by 30%',
        description: 'Improve product quality and documentation to reduce support burden',
        type: 'company',
        category: 'productivity',
        priority: 'high',
        status: 'completed',
        progress: 100,
        startDate: new Date('2023-10-01'),
        targetDate: new Date('2024-02-29'),
        completedDate: new Date('2024-02-25'),
        createdBy: {
          _id: 'u4',
          name: 'Alice Johnson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
        },
        milestones: [
          { _id: 'm18', title: 'Documentation Update', description: 'Improve user documentation', completed: true, completedDate: new Date('2023-11-15'), dueDate: new Date('2023-11-15') },
          { _id: 'm19', title: 'UI Improvements', description: 'Fix common UI issues', completed: true, completedDate: new Date('2023-12-15'), dueDate: new Date('2023-12-15') },
          { _id: 'm20', title: 'FAQ Section', description: 'Create comprehensive FAQ', completed: true, completedDate: new Date('2024-01-15'), dueDate: new Date('2024-01-15') },
          { _id: 'm21', title: 'Metrics Review', description: 'Analyze ticket reduction', completed: true, completedDate: new Date('2024-02-25'), dueDate: new Date('2024-02-25') }
        ],
        tags: ['support', 'documentation', 'ui'],
        isPublic: true,
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2024-02-25')
      }
    ];

    const mockGoalStats: GoalStats = {
      totalGoals: 5,
      completedGoals: 1,
      inProgressGoals: 3,
      overdueGoals: 0,
      averageProgress: 58,
      completionRate: 20,
      topCategories: [
        { category: 'productivity', count: 3, completed: 1 },
        { category: 'learning', count: 2, completed: 0 },
        { category: 'health', count: 0, completed: 0 },
        { category: 'financial', count: 0, completed: 0 },
        { category: 'career', count: 0, completed: 0 }
      ],
      recentActivity: [
        {
          _id: 'a1',
          type: 'milestone_achieved',
          goal: 'Launch Mobile App MVP',
          user: 'John Doe',
          timestamp: new Date('2024-03-20T14:30:00')
        },
        {
          _id: 'a2',
          type: 'updated',
          goal: 'Complete React Certification',
          user: 'John Doe',
          timestamp: new Date('2024-03-19T10:15:00')
        },
        {
          _id: 'a3',
          type: 'completed',
          goal: 'Reduce Customer Support Tickets by 30%',
          user: 'Alice Johnson',
          timestamp: new Date('2024-02-25T16:45:00')
        }
      ]
    };

    setGoals(mockGoals);
    setGoalStats(mockGoalStats);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'not_started': return 'text-gray-600 bg-gray-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return 'text-purple-600 bg-purple-100';
      case 'team': return 'text-blue-600 bg-blue-100';
      case 'project': return 'text-green-600 bg-green-100';
      case 'company': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'not_started': return <Clock className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'cancelled': return <Square className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isOverdue = (targetDate: Date, status: string) => {
    return status !== 'completed' && new Date(targetDate) < new Date();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFilteredGoals = () => {
    let filtered = goals;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(goal => goal.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(goal => goal.status === filterStatus);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'due_date':
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        case 'progress':
          return b.progress - a.progress;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredGoals = getFilteredGoals();

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Goals & Objectives</h1>
            <p className="text-gray-600 mt-1">Track and manage your personal and team goals</p>
          </div>
          <div className="flex items-center gap-3">
            {canCreateGoals() && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                New Goal
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            {goalStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Goals</p>
                      <p className="text-2xl font-bold text-gray-900">{goalStats.totalGoals}</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{goalStats.completedGoals}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{goalStats.inProgressGoals}</p>
                    </div>
                    <Play className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{goalStats.averageProgress}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search goals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="personal">Personal</option>
                    <option value="team">Team</option>
                    <option value="project">Project</option>
                    <option value="company">Company</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="productivity">Productivity</option>
                    <option value="learning">Learning</option>
                    <option value="health">Health</option>
                    <option value="financial">Financial</option>
                    <option value="career">Career</option>
                    <option value="other">Other</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="due_date">Due Date</option>
                    <option value="created">Created</option>
                    <option value="progress">Progress</option>
                    <option value="priority">Priority</option>
                  </select>

                  <div className="flex items-center border border-gray-300 rounded-lg">
                    {[
                      { id: 'grid', icon: Target },
                      { id: 'list', icon: BarChart3 },
                      { id: 'timeline', icon: Calendar }
                    ].map(mode => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setViewMode(mode.id as any)}
                          className={`p-2 ${viewMode === mode.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Goals List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Goals ({filteredGoals.length})</h2>
              </div>
              
              {viewMode === 'grid' && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGoals.map(goal => (
                    <div key={goal._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{goal.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{goal.description}</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 ml-2">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(goal.type)}`}>
                            {goal.type}
                          </span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                            {goal.priority}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                            {getStatusIcon(goal.status)}
                            {goal.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {isOverdue(goal.targetDate, goal.status) && (
                          <div className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>Overdue</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Due: {formatDate(goal.targetDate)}</span>
                          <span>{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => setSelectedGoal(goal)}
                          className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          View Details
                        </button>
                        <button className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="divide-y divide-gray-200">
                  {filteredGoals.map(goal => (
                    <div key={goal._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{goal.title}</h3>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(goal.type)}`}>
                              {goal.type}
                            </span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                              {goal.priority}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                              {getStatusIcon(goal.status)}
                              {goal.status.replace('_', ' ')}
                            </span>
                            {isOverdue(goal.targetDate, goal.status) && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                                <AlertCircle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Due: {formatDate(goal.targetDate)}</span>
                            <span>{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones</span>
                            <span>Created by {goal.createdBy.name}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 mb-1">{goal.progress}%</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">{goal.category}</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedGoal(goal)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'timeline' && (
                <div className="p-4">
                  <div className="space-y-4">
                    {filteredGoals.map(goal => (
                      <div key={goal._id} className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-4 h-4 rounded-full ${goal.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{goal.title}</h3>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(goal.type)}`}>
                              {goal.type}
                            </span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                              {goal.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span>Start: {formatDate(goal.startDate)}</span>
                            <span>Due: {formatDate(goal.targetDate)}</span>
                            <span>Progress: {goal.progress}%</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
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
                  <h3 className="font-semibold">AI Goal Assistant</h3>
                </div>
                <p className="text-sm text-purple-100 mb-3">
                  Get AI-powered suggestions for goal setting and achievement strategies.
                </p>
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
                  Ask AI
                </button>
              </div>
            )}

            {/* Recent Activity */}
            {goalStats && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {goalStats.recentActivity.map(activity => (
                    <div key={activity._id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.goal}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {goalStats && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Goals by Category</h3>
                <div className="space-y-3">
                  {goalStats.topCategories.map(category => (
                    <div key={category.category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{category.completed}/{category.count}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${category.count > 0 ? (category.completed / category.count) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Target className="w-4 h-4 inline mr-2" />
                  Create Personal Goal
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Users className="w-4 h-4 inline mr-2" />
                  Create Team Goal
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  View Analytics
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Download className="w-4 h-4 inline mr-2" />
                  Export Goals
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedGoal.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedGoal.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedGoal.type)}`}>
                      {selectedGoal.type}
                    </span>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedGoal.priority)}`}>
                      {selectedGoal.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedGoal.status)}`}>
                      {getStatusIcon(selectedGoal.status)}
                      {selectedGoal.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Progress */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Progress</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Progress</span>
                    <span className="text-sm font-medium text-gray-900">{selectedGoal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedGoal.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Milestones</h4>
                <div className="space-y-3">
                  {selectedGoal.milestones.map(milestone => (
                    <div key={milestone._id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                      <button
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          milestone.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {milestone.completed && <CheckCircle className="w-3 h-3" />}
                      </button>
                      <div className="flex-1">
                        <h5 className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {milestone.title}
                        </h5>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {formatDate(milestone.dueDate)}
                          {milestone.completedDate && (
                            <span className="ml-2">Completed: {formatDate(milestone.completedDate)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedGoal.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedGoal.targetDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created By</label>
                  <p className="text-sm text-gray-900">{selectedGoal.createdBy.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedGoal.category}</p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {selectedGoal.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedGoal(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
