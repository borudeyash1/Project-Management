import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Circle, Clock, AlertCircle, Star, Flag, 
  Target, Users, Calendar, FileText, MessageSquare, 
  Edit, Trash2, Plus, Save, X, Check, Eye, EyeOff,
  ChevronDown, ChevronRight, ArrowUp, ArrowDown,
  Play, Pause, Square, RefreshCw, Download, Upload,
  Share2, MoreVertical, Filter, Search, Settings,
  BarChart3, PieChart, LineChart, TrendingUp, TrendingDown,
  Activity, Zap, Bot, Crown, Award, Trophy, Medal,
  Heart, Bookmark, Copy, Move, Archive, Tag, MapPin,
  Phone, Mail, Globe, Building, Home, Briefcase,
  DollarSign, CreditCard, Lock, Shield, Key, Bell,
  Monitor, Smartphone, Sun, Moon, Palette, Settings as SettingsIcon,
  User, Calendar as CalendarIcon, Clock as ClockIcon, Target as TargetIcon,
  Building as BuildingIcon, LayoutGrid, List, GanttChart, Kanban,
  PieChart as PieChartIcon, LineChart as LineChartIcon,
  BarChart, TrendingDown as TrendingDownIcon, ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon, Minus, X as XIcon, Check as CheckIcon,
  RefreshCw as RefreshCwIcon, Save as SaveIcon, Send, Reply, Forward,
  Archive as ArchiveIcon, Trash, Undo, Redo, Copy as CopyIcon,
  Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, List as ListIcon, Quote, Code,
  Link as LinkIcon, Image as ImageIcon, Video, Music, File,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface Milestone {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  completedDate?: Date;
  assignee: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  dependencies: string[];
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isBlocked: boolean;
  blockedReason?: string;
  rating?: number;
  feedback?: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  dueDate: Date;
  projectId: string;
  projectName: string;
  milestones: Milestone[];
  totalMilestones: number;
  completedMilestones: number;
  progress: number;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isMilestoneBased: boolean;
  autoCompleteOnMilestones: boolean;
}

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: 'file' | 'image' | 'link';
  size: number;
  uploadedBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  uploadedAt: Date;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  replies: Comment[];
}

