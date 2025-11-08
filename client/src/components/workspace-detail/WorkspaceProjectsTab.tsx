import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, FolderOpen, Edit, Trash2, X, Calendar, DollarSign, 
  Users, Tag, AlertCircle, Eye, Briefcase, Clock
} from 'lucide-react';

interface WorkspaceProject {
  _id: string;
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  startDate: Date;
  dueDate: Date;
  budget?: number;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  assignedMembers: string[];
  createdAt: Date;
}

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
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<WorkspaceProject | null>(null);
  
  // Mock clients - in real app, fetch from WorkspaceClientsTab
  const mockClients = [
    { _id: 'client1', name: 'Acme Corp' },
    { _id: 'client2', name: 'Tech Solutions Inc' },
    { _id: 'client3', name: 'Global Enterprises' }
  ];

  const [projectForm, setProjectForm] = useState<{
    name: string;
    description: string;
    clientId: string;
    startDate: string;
    dueDate: string;
    budget: string;
    status: 'planning' | 'active' | 'on-hold' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tags: string[];
    assignedMembers: string[];
  }>({
    name: '',
    description: '',
    clientId: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    budget: '',
    status: 'planning',
    priority: 'medium',
    tags: [],
    assignedMembers: []
  });

  const [tagInput, setTagInput] = useState('');

  const resetForm = () => {
    setProjectForm({
      name: '',
      description: '',
      clientId: '',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      budget: '',
      status: 'planning',
      priority: 'medium',
      tags: [],
      assignedMembers: []
    });
    setTagInput('');
    setEditingProject(null);
  };

  const handleAddProject = () => {
    if (!projectForm.name.trim() || !projectForm.clientId) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Please fill in required fields (Name and Client)',
          duration: 3000
        }
      });
      return;
    }

    const clientName = mockClients.find(c => c._id === projectForm.clientId)?.name || '';

    if (editingProject) {
      // Update existing project
      setProjects(projects.map(p => 
        p._id === editingProject._id 
          ? {
              ...p,
              ...projectForm,
              clientName,
              startDate: new Date(projectForm.startDate),
              dueDate: new Date(projectForm.dueDate),
              budget: projectForm.budget ? parseFloat(projectForm.budget) : undefined
            }
          : p
      ));
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Project updated successfully!',
          duration: 3000
        }
      });
    } else {
      // Add new project
      const newProject: WorkspaceProject = {
        _id: `project_${Date.now()}`,
        ...projectForm,
        clientName,
        startDate: new Date(projectForm.startDate),
        dueDate: new Date(projectForm.dueDate),
        budget: projectForm.budget ? parseFloat(projectForm.budget) : undefined,
        createdAt: new Date()
      };
      setProjects([...projects, newProject]);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Project created successfully!',
          duration: 3000
        }
      });
    }
    
    resetForm();
    setShowAddModal(false);
  };

  const handleEditProject = (project: WorkspaceProject) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description,
      clientId: project.clientId,
      startDate: new Date(project.startDate).toISOString().split('T')[0],
      dueDate: new Date(project.dueDate).toISOString().split('T')[0],
      budget: project.budget?.toString() || '',
      status: project.status,
      priority: project.priority,
      tags: project.tags,
      assignedMembers: project.assignedMembers
    });
    setShowAddModal(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setProjects(projects.filter(p => p._id !== projectId));
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Project deleted successfully',
          duration: 3000
        }
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !projectForm.tags.includes(tagInput.trim())) {
      setProjectForm({
        ...projectForm,
        tags: [...projectForm.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setProjectForm({
      ...projectForm,
      tags: projectForm.tags.filter(t => t !== tag)
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'on-hold': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'urgent': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter projects by selected client
  const filteredProjects = selectedClientId 
    ? projects.filter(p => p.clientId === selectedClientId)
    : projects;

  // Group projects by client
  const projectsByClient = filteredProjects.reduce((acc, project) => {
    if (!acc[project.clientName]) {
      acc[project.clientName] = [];
    }
    acc[project.clientName].push(project);
    return acc;
  }, {} as Record<string, WorkspaceProject[]>);

  // Get selected client name
  const selectedClientName = selectedClientId 
    ? sessionStorage.getItem('selectedClientName') || mockClients.find(c => c._id === selectedClientId)?.name
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Workspace Projects</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage projects associated with clients in this workspace
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>

        {/* Client Filter Badge */}
        {selectedClientId && selectedClientName && (
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <Briefcase className="w-3 h-3" />
              Showing projects for: {selectedClientName}
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
        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">No projects yet</p>
            <p className="text-sm mt-1">Create a project to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(projectsByClient).map(([clientName, clientProjects]) => (
              <div key={clientName}>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">{clientName}</h4>
                  <span className="text-sm text-gray-500">({clientProjects.length} project{clientProjects.length !== 1 ? 's' : ''})</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {clientProjects.map((project) => (
                    <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div 
                          className="flex-1"
                          onClick={() => {
                            // Store workspace ID for project context
                            sessionStorage.setItem('currentWorkspaceId', workspaceId);
                            navigate(`/project-view/${project._id}`);
                          }}
                        >
                          <h5 className="font-semibold text-gray-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                            <FolderOpen className="w-4 h-4 text-blue-600" />
                            {project.name}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {project.description || 'No description'}
                          </p>
                          <p className="text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to open project →
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sessionStorage.setItem('currentWorkspaceId', workspaceId);
                              navigate(`/project-view/${project._id}`);
                            }}
                            className="text-gray-600 hover:text-gray-700 p-1"
                            title="View Project"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Edit Project"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project._id);
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.dueDate).toLocaleDateString()}
                        </div>
                        {project.budget && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-3 h-3" />
                            ${project.budget.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                        {project.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{project.tags.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h3>
              <button onClick={handleCloseModal}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Website Redesign"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <select
                    value={projectForm.clientId}
                    onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a client</option>
                    {mockClients.map(client => (
                      <option key={client._id} value={client._id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Project description..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={projectForm.dueDate}
                    onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag..."
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projectForm.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-purple-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProject}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceProjectsTab;
