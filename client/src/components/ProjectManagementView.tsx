import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, BarChart3, Settings, MessageSquare, 
  Plus, Filter, Search, MoreVertical, Edit, Trash2, Eye, 
  CheckCircle, AlertCircle, TrendingUp, FileText, Download, 
  Upload, Link, Tag, Flag, User, Clock3, Target, Zap, 
  ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Star, 
  Heart, Bookmark, Share2, Copy, Move, Archive, Play, 
  Pause, Square, Circle, Triangle, Hexagon, Layers, 
  Activity, PieChart, LineChart, TrendingDown, Minus, 
  Maximize, Minimize, RotateCcw, Save, RefreshCw, 
  CheckSquare, Timer, UserCheck, UserX, MessageCircle, 
  ThumbsUp, ThumbsDown, Award, Trophy, Medal, Bot, 
  Sparkles, Lightbulb, Globe, Shield, Key, Lock, 
  Unlock, EyeOff, Bell, Mail, Phone, MapPin, 
  Building, Home, Crown, DollarSign, CreditCard,
  Database, Server, Cloud, Wifi, Monitor, Smartphone,
  Tablet, Headphones, Camera, Mic, Volume2, VolumeX,
  MicOff, CameraOff, CalendarDays, CalendarCheck,
  CalendarX, CalendarPlus, CalendarMinus, CalendarRange,
  CalendarSearch, CalendarClock, CalendarHeart,
  X, UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'abandoned';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate: Date;
  budget: {
    estimated: number;
    actual: number;
    currency: string;
  };
  progress: number;
  teamSize: number;
  workspaceId: string;
  projectManager: string;
  client: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  milestones: Milestone[];
  attachments: Attachment[];
  comments: Comment[];
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  rating?: number;
  projectId: string;
}

interface Milestone {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  completedAt?: Date;
  assignee: string;
  taskId: string;
}

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
  uploadedBy: string;
  uploadedAt: Date;
  taskId: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  taskId: string;
  mentions: string[];
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'project-manager' | 'developer' | 'designer' | 'tester' | 'analyst' | 'custom';
  designation: string;
  permissions: string[];
  joinedAt: Date;
  performance: {
    rating: number;
    tasksCompleted: number;
    onTimeDelivery: number;
    qualityScore: number;
  };
}

interface WorkloadRequest {
  _id: string;
  employeeId: string;
  taskId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

interface DeadlineRequest {
  _id: string;
  employeeId: string;
  taskId: string;
  currentDeadline: Date;
  requestedDeadline: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

interface Poll {
  _id: string;
  question: string;
  options: string[];
  responses: Array<{
    userId: string;
    option: string;
    timestamp: Date;
  }>;
  status: 'active' | 'closed';
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
}

const ProjectManagementView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  const projects: Project[] = [
    {
      _id: '1',
      name: 'E-commerce Platform',
      description: 'Build a comprehensive e-commerce platform with modern features',
      status: 'active',
      priority: 'high',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      budget: { estimated: 50000, actual: 25000, currency: 'USD' },
      progress: 65,
      teamSize: 8,
      workspaceId: 'ws1',
      projectManager: 'pm1',
      client: { _id: 'c1', name: 'TechCorp', email: 'contact@techcorp.com' },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-03-15')
    },
    {
      _id: '2',
      name: 'Mobile App Development',
      description: 'Create a cross-platform mobile application',
      status: 'active',
      priority: 'medium',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-08-31'),
      budget: { estimated: 75000, actual: 30000, currency: 'USD' },
      progress: 40,
      teamSize: 6,
      workspaceId: 'ws1',
      projectManager: 'pm2',
      client: { _id: 'c2', name: 'StartupXYZ', email: 'hello@startupxyz.com' },
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-10')
    }
  ];

