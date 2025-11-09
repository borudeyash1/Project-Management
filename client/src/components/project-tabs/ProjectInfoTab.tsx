import React, { useState } from 'react';
import { 
  Edit, Save, X, Calendar, DollarSign, Tag, Briefcase, 
  Clock, TrendingUp, Users, FileText, AlertCircle
} from 'lucide-react';

interface ProjectInfoTabProps {
  project: any;
  canEdit: boolean;
  onUpdate: (updates: any) => void;
}

const ProjectInfoTab: React.FC<ProjectInfoTabProps> = ({ project, canEdit, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    client: project?.client || '',
    status: project?.status || 'planning',
    priority: project?.priority || 'medium',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    dueDate: project?.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
    budgetEstimated: project?.budget?.estimated || '',
    budgetActual: project?.budget?.actual || '',
    tags: project?.tags?.join(', ') || ''
  });

  const handleSave = () => {
    const updates = {
      name: formData.name,
      description: formData.description,
      client: formData.client,
      status: formData.status,
      priority: formData.priority,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      budget: {
        estimated: parseFloat(formData.budgetEstimated) || 0,
        actual: parseFloat(formData.budgetActual) || 0,
        currency: 'USD'
      },
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
    };
    
    onUpdate(updates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: project?.name || '',
      description: project?.description || '',
      client: project?.client || '',
      status: project?.status || 'planning',
      priority: project?.priority || 'medium',
      startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      dueDate: project?.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
      budgetEstimated: project?.budget?.estimated || '',
      budgetActual: project?.budget?.actual || '',
      tags: project?.tags?.join(', ') || ''
    });
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'on-hold': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'abandoned': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!project) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Project information not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Project Information</h3>
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Project Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{project.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Client
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{project.client || 'No client'}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-700">{project.description || 'No description'}</p>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              ) : (
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              {isEditing ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              ) : (
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">
                  {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
                </p>
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Estimated Budget
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.budgetEstimated}
                  onChange={(e) => setFormData({ ...formData, budgetEstimated: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  ${project.budget?.estimated?.toLocaleString() || '0'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Actual Spent
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.budgetActual}
                  onChange={(e) => setFormData({ ...formData, budgetActual: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  ${project.budget?.actual?.toLocaleString() || '0'}
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Progress
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">{project.progress || 0}%</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tags separated by commas"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {project.tags && project.tags.length > 0 ? (
                  project.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No tags</p>
                )}
              </div>
            )}
          </div>

          {/* Team Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Team Size
            </label>
            <p className="text-gray-900 font-medium">
              {project.team?.length || project.teamMemberCount || 0} members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoTab;
