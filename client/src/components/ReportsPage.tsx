import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Download, Filter, Calendar, 
  Users, Target, Clock, DollarSign, PieChart, LineChart,
  FileText, Share2, Eye, MoreVertical, RefreshCw,
  Bot, Crown, Star, Zap, AlertCircle, CheckCircle,
  ArrowUp, ArrowDown, Minus, Plus, Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface ReportData {
  _id: string;
  name: string;
  type: 'productivity' | 'time' | 'team' | 'financial' | 'project';
  description: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

interface ProjectMetrics {
  _id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  budget: number;
  spent: number;
  teamSize: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
}

interface TeamPerformance {
  _id: string;
  name: string;
  avatar?: string;
  role: string;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  averageRating: number;
  hoursWorked: number;
  productivityScore: number;
  lastActive: Date;
}

interface TimeTrackingData {
  date: string;
  hours: number;
  billableHours: number;
  projects: Array<{
    name: string;
    hours: number;
    color: string;
  }>;
}

const ReportsPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const { canUseAdvancedAnalytics, canExportReports, canUseAI } = useFeatureAccess();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [timeTrackingData, setTimeTrackingData] = useState<TimeTrackingData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [reportType, setReportType] = useState<'all' | 'productivity' | 'time' | 'team' | 'financial' | 'project'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockReports: ReportData[] = [
      {
        _id: '1',
        name: 'Q1 Productivity Report',
        type: 'productivity',
        description: 'Team productivity metrics for Q1 2024',
        data: {
          totalTasks: 150,
          completedTasks: 120,
          averageCompletionTime: 2.5,
          teamEfficiency: 85
        },
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-15'),
        isPublic: false,
        tags: ['productivity', 'q1', 'team']
      },
      {
        _id: '2',
        name: 'Time Tracking Analysis',
        type: 'time',
        description: 'Detailed time tracking analysis for March 2024',
        data: {
          totalHours: 320,
          billableHours: 280,
          averageDailyHours: 8.2,
          topProjects: ['E-commerce Platform', 'Mobile App', 'Dashboard Redesign']
        },
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20'),
        isPublic: true,
        tags: ['time', 'tracking', 'march']
      },
      {
        _id: '3',
        name: 'Team Performance Review',
        type: 'team',
        description: 'Individual and team performance metrics',
        data: {
          teamSize: 8,
          averageRating: 4.2,
          topPerformers: ['John Doe', 'Jane Smith'],
          improvementAreas: ['Communication', 'Deadline Management']
        },
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10'),
        isPublic: false,
        tags: ['team', 'performance', 'review']
      }
    ];

    const mockProjectMetrics: ProjectMetrics[] = [
      {
        _id: 'p1',
        name: 'E-commerce Platform',
        totalTasks: 45,
        completedTasks: 32,
        progress: 71,
        budget: 50000,
        spent: 35000,
        teamSize: 5,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-15'),
        status: 'active'
      },
      {
        _id: 'p2',
        name: 'Mobile App',
        totalTasks: 28,
        completedTasks: 28,
        progress: 100,
        budget: 30000,
        spent: 28500,
        teamSize: 3,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-03-31'),
        status: 'completed'
      },
      {
        _id: 'p3',
        name: 'Dashboard Redesign',
        totalTasks: 18,
        completedTasks: 12,
        progress: 67,
        budget: 20000,
        spent: 12000,
        teamSize: 4,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-01'),
        status: 'active'
      }
    ];

    const mockTeamPerformance: TeamPerformance[] = [
      {
        _id: 'u1',
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        role: 'Senior Developer',
        tasksCompleted: 25,
        totalTasks: 28,
        completionRate: 89,
        averageRating: 4.5,
        hoursWorked: 160,
        productivityScore: 92,
        lastActive: new Date('2024-03-20')
      },
      {
        _id: 'u2',
        name: 'Jane Smith',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        role: 'UI/UX Designer',
        tasksCompleted: 22,
        totalTasks: 25,
        completionRate: 88,
        averageRating: 4.3,
        hoursWorked: 155,
        productivityScore: 89,
        lastActive: new Date('2024-03-20')
      },
      {
        _id: 'u3',
        name: 'Bob Wilson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        role: 'Project Manager',
        tasksCompleted: 18,
        totalTasks: 20,
        completionRate: 90,
        averageRating: 4.7,
        hoursWorked: 165,
        productivityScore: 95,
        lastActive: new Date('2024-03-19')
      }
    ];

    const mockTimeTrackingData: TimeTrackingData[] = [
      { date: '2024-03-14', hours: 8.5, billableHours: 7.5, projects: [
        { name: 'E-commerce Platform', hours: 5, color: 'bg-accent' },
        { name: 'Mobile App', hours: 2.5, color: 'bg-green-500' },
        { name: 'Dashboard Redesign', hours: 1, color: 'bg-purple-500' }
      ]},
      { date: '2024-03-15', hours: 8, billableHours: 7, projects: [
        { name: 'E-commerce Platform', hours: 6, color: 'bg-accent' },
        { name: 'Mobile App', hours: 1.5, color: 'bg-green-500' },
        { name: 'Dashboard Redesign', hours: 0.5, color: 'bg-purple-500' }
      ]},
      { date: '2024-03-16', hours: 7.5, billableHours: 6.5, projects: [
        { name: 'E-commerce Platform', hours: 4, color: 'bg-accent' },
        { name: 'Mobile App', hours: 2, color: 'bg-green-500' },
        { name: 'Dashboard Redesign', hours: 1.5, color: 'bg-purple-500' }
      ]},
      { date: '2024-03-17', hours: 8.2, billableHours: 7.8, projects: [
        { name: 'E-commerce Platform', hours: 5.5, color: 'bg-accent' },
        { name: 'Mobile App', hours: 1.2, color: 'bg-green-500' },
        { name: 'Dashboard Redesign', hours: 1.5, color: 'bg-purple-500' }
      ]},
      { date: '2024-03-18', hours: 8, billableHours: 7.2, projects: [
        { name: 'E-commerce Platform', hours: 4.5, color: 'bg-accent' },
        { name: 'Mobile App', hours: 2, color: 'bg-green-500' },
        { name: 'Dashboard Redesign', hours: 1.5, color: 'bg-purple-500' }
      ]}
    ];

    setReports(mockReports);
    setProjectMetrics(mockProjectMetrics);
    setTeamPerformance(mockTeamPerformance);
    setTimeTrackingData(mockTimeTrackingData);
  }, []);

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'productivity': return <TrendingUp className="w-5 h-5" />;
      case 'time': return <Clock className="w-5 h-5" />;
      case 'team': return <Users className="w-5 h-5" />;
      case 'financial': return <DollarSign className="w-5 h-5" />;
      case 'project': return <Target className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getReportColor = (type: string) => {
    switch (type) {
      case 'productivity': return 'text-green-600 bg-green-100';
      case 'time': return 'text-accent-dark bg-blue-100';
      case 'team': return 'text-purple-600 bg-purple-100';
      case 'financial': return 'text-yellow-600 bg-yellow-100';
      case 'project': return 'text-orange-600 bg-orange-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const generateAIReport = async () => {
    if (!canUseAI()) return;
    
    setIsGenerating(true);
    // Simulate AI report generation
    setTimeout(() => {
      const newReport: ReportData = {
        _id: Date.now().toString(),
        name: `AI Generated Report - ${new Date().toLocaleDateString()}`,
        type: 'productivity',
        description: 'AI-powered analysis of team productivity and recommendations',
        data: {
          insights: [
            'Team productivity increased by 15% this month',
            'Peak productivity hours are 10 AM - 2 PM',
            'Mobile App project is ahead of schedule',
            'Recommend focusing on Dashboard Redesign next week'
          ],
          recommendations: [
            'Schedule important tasks during peak hours',
            'Consider pair programming for complex features',
            'Implement daily standups for better communication'
          ]
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        tags: ['ai', 'productivity', 'recommendations']
      };
      setReports([newReport, ...reports]);
      setIsGenerating(false);
    }, 2000);
  };

  const exportReport = (report: ReportData) => {
    if (!canExportReports()) return;
    
    // Simulate export functionality
    const dataStr = JSON.stringify(report.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredReports = () => {
    return reports.filter(report => 
      reportType === 'all' || report.type === reportType
    );
  };

  const getTotalHours = () => {
    return timeTrackingData.reduce((total, day) => total + day.hours, 0);
  };

  const getBillableHours = () => {
    return timeTrackingData.reduce((total, day) => total + day.billableHours, 0);
  };

  const getAverageProductivity = () => {
    return teamPerformance.reduce((total, member) => total + member.productivityScore, 0) / teamPerformance.length;
  };

  const getProjectProgress = () => {
    return projectMetrics.reduce((total, project) => total + project.progress, 0) / projectMetrics.length;
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Track performance and generate insights</p>
          </div>
          <div className="flex items-center gap-3">
            {canUseAI() && (
              <button
                onClick={generateAIReport}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating...' : 'AI Report'}
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
            >
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-300 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{getTotalHours().toFixed(1)}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-accent" />
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+12% from last week</span>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-300 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Billable Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{getBillableHours().toFixed(1)}h</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+8% from last week</span>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-300 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Team Productivity</p>
                    <p className="text-2xl font-bold text-gray-900">{getAverageProductivity().toFixed(0)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+5% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-300 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Project Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{getProjectProgress().toFixed(0)}%</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+3% from last week</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="all">All Reports</option>
                    <option value="productivity">Productivity</option>
                    <option value="time">Time Tracking</option>
                    <option value="team">Team Performance</option>
                    <option value="financial">Financial</option>
                    <option value="project">Project</option>
                  </select>

                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button className="p-2 text-gray-600 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {getFilteredReports().map(report => (
                  <div key={report._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getReportColor(report.type)}`}>
                        {getReportIcon(report.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{report.name}</h3>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getReportColor(report.type)}`}>
                            {report.type}
                          </span>
                          {report.isPublic && (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium text-accent-dark bg-blue-100">
                              Public
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Created {report.createdAt.toLocaleDateString()}</span>
                          <span>Updated {report.updatedAt.toLocaleDateString()}</span>
                          <div className="flex items-center gap-1">
                            {report.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-2 text-gray-600 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canExportReports() && (
                          <button
                            onClick={() => exportReport(report)}
                            className="p-2 text-gray-600 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-gray-600 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            {canUseAI() && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5" />
                  <h3 className="font-semibold">AI Insights</h3>
                </div>
                <p className="text-sm text-purple-100 mb-3">
                  Get AI-powered insights and recommendations for your team's performance.
                </p>
                <button
                  onClick={generateAIReport}
                  disabled={isGenerating}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Insights'}
                </button>
              </div>
            )}

            {/* Project Performance */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Project Performance</h3>
              <div className="space-y-3">
                {projectMetrics.map(project => (
                  <div key={project._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{project.name}</span>
                      <span className="text-sm text-gray-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                      <span>${project.spent.toLocaleString()}/${project.budget.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Leaderboard */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Team Leaderboard</h3>
              <div className="space-y-3">
                {teamPerformance
                  .sort((a, b) => b.productivityScore - a.productivityScore)
                  .slice(0, 5)
                  .map((member, index) => (
                    <div key={member._id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                          <p className="text-xs text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{member.productivityScore}%</p>
                        <p className="text-xs text-gray-600">{member.completionRate}% tasks</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Download className="w-4 h-4 inline mr-2" />
                  Export All Data
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Share2 className="w-4 h-4 inline mr-2" />
                  Share Dashboard
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Schedule Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getReportColor(selectedReport.type)}`}>
                    {getReportIcon(selectedReport.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedReport.name}</h3>
                    <p className="text-sm text-gray-600">{selectedReport.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-600 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(selectedReport.data, null, 2)}
              </pre>
            </div>
            
            <div className="p-6 border-t border-gray-300 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              {canExportReports() && (
                <button
                  onClick={() => exportReport(selectedReport)}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  Export
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
