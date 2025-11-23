import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, Link as LinkIcon, Calendar, Clock, Flag, User, Tag, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: any) => void;
  projectTeam: TeamMember[];
  projectId: string;
}

const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  projectTeam,
  projectId
}) => {
  const { t } = useTranslation();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    taskType: 'task' as 'task' | 'bug' | 'feature' | 'improvement' | 'research' | 'documentation',
    category: 'development' as 'development' | 'design' | 'testing' | 'deployment' | 'meeting' | 'review' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'pending' as 'pending' | 'in-progress' | 'review' | 'completed' | 'blocked',
    dueDate: '',
    estimatedHours: '',
    tags: [] as string[],
    attachments: [] as File[],
    links: [] as string[]
  });

  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newLink, setNewLink] = useState('');

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: `subtask_${Date.now()}`,
          title: newSubtask.trim(),
          completed: false
        }
      ]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !taskData.tags.includes(newTag.trim())) {
      setTaskData({
        ...taskData,
        tags: [...taskData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTaskData({
      ...taskData,
      tags: taskData.tags.filter(t => t !== tag)
    });
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      setTaskData({
        ...taskData,
        links: [...taskData.links, newLink.trim()]
      });
      setNewLink('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setTaskData({
      ...taskData,
      links: taskData.links.filter((_, i) => i !== index)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setTaskData({
        ...taskData,
        attachments: [...taskData.attachments, ...filesArray]
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setTaskData({
      ...taskData,
      attachments: taskData.attachments.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    // Validation
    if (!taskData.title.trim()) {
      alert(t('projects.pleaseEnterTitle'));
      return;
    }
    if (!taskData.assigneeId) {
      alert(t('projects.pleaseSelectAssignee'));
      return;
    }
    if (!taskData.dueDate) {
      alert(t('projects.pleaseSelectDueDate'));
      return;
    }

    // Find assignee details
    const assignee = projectTeam.find(member => member._id === taskData.assigneeId);

    // Create task object
    const newTask = {
      _id: `task_${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      taskType: taskData.taskType,
      category: taskData.category,
      assignee: assignee,
      priority: taskData.priority,
      status: taskData.status,
      dueDate: new Date(taskData.dueDate),
      estimatedHours: parseFloat(taskData.estimatedHours) || 0,
      actualHours: 0,
      progress: 0,
      tags: taskData.tags,
      subtasks: subtasks,
      comments: [],
      attachments: taskData.attachments.map((file, index) => ({
        _id: `attachment_${Date.now()}_${index}`,
        name: file.name,
        url: URL.createObjectURL(file), // Mock URL
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: file.size,
        uploadedBy: { name: 'Current User' }, // Would be current user
        uploadedAt: new Date()
      })),
      links: taskData.links,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current_user_id', // Would be actual user ID
      projectId: projectId,
      dependencies: [],
      isMilestone: false
    };

    onCreateTask(newTask);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setTaskData({
      title: '',
      description: '',
      assigneeId: '',
      taskType: 'task',
      category: 'development',
      priority: 'medium',
      status: 'pending',
      dueDate: '',
      estimatedHours: '',
      tags: [],
      attachments: [],
      links: []
    });
    setSubtasks([]);
    setNewSubtask('');
    setNewTag('');
    setNewLink('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{t('projects.createTask')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('projects.taskName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder={t('projects.enterTaskTitle')}
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('projects.taskDescription')}
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder={t('projects.describeTask')}
            />
          </div>

          {/* Task Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                {t('projects.taskType')}
              </label>
              <select
                value={taskData.taskType}
                onChange={(e) => setTaskData({ ...taskData, taskType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="task">📋 {t('projects.typeTask')}</option>
                <option value="bug">🐛 {t('projects.typeBug')}</option>
                <option value="feature">✨ {t('projects.typeFeature')}</option>
                <option value="improvement">🔧 {t('projects.typeImprovement')}</option>
                <option value="research">🔍 {t('projects.typeResearch')}</option>
                <option value="documentation">📝 {t('projects.typeDocumentation')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                {t('projects.category')}
              </label>
              <select
                value={taskData.category}
                onChange={(e) => setTaskData({ ...taskData, category: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="development">💻 {t('projects.catDevelopment')}</option>
                <option value="design">🎨 {t('projects.catDesign')}</option>
                <option value="testing">🧪 {t('projects.catTesting')}</option>
                <option value="deployment">🚀 {t('projects.catDeployment')}</option>
                <option value="meeting">👥 {t('projects.catMeeting')}</option>
                <option value="review">👀 {t('projects.catReview')}</option>
                <option value="other">📦 {t('projects.catOther')}</option>
              </select>
            </div>
          </div>

          {/* Assignee and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                {t('projects.assignTo')} <span className="text-red-500">*</span>
              </label>
              <select
                value={taskData.assigneeId}
                onChange={(e) => setTaskData({ ...taskData, assigneeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="">{t('projects.selectMember')}</option>
                {projectTeam.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                {t('projects.priority')}
              </label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="low">{t('projects.low')}</option>
                <option value="medium">{t('projects.medium')}</option>
                <option value="high">{t('projects.high')}</option>
                <option value="critical">{t('projects.critical')}</option>
              </select>
            </div>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('projects.dueDate')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={taskData.dueDate}
                onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {t('projects.estimatedTime')}
              </label>
              <input
                type="number"
                value={taskData.estimatedHours}
                onChange={(e) => setTaskData({ ...taskData, estimatedHours: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('projects.initialStatus')}
            </label>
            <select
              value={taskData.status}
              onChange={(e) => setTaskData({ ...taskData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="pending">{t('projects.todo')}</option>
              <option value="in-progress">{t('projects.inProgress')}</option>
              <option value="blocked">{t('projects.blocked')}</option>
            </select>
          </div>

          {/* Subtasks/Milestones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              {t('projects.subtasks')}
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder={t('projects.addSubtask')}
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('common.add')}
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="border border-gray-300 rounded-lg p-3 space-y-2">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{subtask.title}</span>
                      <button
                        onClick={() => handleRemoveSubtask(subtask.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              {t('projects.tags')}
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder={t('projects.addTag')}
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('common.add')}
                </button>
              </div>

              {taskData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {taskData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="w-4 h-4 inline mr-1" />
              {t('projects.attachments')}
            </label>
            <div className="space-y-2">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />

              {taskData.attachments.length > 0 && (
                <div className="border border-gray-300 rounded-lg p-3 space-y-2">
                  {taskData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="w-4 h-4 inline mr-1" />
              {t('projects.links')}
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder={t('projects.enterLink')}
                />
                <button
                  onClick={handleAddLink}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('common.add')}
                </button>
              </div>

              {taskData.links.length > 0 && (
                <div className="border border-gray-300 rounded-lg p-3 space-y-2">
                  {taskData.links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent-dark hover:underline truncate flex-1"
                      >
                        {link}
                      </a>
                      <button
                        onClick={() => handleRemoveLink(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-300 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            {t('projects.createTask')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCreationModal;
