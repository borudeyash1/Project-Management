import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Search, Filter, Calendar, Clock, Target, Users,
  TrendingUp, BarChart3, MoreVertical, Edit, Trash2,
  Eye, Star, Flag, Tag, MessageSquare, FileText,
  Grid, List, SortAsc, SortDesc, Archive, Play, Pause,
  CheckCircle, AlertCircle, Zap, Bot, Crown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDock } from '../context/DockContext';
import { WorkspaceCreationRestriction } from './FeatureRestriction';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useRefreshData } from '../hooks/useRefreshData';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import CreateProjectModal from './CreateProjectModal';
import {
  getProjects,
  createProject as createProjectApi,
  updateProject as updateProjectApi,
  deleteProject as deleteProjectApi,
  Project as ApiProject,
  ProjectFilters,
} from '../services/projectService';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: Date;
  endDate: Date;
  budget: {
    estimated: number;
    actual: number;
    currency: string;
  };
  team: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
  tags: string[];
  owner: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useApp();
  const { dockPosition } = useDock();
  const { canCreateProject } = useFeatureAccess();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'dueDate' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [processingProjectId, setProcessingProjectId] = useState<string | null>(null);

  const activeWorkspaceId = useMemo(() => {
    if ((state as any)?.currentWorkspaceId) {
      return (state as any).currentWorkspaceId;
    }
    const matchByName = state.workspaces?.find((ws) => ws.name === state.currentWorkspace);
    return matchByName?._id || state.workspaces?.[0]?._id;
  }, [state.currentWorkspace, state.workspaces]);

  const loadProjects = useCallback(async () => {
    try {
      if (!activeWorkspaceId) {
        setError(t('messages.noWorkspace'));
        setProjects([]);
        setFilteredProjects([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const filters: ProjectFilters = {};
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      const response = await getProjects(activeWorkspaceId, filters);
      const normalized = response.map((project: ApiProject) => {
        const rawOwner = (project as any).createdBy || (project as any).owner || {};
        const rawTeam = (project as any).teamMembers || (project as any).team || [];
        const start = project.startDate || (project as any).startDate || new Date().toISOString();
        const due = project.dueDate || (project as any).endDate || new Date().toISOString();

        return {
          _id: project._id,
          name: project.name,
          description: project.description || 'No description provided',
          status: (project.status as Project['status']) || 'active',
          priority: (project.priority as Project['priority']) || 'medium',
          progress: project.progress ?? 0,
          startDate: new Date(start),
          endDate: new Date(due),
          budget: (project as any).budget || { estimated: 0, actual: 0, currency: 'USD' },
          team: Array.isArray(rawTeam)
            ? rawTeam.map((member: any) => ({
              _id: member.user?._id || member._id,
              name: member.user?.fullName || member.name || 'Member',
              avatar: member.user?.avatarUrl || member.avatar,
            }))
            : [],
          tags: project.tags || [],
          owner: {
            _id: rawOwner._id || 'owner',
            name: rawOwner.fullName || rawOwner.name || 'Owner',
            avatar: rawOwner.avatarUrl || rawOwner.avatar,
          },
          createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
          updatedAt: project.updatedAt ? new Date(project.updatedAt) : new Date(),
        };
      });
      setProjects(normalized);
      setFilteredProjects(normalized);
    } catch (err: any) {
      console.error('Failed to load projects', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, activeWorkspaceId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Enable refresh button for this page
  useRefreshData(loadProjects, [loadProjects]);

  // Filter and search projects
  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(project => project.priority === selectedPriority);
    }

    // Sort projects
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'dueDate':
          aValue = a.endDate.getTime();
          bValue = b.endDate.getTime();
          break;
        case 'created':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedStatus, selectedPriority, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-200';
      case 'medium': return 'text-yellow-800 bg-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getDaysUntilDue = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreateProject = async (projectData: any) => {
    if (!activeWorkspaceId) {
      dispatch({
        type: 'ADD_TOAST',
        payload: { type: 'error', message: t('messages.noWorkspace') },
      });
      return;
    }

    try {
      setCreatingProject(true);
      await createProjectApi({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        priority: projectData.priority,
        startDate: projectData.startDate,
        dueDate: projectData.endDate,
        budget: projectData.budget,
        tags: projectData.tags,
        workspaceId: activeWorkspaceId,
      } as any);
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: t('messages.projectCreated') } });
      setShowCreateModal(false);
      await loadProjects();
    } catch (err: any) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.message || t('messages.createFailed') } });
    } finally {
      setCreatingProject(false);
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, status: Project['status']) => {
    try {
      setProcessingProjectId(projectId);
      await updateProjectApi(projectId, { status });
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: t('messages.projectStatusUpdated') } });
      await loadProjects();
    } catch (err: any) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.message || t('messages.updateFailed') } });
    } finally {
      setProcessingProjectId(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmDelete = window.confirm(t('messages.confirmDeleteProject'));
    if (!confirmDelete) return;

    try {
      setProcessingProjectId(projectId);
      await deleteProjectApi(projectId);
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: t('messages.projectDeleted') } });
      await loadProjects();
    } catch (err: any) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.message || t('messages.deleteFailed') } });
    } finally {
      setProcessingProjectId(null);
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/project-view/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/project-view/${projectId}`);
  };

  return (
    <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('projects.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('descriptions.projects')}</p>
          </div>
          <div className="flex items-center gap-3">
            {canCreateProject() ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('projects.newProject')}
              </button>
            ) : (
              <WorkspaceCreationRestriction>
                <div />
              </WorkspaceCreationRestriction>
            )}
          </div>
        </div>
      </div>

      <div
        className="p-6 transition-all duration-300"
        style={{
          paddingLeft: dockPosition === 'left' ? '100px' : undefined,
          paddingRight: dockPosition === 'right' ? '100px' : undefined
        }}
      >
        {/* Filters and Search */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 mb-6`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder={t('projects.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="all">{t('projects.allStatus')}</option>
                <option value="planning">{t('projects.planning')}</option>
                <option value="active">{t('projects.active')}</option>
                <option value="on-hold">{t('projects.onHold')}</option>
                <option value="completed">{t('projects.completed')}</option>
                <option value="cancelled">{t('projects.cancelled')}</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="all">{t('projects.allPriority')}</option>
                <option value="urgent">{t('projects.urgent')}</option>
                <option value="high">{t('projects.high')}</option>
                <option value="medium">{t('projects.medium')}</option>
                <option value="low">{t('projects.low')}</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="name-asc">{t('sort.nameAsc')}</option>
                <option value="name-desc">{t('sort.nameDesc')}</option>
                <option value="progress-desc">{t('sort.progressDesc')}</option>
                <option value="progress-asc">{t('sort.progressAsc')}</option>
                <option value="dueDate-asc">{t('sort.dueDateAsc')}</option>
                <option value="dueDate-desc">{t('sort.dueDateDesc')}</option>
                <option value="created-desc">{t('sort.createdDesc')}</option>
                <option value="created-asc">{t('sort.createdAsc')}</option>
              </select>

              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-accent-dark' : 'text-gray-600 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-accent-dark' : 'text-gray-600 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading ? (
          <ProjectSkeletonGrid />
        ) : error ? (
          <div className={`max-w-lg mx-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 text-center`}>
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('projects.loadError')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadProjects}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
            >
              {t('messages.tryAgain')}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div key={project._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{project.description}</p>
                  </div>
                  <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{project.tags.length - 3}</span>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{t('projects.progress')}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {t('projects.' + (project.status === 'on-hold' ? 'onHold' : project.status))}
                  </span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {t('projects.' + project.priority)}
                  </span>
                </div>

                {/* Team Members */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map(member => (
                      <img
                        key={member._id}
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                    ))}
                    {project.team.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{project.team.length} {t('common.members')}</span>
                </div>

                {/* Budget and Due Date */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('projects.budget')}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(project.budget.actual, project.budget.currency)} / {formatCurrency(project.budget.estimated, project.budget.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('projects.dueDate')}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-300 dark:border-gray-700 flex-wrap">
                  <button
                    onClick={() => handleViewProject(project._id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg ${isDarkMode
                      ? 'text-gray-300 border-gray-600 hover:bg-gray-700'
                      : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <Eye className="w-4 h-4" />
                    {t('common.view')}
                  </button>
                  <button
                    onClick={() => handleEditProject(project._id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg ${isDarkMode
                      ? 'text-gray-300 border-gray-600 hover:bg-gray-700'
                      : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <Edit className="w-4 h-4" />
                    {t('common.edit')}
                  </button>
                  {project.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateProjectStatus(project._id, 'completed')}
                      disabled={processingProjectId === project._id}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg ${isDarkMode
                        ? 'text-green-700 border-green-600 hover:bg-green-900/40'
                        : 'text-green-600 border-green-300 hover:bg-green-50'
                        } ${processingProjectId === project._id ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t('common.complete')}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    disabled={processingProjectId === project._id}
                    className={`flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg ${isDarkMode
                      ? 'text-red-700 border-red-600 hover:bg-red-900/40'
                      : 'text-red-600 border-red-300 hover:bg-red-50'
                      } ${processingProjectId === project._id ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('projects.title')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('projects.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('projects.progress')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('projects.team')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('projects.dueDate')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('projects.budget')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProjects.map(project => (
                    <tr key={project._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{project.description}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {project.tags.length > 2 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">+{project.tags.length - 2}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {t('projects.' + (project.status === 'on-hold' ? 'onHold' : project.status))}
                          </span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {t('projects.' + project.priority)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-300 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {project.team.slice(0, 3).map(member => (
                              <img
                                key={member._id}
                                src={member.avatar}
                                alt={member.name}
                                className="w-6 h-6 rounded-full border border-white"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{project.team.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(project.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(project.budget.actual, project.budget.currency)} / {formatCurrency(project.budget.estimated, project.budget.currency)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => handleViewProject(project._id)}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-600" onClick={() => handleEditProject(project._id)}>
                            <Edit className="w-4 h-4" />
                          </button>
                          {project.status !== 'completed' && (
                            <button
                              className={`text-green-500 hover:text-green-700 ${processingProjectId === project._id ? 'opacity-60 cursor-not-allowed' : ''}`}
                              onClick={() => handleUpdateProjectStatus(project._id, 'completed')}
                              disabled={processingProjectId === project._id}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className={`text-red-500 hover:text-red-700 ${processingProjectId === project._id ? 'opacity-60 cursor-not-allowed' : ''}`}
                            onClick={() => handleDeleteProject(project._id)}
                            disabled={processingProjectId === project._id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
              <Target className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('projects.noProjects')}</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all'
                ? t('projects.adjustFilters')
                : t('projects.createFirst')}
            </p>
            {canCreateProject() && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
              >
                <Plus className="w-4 h-4" />
                {t('projects.createProject')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        isSubmitting={creatingProject}
      />
    </div>
  );
};

export default ProjectsPage;

const ProjectSkeletonGrid: React.FC = () => {
  const skeletonCards = Array.from({ length: 6 });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletonCards.map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-6 animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
          </div>
          <div className="h-2 bg-gray-300 rounded w-full" />
        </div>
      ))}
    </div>
  );
};
