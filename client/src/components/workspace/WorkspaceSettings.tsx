import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Lock,
  Image as ImageIcon,
  Palette,
  Users,
  Shield,
  Trash2,
  Save,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';

const WorkspaceSettings: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useApp();
  const currentWorkspace = state.workspaces.find(w => w._id === state.currentWorkspace);
  
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['US', 'UK']);
  const [themeColor, setThemeColor] = useState('#3B82F6');
  const [backgroundImage, setBackgroundImage] = useState('');

  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' }
  ];

  const themeColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Pink', value: '#EC4899' }
  ];

  const handleSave = () => {
    dispatch({
      type: 'ADD_TOAST',
      payload: { message: t('workspace.settings.saveSuccess'), type: 'success' }
    });
  };

  const toggleRegion = (code: string) => {
    setSelectedRegions(prev =>
      prev.includes(code) ? prev.filter(r => r !== code) : [...prev, code]
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('workspace.settings.title')}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {t('workspace.settings.subtitle')}
        </p>
      </div>

      {/* Visibility Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-accent-dark" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('workspace.settings.visibility.title')}</h2>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
              className="w-4 h-4 text-accent-dark"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{t('workspace.settings.visibility.public')}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('workspace.settings.visibility.publicDesc')}
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
              className="w-4 h-4 text-accent-dark"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{t('workspace.settings.visibility.private')}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('workspace.settings.visibility.privateDesc')}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Region-Based Visibility */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-accent-dark" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('workspace.settings.regions.title')}</h2>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {t('workspace.settings.regions.desc')}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {regions.map((region) => (
            <label
              key={region.code}
              className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedRegions.includes(region.code)}
                onChange={() => toggleRegion(region.code)}
                className="w-4 h-4 text-accent-dark rounded"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">{region.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-accent-dark" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('workspace.settings.appearance.title')}</h2>
        </div>

        {/* Theme Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-3">
            {t('workspace.settings.appearance.themeColor')}
          </label>
          <div className="grid grid-cols-6 gap-3">
            {themeColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setThemeColor(color.value)}
                className={`h-12 rounded-lg transition-all ${
                  themeColor === color.value
                    ? 'ring-2 ring-offset-2 ring-blue-600 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Background Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-3">
            {t('workspace.settings.appearance.backgroundImage')}
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
              {backgroundImage ? (
                <img src={backgroundImage} alt="Background" className="h-full w-full object-cover rounded-lg" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.settings.appearance.noImage')}</p>
                </div>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Upload className="w-4 h-4" />
              {t('workspace.settings.appearance.upload')}
            </button>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-accent-dark" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('workspace.settings.permissions.title')}</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('workspace.settings.permissions.invite')}</div>
              <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.settings.permissions.inviteDesc')}</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-accent-dark rounded" defaultChecked />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('workspace.settings.permissions.projectCreation')}</div>
              <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.settings.permissions.projectCreationDesc')}</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-accent-dark rounded" />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('workspace.settings.permissions.requireApproval')}</div>
              <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.settings.permissions.requireApprovalDesc')}</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-accent-dark rounded" defaultChecked />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-600">{t('workspace.settings.dangerZone.title')}</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('workspace.settings.dangerZone.transfer')}</div>
              <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.settings.dangerZone.transferDesc')}</p>
            </div>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              {t('workspace.settings.dangerZone.transferBtn')}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('workspace.settings.dangerZone.archive')}</div>
              <p className="text-sm text-gray-600 dark:text-gray-200">{t('workspace.settings.dangerZone.archiveDesc')}</p>
            </div>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              {t('workspace.settings.dangerZone.archiveBtn')}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg">
            <div>
              <div className="font-medium text-red-900 dark:text-red-600">{t('workspace.settings.dangerZone.delete')}</div>
              <p className="text-sm text-red-600 dark:text-red-600">{t('workspace.settings.dangerZone.deleteDesc')}</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              {t('workspace.settings.dangerZone.deleteBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-300 dark:border-gray-600">
        <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          {t('common.cancel')}
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <Save className="w-4 h-4" />
          {t('workspace.settings.saveChanges')}
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
