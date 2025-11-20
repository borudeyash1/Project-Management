import React, { useState } from 'react';
import { X, Calendar, Clock, Flag, User, Tag, Repeat, Bell, FileText, Target, CheckSquare } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';

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
    project: '',
    milestone: ''
  });

  const [assigneeInput, setAssigneeInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const taskTypes = [
    { id: 'task', label: 'Task', icon: CheckSquare, description: 'Regular task with due date' },
    { id: 'reminder', label: 'Reminder', icon: Bell, description: 'Quick reminder with notification' },
    { id: 'milestone', label: 'Milestone', icon: Target, description: 'Project milestone or checkpoint' },
    { id: 'subtask', label: 'Subtask', icon: FileText, description: 'Part of a larger task' }
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

    // Create the task with all form data
    createTask({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      dueDate,
      estimatedTime: formData.estimatedTime,
      assignees: formData.assignees,
      tags: formData.tags,
      recurrence: formData.recurrence !== 'none' ? formData.recurrence : undefined,
      clientVisible: formData.clientVisible,
      project: formData.project || undefined,
      milestone: formData.milestone || undefined
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Task</h2>
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
                Task Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {taskTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setTaskType(type.id as TaskType)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        taskType === type.id
                          ? 'border-accent bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${
                        taskType === type.id ? 'text-accent-dark dark:text-accent-light' : 'text-gray-600'
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
                  <strong>Reminder:</strong> Quick notification for important events. Set the date/time and notification timing.
                </p>
              </div>
            )}
            {taskType === 'milestone' && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>Milestone:</strong> Important project checkpoint or deliverable. Can be made visible to clients.
                </p>
              </div>
            )}
            {taskType === 'subtask' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Subtask:</strong> Smaller work item that's part of a larger task. Track time and assign to team members.
                </p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder={
                  taskType === 'reminder' ? 'e.g., Team standup meeting' :
                  taskType === 'milestone' ? 'e.g., Launch v2.0' :
                  taskType === 'subtask' ? 'e.g., Write unit tests' :
                  'Enter task title'
                }
                required
              />
            </div>

            {/* Description - Show for Task and Milestone */}
            {(taskType === 'task' || taskType === 'milestone') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Add description..."
                />
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Due Date
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
                  Time
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
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* Estimated Time - Show for Task and Subtask only */}
            {(taskType === 'task' || taskType === 'subtask') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Estimated Time (hours)
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
                Assignees
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={assigneeInput}
                  onChange={(e) => setAssigneeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAssignee())}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter assignee name"
                />
                <button
                  type="button"
                  onClick={handleAddAssignee}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  Add
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
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  Add
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
                  Recurrence
                </label>
                <select
                  value={formData.recurrence}
                  onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}

            {/* Reminder - Show for all except Subtask */}
            {taskType !== 'subtask' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Bell className="w-4 h-4 inline mr-1" />
                  {taskType === 'reminder' ? 'Notification Timing *' : 'Reminder'}
                </label>
                <select
                  value={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required={taskType === 'reminder'}
                >
                  <option value="none">No reminder</option>
                  <option value="15min">15 minutes before</option>
                  <option value="30min">30 minutes before</option>
                  <option value="1hour">1 hour before</option>
                  <option value="1day">1 day before</option>
                </select>
                {taskType === 'reminder' && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    You'll receive a notification at this time
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
                  Make visible to client
                </label>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create {taskType.charAt(0).toUpperCase() + taskType.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreateModal;
