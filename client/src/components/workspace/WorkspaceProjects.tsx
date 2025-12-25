import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useDock } from '../../context/DockContext';
import WorkspaceCreateProjectModal from '../WorkspaceCreateProjectModal';
import { getProjects as getWorkspaceProjects, createProject as createWorkspaceProject } from '../../services/projectService';
import apiService from '../../services/api';
import {
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Play,
  Pause,
  Archive,
  X
} from 'lucide-react';
import { ContextAIButton } from '../ai/ContextAIButton';

const WorkspaceProjects: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { dockPosition } = useDock();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Rename State
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<{ id: string; name: string } | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const currentWorkspace = state.workspaces.find((w) => w._id === state.currentWorkspace);
  const isOwner = currentWorkspace?.owner === state.userProfile._id;
  const workspaceProjects = state.projects.filter((p) => p.workspace === state.currentWorkspace);

  // Load projects for the current workspace from the backend so they
  // persist in MongoDB and are restored after refresh.
  useEffect(() => {
    const loadWorkspaceProjects = async () => {
      if (!state.currentWorkspace) return;
      try {
        const projects = await getWorkspaceProjects(state.currentWorkspace);
        dispatch({ type: 'SET_PROJECTS', payload: projects as any });
      } catch (error) {
        console.error('Failed to load workspace projects', error);
      }
    };

    loadWorkspaceProjects();
  }, [state.currentWorkspace, dispatch]);

  // Load clients for the current workspace so they're available in the project modal
  useEffect(() => {
    const loadWorkspaceClients = async () => {
      if (!state.currentWorkspace) return;
      try {
        const clients = await apiService.getClients(state.currentWorkspace);
        dispatch({ type: 'SET_CLIENTS', payload: clients });
      } catch (error) {
        console.error('Failed to load workspace clients', error);
      }
    };

    loadWorkspaceClients();
  }, [state.currentWorkspace, dispatch]);

  const filteredProjects = workspaceProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-600';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-accent-light';
      case 'on-hold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-600';
      case 'planning': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-600';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleDeleteProject = (project: any) => {
    setProjectToDelete(project);
    setDeleteConfirmText('');
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText.toUpperCase() !== 'DELETE') {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Please type DELETE to confirm',
        },
      });
      return;
    }

    if (!projectToDelete) return;

    try {
      const response = await fetch(`/api/projects/${projectToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete project');
      }

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Project deleted successfully',
        },
      });

      setShowDeleteModal(false);
      setProjectToDelete(null);
      setDeleteConfirmText('');

      // Remove from global state instead of reload
      // Assuming DELETE_PROJECT action exists, if not we reload or filter
      // ProjectService usually handles this via refresh or optimized state update. 
      // Current impl reloads window. I will keep reload or try to filter.
      // reload is safer for now as per existing code.
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to delete project', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to delete project',
        },
      });
    }
  };

  const handleRenameProject = (project: any) => {
    setProjectToRename({ id: project._id, name: project.name });
    setNewProjectName(project.name);
    setRenameModalOpen(true);
  };

  const submitRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectToRename || !newProjectName.trim()) return;

    try {
      setProcessingId(projectToRename.id);
      const response = await fetch(`/api/projects/${projectToRename.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ name: newProjectName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to rename project');
      }

      dispatch({
        type: 'UPDATE_PROJECT',
        payload: { projectId: projectToRename.id, updates: { name: newProjectName } },
      });

      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Project renamed successfully' } });

      setRenameModalOpen(false);
      setProjectToRename(null);
    } catch (error: any) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: error.message || 'Failed to rename project' } });
    } finally {
      setProcessingId(null);
    }
  };

  const stats = [
    { label: t('workspace.projects.stats.totalProjects'), value: workspaceProjects.length, color: 'text-accent-dark' },
    { label: t('workspace.projects.stats.active'), value: workspaceProjects.filter(p => p.status === 'active').length, color: 'text-green-600' },
    { label: t('workspace.projects.stats.completed'), value: workspaceProjects.filter(p => p.status === 'completed').length, color: 'text-purple-600' },
    { label: t('workspace.projects.stats.onHold'), value: workspaceProjects.filter(p => p.status === 'on-hold').length, color: 'text-yellow-600' }
  ];

  return (
    <div className={`space-y-6 transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px] pr-4 sm:pr-6 py-4 sm:py-6' :
      dockPosition === 'right' ? 'pr-[71px] pl-4 sm:pl-6 py-4 sm:py-6' :
        'p-4 sm:p-6'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('workspace.projects.title')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t('workspace.projects.subtitle')}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('workspace.projects.createProject')}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            placeholder={t('workspace.projects.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent"
          >
            <option value="all">{t('workspace.projects.filter.allStatus')}</option>
            <option value="active">{t('workspace.projects.status.active')}</option>
            <option value="planning">{t('workspace.projects.status.planning')}</option>
            <option value="on-hold">{t('workspace.projects.status.onHold')}</option>
            <option value="completed">{t('workspace.projects.status.completed')}</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent"
          >
            <option value="all">{t('workspace.projects.filter.allPriority')}</option>
            <option value="critical">{t('common.critical')}</option>
            <option value="high">{t('common.high')}</option>
            <option value="medium">{t('common.medium')}</option>
            <option value="low">{t('common.low')}</option>
          </select>

          <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-accent-dark' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-accent-dark' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-5 transition-all cursor-pointer group"
              onClick={() => navigate(`/project/${project._id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-accent-dark">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(project.priority)} border-current`}>
                  {project.priority}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                  <span>{t('workspace.projects.table.progress')}</span>
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
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>{project.completedTasksCount}/{project.totalTasksCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{project.teamMemberCount}</span>
                  </div>
                </div>
                {project.dueDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(project.dueDate).toLocaleDateString(i18n.language)}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex items-center gap-1 mt-3 flex-wrap">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-xs text-gray-600">+{project.tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Edit and Delete Buttons */}
              {isOwner && (
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/project/${project._id}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    {t('workspace.projects.view')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameProject(project);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    {t('workspace.projects.rename')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('workspace.projects.table.project')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('workspace.projects.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('workspace.projects.table.priority')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('workspace.projects.table.progress')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('workspace.projects.table.team')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('workspace.projects.table.dueDate')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('workspace.projects.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProjects.map((project) => (
                <tr
                  key={project._id}
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{project.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{project.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-200">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-200">{project.teamMemberCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-200">
                      {project.dueDate ? new Date(project.dueDate).toLocaleDateString(i18n.language) : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isOwner && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/project/${project._id}`);
                          }}
                          className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title={t('workspace.projects.view')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameProject(project);
                          }}
                          className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title={t('workspace.projects.rename')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title={t('workspace.projects.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">
            <Grid className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t('workspace.projects.empty.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
              ? t('workspace.projects.empty.filterMessage')
              : t('workspace.projects.empty.startMessage')}
          </p>
          {isOwner && !searchQuery && filterStatus === 'all' && filterPriority === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('workspace.projects.createProject')}
            </button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <WorkspaceCreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (projectData) => {
          if (!state.currentWorkspace) {
            dispatch({
              type: 'ADD_TOAST',
              payload: {
                type: 'error',
                message: t('workspace.projects.toastExtended.noWorkspace'),
              },
            });
            return;
          }

          try {
            const created = await createWorkspaceProject({
              name: projectData.name,
              description: projectData.description,
              clientId: projectData.clientId,
              projectManager: projectData.projectManagerId,
              status: projectData.status,
              priority: projectData.priority,
              startDate: projectData.startDate,
              dueDate: projectData.endDate,
              budget: projectData.budget,
              tags: projectData.tags,
              workspaceId: state.currentWorkspace,
            } as any);

            // Add the created project from MongoDB into global state
            dispatch({
              type: 'ADD_PROJECT',
              payload: created as any,
            });

            dispatch({
              type: 'ADD_TOAST',
              payload: {
                type: 'success',
                message: t('workspace.projects.toastExtended.createSuccess', { name: projectData.name }),
              },
            });
          } catch (error: any) {
            console.error('Failed to create workspace project', error);
            dispatch({
              type: 'ADD_TOAST',
              payload: {
                type: 'error',
                message: error?.message || t('workspace.projects.toastExtended.createError'),
              },
            });
          }
        }}
        workspaceId={state.currentWorkspace || ''}
      />

      {/* Rename Modal */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-2xl transform transition-all border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('workspace.projects.modals.rename.title')}</h3>

            <form onSubmit={submitRename}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {t('workspace.projects.modals.rename.nameLabel')}
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder={t('workspace.projects.modals.rename.placeholder')}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t('workspace.projects.modals.rename.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim() || processingId === projectToRename?.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === projectToRename?.id ? t('workspace.projects.modals.rename.renaming') : t('workspace.projects.modals.rename.confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('workspace.projects.modals.delete.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('workspace.projects.modals.delete.description', { name: projectToDelete.name })}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t('workspace.projects.modals.delete.typeToConfirm')}
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={t('workspace.projects.modals.delete.placeholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProjectToDelete(null);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('workspace.projects.modals.delete.cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText.toUpperCase() !== 'DELETE'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('workspace.projects.modals.delete.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context-Aware AI Assistant */}
      <ContextAIButton
        pageData={{
          totalProjects: workspaceProjects.length,
          stats: {
            active: workspaceProjects.filter(p => p.status === 'active').length,
            completed: workspaceProjects.filter(p => p.status === 'completed').length,
            onHold: workspaceProjects.filter(p => p.status === 'on-hold').length,
            planning: workspaceProjects.filter(p => p.status === 'planning').length
          },
          projects: filteredProjects.slice(0, 10).map(p => ({
            name: p.name,
            status: p.status,
            priority: p.priority,
            progress: p.progress,
            teamSize: p.teamMemberCount,
            dueDate: p.dueDate
          }))
        }}
      />
    </div>
  );
};

export default WorkspaceProjects;
