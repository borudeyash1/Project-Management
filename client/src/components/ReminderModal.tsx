import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, Bell, Tag, Users, MapPin, Link as LinkIcon,
  Repeat, Paperclip, FileText, AlertCircle, Plus, Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
        <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            {reminder ? t('reminders.editReminder') : t('reminders.createReminder')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('planner.taskModal.fields.title')} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('reminders.enterTitle')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reminders.type')} *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="task">{t('planner.taskModal.types.task.label')}</option>
                <option value="meeting">{t('calendar.meetings')}</option>
                <option value="deadline">{t('projects.deadline')}</option>
                <option value="milestone">{t('projects.milestones')}</option>
                <option value="personal">{t('reminders.personal')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.priority')} *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="low">{t('common.low')}</option>
                <option value="medium">{t('common.medium')}</option>
                <option value="high">{t('common.high')}</option>
                <option value="urgent">{t('common.urgent')}</option>
              </select>
            </div>
          </div>

          {/* Due Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reminders.dueDateTime')} *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.description')}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('reminders.addDescription')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Project and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.projects')}
              </label>
              <select
                value={formData.project?._id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p._id === e.target.value);
                  setFormData({ ...formData, project });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="">{t('tasks.noProject')}</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('tasks.assignee')}
              </label>
              <select
                value={formData.assignee?._id || ''}
                onChange={(e) => {
                  const assignee = teamMembers.find(m => m._id === e.target.value);
                  setFormData({ ...formData, assignee });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="">{t('tasks.unassigned')}</option>
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
              {t('projects.tags')}
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
                placeholder={t('reminders.addTag')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
              >
                {t('common.add')}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.notifications')}
            </label>
            <div className="space-y-2">
              {formData.notifications?.map((notif, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={notif.type}
                    onChange={(e) => updateNotification(index, 'type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  >
                    <option value="push">{t('reminders.push')}</option>
                    <option value="email">{t('common.email')}</option>
                    <option value="sms">{t('reminders.sms')}</option>
                  </select>
                  <input
                    type="number"
                    value={notif.minutesBefore}
                    onChange={(e) => updateNotification(index, 'minutesBefore', parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    min="0"
                  />
                  <span className="flex items-center text-sm text-gray-600">{t('reminders.minutesBefore')}</span>
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
                className="text-sm text-accent-dark hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('reminders.addNotification')}
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
              {t('reminders.recurring')}
            </label>
            {showRecurring && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <select
                  value={formData.recurring?.frequency || 'daily'}
                  onChange={(e) => setFormData({
                    ...formData,
                    recurring: { ...formData.recurring!, frequency: e.target.value as any }
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                >
                  <option value="daily">{t('planner.taskModal.options.recurrence.daily')}</option>
                  <option value="weekly">{t('planner.taskModal.options.recurrence.weekly')}</option>
                  <option value="monthly">{t('planner.taskModal.options.recurrence.monthly')}</option>
                  <option value="yearly">{t('planner.taskModal.options.recurrence.yearly')}</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={formData.recurring?.interval || 1}
                  onChange={(e) => setFormData({
                    ...formData,
                    recurring: { ...formData.recurring!, interval: parseInt(e.target.value) }
                  })}
                  placeholder={t('reminders.interval')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                />
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-accent-dark hover:text-blue-700 flex items-center gap-1"
            >
              {showAdvanced ? t('reminders.hideAdvancedOptions') : t('reminders.showAdvancedOptions')}
            </button>
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t('calendar.location')}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={t('reminders.addLocation')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Meeting Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    {t('reminders.meetingLink')}
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder={t('reminders.enterMeetingLink')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {t('reminders.notes')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('reminders.addNotes')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
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
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-300"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
            >
              {reminder ? t('buttons.saveChanges') : t('reminders.createReminder')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;
