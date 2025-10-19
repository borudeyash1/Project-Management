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
  CalendarClock, CalendarHeart, X, Check,
  ChevronRight, ChevronLeft, Calendar as CalendarIcon,
  Target as TargetIcon, Building as BuildingIcon, User, Star,
  Award, Trophy, Medal, Heart, Bookmark, Copy, Move,
  Archive, Play, Pause, Square, Circle, Triangle, Hexagon,
  Layers, Timer, UserCheck, UserX, MessageSquare, MessageCircle,
  ThumbsUp, ThumbsDown, Award as AwardIcon, Trophy as TrophyIcon,
  Medal as MedalIcon, Bot as BotIcon, Sparkles as SparklesIcon,
  Lightbulb as LightbulbIcon, Globe as GlobeIcon, Shield as ShieldIcon,
  Key as KeyIcon, Lock as LockIcon, Unlock as UnlockIcon,
  EyeOff as EyeOffIcon, Bell as BellIcon, Mail as MailIcon,
  Phone as PhoneIcon, MapPin as MapPinIcon, Building as BuildingIcon2,
  Home as HomeIcon, Crown as CrownIcon, DollarSign as DollarSignIcon,
  CreditCard as CreditCardIcon, Database as DatabaseIcon,
  Server as ServerIcon, Cloud as CloudIcon, Wifi as WifiIcon,
  Monitor as MonitorIcon, Smartphone as SmartphoneIcon,
  Tablet as TabletIcon, Headphones as HeadphonesIcon,
  Camera as CameraIcon, Mic as MicIcon, Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon, MicOff as MicOffIcon,
  CameraOff as CameraOffIcon, CalendarDays as CalendarDaysIcon,
  CalendarCheck as CalendarCheckIcon, CalendarX as CalendarXIcon,
  CalendarPlus as CalendarPlusIcon, CalendarMinus as CalendarMinusIcon,
  CalendarRange as CalendarRangeIcon, CalendarSearch as CalendarSearchIcon,
  CalendarClock as CalendarClockIcon, CalendarHeart as CalendarHeartIcon,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface ProjectAnalytics {
  _id: string;
  name: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  budget: {
    estimated: number;
    actual: number;
    currency: string;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    actualEndDate?: Date;
  };
  team: {
    size: number;
    members: Array<{
      _id: string;
      name: string;
      role: string;
      performance: number;
    }>;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
  };
  metrics: {
    velocity: number;
    burndown: number;
    quality: number;
    satisfaction: number;
  };
}

interface TeamPerformance {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  metrics: {
    tasksCompleted: number;
    tasksAssigned: number;
    onTimeDelivery: number;
    qualityScore: number;
    collaborationScore: number;
    overallRating: number;
  };
  trends: {
    productivity: Array<{
      date: Date;
      value: number;
    }>;
    quality: Array<{
      date: Date;
      value: number;
    }>;
  };
  achievements: Array<{
    _id: string;
    title: string;
    description: string;
    earnedAt: Date;
    type: 'milestone' | 'quality' | 'collaboration' | 'innovation';
  }>;
}

interface PredictiveAnalytics {
  projectCompletion: {
    predictedEndDate: Date;
    confidence: number;
    riskFactors: Array<{
      factor: string;
      impact: 'low' | 'medium' | 'high';
      probability: number;
    }>;
  };
  resourceNeeds: {
    currentCapacity: number;
    predictedDemand: number;
    recommendations: Array<{
      type: 'hire' | 'reallocate' | 'outsource';
      description: string;
      urgency: 'low' | 'medium' | 'high';
    }>;
  };
  budgetForecast: {
    predictedCost: number;
    variance: number;
    confidence: number;
    recommendations: Array<string>;
  };
}

interface Report {
  _id: string;
  name: string;
  description: string;
  type: 'project' | 'team' | 'financial' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  generatedAt: Date;
  generatedBy: string;
  data: any;
  filters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    projects: string[];
    teamMembers: string[];
    metrics: string[];
  };
  isScheduled: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    nextRun: Date;
  };
}

