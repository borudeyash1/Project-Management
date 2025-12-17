import React, { useState } from 'react';
import { X, Calendar, Clock, Flag, CheckSquare, Trash2, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlanner } from '../../context/PlannerContext';
import { Task } from '../../context/PlannerContext';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task: initialTask, onClose }) => {
  const { tasks, updateTask, deleteTask, addSubtask, toggleSubtask } = usePlanner();
  const { t } = useTranslation();
  
  // Get the live task from context to ensure real-time updates
  const task = tasks.find(t => t._id === initialTask._id) || initialTask;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [newSubtask, setNewSubtask] = useState('');

  const handleSave = () => {
    updateTask(task._id, editedTask);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(t('planner.taskDetail.deleteConfirm'))) {
      deleteTask(task._id);
      onClose();
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task._id, { title: newSubtask, completed: false });
      setNewSubtask('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-accent-dark bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-xl font-semibold w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{task.title}</h2>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  {t('planner.taskDetail.save')}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('planner.taskDetail.cancel')}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-gray-700 dark:text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('planner.taskDetail.edit')}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-600 dark:hover:text-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.description')}
                </label>
                {isEditing ? (
                  <textarea
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('planner.taskModal.fields.addDescription')}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-200">
                    {task.description || t('planner.taskDetail.noDescription')}
                  </p>
                )}
              </div>

              {/* Subtasks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <CheckSquare className="w-4 h-4 inline mr-1" />
                  {t('planner.taskDetail.subtasks')} ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
                </label>
                <div className="space-y-2">
                  {task.subtasks.map((subtask, idx) => (
                    <div key={subtask._id || idx} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => subtask._id && toggleSubtask(task._id, subtask._id)}
                        className="w-4 h-4 text-accent-dark rounded border-gray-300 focus:ring-accent"
                      />
                      <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                      placeholder={t('planner.taskDetail.addSubtask')}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={handleAddSubtask}
                      className="px-4 py-2 text-sm bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                    >
                      {t('planner.taskModal.fields.add')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  {t('planner.taskModal.fields.status')}
                </label>
                {isEditing ? (
                  <select
                    value={editedTask.status}
                    onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="pending">{t('planner.bulkActions.moveToTodo')}</option>
                    <option value="in-progress">{t('planner.bulkActions.moveToInProgress')}</option>
                    <option value="review">Review</option>
                    <option value="completed">{t('planner.bulkActions.moveToDone')}</option>
                  </select>
                ) : (
                  <span className="inline-block px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg">
                    {task.status}
                  </span>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Flag className="w-4 h-4 inline mr-1" />
                  {t('planner.taskModal.fields.priority')}
                </label>
                {isEditing ? (
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">{t('planner.bulkActions.setLowPriority')}</option>
                    <option value="medium">{t('planner.bulkActions.setMediumPriority')}</option>
                    <option value="high">{t('planner.bulkActions.setHighPriority')}</option>
                    <option value="urgent">Urgent</option>
                  </select>
                ) : (
                  <span className={`inline-block px-3 py-1 text-sm border rounded-lg ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('planner.taskModal.fields.dueDate')}
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-200">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t('planner.taskDetail.noDueDate')}
                  </span>
                )}
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {t('planner.taskModal.fields.estimatedTime')}
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editedTask.estimatedTime || 0}
                    onChange={(e) => setEditedTask({ ...editedTask, estimatedTime: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-200">
                    {task.estimatedTime ? `${task.estimatedTime} ${t('planner.taskDetail.hours')}` : t('planner.taskDetail.notSet')}
                  </span>
                )}
              </div>

              {/* Actual Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">
                  <Timer className="w-4 h-4 inline mr-1" />
                  Actual Time
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editedTask.actualHours || 0}
                    onChange={(e) => setEditedTask({ ...editedTask, actualHours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-200">
                    {task.actualHours ? `${task.actualHours} ${t('planner.taskDetail.hours')}` : t('planner.taskDetail.notSet')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
