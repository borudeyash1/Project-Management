import React, { useState, useEffect } from 'react';
import { X, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { goalService, Goal } from '../../services/goalService';
import { apiService } from '../../services/api';

interface AddGoalModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'personal',
    category: 'productivity',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    tags: '',
    slackChannelId: ''
  });
  const [slackChannels, setSlackChannels] = useState<Array<{ id: string; name: string }>>([]);
  const [hasSlackConnected, setHasSlackConnected] = useState(false);

  useEffect(() => {
    checkSlackConnection();
  }, []);

  const checkSlackConnection = async () => {
    try {
      const response = await apiService.get('/sartthi-accounts/slack');
      if (response.success && response.data.accounts && response.data.accounts.length > 0) {
        setHasSlackConnected(true);
        fetchSlackChannels();
      }
    } catch (error) {
      console.error('Failed to check Slack connection:', error);
    }
  };

  const fetchSlackChannels = async () => {
    try {
      const response = await apiService.get('/slack/channels');
      if (response.success) {
        setSlackChannels(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Slack channels:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const goalData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        startDate: new Date(formData.startDate),
        targetDate: new Date(formData.targetDate)
      };
      await goalService.createGoal(goalData as any);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{t('goals.newGoal')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.name')}</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('goals.typeLabel')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="personal">{t('goals.type.personal')}</option>
                <option value="team">{t('goals.type.team')}</option>
                <option value="project">{t('goals.type.project')}</option>
                <option value="company">{t('goals.type.company')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('goals.categoryLabel')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="productivity">{t('goals.category.productivity')}</option>
                <option value="learning">{t('goals.category.learning')}</option>
                <option value="health">{t('goals.category.health')}</option>
                <option value="financial">{t('goals.category.financial')}</option>
                <option value="career">{t('goals.category.career')}</option>
                <option value="other">{t('goals.category.other')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('goals.startDate')}</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('goals.targetDate')}</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                value={formData.targetDate}
                onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('goals.sort.priority')}</label>
            <div className="flex gap-4">
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={formData.priority === p}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="text-accent focus:ring-accent"
                  />
                  <span className="capitalize">{t(`goals.priority.${p}`)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('goals.tags')}</label>
            <input
              type="text"
              placeholder="Tag1, Tag2, Tag3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          {/* Slack Channel */}
          {hasSlackConnected && slackChannels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Hash className="w-4 h-4 inline mr-1" />
                Slack Channel (Optional)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                value={formData.slackChannelId}
                onChange={e => setFormData({ ...formData, slackChannelId: e.target.value })}
              >
                <option value="">Don't post to Slack</option>
                {slackChannels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    #{channel.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Post this goal to a Slack channel when created
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('goals.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;