const AdvancedAnalytics: React.FC = () => {
  const { state, dispatch } = useApp();
  const { canUseAdvancedAnalytics, canManageTeam } = useFeatureAccess();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Utility functions
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRefreshKey(prev => prev + 1);
      showMessage('success', 'Analytics data refreshed successfully!');
    } catch (error) {
      showMessage('error', 'Failed to refresh data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (reportType: string, format: 'pdf' | 'excel' | 'csv') => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      showMessage('success', `Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      showMessage('error', 'Failed to export report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async (reportData: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'Report created successfully!');
      setShowCreateReportModal(false);
    } catch (error) {
      showMessage('error', 'Failed to create report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Mock data - replace with actual API calls
  const projectAnalytics: ProjectAnalytics[] = [
    {
      _id: 'p1',
      name: 'E-commerce Platform',
      status: 'active',
      progress: 65,
      budget: { estimated: 50000, actual: 25000, currency: 'USD' },
      timeline: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        actualEndDate: undefined
      },
      team: {
        size: 8,
        members: [
          { _id: 'u1', name: 'John Doe', role: 'Designer', performance: 4.5 },
          { _id: 'u2', name: 'Jane Smith', role: 'Developer', performance: 4.8 },
          { _id: 'u3', name: 'Bob Wilson', role: 'QA Engineer', performance: 4.3 }
        ]
      },
      tasks: {
        total: 45,
        completed: 29,
        inProgress: 12,
        pending: 4,
        overdue: 2
      },
      metrics: {
        velocity: 85,
        burndown: 78,
        quality: 4.2,
        satisfaction: 4.6
      }
    },
    {
      _id: 'p2',
      name: 'Mobile App',
      status: 'active',
      progress: 40,
      budget: { estimated: 75000, actual: 30000, currency: 'USD' },
      timeline: {
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        actualEndDate: undefined
      },
      team: {
        size: 6,
        members: [
          { _id: 'u4', name: 'Alice Brown', role: 'Mobile Developer', performance: 4.1 },
          { _id: 'u5', name: 'Charlie Davis', role: 'UI Designer', performance: 4.7 }
        ]
      },
      tasks: {
        total: 32,
        completed: 13,
        inProgress: 15,
        pending: 4,
        overdue: 1
      },
      metrics: {
        velocity: 72,
        burndown: 65,
        quality: 4.0,
        satisfaction: 4.3
      }
    }
  ];

  const teamPerformance: TeamPerformance[] = [
    {
      _id: 'u1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'UI/UX Designer',
      avatarUrl: '',
      metrics: {
        tasksCompleted: 12,
        tasksAssigned: 15,
        onTimeDelivery: 95,
        qualityScore: 4.2,
        collaborationScore: 4.5,
        overallRating: 4.3
      },
      trends: {
        productivity: [
          { date: new Date('2024-03-01'), value: 85 },
          { date: new Date('2024-03-08'), value: 92 },
          { date: new Date('2024-03-15'), value: 88 }
        ],
        quality: [
          { date: new Date('2024-03-01'), value: 4.1 },
          { date: new Date('2024-03-08'), value: 4.3 },
          { date: new Date('2024-03-15'), value: 4.2 }
        ]
      },
      achievements: [
        {
          _id: 'a1',
          title: 'Design Excellence',
          description: 'Consistently high-quality design work',
          earnedAt: new Date('2024-03-10'),
          type: 'quality'
        }
      ]
    },
    {
      _id: 'u2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Backend Developer',
      avatarUrl: '',
      metrics: {
        tasksCompleted: 15,
        tasksAssigned: 18,
        onTimeDelivery: 98,
        qualityScore: 4.6,
        collaborationScore: 4.8,
        overallRating: 4.7
      },
      trends: {
        productivity: [
          { date: new Date('2024-03-01'), value: 92 },
          { date: new Date('2024-03-08'), value: 95 },
          { date: new Date('2024-03-15'), value: 98 }
        ],
        quality: [
          { date: new Date('2024-03-01'), value: 4.5 },
          { date: new Date('2024-03-08'), value: 4.6 },
          { date: new Date('2024-03-15'), value: 4.7 }
        ]
      },
      achievements: [
        {
          _id: 'a2',
          title: 'Code Quality Champion',
          description: 'Excellent code quality and documentation',
          earnedAt: new Date('2024-03-12'),
          type: 'quality'
        }
      ]
    }
  ];

  const predictiveAnalytics: PredictiveAnalytics = {
    projectCompletion: {
      predictedEndDate: new Date('2024-07-15'),
      confidence: 85,
      riskFactors: [
        {
          factor: 'Resource availability',
          impact: 'medium',
          probability: 0.3
        },
        {
          factor: 'Scope creep',
          impact: 'high',
          probability: 0.2
        },
        {
          factor: 'Technical complexity',
          impact: 'low',
          probability: 0.1
        }
      ]
    },
    resourceNeeds: {
      currentCapacity: 80,
      predictedDemand: 95,
      recommendations: [
        {
          type: 'hire',
          description: 'Consider hiring 2 additional developers for Q2',
          urgency: 'medium'
        },
        {
          type: 'reallocate',
          description: 'Move 1 designer from Project B to Project A',
          urgency: 'high'
        }
      ]
    },
    budgetForecast: {
      predictedCost: 52000,
      variance: 4,
      confidence: 90,
      recommendations: [
        'Monitor scope changes closely',
        'Consider early vendor negotiations',
        'Implement cost tracking automation'
      ]
    }
  };

  const reports: Report[] = [
    {
      _id: 'r1',
      name: 'Monthly Project Summary',
      description: 'Comprehensive overview of all active projects',
      type: 'project',
      format: 'pdf',
      generatedAt: new Date('2024-03-01'),
      generatedBy: 'Mike Johnson',
      data: {},
      filters: {
        dateRange: {
          start: new Date('2024-02-01'),
          end: new Date('2024-02-29')
        },
        projects: ['p1', 'p2'],
        teamMembers: [],
        metrics: ['progress', 'budget', 'timeline']
      },
      isScheduled: true,
      schedule: {
        frequency: 'monthly',
        nextRun: new Date('2024-04-01')
      }
    },
    {
      _id: 'r2',
      name: 'Team Performance Report',
      description: 'Individual and team performance metrics',
      type: 'team',
      format: 'excel',
      generatedAt: new Date('2024-03-15'),
      generatedBy: 'Mike Johnson',
      data: {},
      filters: {
        dateRange: {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-15')
        },
        projects: [],
        teamMembers: ['u1', 'u2', 'u3'],
        metrics: ['productivity', 'quality', 'collaboration']
      },
      isScheduled: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">
                {projectAnalytics.filter(p => p.status === 'active').length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teamPerformance.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(projectAnalytics.reduce((acc, p) => acc + p.progress, 0) / projectAnalytics.length)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Used</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${projectAnalytics.reduce((acc, p) => acc + p.budget.actual, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
          <div className="space-y-4">
            {projectAnalytics.map(project => (
              <div key={project._id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{project.name}</span>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="space-y-3">
            {teamPerformance.map(member => (
              <div key={member._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                    alt={member.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">{member.metrics.overallRating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Project Analytics</h3>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Projects</option>
          {projectAnalytics.map(project => (
            <option key={project._id} value={project._id}>{project.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projectAnalytics
          .filter(project => selectedProject === 'all' || project._id === selectedProject)
          .map(project => (
            <div key={project._id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Budget</span>
                    <p className="text-lg font-semibold text-gray-900">
                      ${project.budget.actual.toLocaleString()} / ${project.budget.estimated.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Team Size</span>
                    <p className="text-lg font-semibold text-gray-900">{project.team.size}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Tasks Completed</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {project.tasks.completed} / {project.tasks.total}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Overdue Tasks</span>
                    <p className="text-lg font-semibold text-red-600">{project.tasks.overdue}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Velocity</span>
                    <p className="text-lg font-semibold text-gray-900">{project.metrics.velocity}%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Quality Score</span>
                    <p className="text-lg font-semibold text-gray-900">{project.metrics.quality}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderPredictiveAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Completion Forecast</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Predicted End Date</span>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(predictiveAnalytics.projectCompletion.predictedEndDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Confidence Level</span>
              <p className="text-lg font-semibold text-gray-900">
                {predictiveAnalytics.projectCompletion.confidence}%
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Risk Factors</span>
              <div className="space-y-2 mt-2">
                {predictiveAnalytics.projectCompletion.riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{risk.factor}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(risk.impact)}`}>
                      {risk.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Needs</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Current Capacity</span>
              <p className="text-lg font-semibold text-gray-900">
                {predictiveAnalytics.resourceNeeds.currentCapacity}%
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Predicted Demand</span>
              <p className="text-lg font-semibold text-gray-900">
                {predictiveAnalytics.resourceNeeds.predictedDemand}%
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Recommendations</span>
              <div className="space-y-2 mt-2">
                {predictiveAnalytics.resourceNeeds.recommendations.map((rec, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{rec.type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(rec.urgency)}`}>
                        {rec.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Forecast</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Predicted Cost</span>
              <p className="text-lg font-semibold text-gray-900">
                ${predictiveAnalytics.budgetForecast.predictedCost.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Variance</span>
              <p className="text-lg font-semibold text-gray-900">
                {predictiveAnalytics.budgetForecast.variance}%
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Confidence</span>
              <p className="text-lg font-semibold text-gray-900">
                {predictiveAnalytics.budgetForecast.confidence}%
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Recommendations</span>
              <div className="space-y-1 mt-2">
                {predictiveAnalytics.budgetForecast.recommendations.map((rec, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
        <button
          onClick={() => setShowCreateReportModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(report => (
          <div key={report._id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Download className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{report.type}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Format:</span>
                <span className="text-sm font-medium text-gray-900 uppercase">{report.format}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Generated:</span>
                <span className="text-sm text-gray-600">
                  {new Date(report.generatedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scheduled:</span>
                <span className={`text-sm font-medium ${report.isScheduled ? 'text-green-600' : 'text-gray-600'}`}>
                  {report.isScheduled ? 'Yes' : 'No'}
                </span>
              </div>
              
              {report.isScheduled && report.schedule && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Run:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(report.schedule.nextRun).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Key metrics and performance overview' },
    { id: 'projects', label: 'Project Analytics', icon: Target, description: 'Detailed project performance analysis' },
    { id: 'predictive', label: 'Predictive Analytics', icon: Bot, description: 'AI-powered predictions and forecasts' },
    { id: 'reports', label: 'Reports', icon: FileText, description: 'Generate and manage reports' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'projects':
        return renderProjectAnalytics();
      case 'predictive':
        return renderPredictiveAnalytics();
      case 'reports':
        return renderReports();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Advanced Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">Comprehensive analytics, predictions, and reporting for your projects.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{projectAnalytics.length}</span> projects analyzed
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
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

export default AdvancedAnalytics;