interface MilestoneTemplate {
  _id: string;
  name: string;
  description: string;
  milestones: Array<{
    title: string;
    description: string;
    estimatedHours: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  category: string;
  tags: string[];
  createdAt: Date;
  createdBy: string;
}

const MilestoneTaskSystem: React.FC = () => {
  const { state, dispatch } = useApp();
  const { canUseAdvancedAnalytics, canManageTeam } = useFeatureAccess();
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'milestones' | 'templates' | 'analytics'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'blocked'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'progress' | 'created'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        _id: 't1',
        title: 'User Authentication System',
        description: 'Implement comprehensive user authentication with OAuth, JWT, and security features',
        status: 'in-progress',
        priority: 'high',
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: ''
        },
        dueDate: new Date('2024-04-15'),
        projectId: 'p1',
        projectName: 'E-commerce Platform',
        milestones: [],
        totalMilestones: 5,
        completedMilestones: 2,
        progress: 40,
        estimatedHours: 40,
        actualHours: 16,
        tags: ['authentication', 'security', 'backend'],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date(),
        createdBy: 'u1',
        isMilestoneBased: true,
        autoCompleteOnMilestones: true
      },
      {
        _id: 't2',
        title: 'Payment Integration',
        description: 'Integrate multiple payment gateways including Stripe, PayPal, and Apple Pay',
        status: 'pending',
        priority: 'critical',
        assignee: {
          _id: 'u2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: ''
        },
        dueDate: new Date('2024-04-20'),
        projectId: 'p1',
        projectName: 'E-commerce Platform',
        milestones: [],
        totalMilestones: 4,
        completedMilestones: 0,
        progress: 0,
        estimatedHours: 32,
        actualHours: 0,
        tags: ['payment', 'integration', 'frontend'],
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date(),
        createdBy: 'u1',
        isMilestoneBased: true,
        autoCompleteOnMilestones: true
      }
    ];

    const mockMilestones: Milestone[] = [
      {
        _id: 'm1',
        title: 'Setup Authentication Framework',
        description: 'Configure JWT tokens and authentication middleware',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-03-10'),
        completedDate: new Date('2024-03-08'),
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: ''
        },
        taskId: 't1',
        taskTitle: 'User Authentication System',
        projectId: 'p1',
        projectName: 'E-commerce Platform',
        estimatedHours: 8,
        actualHours: 6,
        progress: 100,
        dependencies: [],
        tags: ['setup', 'jwt'],
        attachments: [],
        comments: [],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-08'),
        createdBy: 'u1',
        isBlocked: false,
        rating: 4.5,
        feedback: 'Excellent work, completed ahead of schedule'
      },
      {
        _id: 'm2',
        title: 'Implement OAuth Providers',
        description: 'Add Google, Facebook, and GitHub OAuth integration',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date('2024-03-15'),
        completedDate: new Date('2024-03-14'),
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: ''
        },
        taskId: 't1',
        taskTitle: 'User Authentication System',
        projectId: 'p1',
        projectName: 'E-commerce Platform',
        estimatedHours: 12,
        actualHours: 10,
        progress: 100,
        dependencies: ['m1'],
        tags: ['oauth', 'social-login'],
        attachments: [],
        comments: [],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-14'),
        createdBy: 'u1',
        isBlocked: false,
        rating: 4.0,
        feedback: 'Good implementation, minor issues with Facebook integration'
      },
      {
        _id: 'm3',
        title: 'Password Security Features',
        description: 'Implement password hashing, reset, and strength validation',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2024-03-20'),
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: ''
        },
        taskId: 't1',
        taskTitle: 'User Authentication System',
        projectId: 'p1',
        projectName: 'E-commerce Platform',
        estimatedHours: 10,
        actualHours: 4,
        progress: 40,
        dependencies: ['m1'],
        tags: ['security', 'password'],
        attachments: [],
        comments: [],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date(),
        createdBy: 'u1',
        isBlocked: false
      },
      {
        _id: 'm4',
        title: 'Two-Factor Authentication',
        description: 'Add 2FA support with SMS and authenticator apps',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2024-03-25'),
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: ''
        },
        taskId: 't1',
        taskTitle: 'User Authentication System',
        projectId: 'p1',
        projectName: 'E-commerce Platform',
        estimatedHours: 8,
        actualHours: 0,
        progress: 0,
        dependencies: ['m3'],
        tags: ['2fa', 'security'],
        attachments: [],
        comments: [],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date(),
        createdBy: 'u1',
        isBlocked: false
      },
      {
        _id: 'm5',
        title: 'Security Testing & Documentation',
        description: 'Perform security testing and create comprehensive documentation',
        status: 'pending',
        priority: 'low',
        dueDate: new Date('2024-03-30'),
        assignee: {
          _id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: ''
        },
        taskId: 't1',
        taskTitle: 'User Authentication System',
        projectId: 'p1',
        projectName: 'E-commerce Platform',
        estimatedHours: 6,
        actualHours: 0,
        progress: 0,
        dependencies: ['m4'],
        tags: ['testing', 'documentation'],
        attachments: [],
        comments: [],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date(),
        createdBy: 'u1',
        isBlocked: false
      }
    ];

    const mockTemplates: MilestoneTemplate[] = [
      {
        _id: 'tmpl1',
        name: 'Web Development Task',
        description: 'Standard template for web development tasks',
        milestones: [
          {
            title: 'Planning & Setup',
            description: 'Project planning and environment setup',
            estimatedHours: 4,
            priority: 'high'
          },
          {
            title: 'Core Development',
            description: 'Main feature development',
            estimatedHours: 16,
            priority: 'high'
          },
          {
            title: 'Testing',
            description: 'Unit and integration testing',
            estimatedHours: 6,
            priority: 'medium'
          },
          {
            title: 'Documentation',
            description: 'Code documentation and user guides',
            estimatedHours: 4,
            priority: 'low'
          }
        ],
        category: 'Development',
        tags: ['web', 'development'],
        createdAt: new Date('2024-01-01'),
        createdBy: 'u1'
      },
      {
        _id: 'tmpl2',
        name: 'UI/UX Design Task',
        description: 'Template for UI/UX design tasks',
        milestones: [
          {
            title: 'Research & Analysis',
            description: 'User research and requirements analysis',
            estimatedHours: 8,
            priority: 'high'
          },
          {
            title: 'Wireframing',
            description: 'Create wireframes and user flows',
            estimatedHours: 6,
            priority: 'high'
          },
          {
            title: 'Visual Design',
            description: 'Create high-fidelity designs',
            estimatedHours: 12,
            priority: 'high'
          },
          {
            title: 'Prototyping',
            description: 'Create interactive prototypes',
            estimatedHours: 8,
            priority: 'medium'
          },
          {
            title: 'Testing & Iteration',
            description: 'User testing and design iteration',
            estimatedHours: 6,
            priority: 'medium'
          }
        ],
        category: 'Design',
        tags: ['ui', 'ux', 'design'],
        createdAt: new Date('2024-01-01'),
        createdBy: 'u1'
      }
    ];

    setTasks(mockTasks);
    setMilestones(mockMilestones);
    setTemplates(mockTemplates);
  }, []);

  // Utility functions
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleMilestoneStatusChange = async (milestoneId: string, status: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMilestones(milestones.map(milestone => 
        milestone._id === milestoneId 
          ? { 
              ...milestone, 
              status: status as any,
              progress: status === 'completed' ? 100 : milestone.progress,
              completedDate: status === 'completed' ? new Date() : milestone.completedDate,
              updatedAt: new Date()
            }
          : milestone
      ));

      // Update task progress if auto-complete is enabled
      const milestone = milestones.find(m => m._id === milestoneId);
      if (milestone && status === 'completed') {
        const taskMilestones = milestones.filter(m => m.taskId === milestone.taskId);
        const completedCount = taskMilestones.filter(m => m.status === 'completed').length + 1;
        const totalCount = taskMilestones.length;
        const newProgress = Math.round((completedCount / totalCount) * 100);

        setTasks(tasks.map(task => 
          task._id === milestone.taskId 
            ? { 
                ...task, 
                completedMilestones: completedCount,
                progress: newProgress,
                status: newProgress === 100 ? 'completed' : task.status,
                updatedAt: new Date()
              }
            : task
        ));
      }

      showMessage('success', 'Milestone status updated successfully!');
    } catch (error) {
      showMessage('error', 'Failed to update milestone status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMilestoneRating = async (milestoneId: string, rating: number, feedback: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMilestones(milestones.map(milestone => 
        milestone._id === milestoneId 
          ? { 
              ...milestone, 
              rating,
              feedback,
              updatedAt: new Date()
            }
          : milestone
      ));

      showMessage('success', 'Milestone rated successfully!');
    } catch (error) {
      showMessage('error', 'Failed to rate milestone. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTasksTab = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="progress">Progress</option>
              <option value="created">Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const taskMilestones = milestones.filter(m => m.taskId === task._id);
          const isExpanded = expandedTasks.has(task._id);
          
          return (
            <div key={task._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Task Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaskExpansion(task._id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Task Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress: {task.completedMilestones}/{task.totalMilestones} milestones</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Task Info */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Assignee:</span>
                    <p className="font-medium text-gray-900">{task.assignee.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <p className="font-medium text-gray-900">{formatDate(task.dueDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Hours:</span>
                    <p className="font-medium text-gray-900">{task.actualHours}/{task.estimatedHours}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Project:</span>
                    <p className="font-medium text-gray-900">{task.projectName}</p>
                  </div>
                </div>
              </div>

              {/* Milestones (Expanded View) */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Milestones</h4>
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowCreateMilestone(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        Add Milestone
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {taskMilestones.map((milestone) => (
                        <div key={milestone._id} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleMilestoneStatusChange(milestone._id, 
                                  milestone.status === 'completed' ? 'pending' : 'completed'
                                )}
                                className={`p-1 rounded-full ${
                                  milestone.status === 'completed' 
                                    ? 'text-green-600 hover:text-green-700' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                {milestone.status === 'completed' ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                                <p className="text-sm text-gray-600">{milestone.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(milestone.status)}`}>
                                {milestone.status}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(milestone.priority)}`}>
                                {milestone.priority}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedMilestone(milestone);
                                  setShowMilestoneModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Milestone Progress */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progress: {milestone.progress}%</span>
                              <span>{milestone.actualHours}/{milestone.estimatedHours}h</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Milestone Rating */}
                          {milestone.status === 'completed' && milestone.rating && (
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= milestone.rating! 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">{milestone.rating}/5</span>
                              {milestone.feedback && (
                                <span className="text-sm text-gray-600 italic">"{milestone.feedback}"</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMilestonesTab = () => (
    <div className="space-y-6">
      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <div key={milestone._id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleMilestoneStatusChange(milestone._id, 
                    milestone.status === 'completed' ? 'pending' : 'completed'
                  )}
                  className={`p-1 rounded-full ${
                    milestone.status === 'completed' 
                      ? 'text-green-600 hover:text-green-700' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                  <p className="text-gray-600 mt-1">{milestone.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>Task: {milestone.taskTitle}</span>
                    <span>Project: {milestone.projectName}</span>
                    <span>Assignee: {milestone.assignee.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(milestone.status)}`}>
                  {milestone.status}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(milestone.priority)}`}>
                  {milestone.priority}
                </span>
                <button
                  onClick={() => {
                    setSelectedMilestone(milestone);
                    setShowMilestoneModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Milestone Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {milestone.progress}%</span>
                <span>{milestone.actualHours}/{milestone.estimatedHours} hours</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${milestone.progress}%` }}
                />
              </div>
            </div>

            {/* Milestone Rating */}
            {milestone.status === 'completed' && milestone.rating && (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= milestone.rating! 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{milestone.rating}/5</span>
                {milestone.feedback && (
                  <span className="text-sm text-gray-600 italic">"{milestone.feedback}"</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Milestone Templates</h3>
        <button
          onClick={() => setShowCreateTemplate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template._id} className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h4>
            <p className="text-gray-600 mb-4">{template.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">{template.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Milestones:</span>
                <span className="font-medium text-gray-900">{template.milestones.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Hours:</span>
                <span className="font-medium text-gray-900">
                  {template.milestones.reduce((sum, m) => sum + m.estimatedHours, 0)}h
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Eye className="w-4 h-4" />
                View
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Copy className="w-4 h-4" />
                Use
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Milestones</p>
              <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {milestones.filter(m => m.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {milestones.filter(m => m.rating).length > 0 
                  ? (milestones.filter(m => m.rating).reduce((sum, m) => sum + (m.rating || 0), 0) / milestones.filter(m => m.rating).length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone Status Distribution</h3>
          <div className="space-y-3">
            {['pending', 'in-progress', 'completed', 'blocked'].map((status) => {
              const count = milestones.filter(m => m.status === status).length;
              const percentage = milestones.length > 0 ? (count / milestones.length) * 100 : 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'completed' ? 'bg-green-600' :
                          status === 'in-progress' ? 'bg-blue-600' :
                          status === 'blocked' ? 'bg-red-600' :
                          'bg-gray-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Progress</h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">{task.title}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{task.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return renderTasksTab();
      case 'milestones':
        return renderMilestonesTab();
      case 'templates':
        return renderTemplatesTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return renderTasksTab();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Milestone Task System</h1>
            <p className="text-gray-600 mt-1">Manage tasks with milestone-based completion tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <nav className="p-4">
            <div className="space-y-1">
              {[
                { id: 'tasks', label: 'Tasks', icon: Target },
                { id: 'milestones', label: 'Milestones', icon: CheckCircle },
                { id: 'templates', label: 'Templates', icon: FileText },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {message.type === 'info' && <Info className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneTaskSystem;
