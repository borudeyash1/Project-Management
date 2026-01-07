import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Plus, FolderOpen, Edit, Trash2, X, Calendar, DollarSign,
  Users, Tag, AlertCircle, Eye, Briefcase, Clock, CheckCircle,
  Pause, XCircle, Play, Archive
} from 'lucide-react';

interface WorkspaceProjectsTabProps {
  workspaceId: string;
  selectedClientId?: string | null;
  onClearClientFilter?: () => void;
}

const WorkspaceProjectsTab: React.FC<WorkspaceProjectsTabProps> = ({
  workspaceId,
  selectedClientId,
  onClearClientFilter
}) => {
  const { state, dispatch } = useApp();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedProjectForStatus, setSelectedProjectForStatus] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(true);
  const [workspaceProjects, setWorkspaceProjects] = useState<any[]>([]);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    client: '',
    status: 'planning' as 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled' | 'abandoned',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    budgetEstimated: '',
    budgetActual: '0',
    tags: ''
  });

  // Fetch projects when component mounts or workspaceId changes
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projects = await api.getWorkspaceProjects(workspaceId);
        // Store projects in local state instead of global state
        setWorkspaceProjects(projects);
      } catch (error) {
        console.error('Failed to fetch workspace projects:', error);
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'error',
            message: 'Failed to load projects',
            duration: 3000
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [workspaceId, dispatch]);

  // Fetch clients for filtering
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clients = await api.getClients(workspaceId);
        dispatch({ type: 'SET_CLIENTS', payload: clients });
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };

    fetchClients();
  }, [workspaceId, dispatch]);

  // Get workspace and clients from AppContext
  const workspace = state.workspaces.find(w => w._id === workspaceId);
  const isWorkspaceOwner = workspace?.owner === state.userProfile._id;

  // Filter projects based on user role
  // Owner sees all projects, employees see only projects they're assigned to
  const filteredByRole = isWorkspaceOwner
    ? workspaceProjects
    : workspaceProjects.filter(p =>
      (p as any).team?.some((member: any) => member._id === state.userProfile._id) ||
      p.createdBy === state.userProfile._id
    );

  const workspaceClients = state.clients || [];

  const handleCreateProject = async () => {
    if (!projectForm.name.trim()) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: t('workspace.projects.toast.nameRequired'),
          duration: 3000
        }
      });
      return;
    }

    try {
      const budgetEstimated = parseFloat(projectForm.budgetEstimated) || 0;
      const budgetActual = parseFloat(projectForm.budgetActual) || 0;
      
      const projectData: any = {
        name: projectForm.name,
        description: projectForm.description,
        workspace: workspaceId,
        status: projectForm.status,
        priority: projectForm.priority,
        startDate: projectForm.startDate ? new Date(projectForm.startDate) : undefined,
        dueDate: projectForm.dueDate ? new Date(projectForm.dueDate) : undefined,
        tags: projectForm.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      };

      // Add client if selected (send the client name, not empty string)
      if (projectForm.client && projectForm.client.trim()) {
        projectData.client = projectForm.client;
      }

      // Add budget if provided
      if (budgetEstimated > 0 || budgetActual > 0) {
        projectData.budget = {
          amount: budgetEstimated,
          spent: budgetActual,
          currency: 'INR'
        };
      }

      // Create in database via API
      const newProject = await api.createProject(projectData);

      // Update global state
      dispatch({
        type: 'ADD_PROJECT',
        payload: newProject
      });

      // Also add to local state to show immediately
      setWorkspaceProjects(prev => [...prev, newProject]);

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: t('workspace.projects.toast.created'),
          duration: 3000
        }
      });

      setShowCreateModal(false);
      setProjectForm({
        name: '',
        description: '',
        client: '',
        status: 'planning',
        priority: 'medium',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        budgetEstimated: '',
        budgetActual: '0',
        tags: ''
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to create project',
          duration: 3000
        }
      });
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, newStatus: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled' | 'abandoned') => {
    try {
      // Update in database via API
      await api.updateProject(projectId, { status: newStatus });
      
      // Update global state
      dispatch({
        type: 'UPDATE_PROJECT',
        payload: {
          projectId,
          updates: { status: newStatus }
        }
      });
      
      // Update local state
      setWorkspaceProjects(prev => 
        prev.map(p => p._id === projectId ? { ...p, status: newStatus } : p)
      );
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: t('workspace.projects.toast.updated'),
          duration: 3000
        }
      });
      
      setShowStatusModal(false);
      setSelectedProjectForStatus(null);
    } catch (error) {
      console.error('Failed to update project status:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to update project status',
          duration: 3000
        }
      });
    }
  };

  const handleDeleteProject = async (project: any) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    if (deleteConfirmText !== 'DELETE') {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Please type DELETE to confirm',
          duration: 3000
        }
      });
      return;
    }

    if (projectToDelete) {
      try {
        // Delete from database via API
        await api.deleteProject(projectToDelete._id);
        
        // Update global state
        dispatch({
          type: 'DELETE_PROJECT',
          payload: projectToDelete._id
        });
        
        // Remove from local state
        setWorkspaceProjects(prev => prev.filter(p => p._id !== projectToDelete._id));
        
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'success',
            message: t('workspace.projects.toast.deleted'),
            duration: 3000
          }
        });

        // Close modal and reset
        setShowDeleteModal(false);
        setProjectToDelete(null);
        setDeleteConfirmText('');
      } catch (error) {
        console.error('Failed to delete project:', error);
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'error',
            message: 'Failed to delete project',
            duration: 3000
          }
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'on-hold': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'abandoned': return 'bg-orange-200 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4" />;
      case 'active': return <Play className="w-4 h-4" />;
      case 'on-hold': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'abandoned': return <Archive className="w-4 h-4" />;
      default: return <FolderOpen className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-200 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter projects by selected client
  const filteredProjects = selectedClientId
    ? (() => {
        const selectedClient = workspaceClients.find(c => c._id === selectedClientId);
        
        console.log('=== CLIENT FILTER DEBUG ===');
        console.log('1. Selected Client ID:', selectedClientId);
        console.log('2. All Clients:', workspaceClients.map(c => ({ id: c._id, name: c.name })));
        console.log('3. Found Client:', selectedClient);
        console.log('4. Total Projects:', filteredByRole.length);
        console.log('5. Projects with clients:', filteredByRole.map(p => ({ 
          name: p.name, 
          client: p.client,
          clientType: typeof p.client 
        })));
        
        const filtered = filteredByRole.filter(p => {
          // Normalize both strings for comparison (trim and lowercase)
          const projectClient = (p.client || '').trim().toLowerCase();
          const selectedClientName = (selectedClient?.name || '').trim().toLowerCase();
          
          const matches = projectClient === selectedClientName;
          console.log(`  - "${p.name}": "${projectClient}" === "${selectedClientName}" = ${matches}`);
          
          return matches;
        });
        
        console.log('6. Filtered Count:', filtered.length);
        console.log('7. Filtered Projects:', filtered.map(p => p.name));
        console.log('=== END DEBUG ===');
        
        return filtered;
      })()
    : filteredByRole;

  // Group projects by client
  const projectsByClient = filteredProjects.reduce((acc: Record<string, any[]>, project) => {
    const clientName = typeof project.client === 'string' ? project.client : (project.client?.name || 'No Client');
    if (!acc[clientName]) {
      acc[clientName] = [];
    }
    acc[clientName].push(project);
    return acc;
  }, {});

  // Get selected client name
  const selectedClientName = selectedClientId
    ? workspaceClients.find(c => c._id === selectedClientId)?.name
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('workspace.projects.title')}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {t('workspace.projects.subtitle')} ({filteredProjects.length})
            </p>
          </div>
        </div>

        {/* Client Filter Badge */}
        {selectedClientId && selectedClientName && (
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <Briefcase className="w-3 h-3" />
              {t('workspace.projects.filterClient')}: {selectedClientName}
              <button
                onClick={onClearClientFilter}
                className="hover:text-blue-900"
                title="Clear filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-3"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="font-medium">{t('workspace.projects.noProjects')}</p>
            <p className="text-sm mt-1">{t('workspace.projects.noProjectsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(projectsByClient).map(([clientName, clientProjects]) => (
              <div key={clientName}>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">{clientName}</h4>
                  <span className="text-sm text-gray-600">({clientProjects.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientProjects.map((project: any) => (
                    <div
                      key={project._id}
                      className="bg-white border border-gray-300 rounded-lg p-4 transition-shadow"
                    >
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">{project.name}</h5>
                          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                        </div>
                      </div>

                      {/* Status and Priority */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          {project.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>

                      {/* Project Details */}
                      <div className="space-y-2 mb-3 text-sm text-gray-600">
                        {project.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(project.startDate).toLocaleDateString(i18n.language)} - {new Date(project.dueDate).toLocaleDateString(i18n.language)}
                            </span>
                          </div>
                        )}
                        {project.budget && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(project.budget.actual ?? 0)} / {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(project.budget.estimated ?? 0)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-300 rounded-full h-2">
                            <div
                              className="bg-accent h-2 rounded-full transition-all"
                              style={{ width: `${project.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{project.progress || 0}%</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-gray-200">
                        <button
                          onClick={() => navigate(`/project/${project._id}/overview`)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-accent text-gray-900 rounded hover:bg-accent-hover"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProjectForStatus(project);
                            setShowStatusModal(true);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                          <Edit className="w-3 h-3" />
                          {t('workspace.projects.statusLabel')}
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedProjectForStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Project Status</h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedProjectForStatus(null);
                }}
                className="text-gray-600 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Project: <span className="font-medium">{selectedProjectForStatus.name}</span>
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleUpdateProjectStatus(selectedProjectForStatus._id, 'planning')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">{t('workspace.projects.status.planning')}</div>
                  <div className="text-xs text-gray-600">Project is in planning phase</div>
                </div>
              </button>

              <button
                onClick={() => handleUpdateProjectStatus(selectedProjectForStatus._id, 'active')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <Play className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">{t('workspace.projects.status.active')}</div>
                  <div className="text-xs text-gray-600">Project is actively being worked on</div>
                </div>
              </button>

              <button
                onClick={() => handleUpdateProjectStatus(selectedProjectForStatus._id, 'on-hold')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <Pause className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-gray-900">{t('workspace.projects.status.on-hold')}</div>
                  <div className="text-xs text-gray-600">Project is temporarily paused</div>
                </div>
              </button>

              <button
                onClick={() => handleUpdateProjectStatus(selectedProjectForStatus._id, 'completed')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <CheckCircle className="w-5 h-5 text-accent-dark" />
                <div>
                  <div className="font-medium text-gray-900">{t('workspace.projects.status.completed')}</div>
                  <div className="text-xs text-gray-600">Project is successfully completed</div>
                </div>
              </button>

              <button
                onClick={() => handleUpdateProjectStatus(selectedProjectForStatus._id, 'cancelled')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-gray-900">{t('workspace.projects.status.cancelled')}</div>
                  <div className="text-xs text-gray-600">Project was cancelled</div>
                </div>
              </button>

              <button
                onClick={() => handleUpdateProjectStatus(selectedProjectForStatus._id, 'abandoned')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <Archive className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900">Abandoned</div>
                  <div className="text-xs text-gray-600">Project was abandoned</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('workspace.projects.modal.createTitle')}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-600 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('workspace.projects.modal.nameLabel')}
                </label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  placeholder={t('workspace.projects.modal.namePlaceholder')}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('workspace.projects.modal.descriptionLabel')}
                </label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  placeholder={t('workspace.projects.modal.descriptionPlaceholder')}
                />
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('workspace.projects.modal.clientLabel')}
                </label>
                <select
                  value={projectForm.client}
                  onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                >
                  <option value="">{t('workspace.projects.modal.clientPlaceholder')}</option>
                  {workspaceClients.map((client) => (
                    <option key={client._id} value={client.name}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('workspace.projects.modal.statusLabel')}
                  </label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  >
                    <option value="planning">{t('workspace.projects.status.planning')}</option>
                    <option value="active">{t('workspace.projects.status.active')}</option>
                    <option value="on-hold">{t('workspace.projects.status.on-hold')}</option>
                    <option value="completed">{t('workspace.projects.status.completed')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('workspace.projects.modal.priorityLabel')}
                  </label>
                  <select
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  >
                    <option value="low">{t('workspace.projects.priority.low')}</option>
                    <option value="medium">{t('workspace.projects.priority.medium')}</option>
                    <option value="high">{t('workspace.projects.priority.high')}</option>
                    <option value="critical">{t('workspace.projects.priority.urgent')}</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('workspace.projects.modal.startDateLabel')}
                  </label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('workspace.projects.modal.dueDateLabel')}
                  </label>
                  <input
                    type="date"
                    value={projectForm.dueDate}
                    onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('workspace.projects.modal.budgetLabel')}
                  </label>
                  <input
                    type="number"
                    value={projectForm.budgetEstimated}
                    onChange={(e) => setProjectForm({ ...projectForm, budgetEstimated: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Spent (₹)
                  </label>
                  <input
                    type="number"
                    value={projectForm.budgetActual}
                    onChange={(e) => setProjectForm({ ...projectForm, budgetActual: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  placeholder="e.g., Web, Mobile, Design"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  {t('workspace.projects.modal.createBtn')}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('workspace.projects.modal.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProjectToDelete(null);
                  setDeleteConfirmText('');
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete project <span className="font-medium text-gray-900">{projectToDelete.name}</span>?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="DELETE"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={confirmDeleteProject}
                disabled={deleteConfirmText !== 'DELETE'}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  deleteConfirmText === 'DELETE'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Delete Project
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProjectToDelete(null);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceProjectsTab;
