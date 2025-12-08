import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { getProjects as getWorkspaceProjects } from '../../services/projectService';
import { apiService } from '../../services/api';
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

const WorkspaceOverview: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const currentWorkspace = state.workspaces.find(w => w._id === state.currentWorkspace);
  const workspaceProjects = state.projects.filter(
    (project) => project.workspace === state.currentWorkspace
  );

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

  // Ensure projects for the active workspace are loaded from the backend
  // so they persist in MongoDB and are available after page refresh.
  useEffect(() => {
    const loadWorkspaceProjects = async () => {
      if (!state.currentWorkspace) return;
      try {
        const projects = await getWorkspaceProjects(state.currentWorkspace);
        // We intentionally replace the current project list so overview
        // stays in sync with the backend.
        (state as any).dispatch?.({ type: 'SET_PROJECTS', payload: projects });
      } catch (error) {
        console.error('Failed to load workspace projects for overview', error);
      }
    };

    // Only run if we have a workspace and a dispatch function exposed
    // (when using the hook outside of the AppProvider this will be undefined).
    if ((state as any)?.currentWorkspace && (state as any)?.dispatch) {
      loadWorkspaceProjects();
    }
  }, [state]);

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
            className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
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
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-200">{stat.label}</span>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                    <div className="text-xs text-green-600 mt-1">{stat.change}</div>
                  </div>
                  {/* Progress bar for some stats */}
                  {stat.key === 'activeProjects' && (
                    <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: '72%' }} />
                    </div>
                  )}
                  {stat.key === 'utilization' && (
                    <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600" style={{ width: avgProgress + '%' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Attendance</h2>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          {isOwner ? (
            <div className="space-y-6">
              {/* Owner Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Check-In Time (Opens for 1 hour)
                  </label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Window: 9:00 AM - 10:00 AM
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Check-Out Time (Opens for 1 hour)
                  </label>
                  <input
                    type="time"
                    defaultValue="17:00"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Window: 5:00 PM - 6:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-600">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Today's Attendance
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">0</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">WFH</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Mark your attendance for today
              </p>
              <div className="flex items-center justify-center gap-4">
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Check In
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Check Out
                </button>
              </div>
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
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'active' ? 'bg-green-100 text-green-700' :
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
