import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronRight, Users, Calendar, Clock, Target, 
  BarChart3, MessageSquare, Settings, Plus, Filter, Search,
  Edit, Trash2, Eye, CheckCircle, AlertCircle, Star, Flag,
  TrendingUp, Activity, FileText, Image, Link, Download,
  Upload, Share2, MoreVertical, Play, Pause, Square,
  Zap, Bot, Crown, Award, Trophy, Medal, Heart, Bookmark,
  Copy, Move, Archive, Tag, MapPin, Phone, Mail, Globe,
  Building, Home, Briefcase, DollarSign, CreditCard,
  Lock, Shield, Key, Bell, EyeOff, Monitor, Smartphone,
  Sun, Moon, Palette, Settings as SettingsIcon, User,
  Calendar as CalendarIcon, Clock as ClockIcon, Target as TargetIcon,
  Building as BuildingIcon, LayoutGrid, List,
  TrendingDown, ArrowUp, ArrowDown, Minus, X, Check,
  RefreshCw, Save, Send, Reply, Forward, Archive as ArchiveIcon,
  Trash, Undo, Redo, Copy as CopyIcon,
  Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, List as ListIcon, Quote,
  Code, Link as LinkIcon, Image as ImageIcon, Video,
  Music, File
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate: Date;
  progress: number;
  budget: number;
  spent: number;
  client: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  team: TeamMember[];
  tasks: Task[];
  milestones: Milestone[];
  documents: Document[];
  timeline: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  color: string;
  isPublic: boolean;
  permissions: ProjectPermissions;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  permissions: TeamMemberPermissions;
  workload: number; // percentage
  tasksAssigned: number;
  tasksCompleted: number;
  rating: number;
  lastActive: Date;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: TeamMember;
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  dependencies: string[];
  isMilestone: boolean;
  milestoneId?: string;
}

interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  assignee: TeamMember;
  dueDate: Date;
}

interface Comment {
  _id: string;
  content: string;
  author: TeamMember;
  createdAt: Date;
  replies: Comment[];
}

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: 'file' | 'image' | 'link';
  size: number;
  uploadedBy: TeamMember;
  uploadedAt: Date;
}

