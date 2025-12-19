import React, { useState, useEffect } from 'react';
import {
  BarChart3, PieChart, LineChart, TrendingUp, TrendingDown,
  Activity, Target, Users, Clock, CheckCircle, AlertCircle,
  Calendar, FileText, Download, Filter, Search, MoreVertical,
  Eye, Edit, Trash2, Plus, RefreshCw, Save, Share2,
  ArrowUp, ArrowDown, Minus, Maximize, Minimize, RotateCcw,
  Zap, Bot, Sparkles, Lightbulb, Globe, Shield, Key,
  Lock, Unlock, EyeOff, Bell, Mail, Phone, MapPin,
  Building, Home, Crown, DollarSign, CreditCard, Database,
  Server, Cloud, Wifi, Monitor, Smartphone, Tablet,
  Headphones, Camera, Mic, Volume2, VolumeX, MicOff,
  CameraOff, CalendarDays, CalendarCheck, CalendarX,
  CalendarPlus, CalendarMinus, CalendarRange, CalendarSearch,
  CalendarClock, CalendarHeart, X, Check, ChevronRight,
  ChevronLeft, User, Star, Award, Trophy, Medal, Heart,
  Bookmark, Copy, Move, Archive, Play, Pause, Square,
  Circle, Triangle, Hexagon, Layers, Timer, UserCheck,
  UserX, MessageSquare, MessageCircle, ThumbsUp, ThumbsDown,
  Send, Reply, Forward, Archive as ArchiveIcon, Trash,
  Undo, Redo, Copy as CopyIcon,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List as ListIcon, Quote, Code, Link as LinkIcon,
  Image as ImageIcon, Video, Music, File, Folder, FolderOpen,
  FolderPlus, FolderMinus, FolderX, FolderCheck, FolderEdit,
  FolderSearch, FolderLock, FolderHeart, FolderArchive,
  Settings,
  Settings as SettingsIcon, Palette, Globe as GlobeIcon, Lock as LockIcon,
  Bell as BellIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon, Sun, Moon, Monitor as MonitorIcon2,
  CheckCircle as CheckCircleIcon, AlertCircle as AlertCircleIcon, Info,
  Info as InfoIcon, Trash2 as Trash2Icon, Key as KeyIcon, Building as BuildingIcon,
  Home as HomeIcon, Briefcase, Calendar as CalendarIcon, Clock as ClockIcon,
  Target as TargetIcon, Building as BuildingIcon2, LayoutGrid, List,
  GanttChart, Kanban, PieChart as PieChartIcon, LineChart as LineChartIcon,
  BarChart, TrendingDown as TrendingDownIcon, ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon, Minus as MinusIcon, X as XIcon, Check as CheckIcon,
  RefreshCw as RefreshCwIcon, Save as SaveIcon, Send as SendIcon, Reply as ReplyIcon,
  Forward as ForwardIcon, Archive as ArchiveIcon2, Trash as TrashIcon,
  Undo as UndoIcon, Redo as RedoIcon, Copy as CopyIcon2,
  Bold as BoldIcon, Italic as ItalicIcon,
  Underline as UnderlineIcon, AlignLeft as AlignLeftIcon, AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon, List as ListIcon2,
  Quote as QuoteIcon, Code as CodeIcon, Link as LinkIcon2, Image as ImageIcon2,
  Video as VideoIcon, Music as MusicIcon, File as FileIcon, Folder as FolderIcon,
  FolderOpen as FolderOpenIcon, FolderPlus as FolderPlusIcon, FolderMinus as FolderMinusIcon,
  FolderX as FolderXIcon, FolderCheck as FolderCheckIcon, FolderEdit as FolderEditIcon,
  FolderSearch as FolderSearchIcon, FolderLock as FolderLockIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import GlassmorphicCard from './ui/GlassmorphicCard';
import { useTheme } from '../context/ThemeContext';

interface WorkloadRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeAvatar: string;
  role: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  currentWorkload: number;
  requestedWorkload: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  comments?: string;
  attachments: Array<{
    _id: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
}

interface DeadlineExtensionRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeAvatar: string;
  role: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  currentDeadline: Date;
  requestedDeadline: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  comments?: string;
  attachments: Array<{
    _id: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
}

interface EmployeeWorkload {
  _id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  currentWorkload: number;
  maxWorkload: number;
  utilizationPercentage: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  lastActivity: Date;
  performance: {
    rating: number;
    trends: Array<{
      date: Date;
      value: number;
    }>;
  };
}

interface WorkloadAnalytics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageProcessingTime: number;
  topRequesters: Array<{
    employeeId: string;
    employeeName: string;
    requestCount: number;
  }>;
  workloadDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  trends: Array<{
    date: Date;
    requests: number;
    approvals: number;
    rejections: number;
  }>;
}

const WorkloadDeadlineManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const { isDarkMode } = useTheme();
  const { canUseAdvancedAnalytics, canManageTeam } = useFeatureAccess();
  const [activeTab, setActiveTab] = useState('workload-requests');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkloadRequest | DeadlineExtensionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [requestType, setRequestType] = useState<'workload' | 'deadline'>('workload');

  // Utility functions
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', comments?: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', `Request ${action}d successfully!`);
      setShowRequestModal(false);
      setSelectedRequest(null);
    } catch (error) {
      showMessage('error', `Failed to ${action} request. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (requestData: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'Request submitted successfully!');
      setShowCreateRequest(false);
    } catch (error) {
      showMessage('error', 'Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const workloadRequests: WorkloadRequest[] = [
    {
      _id: 'wr1',
      employeeId: 'u1',
      employeeName: 'John Doe',
      employeeEmail: 'john@example.com',
      employeeAvatar: '',
      role: 'UI/UX Designer',
      taskId: 't1',
      taskTitle: 'UI Design Implementation',
      projectId: 'p1',
      projectName: 'E-commerce Platform',
      currentWorkload: 8,
      requestedWorkload: 5,
      reason: 'Current workload is too high, need to reduce tasks to maintain quality.',
      status: 'pending',
      submittedAt: new Date('2024-03-15'),
      attachments: []
    },
    {
      _id: 'wr2',
      employeeId: 'u2',
      employeeName: 'Jane Smith',
      employeeEmail: 'jane@example.com',
      employeeAvatar: '',
      role: 'Backend Developer',
      taskId: 't2',
      taskTitle: 'Backend API Development',
      projectId: 'p1',
      projectName: 'E-commerce Platform',
      currentWorkload: 6,
      requestedWorkload: 8,
      reason: 'I have capacity to take on more tasks to help with project delivery.',
      status: 'approved',
      submittedAt: new Date('2024-03-14'),
      reviewedAt: new Date('2024-03-15'),
      reviewedBy: 'Mike Johnson',
      comments: 'Approved. Will redistribute tasks to other team members.',
      attachments: []
    },
    {
      _id: 'wr3',
      employeeId: 'u3',
      employeeName: 'Bob Wilson',
      employeeEmail: 'bob@example.com',
      employeeAvatar: '',
      role: 'QA Engineer',
      taskId: 't3',
      taskTitle: 'Mobile App Testing',
      projectId: 'p2',
      projectName: 'Mobile App',
      currentWorkload: 7,
      requestedWorkload: 4,
      reason: 'Testing workload is overwhelming, need to reduce to ensure thorough testing.',
      status: 'rejected',
      submittedAt: new Date('2024-03-13'),
      reviewedAt: new Date('2024-03-14'),
      reviewedBy: 'Mike Johnson',
      comments: 'Rejected. Testing timeline cannot be extended further.',
      attachments: []
    }
  ];

  const deadlineExtensionRequests: DeadlineExtensionRequest[] = [
    {
      _id: 'der1',
      employeeId: 'u1',
      employeeName: 'John Doe',
      employeeEmail: 'john@example.com',
      employeeAvatar: '',
      role: 'UI/UX Designer',
      taskId: 't1',
      taskTitle: 'UI Design Implementation',
      projectId: 'p1',
      projectName: 'E-commerce Platform',
      currentDeadline: new Date('2024-03-20'),
      requestedDeadline: new Date('2024-03-25'),
      reason: 'Additional design revisions requested by client, need extra time.',
      status: 'pending',
      submittedAt: new Date('2024-03-15'),
      attachments: []
    },
    {
      _id: 'der2',
      employeeId: 'u2',
      employeeName: 'Jane Smith',
      employeeEmail: 'jane@example.com',
      employeeAvatar: '',
      role: 'Backend Developer',
      taskId: 't2',
      taskTitle: 'Backend API Development',
      projectId: 'p1',
      projectName: 'E-commerce Platform',
      currentDeadline: new Date('2024-03-18'),
      requestedDeadline: new Date('2024-03-22'),
      reason: 'Integration with third-party service is taking longer than expected.',
      status: 'approved',
      submittedAt: new Date('2024-03-14'),
      reviewedAt: new Date('2024-03-15'),
      reviewedBy: 'Mike Johnson',
      comments: 'Approved. Third-party integration delays are understandable.',
      attachments: []
    }
  ];

  const employeeWorkloads: EmployeeWorkload[] = [
    {
      _id: 'u1',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: '',
      role: 'UI/UX Designer',
      currentWorkload: 8,
      maxWorkload: 10,
      utilizationPercentage: 80,
      activeTasks: 5,
      completedTasks: 12,
      overdueTasks: 1,
      averageCompletionTime: 2.5,
      lastActivity: new Date('2024-03-15'),
      performance: {
        rating: 4.2,
        trends: [
          { date: new Date('2024-03-01'), value: 4.0 },
          { date: new Date('2024-03-08'), value: 4.1 },
          { date: new Date('2024-03-15'), value: 4.2 }
        ]
      }
    },
    {
      _id: 'u2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatarUrl: '',
      role: 'Backend Developer',
      currentWorkload: 6,
      maxWorkload: 10,
      utilizationPercentage: 60,
      activeTasks: 3,
      completedTasks: 15,
      overdueTasks: 0,
      averageCompletionTime: 1.8,
      lastActivity: new Date('2024-03-15'),
      performance: {
        rating: 4.6,
        trends: [
          { date: new Date('2024-03-01'), value: 4.5 },
          { date: new Date('2024-03-08'), value: 4.6 },
          { date: new Date('2024-03-15'), value: 4.6 }
        ]
      }
    },
    {
      _id: 'u3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      avatarUrl: '',
      role: 'QA Engineer',
      currentWorkload: 7,
      maxWorkload: 8,
      utilizationPercentage: 87.5,
      activeTasks: 4,
      completedTasks: 8,
      overdueTasks: 2,
      averageCompletionTime: 3.2,
      lastActivity: new Date('2024-03-14'),
      performance: {
        rating: 3.8,
        trends: [
          { date: new Date('2024-03-01'), value: 4.0 },
          { date: new Date('2024-03-08'), value: 3.9 },
          { date: new Date('2024-03-15'), value: 3.8 }
        ]
      }
    }
  ];

  const workloadAnalytics: WorkloadAnalytics = {
    totalRequests: 15,
    pendingRequests: 3,
    approvedRequests: 8,
    rejectedRequests: 4,
    averageProcessingTime: 1.2,
    topRequesters: [
      { employeeId: 'u1', employeeName: 'John Doe', requestCount: 5 },
      { employeeId: 'u3', employeeName: 'Bob Wilson', requestCount: 4 },
      { employeeId: 'u2', employeeName: 'Jane Smith', requestCount: 3 }
    ],
    workloadDistribution: [
      { range: '0-25%', count: 2, percentage: 13.3 },
      { range: '26-50%', count: 3, percentage: 20.0 },
      { range: '51-75%', count: 5, percentage: 33.3 },
      { range: '76-100%', count: 5, percentage: 33.3 }
    ],
    trends: [
      { date: new Date('2024-03-01'), requests: 2, approvals: 1, rejections: 0 },
      { date: new Date('2024-03-08'), requests: 3, approvals: 2, rejections: 1 },
      { date: new Date('2024-03-15'), requests: 4, approvals: 3, rejections: 1 }
    ]
  };

  // Note: getStatusColor already defined above

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const renderWorkloadRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Workload Requests</h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {workloadRequests
          .filter(request => selectedStatus === 'all' || request.status === selectedStatus)
          .map(request => (
            <div key={request._id} className="bg-white p-6 rounded-lg border border-gray-300 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={request.employeeAvatar || `https://ui-avatars.com/api/?name=${request.employeeName}&background=random`}
                    alt={request.employeeName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{request.employeeName}</h4>
                    <p className="text-sm text-gray-600">{request.role}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Task:</span>
                  <p className="text-sm font-medium text-gray-900">{request.taskTitle}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Project:</span>
                  <p className="text-sm font-medium text-gray-900">{request.projectName}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Workload:</span>
                  <span className="text-sm font-medium text-gray-900">{request.currentWorkload}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Requested Workload:</span>
                  <span className="text-sm font-medium text-gray-900">{request.requestedWorkload}</span>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Reason:</span>
                  <p className="text-sm text-gray-700 mt-1">{request.reason}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                {request.reviewedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reviewed:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(request.reviewedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {request.status === 'pending' && (
                  <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderDeadlineExtensionRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Deadline Extension Requests</h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {deadlineExtensionRequests
          .filter(request => selectedStatus === 'all' || request.status === selectedStatus)
          .map(request => (
            <div key={request._id} className="bg-white p-6 rounded-lg border border-gray-300 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={request.employeeAvatar || `https://ui-avatars.com/api/?name=${request.employeeName}&background=random`}
                    alt={request.employeeName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{request.employeeName}</h4>
                    <p className="text-sm text-gray-600">{request.role}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Task:</span>
                  <p className="text-sm font-medium text-gray-900">{request.taskTitle}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Project:</span>
                  <p className="text-sm font-medium text-gray-900">{request.projectName}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Deadline:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(request.currentDeadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Requested Deadline:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(request.requestedDeadline).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Reason:</span>
                  <p className="text-sm text-gray-700 mt-1">{request.reason}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                {request.reviewedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reviewed:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(request.reviewedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {request.status === 'pending' && (
                  <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderEmployeeWorkloadOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Employee Workload Overview</h3>
        <button
          onClick={() => setShowAnalyticsModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          View Analytics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employeeWorkloads.map(employee => (
          <div key={employee._id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${employee.name}&background=random`}
                alt={employee.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                <p className="text-sm text-gray-600">{employee.role}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Workload Utilization</span>
                  <span className={`text-sm font-medium ${getUtilizationColor(employee.utilizationPercentage)}`}>
                    {employee.utilizationPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${employee.utilizationPercentage >= 90 ? 'bg-red-500' :
                        employee.utilizationPercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${employee.utilizationPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-gray-600">Active Tasks</span>
                  <p className="text-lg font-semibold text-gray-900">{employee.activeTasks}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Completed</span>
                  <p className="text-lg font-semibold text-gray-900">{employee.completedTasks}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Overdue</span>
                  <p className="text-lg font-semibold text-red-600">{employee.overdueTasks}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Avg Time</span>
                  <p className="text-lg font-semibold text-gray-900">{employee.averageCompletionTime}d</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Performance Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-900">{employee.performance.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Activity</span>
                <span className="text-sm text-gray-600">
                  {new Date(employee.lastActivity).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassmorphicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Requests</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{workloadAnalytics.totalRequests}</p>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Requests</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{workloadAnalytics.pendingRequests}</p>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Approved Requests</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{workloadAnalytics.approvedRequests}</p>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Processing Time</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{workloadAnalytics.averageProcessingTime}d</p>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
              <Timer className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassmorphicCard className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Requesters</h3>
          <div className="space-y-3">
            {workloadAnalytics.topRequesters.map((requester, index) => (
              <div key={requester.employeeId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{requester.employeeName}</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{requester.requestCount} requests</span>
              </div>
            ))}
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Workload Distribution</h3>
          <div className="space-y-3">
            {workloadAnalytics.workloadDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.range}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-20 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className={`text-sm w-12 text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );

  const tabs = [
    { id: 'workload-requests', label: 'Workload Requests', icon: Users, description: 'Manage workload distribution requests' },
    { id: 'deadline-requests', label: 'Deadline Extensions', icon: Clock, description: 'Handle deadline extension requests' },
    { id: 'workload-overview', label: 'Workload Overview', icon: BarChart3, description: 'View employee workload status' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Workload and deadline analytics' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'workload-requests':
        return renderWorkloadRequests();
      case 'deadline-requests':
        return renderDeadlineExtensionRequests();
      case 'workload-overview':
        return renderEmployeeWorkloadOverview();
      case 'analytics':
        return renderAnalyticsDashboard();
      default:
        return renderWorkloadRequests();
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Workload & Deadline Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage workload distribution and deadline extensions for your team.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{workloadRequests.length + deadlineExtensionRequests.length}</span> total requests
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'border-accent text-accent-dark'
                      : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  title={tab.description}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {message.type === 'info' && <Info className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-2 text-gray-600 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkloadDeadlineManagement;