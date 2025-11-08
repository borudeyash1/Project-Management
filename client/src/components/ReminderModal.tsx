import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, Bell, Tag, Users, MapPin, Link as LinkIcon,
  Repeat, Paperclip, FileText, AlertCircle, Plus, Trash2
} from 'lucide-react';

interface Reminder {
  _id?: string;
  title: string;
  description?: string;
  type: 'task' | 'meeting' | 'deadline' | 'milestone' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  completed: boolean;
  project?: {
    _id: string;
    name: string;
    color: string;
  };
  assignee?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  notifications: Array<{
    type: 'email' | 'push' | 'sms';
    minutesBefore: number;
  }>;
  location?: string;
  meetingLink?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  notes?: string;
}

interface ReminderModalProps {
  reminder?: Reminder | null;
  onSave: (reminder: Partial<Reminder>) => void;
  onClose: () => void;
  projects?: Array<{ _id: string; name: string; color: string }>;
  teamMembers?: Array<{ _id: string; name: string; avatar?: string }>;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  reminder,
  onSave,
  onClose,
  projects = [],
  teamMembers = []
}) => {
  const [formData, setFormData] = useState<Partial<Reminder>>({
    title: reminder?.title || '',
    description: reminder?.description || '',
    type: reminder?.type || 'task',
    priority: reminder?.priority || 'medium',
    dueDate: reminder?.dueDate || new Date(),
    project: reminder?.project,
    assignee: reminder?.assignee,
    tags: reminder?.tags || [],
    recurring: reminder?.recurring,
    notifications: reminder?.notifications || [{ type: 'push', minutesBefore: 15 }],
    location: reminder?.location || '',
    meetingLink: reminder?.meetingLink || '',
    notes: reminder?.notes || '',
    completed: reminder?.completed || false
  });

  const [newTag, setNewTag] = useState('');
  const [showRecurring, setShowRecurring] = useState(!!reminder?.recurring);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag)
    });
  };

  const addNotification = () => {
    setFormData({
      ...formData,
      notifications: [
        ...(formData.notifications || []),
        { type: 'push', minutesBefore: 15 }
      ]
    });
  };

  const removeNotification = (index: number) => {
    setFormData({
      ...formData,
      notifications: formData.notifications?.filter((_, i) => i !== index)
    });
  };

  const updateNotification = (index: number, field: string, value: any) => {
    const updated = [...(formData.notifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, notifications: updated });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            {reminder ? 'Edit Reminder' : 'Create Reminder'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter reminder title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="task">Task</option>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="milestone">Milestone</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Project and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={formData.project?._id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p._id === e.target.value);
                  setFormData({ ...formData, project });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <select
                value={formData.assignee?._id || ''}
                onChange={(e) => {
                  const assignee = teamMembers.find(m => m._id === e.target.value);
                  setFormData({ ...formData, assignee });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No Assignee</option>
                {teamMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notifications
            </label>
            <div className="space-y-2">
              {formData.notifications?.map((notif, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={notif.type}
                    onChange={(e) => updateNotification(index, 'type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="push">Push</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                  <input
                    type="number"
                    value={notif.minutesBefore}
                    onChange={(e) => updateNotification(index, 'minutesBefore', parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  <span className="flex items-center text-sm text-gray-600">minutes before</span>
                  <button
                    type="button"
                    onClick={() => removeNotification(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addNotification}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Notification
              </button>
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={showRecurring}
                onChange={(e) => {
                  setShowRecurring(e.target.checked);
                  if (!e.target.checked) {
                    setFormData({ ...formData, recurring: undefined });
                  } else {
                    setFormData({
                      ...formData,
                      recurring: { frequency: 'daily', interval: 1 }
                    });
                  }
                }}
                className="rounded border-gray-300"
              />
              Recurring
            </label>
            {showRecurring && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <select
                  value={formData.recurring?.frequency || 'daily'}
                  onChange={(e) => setFormData({
                    ...formData,
                    recurring: { ...formData.recurring!, frequency: e.target.value as any }
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={formData.recurring?.interval || 1}
                  onChange={(e) => setFormData({
                    ...formData,
                    recurring: { ...formData.recurring!, interval: parseInt(e.target.value) }
                  })}
                  placeholder="Interval"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Add location..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Meeting Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add notes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {reminder ? 'Save Changes' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;
