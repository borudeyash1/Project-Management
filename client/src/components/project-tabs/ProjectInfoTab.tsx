import React, { useState } from 'react';
import { 
  Edit, Save, X, Calendar, DollarSign, Tag, Briefcase, 
  Clock, TrendingUp, Users, FileText, AlertCircle
} from 'lucide-react';

import { useTranslation } from 'react-i18next';

interface ProjectInfoTabProps {
  project: any;
  canEdit: boolean;
  onUpdate: (updates: any) => void;
}

const ProjectInfoTab: React.FC<ProjectInfoTabProps> = ({ project, canEdit, onUpdate }) => {
  const { t } = useTranslation();
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
      case 'planning': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'on-hold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'abandoned': return 'bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'medium': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'high': return 'bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!project) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-600 dark:text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">{t('project.info.notAvailable')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('project.info.title')}</h3>
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Edit className="w-4 h-4" />
              {t('project.info.edit')}
            </button>
          )}
          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
              >
                <Save className="w-4 h-4" />
                {t('project.info.save')}
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                {t('project.info.cancel')}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                {t('project.info.projectName')}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100 font-medium">{project.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                {t('project.info.client')}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{project.client || t('project.info.noClient')}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('project.info.description')}
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300">{project.description || t('project.info.noDescription')}</p>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('project.info.status')}
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="planning">{t('project.status.planning')}</option>
                  <option value="active">{t('project.status.active')}</option>
                  <option value="on-hold">{t('project.status.onHold')}</option>
                  <option value="completed">{t('project.status.completed')}</option>
                  <option value="cancelled">{t('project.status.cancelled')}</option>
                  <option value="abandoned">{t('project.status.abandoned')}</option>
                </select>
              ) : (
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {t(`project.status.${project.status}`)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('project.info.priority')}
              </label>
              {isEditing ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="low">{t('project.priority.low')}</option>
                  <option value="medium">{t('project.priority.medium')}</option>
                  <option value="high">{t('project.priority.high')}</option>
                  <option value="critical">{t('project.priority.critical')}</option>
                </select>
              ) : (
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                  {t(`project.priority.${project.priority}`)}
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('project.info.startDate')}
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : t('project.info.notSet')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {t('project.info.dueDate')}
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">
                  {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : t('project.info.notSet')}
                </p>
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                {t('project.info.estimatedBudget')}
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.budgetEstimated}
                  onChange={(e) => setFormData({ ...formData, budgetEstimated: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="0"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  ${project.budget?.estimated?.toLocaleString() || '0'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                {t('project.info.actualSpent')}
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.budgetActual}
                  onChange={(e) => setFormData({ ...formData, budgetActual: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="0"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  ${project.budget?.actual?.toLocaleString() || '0'}
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              {t('project.info.progress')}
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-3">
                <div
                  className="bg-accent h-3 rounded-full transition-all"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.progress || 0}%</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              {t('project.info.tags')}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder={t('project.info.tagsPlaceholder')}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {project.tags && project.tags.length > 0 ? (
                  project.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t('project.info.noTags')}</p>
                )}
              </div>
            )}
          </div>

          {/* Team Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              {t('project.info.teamSize')}
            </label>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {t('project.info.membersCount', { count: project.team?.length || project.teamMemberCount || 0 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoTab;
