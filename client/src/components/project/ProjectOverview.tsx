import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import ProjectPageSkeleton from './ProjectPageSkeleton';
import { ContextAIButton } from '../ai/ContextAIButton';
import { Github, Link as LinkIcon, X as XIcon } from 'lucide-react';
import GitHubRepoSelector from '../github/GitHubRepoSelector';
import GitHubSyncStatus from '../github/GitHubSyncStatus';
import CommitsFeed from '../github/CommitsFeed';
import { apiService } from '../../services/api';

const ProjectOverview: React.FC = () => {
  const { t } = useTranslation();
  const { state, addToast } = useApp();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  const project = state.projects.find(p => p._id === projectId);

  const handleUnlinkRepo = async (repoId: string) => {
    try {
      if (!window.confirm(t('project.overview.confirmUnlinkRepo') || 'Are you sure you want to unlink this repository?')) return;

      const response = await apiService.delete(`/projects/${projectId}/unlink-repo/${repoId}`);
      if (response.success) {
        addToast('Repository unlinked successfully', 'success');
        window.location.reload();
      } else {
        addToast(response.message || 'Failed to unlink repository', 'error');
      }
    } catch (error: any) {
      addToast(error.message || 'Error unlinking repository', 'error');
    }
  };

  // Simulate loading for smooth skeleton display
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [projectId]);

  if (loading) {
    return <ProjectPageSkeleton type="overview" />;
  }

  if (!project) return null;

  const stats = [
    {
      label: t('project.overview.totalTasks'),
      value: project.totalTasksCount || 0,
      icon: CheckCircle,
      color: 'text-accent-dark',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: t('project.overview.completed'),
      value: project.completedTasksCount || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      label: t('project.overview.inProgress'),
      value: (project.totalTasksCount || 0) - (project.completedTasksCount || 0),
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-200 dark:bg-orange-900/30'
    },
    {
      label: t('project.overview.teamMembers'),
      value: project.teamMemberCount || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  // Get milestones from project data (if available)
  const milestones = (project as any).milestones || [];
  const activeMilestones = milestones; // Define alias for cleaner usage below

  // Get recent activity from project data (if available)
  const recentActivity = (project as any).recentActivity || [];

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
          {milestones.length > 0 ? (
            <div className="space-y-3">
              {milestones.map((milestone: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${milestone.status === 'completed' ? 'bg-green-500' :
                    milestone.status === 'in-progress' ? 'bg-accent' :
                      'bg-gray-300'
                    }`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{milestone.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-200">{milestone.date}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${milestone.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-600' :
                    milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-accent-light' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-200'
                    }`}>
                    {milestone.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('projects.noMilestones')}
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('project.overview.recentActivity')}
            </h2>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity: any, index: number) => (
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
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('projects.noRecentActivity')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('project.overview.quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate(`/project/${projectId}/progress`)}
            className="flex flex-col items-center gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <CheckCircle className="w-6 h-6 text-accent-dark" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('project.overview.addTask')}</span>
          </button>
          <button
            onClick={() => navigate(`/project/${projectId}/team`)}
            className="flex flex-col items-center gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Users className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('project.overview.addMember')}</span>
          </button>
          <button
            onClick={() => navigate(`/project/${projectId}/progress`)}
            className="flex flex-col items-center gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('project.overview.schedule')}</span>
          </button>
          <button
            onClick={() => navigate(`/project/${projectId}/reports`)}
            className="flex flex-col items-center gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('project.overview.viewReports')}</span>
          </button>
        </div>
      </div>

      {/* GitHub Integration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Github className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            GitHub Repositories
          </h2>
          <button
            onClick={() => setShowGitHubModal(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <LinkIcon className="w-4 h-4" />
            Link Repository
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(project as any).integrations?.github?.repos && (project as any).integrations.github.repos.length > 0 ? (
            (project as any).integrations.github.repos.map((repo: any) => (
              <GitHubSyncStatus
                key={repo._id}
                repo={repo}
                onUnlink={() => handleUnlinkRepo(repo._id)}
                onSync={() => { }} // Placeholder for now
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <Github className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">No repositories linked</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Link a GitHub repository to auto-sync tasks and PRs</p>
            </div>
          )}
        </div>

        {/* Team Commits Feed */}
        {(project as any).integrations?.github?.repos && (project as any).integrations.github.repos.length > 0 && (
          <div className="mt-6">
            <CommitsFeed projectId={projectId!} limit={15} />
          </div>
        )}
      </div>

      {/* GitHub Modal */}
      {showGitHubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Link GitHub Repository</h3>
              <button onClick={() => setShowGitHubModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <GitHubRepoSelector
                projectId={projectId!}
                linkedRepos={(project as any).integrations?.github?.repos || []}
                onLink={(repo) => {
                  // Refresh project data or manually update local state
                  // For now simply close modal or show success
                  // But really we should reload project context. 
                  // Since useApp handles state, we might need to fetchProject again.
                  // But we don't have updateProject in context visible here easily without calling API.
                  // reloadPage(); instead?
                  window.location.reload(); // Brute force refresh for now to pick up changes
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Context-Aware AI Assistant */}
      <ContextAIButton
        pageData={{
          projectName: project.name,
          status: project.status,
          progress: project.progress,
          teamSize: project.teamMemberCount || 0,
          milestones: activeMilestones.map((m: any) => ({
            name: m.name,
            status: m.status,
            date: m.date
          })),
          recentActivity: recentActivity.slice(0, 5).map((a: any) => ({
            user: a.user,
            action: a.action,
            item: a.item
          }))
        }}
      />
    </div>
  );
};

export default ProjectOverview;
