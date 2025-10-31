import React, { useState } from 'react';
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
      payload: { message: 'Settings saved successfully', type: 'success' }
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Workspace Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage workspace configuration and preferences
        </p>
      </div>

      {/* Visibility Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Visibility</h2>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
              className="w-4 h-4 text-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Public</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Anyone can discover and request to join this workspace
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
              className="w-4 h-4 text-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Private</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Only invited members can access this workspace
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Region-Based Visibility */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Regional Visibility</h2>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select regions where your workspace will be visible
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {regions.map((region) => (
            <label
              key={region.code}
              className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedRegions.includes(region.code)}
                onChange={() => toggleRegion(region.code)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">{region.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
        </div>

        {/* Theme Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Theme Color
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Background Image
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
              {backgroundImage ? (
                <img src={backgroundImage} alt="Background" className="h-full w-full object-cover rounded-lg" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No image selected</p>
                </div>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Permissions</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Allow Member Invites</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Members can invite others to the workspace</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Project Creation</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow all members to create projects</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Require Join Approval</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Join requests must be approved by owner</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">Danger Zone</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Transfer Ownership</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transfer workspace to another member</p>
            </div>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              Transfer
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Archive Workspace</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Archive this workspace and all its data</p>
            </div>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              Archive
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg">
            <div>
              <div className="font-medium text-red-900 dark:text-red-400">Delete Workspace</div>
              <p className="text-sm text-red-600 dark:text-red-400">Permanently delete this workspace and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
