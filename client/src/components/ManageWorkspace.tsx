import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Building, Users, Settings, BarChart3, 
  Edit, Trash2, Plus, Eye, EyeOff, Crown, UserPlus,
  Mail, Lock, Globe, Calendar, DollarSign, AlertCircle,
  ArrowRight, Search, MapPin
} from 'lucide-react';

const ManageWorkspace: React.FC = () => {
  const { state } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Get workspaces owned by current user
  const ownedWorkspaces = useMemo(() => {
    return state.workspaces.filter(w => w.owner === state.userProfile._id);
  }, [state.workspaces, state.userProfile._id]);

  // Filter workspaces by search
  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return ownedWorkspaces;
    const query = searchQuery.toLowerCase();
    return ownedWorkspaces.filter(w => 
      w.name.toLowerCase().includes(query) ||
      w.description?.toLowerCase().includes(query) ||
      w.type.toLowerCase().includes(query)
    );
  }, [ownedWorkspaces, searchQuery]);

  const handleVisitWorkspace = (workspaceId: string) => {
    navigate(`/manage-workspace/${workspaceId}`);
  };

  if (ownedWorkspaces.length === 0) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('workspace.manage.noWorkspacesTitle')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('workspace.manage.noWorkspacesDesc')}
          </p>
          <button
            onClick={() => navigate('/workspace')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover"
          >
            <Plus className="w-5 h-5" />
            {t('workspace.manage.create')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-700">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="w-6 h-6 text-accent-dark" />
              {t('workspace.manage.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('workspace.manage.subtitle')}</p>
          </div>
          
          <button
            onClick={() => navigate('/workspace')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover"
          >
            <Plus className="w-4 h-4" />
            {t('workspace.manage.create')}
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('workspace.manage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Workspace Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((workspace) => (
              <div key={workspace._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 p-6 hover:shadow-lg transition-shadow">
                {/* Workspace Icon */}
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-accent-dark" />
                </div>

                {/* Workspace Info */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{workspace.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {workspace.description || t('workspace.detail.noDescription')}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{workspace.memberCount} {t('workspace.manage.members')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{workspace.region}</span>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    workspace.type === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                    workspace.type === 'team' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {t(`workspace.edit.types.${workspace.type}`) || workspace.type}
                  </span>
                  {(workspace as any)?.isPublic ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      {t('workspace.manage.public')}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {t('workspace.manage.private')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleVisitWorkspace(workspace._id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent text-gray-900 dark:text-gray-100 rounded-lg hover:bg-accent-hover transition-colors"
                >
                  {t('workspace.manage.visit')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredWorkspaces.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-600 dark:text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">{t('workspace.manage.noResults')} "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageWorkspace;
