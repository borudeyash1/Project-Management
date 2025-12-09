import React, { useState } from 'react';
import { X, CheckSquare, Bell, Flag, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePlanner } from '../../context/PlannerContext';
import apiService from '../../services/api';

interface QuickAddModalProps {
  onClose: () => void;
  defaultDate?: Date;
  defaultTime?: string;
  defaultStatus?: string;
}

type ItemType = 'task' | 'reminder' | 'milestone' | 'event';

const QuickAddModal: React.FC<QuickAddModalProps> = ({ onClose, defaultDate, defaultTime }) => {
  const { state, dispatch } = useApp();
  const { fetchData } = usePlanner();
  const [activeType, setActiveType] = useState<ItemType>('task');
  const [loading, setLoading] = useState(false);

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate ? defaultDate.toISOString().split('T')[0] : '');
  const [dueTime, setDueTime] = useState(defaultTime || '');

  // Task specific
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [project, setProject] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  // Milestone specific
  const [startDate, setStartDate] = useState('');

  // Event specific
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(false);

  const itemTypes = [
    { id: 'task', label: 'Task', icon: CheckSquare, color: 'blue' },
    { id: 'reminder', label: 'Reminder', icon: Bell, color: 'yellow' },
    { id: 'milestone', label: 'Milestone', icon: Flag, color: 'purple' },
    { id: 'event', label: 'Event', icon: Calendar, color: 'green' }
  ];

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      // Get workspace - optional now
      const selectedWorkspace = workspace || null;

      switch (activeType) {
        case 'task':
          const taskData: any = {
            title,
            description,
            reporter: state.userProfile._id,
            priority,
            dueDate: dueDate ? new Date(`${dueDate}T${dueTime || '23:59'}`) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            subtasks: subtasks.map(st => ({ title: st, completed: false }))
          };
          if (selectedWorkspace) taskData.workspace = selectedWorkspace;
          if (project) taskData.project = project;

          console.log('Creating task:', taskData);
          response = await apiService.post('/tasks', taskData);
          break;

        case 'reminder':
          const reminderData: any = {
            title,
            description,
            type: 'personal',
            priority,
            dueDate: new Date(`${dueDate}T${dueTime || '09:00'}`),
            createdBy: state.userProfile._id,
            assignedTo: state.userProfile._id
          };
          if (selectedWorkspace) reminderData.workspace = selectedWorkspace;

          console.log('Creating reminder:', reminderData);
          response = await apiService.post('/reminders', reminderData);
          break;

        case 'milestone':
          const milestoneData: any = {
            title,
            description,
            dueDate: new Date(dueDate),
            startDate: startDate ? new Date(startDate) : undefined,
            createdBy: state.userProfile._id
          };
          if (selectedWorkspace) milestoneData.workspace = selectedWorkspace;
          if (project) milestoneData.project = project;

          console.log('Creating milestone:', milestoneData);
          response = await apiService.post('/milestones', milestoneData);
          break;

        case 'event':
          // For events, we need start date (use dueDate as start if no startDate)
          const eventStartDate = startDate || dueDate;
          const eventEndDate = endDate || dueDate;

          if (!eventStartDate) {
            throw new Error('Start date is required for events');
          }

          const eventData = {
            title,
            description,
            start: new Date(`${eventStartDate}T${dueTime || '09:00'}`),
            end: new Date(`${eventEndDate}T${dueTime || '10:00'}`),
            allDay,
            participants: [state.userProfile._id]
          };
          console.log('Creating event:', eventData);
          response = await apiService.post('/planner/events', eventData);
          break;
      }

      console.log('API Response:', response);

      // Refresh planner data
      await fetchData();

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: `${itemTypes.find(t => t.id === activeType)?.label} created successfully`,
          duration: 3000
        }
      });

      onClose();
    } catch (error: any) {
      console.error('Failed to create item:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create item';
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: errorMessage,
          duration: 5000
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Add</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-4 gap-2">
            {itemTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id as ItemType)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${activeType === type.id
                      ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${activeType === type.id ? `text-${type.color}-600 dark:text-${type.color}-400` : 'text-gray-600 dark:text-gray-400'}`} />
                  <span className={`text-sm font-medium ${activeType === type.id ? `text-${type.color}-700 dark:text-${type.color}-300` : 'text-gray-700 dark:text-gray-300'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder={`Enter ${activeType} title`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Add details..."
            />
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            {(activeType === 'milestone' || activeType === 'event') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date {activeType === 'event' && '*'}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required={activeType === 'event'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {activeType === 'event' ? 'End Date' : 'Due Date'} *
              </label>
              <input
                type="date"
                value={activeType === 'event' ? endDate : dueDate}
                onChange={(e) => activeType === 'event' ? setEndDate(e.target.value) : setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {activeType !== 'milestone' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Priority (Task & Reminder) */}
          {(activeType === 'task' || activeType === 'reminder') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          )}

          {/* Workspace & Project (Task & Milestone) */}
          {(activeType === 'task' || activeType === 'milestone') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workspace
                </label>
                <select
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select workspace</option>
                  {state.workspaces.map(ws => (
                    <option key={ws._id} value={ws._id}>{ws.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project (Optional)
                </label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">No project</option>
                  {state.projects.map(proj => (
                    <option key={proj._id} value={proj._id}>{proj.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Subtasks (Task only) */}
          {activeType === 'task' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtasks
              </label>
              <div className="space-y-2">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{subtask}</span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                    placeholder="Add subtask..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* All Day (Event only) */}
          {activeType === 'event' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
              <label htmlFor="allDay" className="text-sm text-gray-700 dark:text-gray-300">
                All day event
              </label>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title || (activeType === 'event' ? (!startDate && !dueDate) : !dueDate)}
            className="px-6 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
          >
            {loading ? 'Creating...' : `Create ${itemTypes.find(t => t.id === activeType)?.label}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
