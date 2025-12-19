import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Download, Filter, Calendar,
  Users, Target, Clock, DollarSign, PieChart, LineChart,
  FileText, Share2, Eye, MoreVertical, RefreshCw,
  Bot, Crown, Star, Zap, AlertCircle, CheckCircle,
  ArrowUp, ArrowDown, Minus, Plus, Search, Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useRefreshData } from '../hooks/useRefreshData';
import CreateReportModal from './CreateReportModal';
import ScheduleReportModal from './ScheduleReportModal';
import { downloadReportPDF, printReportPDF } from '../utils/pdfGenerator';
import * as XLSX from 'xlsx';
import { reportService, Report, CreateReportData } from '../services/reportService';
import { useTheme } from '../context/ThemeContext';
import GlassmorphicCard from './ui/GlassmorphicCard';
import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';

interface ReportData {
  _id: string;
  name: string;
  type: 'productivity' | 'time' | 'team' | 'financial' | 'project' | 'custom';
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
  const { isDarkMode } = useTheme();
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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch actual data
  const fetchReportsData = async () => {
    try {
      const [reportsRes, projectsRes, teamRes, timeRes] = await Promise.all([
        reportService.getReports(reportType === 'all' ? undefined : reportType),
        reportService.getProjectAnalytics(),
        reportService.getTeamAnalytics(),
        reportService.getTimeAnalytics(30)
      ]);

      if (reportsRes) {
        setReports(reportsRes.data || []);
      }

      if (projectsRes) {
        const projectsData = projectsRes.data || [];
        setProjectMetrics(projectsData.map((p: any) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate)
        })));
      }

      if (teamRes) {
        const teamData = teamRes.data || [];
        setTeamPerformance(teamData.map((t: any) => ({
          ...t,
          lastActive: new Date(t.lastActive)
        })));
      }

      if (timeRes) {
        const timeData = timeRes.data?.dailyData || [];
        setTimeTrackingData(timeData.map((t: any) => ({
          date: t.date,
          hours: t.hours,
          billableHours: t.billableHours,
          projects: t.projects || []
        })));
      }

    } catch (error) {
      console.error('Failed to fetch reports data:', error);
      // Show error toast or notification
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to load reports data',
          duration: 3000
        }
      });
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // Enable refresh button for this page
  useRefreshData(fetchReportsData, []);

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
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
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

  // New Report Creation
  const handleCreateReport = async (reportData: any) => {
    try {
      const createData: CreateReportData = {
        name: reportData.name,
        description: reportData.description,
        type: reportData.type,
        dateRange: {
          startDate: new Date(reportData.dateRange.startDate),
          endDate: new Date(reportData.dateRange.endDate)
        },
        tags: reportData.tags || [],
        isPublic: false
      };

      const newReport = await reportService.createReport(createData);
      setReports([newReport as any, ...reports]);

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Report created successfully',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Failed to create report:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to create report',
          duration: 3000
        }
      });
    }
  };

  // Quick Actions
  const handleExportAllData = () => {
    const workbook = XLSX.utils.book_new();

    // Reports sheet
    const reportsData = reports.map(r => ({
      Name: r.name,
      Type: r.type,
      Description: r.description,
      Created: r.createdAt.toLocaleDateString(),
      Tags: r.tags.join(', ')
    }));
    const reportsSheet = XLSX.utils.json_to_sheet(reportsData);
    XLSX.utils.book_append_sheet(workbook, reportsSheet, 'Reports');

    // Projects sheet
    const projectsData = projectMetrics.map(p => ({
      Name: p.name,
      'Total Tasks': p.totalTasks,
      'Completed Tasks': p.completedTasks,
      'Progress %': p.progress,
      Budget: p.budget,
      Spent: p.spent,
      'Team Size': p.teamSize,
      Status: p.status
    }));
    const projectsSheet = XLSX.utils.json_to_sheet(projectsData);
    XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projects');

    // Team sheet
    const teamData = teamPerformance.map(m => ({
      Name: m.name,
      Role: m.role,
      'Tasks Completed': m.tasksCompleted,
      'Total Tasks': m.totalTasks,
      'Completion Rate %': m.completionRate,
      'Avg Rating': m.averageRating,
      'Hours Worked': m.hoursWorked,
      'Productivity Score': m.productivityScore
    }));
    const teamSheet = XLSX.utils.json_to_sheet(teamData);
    XLSX.utils.book_append_sheet(workbook, teamSheet, 'Team Performance');

    // Time tracking sheet
    const timeData = timeTrackingData.map(t => ({
      Date: t.date,
      'Total Hours': t.hours,
      'Billable Hours': t.billableHours
    }));
    const timeSheet = XLSX.utils.json_to_sheet(timeData);
    XLSX.utils.book_append_sheet(workbook, timeSheet, 'Time Tracking');

    // Download
    XLSX.writeFile(workbook, `reports_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleShareDashboard = () => {
    const shareUrl = `${window.location.origin}/reports/shared/${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);

    // Show toast notification (you can implement a toast system)
    alert('Dashboard link copied to clipboard!\n' + shareUrl);
  };

  const handleScheduleReport = (scheduleData: any) => {
    console.log('Scheduling report:', scheduleData);
    // In a real implementation, this would call an API to set up the schedule
    alert(`Report scheduled successfully!\nType: ${scheduleData.reportType}\nFrequency: ${scheduleData.frequency}\nRecipients: ${scheduleData.recipients.length}`);
  };

  return (
    <div className={`h-full min-h-screen bg-gradient-to-br ${isDarkMode ? 'from-gray-900 via-gray-800 to-gray-900' : 'from-gray-50 via-blue-50/30 to-purple-50/20'}`}>
      <GlassmorphicPageHeader
        title="Reports & Analytics"
        subtitle="Track performance and generate insights"
        icon={BarChart3}
      >
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover"
          >
            <Plus className="w-4 h-4" />
            New Report
          </button>
        </div>
      </GlassmorphicPageHeader>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassmorphicCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getTotalHours().toFixed(1)}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-accent" />
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+12% from last week</span>
                </div>
              </GlassmorphicCard>

              <GlassmorphicCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Billable Hours</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getBillableHours().toFixed(1)}h</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+8% from last week</span>
                </div>
              </GlassmorphicCard>

              <GlassmorphicCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Team Productivity</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getAverageProductivity().toFixed(0)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+5% from last month</span>
                </div>
              </GlassmorphicCard>

              <GlassmorphicCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Project Progress</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getProjectProgress().toFixed(0)}%</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+3% from last week</span>
                </div>
              </GlassmorphicCard>
            </div>

            {/* Filters */}
            <GlassmorphicCard className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
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
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassmorphicCard>

            {/* Reports List */}
            <GlassmorphicCard>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reports</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredReports().map(report => (
                  <div key={report._id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getReportColor(report.type)}`}>
                        {getReportIcon(report.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{report.name}</h3>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getReportColor(report.type)}`}>
                            {report.type}
                          </span>
                          {report.isPublic && (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium text-accent-dark bg-blue-100">
                              Public
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{report.description}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Created {report.createdAt.toLocaleDateString()}</span>
                          <span>Updated {report.updatedAt.toLocaleDateString()}</span>
                          <div className="flex items-center gap-1">
                            {report.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canExportReports() && (
                          <button
                            onClick={() => exportReport(report)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicCard>
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
                  className="w-full bg-white dark:bg-gray-800 bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Insights'}
                </button>
              </div>
            )}

            {/* Project Performance */}
            <GlassmorphicCard className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Project Performance</h3>
              <div className="space-y-3">
                {projectMetrics.map(project => (
                  <div key={project._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                      <span>${project.spent.toLocaleString()}/${project.budget.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicCard>

            {/* Team Leaderboard */}
            <GlassmorphicCard className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Team Leaderboard</h3>
              <div className="space-y-3">
                {teamPerformance
                  .sort((a, b) => b.productivityScore - a.productivityScore)
                  .slice(0, 5)
                  .map((member, index) => (
                    <div key={member._id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium dark:text-gray-300">
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
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-200">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{member.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.productivityScore}%</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{member.completionRate}% tasks</p>
                      </div>
                    </div>
                  ))}
              </div>
            </GlassmorphicCard>

            {/* Quick Actions */}
            <GlassmorphicCard className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleExportAllData}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Export All Data
                </button>
                <button
                  onClick={handleShareDashboard}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4 inline mr-2" />
                  Share Dashboard
                </button>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Schedule Report
                </button>
              </div>
            </GlassmorphicCard>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getReportColor(selectedReport.type)}`}>
                    {getReportIcon(selectedReport.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedReport.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReport.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-accent/10 to-blue-100 rounded-lg p-6 mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Report Preview</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  This report contains {Object.keys(selectedReport.data).length} data points.
                  Download as PDF for a formatted view or export as JSON for raw data.
                </p>

                {/* Data Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  {selectedReport.data.insights ? (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Key Insights:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {selectedReport.data.insights.map((insight: string, i: number) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                      {selectedReport.data.recommendations && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Recommendations:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {selectedReport.data.recommendations.map((rec: string, i: number) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedReport.data).map(([key, value]) => (
                        <div key={key} className="border-l-2 border-accent pl-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Raw JSON (collapsible) */}
              <details className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-100">
                  View Raw JSON Data
                </summary>
                <pre className="mt-3 text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(selectedReport.data, null, 2)}
                </pre>
              </details>
            </div>

            <div className="p-6 border-t border-gray-300 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => printReportPDF(selectedReport)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 inline-flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              {canExportReports() && (
                <>
                  <button
                    onClick={() => exportReport(selectedReport)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 inline-flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Export JSON
                  </button>
                  <button
                    onClick={() => downloadReportPDF(selectedReport)}
                    className="px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateReport={handleCreateReport}
      />

      {/* Schedule Report Modal */}
      <ScheduleReportModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleScheduleReport}
      />
    </div>
  );
};

export default ReportsPage;
