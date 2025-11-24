import React from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle,
  Clock,
  Users,
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

import { useTranslation } from 'react-i18next';

const ProjectOverview: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useApp();
  const { projectId } = useParams();
  
  const project = state.projects.find(p => p._id === projectId);

  if (!project) return null;

  const stats = [
    {
      label: t('project.overview.totalTasks'),
      value: project.totalTasksCount,
      icon: CheckCircle,
      color: 'text-accent-dark',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: t('project.overview.completed'),
      value: project.completedTasksCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      label: t('project.overview.inProgress'),
      value: project.totalTasksCount - project.completedTasksCount,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-200 dark:bg-orange-900/30'
    },
    {
      label: t('project.overview.teamMembers'),
      value: project.teamMemberCount,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  const milestones = [
    { name: 'Phase 1 Complete', date: '2024-04-15', status: 'completed' },
    { name: 'Beta Release', date: '2024-05-20', status: 'in-progress' },
    { name: 'Final Launch', date: '2024-06-30', status: 'pending' }
  ];

  const recentActivity = [
    { user: 'John Doe', action: 'completed task', item: 'API Integration', time: '2 hours ago' },
    { user: 'Jane Smith', action: 'added comment on', item: 'UI Design', time: '4 hours ago' },
    { user: 'Bob Wilson', action: 'updated status of', item: 'Database Schema', time: '1 day ago' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Project Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">{project.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-200">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Progress Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('project.overview.projectProgress')}</h2>
          <span className="text-2xl font-bold text-accent-dark">{project.progress}%</span>
        </div>
        <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-200">{t('project.overview.startDate')}</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : t('project.overview.notSet')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-200">{t('project.overview.dueDate')}</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : t('project.overview.notSet')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-200">{t('project.overview.daysRemaining')}</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {project.dueDate ? Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Target className="w-5 h-5" />
              {t('project.overview.milestones')}
            </h2>
          </div>
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className={`w-3 h-3 rounded-full ${
                  milestone.status === 'completed' ? 'bg-green-500' :
                  milestone.status === 'in-progress' ? 'bg-accent' :
                  'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{milestone.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-200">{milestone.date}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  milestone.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-600' :
                  milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-accent-light' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-200'
                }`}>
                  {milestone.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('project.overview.recentActivity')}
            </h2>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-accent-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('project.overview.quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <CheckCircle className="w-6 h-6 text-accent-dark" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('project.overview.addTask')}</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Users className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('project.overview.addMember')}</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Calendar className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('project.overview.schedule')}</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('project.overview.viewReports')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