  const tasks: Task[] = [
    {
      _id: '1',
      title: 'Design User Interface',
      description: 'Create wireframes and mockups for the main dashboard',
      status: 'in-progress',
      priority: 'high',
      assignee: { _id: 'u1', name: 'John Doe', email: 'john@example.com', avatarUrl: '' },
      dueDate: new Date('2024-03-20'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-15'),
      milestones: [
        { _id: 'm1', title: 'Wireframes', description: 'Create basic wireframes', status: 'completed', dueDate: new Date('2024-03-05'), assignee: 'u1', taskId: '1' },
        { _id: 'm2', title: 'Mockups', description: 'Design detailed mockups', status: 'in-progress', dueDate: new Date('2024-03-15'), assignee: 'u1', taskId: '1' },
        { _id: 'm3', title: 'Prototype', description: 'Create interactive prototype', status: 'pending', dueDate: new Date('2024-03-20'), assignee: 'u1', taskId: '1' }
      ],
      attachments: [],
      comments: [],
      tags: ['design', 'ui', 'frontend'],
      estimatedHours: 40,
      actualHours: 25,
      projectId: '1'
    },
    {
      _id: '2',
      title: 'Backend API Development',
      description: 'Develop RESTful APIs for the application',
      status: 'pending',
      priority: 'high',
      assignee: { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com', avatarUrl: '' },
      dueDate: new Date('2024-03-25'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-15'),
      milestones: [
        { _id: 'm4', title: 'Database Design', description: 'Design database schema', status: 'completed', dueDate: new Date('2024-03-10'), assignee: 'u2', taskId: '2' },
        { _id: 'm5', title: 'API Endpoints', description: 'Create API endpoints', status: 'pending', dueDate: new Date('2024-03-20'), assignee: 'u2', taskId: '2' },
        { _id: 'm6', title: 'Testing', description: 'Write unit tests', status: 'pending', dueDate: new Date('2024-03-25'), assignee: 'u2', taskId: '2' }
      ],
      attachments: [],
      comments: [],
      tags: ['backend', 'api', 'development'],
      estimatedHours: 60,
      actualHours: 15,
      projectId: '1'
    }
  ];

  const teamMembers: TeamMember[] = [
    {
      _id: 'u1',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: '',
      role: 'designer',
      designation: 'UI/UX Designer',
      permissions: ['view', 'comment', 'upload'],
      joinedAt: new Date('2024-01-01'),
      performance: { rating: 4.5, tasksCompleted: 12, onTimeDelivery: 95, qualityScore: 4.2 }
    },
    {
      _id: 'u2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatarUrl: '',
      role: 'developer',
      designation: 'Backend Developer',
      permissions: ['view', 'comment', 'upload', 'edit'],
      joinedAt: new Date('2024-01-01'),
      performance: { rating: 4.8, tasksCompleted: 15, onTimeDelivery: 98, qualityScore: 4.6 }
    },
    {
      _id: 'pm1',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatarUrl: '',
      role: 'project-manager',
      designation: 'Project Manager',
      permissions: ['view', 'comment', 'upload', 'edit', 'delete', 'assign', 'manage'],
      joinedAt: new Date('2024-01-01'),
      performance: { rating: 4.9, tasksCompleted: 8, onTimeDelivery: 100, qualityScore: 4.8 }
    }
  ];

  const workloadRequests: WorkloadRequest[] = [
    {
      _id: 'wr1',
      employeeId: 'u1',
      taskId: '1',
      reason: 'Current workload is too heavy, need to redistribute some tasks',
      status: 'pending',
      requestedAt: new Date('2024-03-15')
    }
  ];

  const deadlineRequests: DeadlineRequest[] = [
    {
      _id: 'dr1',
      employeeId: 'u2',
      taskId: '2',
      currentDeadline: new Date('2024-03-25'),
      requestedDeadline: new Date('2024-03-30'),
      reason: 'Additional requirements discovered, need more time for proper implementation',
      status: 'pending',
      requestedAt: new Date('2024-03-15')
    }
  ];

  const polls: Poll[] = [
    {
      _id: 'p1',
      question: 'Which design approach do you prefer for the dashboard?',
      options: ['Minimalist', 'Detailed', 'Hybrid'],
      responses: [
        { userId: 'u1', option: 'Minimalist', timestamp: new Date('2024-03-15') },
        { userId: 'u2', option: 'Hybrid', timestamp: new Date('2024-03-15') }
      ],
      status: 'active',
      createdBy: 'pm1',
      createdAt: new Date('2024-03-15'),
      expiresAt: new Date('2024-03-20')
    }
  ];

  // Set default selected project
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'abandoned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-200 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return <Circle className="w-3 h-3" />;
      case 'medium': return <Square className="w-3 h-3" />;
      case 'high': return <Triangle className="w-3 h-3" />;
      case 'critical': return <AlertCircle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      // Update task status
      console.log(`Moving task ${draggedTask._id} to ${status}`);
      // In real app, call API to update task status
    }
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const renderProjectSelector = () => (
    <div className="relative">
      <button
        onClick={() => setShowProjectSelector(!showProjectSelector)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Building className="w-4 h-4" />
        <span className="font-medium">{selectedProject?.name || 'Select Project'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {showProjectSelector && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {projects.map(project => (
              <button
                key={project._id}
                onClick={() => {
                  setSelectedProject(project);
                  setShowProjectSelector(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 ${
                  selectedProject?._id === project._id ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <div className="font-medium">{project.name}</div>
                <div className="text-sm text-gray-600">{project.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className="text-xs text-gray-600">{project.progress}% complete</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProjectManagerSidebar = () => {
    const sidebarItems = [
      { id: 'manage-project', label: 'Manage Project', icon: Settings },
      { id: 'project-management', label: 'Project Management View', icon: BarChart3 },
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'timeline', label: 'Timeline View', icon: Clock },
      { id: 'project-info', label: 'Complete Project Info', icon: FileText },
      { id: 'assign-task', label: 'Assign Task', icon: Plus },
      { id: 'add-employees', label: 'Add Employees', icon: UserPlus },
      { id: 'inbox', label: 'Inbox', icon: MessageSquare },
      { id: 'poll', label: 'Poll', icon: MessageCircle },
      { id: 'workload-deadline', label: 'Workload & Deadline Mgmt', icon: Timer },
      { id: 'progress-tracker', label: 'Progress Tracker', icon: TrendingUp },
      { id: 'leaderboard', label: 'Employee Leaderboard', icon: Trophy }
    ];

    return (
      <div className="w-64 bg-white border-r border-gray-300 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Project Management</h3>
          <p className="text-sm text-gray-600">Manage your project efficiently</p>
        </div>
        
        <nav className="p-2">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-accent-dark" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-semibold text-gray-900">{teamMembers.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project._id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{project.name}</span>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Task "Design User Interface" completed</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New task "Backend API Development" assigned</p>
                <p className="text-xs text-gray-600">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Deadline extension requested</p>
                <p className="text-xs text-gray-600">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKanbanBoard = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Task Board</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['pending', 'in-progress', 'completed', 'blocked'].map(status => (
          <div
            key={status}
            className={`bg-gray-50 rounded-lg p-4 min-h-[400px] ${
              draggedOverColumn === status ? 'ring-2 ring-blue-500' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 capitalize">
                {status.replace('-', ' ')}
              </h3>
              <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            
            <div className="space-y-3">
              {tasks
                .filter(task => task.status === status)
                .map(task => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                    className="bg-white p-4 rounded-lg border border-gray-300 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(task.priority)}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignee.avatarUrl || `https://ui-avatars.com/api/?name=${task.assignee.name}&background=random`}
                          alt={task.assignee.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs text-gray-600">{task.assignee.name}</span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {task.milestones.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Milestones</span>
                          <span>
                            {task.milestones.filter(m => m.status === 'completed').length}/
                            {task.milestones.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-1">
                          <div
                            className="bg-accent h-1 rounded-full"
                            style={{
                              width: `${(task.milestones.filter(m => m.status === 'completed').length / task.milestones.length) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTaskModal = () => {
    if (!selectedTask) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{selectedTask.title}</h2>
            <button
              onClick={() => setShowTaskModal(false)}
              className="text-gray-600 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Task Details</h3>
                <p className="text-gray-600 mb-4">{selectedTask.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Priority:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Assignee:</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedTask.assignee.avatarUrl || `https://ui-avatars.com/api/?name=${selectedTask.assignee.name}&background=random`}
                        alt={selectedTask.assignee.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-600">{selectedTask.assignee.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Due Date:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Milestones</h3>
                <div className="space-y-2">
                  {selectedTask.milestones.map(milestone => (
                    <div key={milestone._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={milestone.status === 'completed'}
                        className="w-4 h-4 text-accent-dark rounded focus:ring-accent"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                        <p className="text-xs text-gray-600">{milestone.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(milestone.status)}`}>
                        {milestone.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Comments</h3>
              <div className="space-y-3">
                {selectedTask.comments.map(comment => (
                  <div key={comment._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={comment.author.avatarUrl || `https://ui-avatars.com/api/?name=${comment.author.name}&background=random`}
                      alt={comment.author.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                        <span className="text-xs text-gray-600">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  rows={3}
                />
                <button className="mt-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors">
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWorkloadDeadlineManagement = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Workload & Deadline Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Workload Requests</h3>
            <p className="text-sm text-gray-600">Manage employee workload distribution requests</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {workloadRequests.map(request => (
                <div key={request._id} className="p-4 border border-gray-300 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {teamMembers.find(m => m._id === request.employeeId)?.name}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{request.reason}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Deadline Requests</h3>
            <p className="text-sm text-gray-600">Manage deadline extension requests</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {deadlineRequests.map(request => (
                <div key={request._id} className="p-4 border border-gray-300 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {teamMembers.find(m => m._id === request.employeeId)?.name}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <p>Current: {new Date(request.currentDeadline).toLocaleDateString()}</p>
                    <p>Requested: {new Date(request.requestedDeadline).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{request.reason}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmployeeLeaderboard = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Employee Leaderboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">This Month</span>
          <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tasks Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">On-Time Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Quality Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers
                .sort((a, b) => b.performance.rating - a.performance.rating)
                .map((member, index) => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && <Trophy className="w-5 h-5 text-yellow-500 mr-2" />}
                        {index === 1 && <Medal className="w-5 h-5 text-gray-600 mr-2" />}
                        {index === 2 && <Award className="w-5 h-5 text-orange-500 mr-2" />}
                        <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                          alt={member.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-600 mr-1" />
                        <span className="text-sm text-gray-900">{member.performance.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.performance.tasksCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.performance.onTimeDelivery}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.performance.qualityScore}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'project-management':
        return renderKanbanBoard();
      case 'workload-deadline':
        return renderWorkloadDeadlineManagement();
      case 'leaderboard':
        return renderEmployeeLeaderboard();
      default:
        return renderDashboard();
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Selected</h3>
          <p className="text-gray-600">Please select a project to view its management interface.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {renderProjectManagerSidebar()}
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-300 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {renderProjectSelector()}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedProject.client.name}</span>
                <span className="mx-2">•</span>
                <span>{selectedProject.progress}% Complete</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                {selectedProject.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedProject.priority)}`}>
                {selectedProject.priority}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
      
      {showTaskModal && renderTaskModal()}
    </div>
  );
};

export default ProjectManagementView;
