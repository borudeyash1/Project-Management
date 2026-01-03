import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { Save, Globe, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import apiService from '../../services/api';

interface WorkspaceEditTabProps {
  workspace: any;
}

const WorkspaceEditTab: React.FC<WorkspaceEditTabProps> = ({ workspace }) => {
  const { dispatch } = useApp();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: workspace?.name || '',
    description: workspace?.description || '',
    type: workspace?.type || 'team',
    region: workspace?.region || 'North America',
    contactEmail: workspace?.contactInfo?.email || '',
    contactPhone: workspace?.contactInfo?.phone || '',
    address: workspace?.contactInfo?.address || '',
    website: workspace?.contactInfo?.website || '',
    isPublic: true, // Always true - workspaces are public by default
    allowMemberInvites: workspace?.settings?.allowMemberInvites || true,
    requireApproval: workspace?.settings?.requireApprovalForJoining || false
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: t('workspace.edit.errorName'),
          duration: 3000
        }
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare workspace data for API
      const workspaceData: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        region: formData.region,
        contactInfo: {
          email: formData.contactEmail,
          phone: formData.contactPhone,
          address: formData.address,
          website: formData.website
        },
        settings: {
          ...workspace.settings, // Preserve existing settings like defaultProjectPermissions
          isPublic: true, // Always true - workspaces are public by default
          allowMemberInvites: formData.allowMemberInvites,
          requireApprovalForJoining: formData.requireApproval
        }
      };

      // Call API to update workspace in database
      const updatedWorkspace = await apiService.updateWorkspace(workspace._id, workspaceData);

      // Update workspace in global state
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: updatedWorkspace
      });

      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: t('workspace.edit.success'),
          duration: 3000
        }
      });
    } catch (error: any) {
      console.error('Failed to update workspace:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to update workspace. Please try again.',
          duration: 4000
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Information */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('workspace.edit.infoTitle')}</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('workspace.edit.nameLabel')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder={t('workspace.edit.namePlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('workspace.edit.typeLabel')}
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="personal">{t('workspace.edit.types.personal')}</option>
                <option value="team">{t('workspace.edit.types.team')}</option>
                <option value="enterprise">{t('workspace.edit.types.enterprise')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('workspace.edit.descriptionLabel')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder={t('workspace.edit.descriptionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                {t('workspace.edit.regionLabel')}
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="North America">{t('workspace.edit.regions.northAmerica')}</option>
                <option value="Europe">{t('workspace.edit.regions.europe')}</option>
                <option value="Asia">{t('workspace.edit.regions.asia')}</option>
                <option value="South America">{t('workspace.edit.regions.southAmerica')}</option>
                <option value="Africa">{t('workspace.edit.regions.africa')}</option>
                <option value="Oceania">{t('workspace.edit.regions.oceania')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                {t('workspace.edit.emailLabel')}
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="contact@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                {t('workspace.edit.phoneLabel')}
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                {t('workspace.edit.websiteLabel')}
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('workspace.edit.addressLabel')}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>
        </div>
      </div>

      {/* Privacy & Permissions */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('workspace.edit.privacyTitle')}</h3>
        
        <div className="space-y-4">
          <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed opacity-75">
            <input
              type="checkbox"
              checked={true}
              disabled={true}
              className="mt-1 rounded cursor-not-allowed"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium text-gray-900">
                {formData.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {t('workspace.edit.publicWorkspace')}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {t('workspace.edit.publicDesc')}
              </div>
              <div className="text-xs text-gray-500 mt-2 italic">
                All workspaces are public by default and this setting cannot be changed.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed opacity-75">
            <input
              type="checkbox"
              checked={formData.allowMemberInvites}
              disabled={true}
              className="mt-1 rounded cursor-not-allowed"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{t('workspace.edit.allowInvites')}</div>
              <div className="text-sm text-gray-600 mt-1">
                {t('workspace.edit.allowInvitesDesc')}
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed opacity-75">
            <input
              type="checkbox"
              checked={formData.requireApproval}
              disabled={true}
              className="mt-1 rounded cursor-not-allowed"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{t('workspace.edit.requireApproval')}</div>
              <div className="text-sm text-gray-600 mt-1">
                {t('workspace.edit.requireApprovalDesc')}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : t('workspace.edit.save')}
        </button>
      </div>
    </div>
  );
};

export default WorkspaceEditTab;
