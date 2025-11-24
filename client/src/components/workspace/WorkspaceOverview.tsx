import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { getProjects as getWorkspaceProjects } from '../../services/projectService';
import { 
  FolderKanban, 
  Users, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

const WorkspaceOverview: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const currentWorkspace = state.workspaces.find(w => w._id === state.currentWorkspace);
  const workspaceProjects = state.projects.filter(
    (project) => project.workspace === state.currentWorkspace
  );

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
      key: 'burnRate',
      label: t('workspace.overview.burnRate'),
      value: '$18.4k',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-200',
      change: '+4% MoM'
    },
    {
      key: 'revenue',
      label: t('workspace.overview.revenue'),
      value: '$42.7k',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+9% MoM'
    }
  ];

  const upcomingMilestones = [
    { name: 'Site handoff', date: 'Oct 23', project: 'NovaTech', type: 'internal' },
    { name: 'Payroll cycle close', date: 'Dec 30', project: 'Internal', type: 'internal' }
  ];

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

        {/* Upcoming Milestones */}
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
