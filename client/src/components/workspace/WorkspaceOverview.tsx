import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import { getProjects as getWorkspaceProjects } from '../../services/projectService';
import { apiService } from '../../services/api';
import { format } from 'date-fns';
import {
  FolderKanban,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  FileText,
  Sparkles,
  Edit3
} from 'lucide-react';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AttendanceStats {
  present: number;
  absent: number;
  wfh: number;
  total: number;
}

const WorkspaceOverview: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode, preferences } = useTheme();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({ present: 0, absent: 0, wfh: 0, total: 0 });
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  const currentWorkspace = state.workspaces.find(w => w._id === state.currentWorkspace);
  const workspaceProjects = state.projects.filter(
    (project) => project.workspace === state.currentWorkspace
  );

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!state.currentWorkspace) return;

      try {
        setLoadingAttendance(true);
        const today = format(new Date(), 'yyyy-MM-dd');
        const response = await apiService.get(`/workspace-attendance/workspace/${state.currentWorkspace}/date/${today}`);

        const records = Array.isArray(response.data) ? response.data : (response.data.data || []);

        let present = 0, absent = 0, wfh = 0;

        records.forEach((record: any) => {
          if (record.slots && record.slots.length > 0) {
            const status = record.slots[0].status;
            if (status === 'present') present++;
            else if (status === 'work-from-home') wfh++;
            else if (status === 'absent') absent++;
          }
        });

        setAttendanceStats({ present, absent, wfh, total: records.length });
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAttendance();
  }, [state.currentWorkspace]);

  // Fetch recent notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notes = await apiService.get('/notes') as unknown as Note[];
        setRecentNotes(notes.slice(0, 3)); // Get 3 most recent
        setLoadingNotes(false);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        setLoadingNotes(false);
      }
    };
    fetchNotes();
  }, []);

  // Fetch workspace projects from backend to ensure data is synced
  useEffect(() => {
    const loadWorkspaceProjects = async () => {
      if (!state.currentWorkspace) return;

      try {
        console.log('[WorkspaceOverview] Fetching projects for workspace:', state.currentWorkspace);
        const projects = await getWorkspaceProjects(state.currentWorkspace);
        console.log('[WorkspaceOverview] Fetched projects:', projects.length);

        // Transform projects to match state type (convert createdBy object to string)
        const transformedProjects = projects.map((project: any) => ({
          ...project,
          createdBy: typeof project.createdBy === 'object' ? project.createdBy._id : project.createdBy
        }));

        // Update the projects in state
        dispatch({ type: 'SET_PROJECTS', payload: transformedProjects });
      } catch (error) {
        console.error('[WorkspaceOverview] Failed to load workspace projects:', error);
      }
    };

    loadWorkspaceProjects();
  }, [state.currentWorkspace, dispatch]);

  const isOwner = currentWorkspace?.owner === state.userProfile._id;

  // Calculate stats
  const activeProjects = workspaceProjects.filter(p => p.status === 'active').length;
  const completedProjects = workspaceProjects.filter(p => p.status === 'completed').length;
  const totalTasks = workspaceProjects.reduce((sum, p) => sum + p.totalTasksCount, 0);
  const completedTasks = workspaceProjects.reduce((sum, p) => sum + p.completedTasksCount, 0);
  const avgProgress = workspaceProjects.length > 0
    ? Math.round(workspaceProjects.reduce((sum, p) => sum + p.progress, 0) / workspaceProjects.length)
    : 0;

  const stats = [
    {
      key: 'activeProjects',
      label: t('workspace.overview.activeProjects'),
      value: activeProjects,
      icon: FolderKanban,
      color: 'text-accent-dark',
      bgColor: 'bg-blue-100',
      change: '+4% MoM'
    },
    {
      key: 'utilization',
      label: t('workspace.overview.utilization'),
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+2% MoM'
    },
    {
      key: 'completedProjects',
      label: t('workspace.overview.completedProjects'),
      value: completedProjects,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: `${workspaceProjects.length} total`
    },
    {
      key: 'totalTasks',
      label: t('workspace.overview.totalTasks'),
      value: totalTasks,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: `${completedTasks} completed`
    }
  ];

  // Get upcoming project deadlines as milestones
  const upcomingMilestones = workspaceProjects
    .filter(p => p.dueDate && new Date(p.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      date: new Date(p.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      project: p.name,
      type: p.status
    }));

  return (
    <div className="p-6 space-y-6">
      {/* Workspace Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-gray-900 font-bold text-xl">
              {currentWorkspace?.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currentWorkspace?.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-200">
                {t('workspace.overview.viewingWorkspace')}
              </p>
            </div>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => navigate(`/workspace/${state.currentWorkspace}/projects/new`)}
            style={{
              background: `linear-gradient(135deg, ${preferences.accentColor} 0%, ${preferences.accentColor}dd 100%)`
            }}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            <Plus className="w-5 h-5" />
            {t('workspace.overview.newProject')}
          </button>
        )}
      </div>

      {/* Analytics Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('workspace.overview.analytics')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassmorphicCard key={index} hoverEffect={true} className="p-6 group relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</span>
                  <div className={`p-3 rounded-xl ${stat.bgColor} shadow-lg`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color === 'text-accent-dark' ? 'from-blue-600 to-purple-600' : stat.color === 'text-green-600' ? 'from-green-600 to-emerald-600' : 'from-purple-600 to-pink-600'} bg-clip-text text-transparent`}>{stat.value}</div>
                    <div className="text-xs text-green-600 mt-1 font-semibold">{stat.change}</div>
                  </div>
                  {/* Progress bar for some stats */}
                  {stat.key === 'activeProjects' && (
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: '72%', background: `linear-gradient(90deg, ${preferences.accentColor}, ${preferences.accentColor}dd)` }} />
                    </div>
                  )}
                  {stat.key === 'utilization' && (
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-600 to-emerald-600" style={{ width: avgProgress + '%' }} />
                    </div>
                  )}
                </div>
              </GlassmorphicCard>
            );
          })}
        </div>
      </div>

      {/* Attendance Section */}
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today's Attendance</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          {attendanceStats.total > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Present</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Absent</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{attendanceStats.wfh}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">WFH</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{attendanceStats.total}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No attendance data available for today
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('workspace.overview.projectProgress')}
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-600">
            {t('workspace.overview.chartPlaceholder')}
          </div>
        </div>

        {/* AI Notes Widget */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                AI Notes
              </h3>
            </div>
            <button
              onClick={() => navigate('/notes')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All
            </button>
          </div>

          {loadingNotes ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                No notes yet. Create your first AI-powered note!
              </p>
              <button
                onClick={() => navigate('/notes')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Create Note
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {recentNotes.map((note) => (
                  <div
                    key={note._id}
                    onClick={() => navigate('/notes')}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-2">
                      <Edit3 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                          {note.title || 'Untitled'}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                          {note.content || 'No content'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/notes')}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium"
              >
                <Sparkles className="w-4 h-4 inline mr-1" />
                Create AI Note
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Milestones - moved to its own row */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('workspace.overview.upcomingMilestones')}
            </h3>
            <button className="text-sm text-accent-dark hover:text-blue-700">{t('workspace.overview.view')}</button>
          </div>
          <div className="space-y-3">
            {upcomingMilestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Clock className="w-4 h-4 text-gray-600 mt-1" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{milestone.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-200">{milestone.date}</div>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  {milestone.project}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('navigation.projects')}</h2>
          <button
            onClick={() => navigate(`/workspace/${state.currentWorkspace}/projects`)}
            className="text-sm text-accent-dark hover:text-blue-700"
          >
            {t('workspace.overview.viewAll')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaceProjects.slice(0, 6).map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/project/${project._id}`)}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                  }`}>
                  {project.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                  <span>{t('common.progress')}</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Project Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-200">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{project.completedTasksCount}/{project.totalTasksCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{project.teamMemberCount}</span>
                </div>
                {project.priority === 'critical' && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>{t('common.critical')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceOverview;
