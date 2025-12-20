import React, { useState } from 'react';
import { X, FileText, Calendar, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateReport: (report: {
    name: string;
    type: 'productivity' | 'time' | 'team' | 'financial' | 'project';
    description: string;
    dateRange: '7d' | '30d' | '90d' | '1y';
    tags: string[];
  }) => void;
}

const CreateReportModal: React.FC<CreateReportModalProps> = ({ isOpen, onClose, onCreateReport }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'productivity' | 'time' | 'team' | 'financial' | 'project'>('productivity');
  const [description, setDescription] = useState('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateReport({
      name,
      type,
      description,
      dateRange,
      tags
    });
    // Reset form
    setName('');
    setType('productivity');
    setDescription('');
    setDateRange('30d');
    setTags([]);
    setTagInput('');
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const reportTypes = [
    { value: 'productivity', label: 'Productivity Report', icon: TrendingUp, color: 'text-green-600' },
    { value: 'time', label: 'Time Tracking', icon: Clock, color: 'text-blue-600' },
    { value: 'team', label: 'Team Performance', icon: Users, color: 'text-purple-600' },
    { value: 'financial', label: 'Financial Report', icon: DollarSign, color: 'text-yellow-600' },
    { value: 'project', label: 'Project Report', icon: FileText, color: 'text-orange-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Report</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Report Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="e.g., Q1 Performance Review"
              required
            />
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {reportTypes.map((reportType) => {
                const Icon = reportType.icon;
                return (
                  <button
                    key={reportType.value}
                    type="button"
                    onClick={() => setType(reportType.value as any)}
                    className={`p-4 border-2 rounded-lg transition-all ${type === reportType.value
                        ? 'border-accent bg-accent bg-opacity-10'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Icon className={`w-6 h-6 ${reportType.color} mx-auto mb-2`} />
                    <p className="text-sm font-medium text-gray-900 text-center">
                      {reportType.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Brief description of what this report covers..."
              rows={3}
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range *
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Add tags (press Enter)"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent bg-opacity-20 text-accent-dark rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportModal;
