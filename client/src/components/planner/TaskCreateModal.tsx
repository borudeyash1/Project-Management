import React, { useState } from 'react';
import { X, Calendar, Clock, Flag, User, Tag, Repeat, Bell, FileText as FileTextIcon, Target, CheckSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlanner } from '../../context/PlannerContext';
import { useApp } from '../../context/AppContext';
import { notionSyncService } from '../../services/notionSyncService';

interface TaskCreateModalProps {
  onClose: () => void;
  defaultStatus?: string;
  defaultDate?: Date;
  defaultTime?: string;
}

type TaskType = 'task' | 'reminder' | 'milestone' | 'subtask';

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  onClose,
  defaultStatus = 'todo',
  defaultDate,
  defaultTime
}) => {
  const { createTask } = usePlanner();
  const { state } = useApp();
  const { t } = useTranslation();

  const notionConnected = state.userProfile?.connectedAccounts?.notion?.activeAccountId ||
    (state.userProfile?.connectedAccounts?.notion?.accounts?.length ?? 0) > 0;

  const jiraConnected = state.userProfile?.connectedAccounts?.jira?.activeAccountId ||
    (state.userProfile?.connectedAccounts?.jira?.accounts?.length ?? 0) > 0;

  const [taskType, setTaskType] = useState<TaskType>('task');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: defaultDate ? defaultDate.toISOString().split('T')[0] : '',
    dueTime: defaultTime || '09:00',
    estimatedTime: 1,
    assignees: [] as string[],
    tags: [] as string[],
    recurrence: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    reminder: '15min' as '15min' | '30min' | '1hour' | '1day' | 'none',
    clientVisible: false,
    syncToNotion: false,
    syncToJira: false,
    project: '',
    milestone: ''
  });

  const [assigneeInput, setAssigneeInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const taskTypes = [
    { id: 'task', label: t('planner.taskModal.types.task.label'), icon: CheckSquare, description: t('planner.taskModal.types.task.desc') },
    { id: 'reminder', label: t('planner.taskModal.types.reminder.label'), icon: Bell, description: t('planner.taskModal.types.reminder.desc') },
    { id: 'milestone', label: t('planner.taskModal.types.milestone.label'), icon: Target, description: t('planner.taskModal.types.milestone.desc') },
    { id: 'subtask', label: t('planner.taskModal.types.subtask.label'), icon: FileTextIcon, description: t('planner.taskModal.types.subtask.desc') }
  ];

  const handleAddAssignee = () => {
    if (assigneeInput.trim() && !formData.assignees.includes(assigneeInput.trim())) {
      setFormData({
        ...formData,
        assignees: [...formData.assignees, assigneeInput.trim()]
      });
      setAssigneeInput('');
    }
  };

  const handleRemoveAssignee = (assignee: string) => {
    setFormData({
      ...formData,
      assignees: formData.assignees.filter(a => a !== assignee)
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    // Combine date and time
    let dueDate: Date | undefined;
    if (formData.dueDate) {
      dueDate = new Date(`${formData.dueDate}T${formData.dueTime}`);
    }

    // Create the task with all form data (including syncToNotion flag)
    createTask({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      dueDate,
      estimatedTime: formData.estimatedTime,
      assignees: formData.assignees,
      tags: formData.tags,
      subtasks: [],
      comments: [],
      attachments: [],
      // @ts-ignore - syncToNotion will be handled by backend
      syncToNotion: formData.syncToNotion && notionConnected,
      // @ts-ignore - syncToJira will be handled by backend
      syncToJira: formData.syncToJira && jiraConnected
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('planner.taskModal.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-600 dark:hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Task Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-3">
                {t('planner.taskModal.taskType')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {taskTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setTaskType(type.id as TaskType)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${taskType === type.id
                        ? 'border-accent bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${taskType === type.id ? 'text-accent-dark dark:text-accent-light' : 'text-gray-600'
                        }`} />
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {type.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {type.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info Box based on Task Type */}
            {taskType === 'reminder' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-700">
                  {t('planner.taskModal.typeInfo.reminder')}
                </p>
              </div>
            )}
            {taskType === 'milestone' && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  {t('planner.taskModal.typeInfo.milestone')}
                </p>
              </div>
            )}
            {taskType === 'subtask' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {t('planner.taskModal.typeInfo.subtask')}
                </p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                {t('planner.taskModal.fields.title')}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder={
                  taskType === 'reminder' ? t('planner.taskModal.fields.placeholders.reminder') :
                    taskType === 'milestone' ? t('planner.taskModal.fields.placeholders.milestone') :
                      taskType === 'subtask' ? t('planner.taskModal.fields.placeholders.subtask') :
                        t('planner.taskModal.fields.placeholders.default')
                }
                required
              />
            </div>

            {/* Description - Show for Task and Milestone */}
            {(taskType === 'task' || taskType === 'milestone') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={t('planner.taskModal.fields.addDescription')}
                />
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('planner.taskModal.fields.dueDate')}
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {t('planner.taskModal.fields.time')}
                </label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Flag className="w-4 h-4 inline mr-1" />
                  {t('planner.taskModal.fields.priority')}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="low">{t('planner.bulkActions.setLowPriority')}</option>
                  <option value="medium">{t('planner.bulkActions.setMediumPriority')}</option>
                  <option value="high">{t('planner.bulkActions.setHighPriority')}</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="todo">{t('planner.bulkActions.moveToTodo')}</option>
                  <option value="in-progress">{t('planner.bulkActions.moveToInProgress')}</option>
                  <option value="review">Review</option>
                  <option value="done">{t('planner.bulkActions.moveToDone')}</option>
                </select>
              </div>
            </div>

            {/* Estimated Time - Show for Task and Subtask only */}
            {(taskType === 'task' || taskType === 'subtask') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {t('planner.taskModal.fields.estimatedTime')}
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            )}

            {/* Assignees - Show for Task, Subtask, and Milestone */}
            {(taskType === 'task' || taskType === 'subtask' || taskType === 'milestone') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  {t('planner.taskModal.fields.assignees')}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAssignee())}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder={t('planner.taskModal.fields.enterAssignee')}
                  />
                  <button
                    type="button"
                    onClick={handleAddAssignee}
                    className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                  >
                    {t('planner.taskModal.fields.add')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.assignees.map(assignee => (
                    <span
                      key={assignee}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-700 rounded-full text-sm"
                    >
                      {assignee}
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignee(assignee)}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags - Show for all types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                {t('planner.taskModal.fields.tags')}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={t('planner.taskModal.fields.enterTag')}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  {t('planner.taskModal.fields.add')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Recurrence (for reminders) */}
            {taskType === 'reminder' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Repeat className="w-4 h-4 inline mr-1" />
                  {t('planner.taskModal.fields.recurrence')}
                </label>
                <select
                  value={formData.recurrence}
                  onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="none">{t('planner.taskModal.options.recurrence.none')}</option>
                  <option value="daily">{t('planner.taskModal.options.recurrence.daily')}</option>
                  <option value="weekly">{t('planner.taskModal.options.recurrence.weekly')}</option>
                  <option value="monthly">{t('planner.taskModal.options.recurrence.monthly')}</option>
                </select>
              </div>
            )}

            {/* Reminder - Show for all except Subtask */}
            {taskType !== 'subtask' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Bell className="w-4 h-4 inline mr-1" />
                  {taskType === 'reminder' ? t('planner.taskModal.fields.notificationTiming') : t('planner.taskModal.fields.reminderLabel')}
                </label>
                <select
                  value={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required={taskType === 'reminder'}
                >
                  <option value="none">{t('planner.taskModal.options.reminder.none')}</option>
                  <option value="15min">{t('planner.taskModal.options.reminder.15min')}</option>
                  <option value="30min">{t('planner.taskModal.options.reminder.30min')}</option>
                  <option value="1hour">{t('planner.taskModal.options.reminder.1hour')}</option>
                  <option value="1day">{t('planner.taskModal.options.reminder.1day')}</option>
                </select>
                {taskType === 'reminder' && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {t('planner.taskModal.options.notificationHint')}
                  </p>
                )}
              </div>
            )}

            {/* Client Visible Toggle - Show for Task and Milestone only */}
            {(taskType === 'task' || taskType === 'milestone') && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="clientVisible"
                  checked={formData.clientVisible}
                  onChange={(e) => setFormData({ ...formData, clientVisible: e.target.checked })}
                  className="w-4 h-4 text-accent-dark rounded border-gray-300 focus:ring-accent"
                />
                <label htmlFor="clientVisible" className="text-sm text-gray-700 dark:text-gray-700">
                  {t('planner.taskModal.fields.clientVisible')}
                </label>
              </div>
            )}

            {/* Notion Sync Toggle - Show for Task and Milestone only */}
            {(taskType === 'task' || taskType === 'milestone') && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  id="syncToNotion"
                  checked={formData.syncToNotion}
                  onChange={(e) => setFormData({ ...formData, syncToNotion: e.target.checked })}
                  className="w-4 h-4 text-gray-900 dark:text-white rounded border-gray-300 focus:ring-gray-900 dark:focus:ring-white"
                  disabled={!notionConnected}
                />
                <div className="flex-1">
                  <label htmlFor="syncToNotion" className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4" />
                    Sync to Notion
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {notionConnected
                      ? 'Create a Notion page for this task'
                      : 'Connect Notion in Settings to enable sync'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Jira Sync Toggle - Show for Task and Milestone only */}
            {(taskType === 'task' || taskType === 'milestone') && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <input
                  type="checkbox"
                  id="syncToJira"
                  checked={formData.syncToJira}
                  onChange={(e) => setFormData({ ...formData, syncToJira: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                  disabled={!jiraConnected}
                />
                <div className="flex-1">
                  <label htmlFor="syncToJira" className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Sync to Jira
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {jiraConnected
                      ? 'Create a Jira issue for this task'
                      : 'Connect Jira in Settings to enable sync'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-300 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('planner.taskModal.fields.cancel')}
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('planner.taskModal.fields.create')} {taskType.charAt(0).toUpperCase() + taskType.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreateModal;
