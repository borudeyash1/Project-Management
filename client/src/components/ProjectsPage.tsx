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
import { useRealtime } from '../hooks/useRealtime';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import CreateProjectModal from './CreateProjectModal';
import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';
import GlassmorphicCard from './ui/GlassmorphicCard';
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
  const { socket, isConnected } = useRealtime();
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Rename State
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<{ id: string; name: string } | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

  // Complete Confirmation State
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [projectToComplete, setProjectToComplete] = useState<{ id: string; name: string } | null>(null);
  const [completeConfirmText, setCompleteConfirmText] = useState('');

  const activeWorkspaceId = useMemo(() => {
    // If in Personal Mode, return 'personal' to load personal projects
    if (state.mode === 'Personal') {
      return 'personal';
    }

    // Otherwise, get the current workspace ID
    if ((state as any)?.currentWorkspaceId) {
      return (state as any).currentWorkspaceId;
    }
    const matchByName = state.workspaces?.find((ws) => ws.name === state.currentWorkspace);
    return matchByName?._id || state.workspaces?.[0]?._id;
  }, [state.mode, state.currentWorkspace, state.workspaces]);

  // Real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join workspace room if in workspace mode
    if (activeWorkspaceId && activeWorkspaceId !== 'personal') {
      socket.emit('subscribe:workspace', activeWorkspaceId);
    }

    // Handlers
    const handleProjectCreated = (newProject: any) => {
      // Only add if it belongs to current view (workspace or personal)
      if (activeWorkspaceId === 'personal') {
        if (newProject.workspace) return; // Ignore workspace projects in personal view
      } else {
        if (newProject.workspace !== activeWorkspaceId) return; // Ignore other workspace projects
      }

      setProjects(prev => {
        if (prev.find(p => p._id === newProject._id)) return prev;

        // Adapt new project to local Project interface
        const rawOwner = (newProject as any).createdBy || (newProject as any).owner || {};
        const rawTeam = (newProject as any).teamMembers || (newProject as any).team || [];
        const start = newProject.startDate || (newProject as any).startDate || new Date().toISOString();
        const due = newProject.dueDate || (newProject as any).endDate || new Date().toISOString();

        const adaptedProject: Project = {
          _id: newProject._id,
          name: newProject.name,
          description: newProject.description || 'No description provided',
          status: (newProject.status as Project['status']) || 'active',
          priority: (newProject.priority as Project['priority']) || 'medium',
          progress: newProject.progress ?? 0,
          startDate: new Date(start),
          endDate: new Date(due),
          budget: (newProject as any).budget || { estimated: 0, actual: 0, currency: 'INR' },
          team: Array.isArray(rawTeam)
            ? rawTeam.map((member: any) => ({
              _id: member.user?._id || member._id,
              name: member.user?.fullName || member.name || 'Member',
              avatar: member.user?.avatarUrl || member.avatar,
            }))
            : [],
          tags: newProject.tags || [],
          owner: {
            _id: rawOwner._id || 'owner',
            name: rawOwner.fullName || rawOwner.name || 'Owner',
            avatar: rawOwner.avatarUrl || rawOwner.avatar,
          },
          createdAt: new Date(newProject.createdAt),
          updatedAt: new Date(newProject.updatedAt)
        };

        return [adaptedProject, ...prev];
      });
    };

    const handleProjectUpdated = (data: { projectId: string, changes: any }) => {
      setProjects(prev => prev.map(p => {
        if (p._id === data.projectId) {
          return { ...p, ...data.changes };
        }
        return p;
      }));
    };

    const handleProjectDeleted = (data: { projectId: string }) => {
      setProjects(prev => prev.filter(p => p._id !== data.projectId));
    };

    socket.on('project:created', handleProjectCreated);
    socket.on('project:updated', handleProjectUpdated);
    socket.on('project:deleted', handleProjectDeleted);

    return () => {
      if (activeWorkspaceId && activeWorkspaceId !== 'personal') {
        socket.emit('unsubscribe:workspace', activeWorkspaceId);
      }
      socket.off('project:created', handleProjectCreated);
      socket.off('project:updated', handleProjectUpdated);
      socket.off('project:deleted', handleProjectDeleted);
    };
  }, [socket, isConnected, activeWorkspaceId]);

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
          budget: (project as any).budget || { estimated: 0, actual: 0, currency: 'INR' },
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
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

      // If in Personal Mode, don't send workspaceId (creates personal project)
      // If in Workspace Mode, send the workspaceId
      const projectPayload: any = {
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        priority: projectData.priority,
        startDate: projectData.startDate,
        dueDate: projectData.endDate,
        budget: projectData.budget,
        tags: projectData.tags,
      };

      // Only add workspaceId if not in Personal Mode
      if (activeWorkspaceId !== 'personal') {
        projectPayload.workspaceId = activeWorkspaceId;
      }

      await createProjectApi(projectPayload);
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
    // Show confirmation modal for complete status
    if (status === 'completed') {
      const project = projects.find(p => p._id === projectId);
      if (project) {
        setProjectToComplete({ id: projectId, name: project.name });
        setCompleteConfirmOpen(true);
        setCompleteConfirmText('');
      }
      return;
    }

    // For other statuses, update directly
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

  const confirmCompleteProject = async () => {
    if (!projectToComplete) return;

    // Validate confirmation text
    if (completeConfirmText !== 'complete-this-project') {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: 'Please type "complete-this-project" to confirm' } });
      return;
    }

    try {
      setProcessingProjectId(projectToComplete.id);
      await updateProjectApi(projectToComplete.id, { status: 'completed' });
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: t('messages.projectStatusUpdated') } });
      await loadProjects();
      setCompleteConfirmOpen(false);
      setProjectToComplete(null);
      setCompleteConfirmText('');
    } catch (err: any) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.message || t('messages.updateFailed') } });
    } finally {
      setProcessingProjectId(null);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    if (project) {
      setProjectToDelete({ id: projectId, name: project.name });
      setDeleteConfirmOpen(true);
      setDeleteConfirmText('');
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    // Validate confirmation text
    if (deleteConfirmText !== 'delete-this-project') {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: 'Please type "delete-this-project" to confirm' } });
      return;
    }

    try {
      setProcessingProjectId(projectToDelete.id);
      await deleteProjectApi(projectToDelete.id);
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: t('messages.projectDeleted') } });
      await loadProjects();
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      setDeleteConfirmText('');
    } catch (err: any) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.message || t('messages.deleteFailed') } });
    } finally {
      setProcessingProjectId(null);
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}/overview`);
  };

  const handleRenameProject = (project: Project) => {
    setProjectToRename({ id: project._id, name: project.name });
    setNewProjectName(project.name);
    setRenameModalOpen(true);
  };

  const submitRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectToRename || !newProjectName.trim()) return;

    try {
      setProcessingProjectId(projectToRename.id);
      await updateProjectApi(projectToRename.id, { name: newProjectName });
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Project renamed successfully' } });
      await loadProjects();
      setRenameModalOpen(false);
      setProjectToRename(null);
    } catch (err: any) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.message || 'Failed to rename project' } });
    } finally {
      setProcessingProjectId(null);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20'}`}>
      {/* Glassmorphic Page Header - Uses Accent Color */}
      <GlassmorphicPageHeader
        icon={Target}
        title={t('projects.title')}
        subtitle={t('descriptions.projects')}
        className="w-full !rounded-none !border-x-0 !mb-0"
      />

      <div className={`flex-1 transition-all duration-300 ${dockPosition === 'left' ? 'pl-[71px] pr-4 sm:pr-6 py-4 sm:py-6' :
        dockPosition === 'right' ? 'pr-[71px] pl-4 sm:pl-6 py-4 sm:py-6' :
          'p-4 sm:p-6'
        }`}>

        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-gray-900 dark:text-white rounded-xl hover:bg-accent-hover transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {t('projects.newProject')}
          </button>
        </div>
        {/* Filters and Search */}
        <GlassmorphicCard className="p-6 mb-6">
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
        </GlassmorphicCard>

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
              <GlassmorphicCard
                key={project._id}
                hoverEffect={true}
                className="p-6 group relative overflow-hidden"
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br ${project.priority === 'urgent' ? 'from-red-500/10 to-orange-500/10' :
                  project.priority === 'high' ? 'from-orange-500/10 to-yellow-500/10' :
                    project.priority === 'medium' ? 'from-blue-500/10 to-purple-500/10' :
                      'from-gray-500/10 to-slate-500/10'
                  }`} />
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 bg-gradient-to-r ${project.priority === 'urgent' ? 'from-red-600 to-orange-600' :
                      project.priority === 'high' ? 'from-orange-600 to-yellow-600' :
                        project.priority === 'medium' ? 'from-blue-600 to-purple-600' :
                          'from-gray-600 to-slate-600'
                      } bg-clip-text text-transparent`}>
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{project.description}</p>
                  </div>
                  {/* Three-dots menu hidden as per user request */}
                </div>

                {/* Tags with Gradient Backgrounds */}
                <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                  {project.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${idx % 3 === 0 ? 'from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300' :
                        idx % 3 === 1 ? 'from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300' :
                          'from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300'
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{project.tags.length - 3}</span>
                  )}
                </div>

                {/* Progress with Gradient */}
                <div className="mb-4 relative z-10">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t('projects.progress')}</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r ${project.progress < 30 ? 'from-red-500 to-orange-500' :
                        project.progress < 70 ? 'from-yellow-500 to-amber-500' :
                          'from-green-500 to-emerald-500'
                        }`}
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
                      {formatCurrency(project.budget.actual ?? 0, project.budget.currency)} / {formatCurrency(project.budget.estimated ?? 0, project.budget.currency)}
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
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-300 dark:border-gray-700 flex-wrap relative z-10">
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
                  {/* Rename button hidden as per user request */}
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
              </GlassmorphicCard>
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
                        {formatCurrency(project.budget.actual ?? 0, project.budget.currency)} / {formatCurrency(project.budget.estimated ?? 0, project.budget.currency)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => handleViewProject(project._id)}>
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Rename button hidden as per user request */}
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

        {/* Complete Confirmation Modal */}
        {completeConfirmOpen && projectToComplete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`max-w-md w-full rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Complete Project
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                To complete this project, please confirm by entering the following:
              </p>

              <div className="space-y-4">
                {/* Project Name Display */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Project Name:
                  </label>
                  <div className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                    {projectToComplete.name}
                  </div>
                </div>

                {/* Confirmation Input */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Type <span className="font-mono text-green-600">"complete-this-project"</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={completeConfirmText}
                    onChange={(e) => setCompleteConfirmText(e.target.value)}
                    placeholder="complete-this-project"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setCompleteConfirmOpen(false);
                    setProjectToComplete(null);
                    setCompleteConfirmText('');
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmCompleteProject}
                  disabled={completeConfirmText !== 'complete-this-project' || processingProjectId === projectToComplete.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingProjectId === projectToComplete.id ? 'Completing...' : 'Complete Project'}
                </button>
              </div>
            </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Delete Project
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              To delete this project, please confirm by entering the following:
            </p>

            <div className="space-y-4">
              {/* Project Name Display */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Project Name:
                </label>
                <div className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                  {projectToDelete.name}
                </div>
              </div>

              {/* Confirmation Input */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type <span className="font-mono text-red-600">"delete-this-project"</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="delete-this-project"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setProjectToDelete(null);
                  setDeleteConfirmText('');
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProject}
                disabled={deleteConfirmText !== 'delete-this-project' || processingProjectId === projectToDelete.id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingProjectId === projectToDelete.id ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl transform transition-all ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('projects.renameProject')}</h3>

            <form onSubmit={submitRename}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('projects.projectName')}
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  placeholder="Enter new project name"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {t('projects.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim() || processingProjectId === projectToRename?.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingProjectId === projectToRename?.id ? 'Renaming...' : t('projects.rename')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
