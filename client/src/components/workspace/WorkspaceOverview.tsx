import React from 'react';
import { useApp } from '../../context/AppContext';
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
import { useNavigate } from 'react-router-dom';

const WorkspaceOverview: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  const currentWorkspace = state.workspaces.find(w => w._id === state.currentWorkspace);
  const workspaceProjects = state.projects.filter(p => p.workspace === state.currentWorkspace);
  
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
      label: 'Active Projects',
      value: activeProjects,
      icon: FolderKanban,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+4% MoM'
    },
    {
      label: 'Utilization',
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+2% MoM'
    },
    {
      label: 'Burn Rate',
      value: '$18.4k',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+4% MoM'
    },
    {
      label: 'Revenue (MTD)',
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
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {currentWorkspace?.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currentWorkspace?.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You are viewing the workspace area
              </p>
            </div>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => navigate(`/workspace/${state.currentWorkspace}/projects/new`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Analytics Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
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
                  {stat.label === 'Active Projects' && (
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: '72%' }} />
                    </div>
                  )}
                  {stat.label === 'Utilization' && (
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
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
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Project Progress
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart placeholder - Project timeline and progress visualization
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Upcoming Milestones
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">View</button>
          </div>
          <div className="space-y-3">
            {upcomingMilestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Clock className="w-4 h-4 text-gray-400 mt-1" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{milestone.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{milestone.date}</div>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
          <button
            onClick={() => navigate(`/workspace/${state.currentWorkspace}/projects`)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaceProjects.slice(0, 6).map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/project/${project._id}`)}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
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
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Project Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
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
                    <span>Critical</span>
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
