import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, Globe, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

interface WorkspaceEditTabProps {
  workspace: any;
}

const WorkspaceEditTab: React.FC<WorkspaceEditTabProps> = ({ workspace }) => {
  const { dispatch } = useApp();
  
  const [formData, setFormData] = useState({
    name: workspace?.name || '',
    description: workspace?.description || '',
    type: workspace?.type || 'team',
    region: workspace?.region || 'North America',
    contactEmail: '',
    contactPhone: '',
    address: '',
    website: '',
    isPublic: (workspace as any)?.isPublic || false,
    allowMemberInvites: workspace?.settings?.allowMemberInvites || true,
    requireApproval: workspace?.settings?.requireApprovalForJoining || false
  });

  const handleSave = () => {
    // TODO: Implement API call to update workspace
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Workspace updated successfully!',
        duration: 3000
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Workspace Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Workspace Information</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workspace Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter workspace name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="personal">Personal</option>
                <option value="team">Team</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your workspace"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Region
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="South America">South America</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contact@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>
        </div>
      </div>

      {/* Privacy & Permissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy & Permissions</h3>
        
        <div className="space-y-4">
          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="mt-1 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium text-gray-900">
                {formData.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Public Workspace
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Anyone can discover and request to join this workspace
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowMemberInvites}
              onChange={(e) => setFormData({ ...formData, allowMemberInvites: e.target.checked })}
              className="mt-1 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Allow Member Invites</div>
              <div className="text-sm text-gray-600 mt-1">
                Members can invite others to join the workspace
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requireApproval}
              onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
              className="mt-1 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Require Approval for Joining</div>
              <div className="text-sm text-gray-600 mt-1">
                Owner must approve all join requests
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default WorkspaceEditTab;