interface Milestone {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  tasks: string[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Document {
  _id: string;
  name: string;
  type: 'file' | 'folder';
  url?: string;
  size?: number;
  uploadedBy: TeamMember;
  uploadedAt: Date;
  parentId?: string;
  children?: Document[];
}

interface TimelineEvent {
  _id: string;
  type: 'task' | 'milestone' | 'comment' | 'status-change';
  title: string;
  description: string;
  date: Date;
  user: TeamMember;
  metadata?: any;
}

interface ProjectPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canManageTasks: boolean;
  canViewAnalytics: boolean;
  canManageDocuments: boolean;
}

interface TeamMemberPermissions {
  canEditTasks: boolean;
  canCreateTasks: boolean;
  canDeleteTasks: boolean;
  canManageTeam: boolean;
  canViewAnalytics: boolean;
}

const ProjectViewDetailed: React.FC = () => {
  const { state, dispatch } = useApp();
  const { canUseAdvancedAnalytics, canManageTeam } = useFeatureAccess();
  
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'tasks' | 'timeline' | 'team' | 'documents' | 'analytics'>('overview');
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showManageProject, setShowManageProject] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'team']));

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        _id: '1',
        name: 'E-commerce Platform',
        description: 'Building a comprehensive e-commerce platform with modern features',
        status: 'active',
        priority: 'high',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        progress: 65,
        budget: 50000,
        spent: 32500,
        client: {
          _id: 'c1',
          name: 'TechCorp Inc.',
          email: 'contact@techcorp.com',
          avatar: ''
        },
        team: [
          {
            _id: 'u1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'manager',
            status: 'active',
            joinedAt: new Date('2024-01-01'),
            permissions: {
              canEditTasks: true,
              canCreateTasks: true,
              canDeleteTasks: true,
              canManageTeam: true,
              canViewAnalytics: true
            },
            workload: 80,
            tasksAssigned: 12,
            tasksCompleted: 8,
            rating: 4.5,
            lastActive: new Date()
          },
          {
            _id: 'u2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'member',
            status: 'active',
            joinedAt: new Date('2024-01-15'),
            permissions: {
              canEditTasks: true,
              canCreateTasks: true,
              canDeleteTasks: false,
              canManageTeam: false,
              canViewAnalytics: false
            },
            workload: 60,
            tasksAssigned: 8,
            tasksCompleted: 6,
            rating: 4.2,
            lastActive: new Date()
          }
        ],
        tasks: [],
        milestones: [],
        documents: [],
        timeline: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        createdBy: 'u1',
        tags: ['e-commerce', 'web', 'react'],
        color: '#3B82F6',
        isPublic: false,
        permissions: {
          canEdit: true,
          canDelete: true,
          canManageTeam: true,
          canManageTasks: true,
          canViewAnalytics: true,
          canManageDocuments: true
        }
      },
      {
        _id: '2',
        name: 'Mobile App Development',
        description: 'Native mobile app for iOS and Android platforms',
        status: 'active',
        priority: 'medium',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        progress: 40,
        budget: 75000,
        spent: 30000,
        client: {
          _id: 'c2',
          name: 'MobileFirst Ltd.',
          email: 'hello@mobilefirst.com',
          avatar: ''
        },
        team: [],
        tasks: [],
        milestones: [],
        documents: [],
        timeline: [],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
        createdBy: 'u1',
        tags: ['mobile', 'ios', 'android'],
        color: '#10B981',
        isPublic: false,
        permissions: {
          canEdit: true,
          canDelete: true,
          canManageTeam: true,
          canManageTasks: true,
          canViewAnalytics: true,
          canManageDocuments: true
        }
      }
    ];

    setProjects(mockProjects);
    setActiveProject(mockProjects[0]);
  }, []);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
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

  const renderProjectHeader = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: activeProject?.color }} />
            <button
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
            >
              {activeProject?.name}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activeProject?.status || '')}`}>
            {activeProject?.status}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activeProject?.priority || '')}`}>
            {activeProject?.priority}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Project Selector Dropdown */}
      {showProjectSelector && (
        <div className="absolute top-16 left-6 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              {projects.map((project) => (
                <button
                  key={project._id}
                  onClick={() => {
                    setActiveProject(project);
                    setShowProjectSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 ${
                    activeProject?._id === project._id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: project.color }} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProjectOverview = () => (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{activeProject?.progress}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${activeProject?.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(activeProject?.budget || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Spent: {formatCurrency(activeProject?.spent || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{activeProject?.team.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {activeProject?.team.filter(m => m.status === 'active').length} active
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{activeProject?.tasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {activeProject?.tasks.filter(t => t.status === 'completed').length} completed
          </p>
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
            <p className="text-gray-700">{activeProject?.description}</p>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Start Date</p>
                  <p className="text-sm text-gray-600">{formatDate(activeProject?.startDate || new Date())}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">End Date</p>
                  <p className="text-sm text-gray-600">{formatDate(activeProject?.endDate || new Date())}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${activeProject?.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Task "User Authentication" was completed</p>
                  <p className="text-xs text-gray-600">2 hours ago by John Doe</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New task "Payment Integration" was created</p>
                  <p className="text-xs text-gray-600">4 hours ago by Jane Smith</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New team member "Bob Wilson" was added</p>
                  <p className="text-xs text-gray-600">1 day ago by John Doe</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Client Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{activeProject?.client.name}</h4>
                <p className="text-sm text-gray-600">{activeProject?.client.email}</p>
              </div>
            </div>
          </div>

          {/* Project Tags */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {activeProject?.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowCreateTask(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
              <button
                onClick={() => setShowTeamManagement(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Users className="w-4 h-4" />
                Manage Team
              </button>
              <button
                onClick={() => setShowAnalytics(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </button>
              <button
                onClick={() => setShowManageProject(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                Project Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        <button
          onClick={() => setShowTeamManagement(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeProject?.team.map((member) => (
          <div key={member._id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {member.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Role</span>
                <span className="font-medium text-gray-900 capitalize">{member.role}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Workload</span>
                <span className="font-medium text-gray-900">{member.workload}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tasks</span>
                <span className="font-medium text-gray-900">{member.tasksCompleted}/{member.tasksAssigned}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-900">{member.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="w-80 bg-white border-l border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="space-y-6">
          {/* Project Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activeProject?.status || '')}`}>
                  {activeProject?.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Priority</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activeProject?.priority || '')}`}>
                  {activeProject?.priority}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{activeProject?.progress}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Budget</span>
                <span className="font-medium text-gray-900">{formatCurrency(activeProject?.budget || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Spent</span>
                <span className="font-medium text-gray-900">{formatCurrency(activeProject?.spent || 0)}</span>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
            <div className="space-y-3">
              {activeProject?.team.slice(0, 5).map((member) => (
                <div key={member._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{member.role}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {activeProject && activeProject.team.length > 5 && (
                <p className="text-sm text-gray-600 text-center">
                  +{activeProject.team.length - 5} more members
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Tasks</span>
                <span className="font-medium text-gray-900">{activeProject?.tasks.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium text-gray-900">
                  {activeProject?.tasks.filter(t => t.status === 'completed').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">In Progress</span>
                <span className="font-medium text-gray-900">
                  {activeProject?.tasks.filter(t => t.status === 'in-progress').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Overdue</span>
                <span className="font-medium text-red-600">
                  {activeProject?.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return renderProjectOverview();
      case 'team':
        return renderTeamSection();
      default:
        return renderProjectOverview();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {renderProjectHeader()}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderMainContent()}
          </div>
        </div>

        {/* Sidebar */}
        {renderSidebar()}
      </div>
    </div>
  );
};

export default ProjectViewDetailed;