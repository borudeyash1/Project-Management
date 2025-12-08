import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Users, UserPlus, Building, FolderOpen,
  Search, Mail, Phone, MapPin, Globe, Eye, EyeOff,
  Save, X, Plus, Trash2, Check, Clock, Briefcase,
  FileText, Tag, DollarSign, Calendar, User, Files
} from 'lucide-react';
import WorkspaceEditTab from './workspace-detail/WorkspaceEditTab';
import WorkspaceCollaborateTab from './workspace-detail/WorkspaceCollaborateTab';
import WorkspaceMembersTab from './workspace-detail/WorkspaceMembersTab';
import WorkspaceClientsTab from './workspace-detail/WorkspaceClientsTab';
import WorkspaceProjectsTab from './workspace-detail/WorkspaceProjectsTab';
import VaultIntegration from './workspace-detail/VaultIntegration';
import WorkspaceAttendanceTab from './workspace-detail/WorkspaceAttendanceTab';

const WorkspaceDetailView: React.FC = () => {
  const { t } = useTranslation();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { state } = useApp();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'edit' | 'collaborate' | 'members' | 'clients' | 'projects' | 'documents' | 'attendance'>('edit');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Listen for client click events from ClientsTab
  useEffect(() => {
    const handleSwitchToProjects = (event: any) => {
      const clientId = event.detail?.clientId;
      if (clientId) {
        setSelectedClientId(clientId);
        setActiveTab('projects');
      }
    };

    window.addEventListener('switchToProjectsTab', handleSwitchToProjects as EventListener);
    return () => {
      window.removeEventListener('switchToProjectsTab', handleSwitchToProjects as EventListener);
    };
  }, []);
  
  // Get workspace details
  const workspace = useMemo(() => {
    return state.workspaces.find(w => w._id === workspaceId);
  }, [state.workspaces, workspaceId]);

  if (!workspace) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('workspace.detail.notFoundTitle')}</h2>
          <button
            onClick={() => navigate('/manage-workspace')}
            className="text-accent-dark hover:text-blue-700"
          >
            {t('workspace.detail.backToWorkspaces')}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'edit', label: t('workspace.detail.tabs.edit'), icon: Edit },
    { id: 'collaborate', label: t('workspace.detail.tabs.collaborate'), icon: Users },
    { id: 'members', label: t('workspace.detail.tabs.members'), icon: UserPlus },
    { id: 'clients', label: t('workspace.detail.tabs.clients'), icon: Briefcase },
    { id: 'projects', label: t('workspace.detail.tabs.projects'), icon: FolderOpen },
    { id: 'documents', label: 'Documents', icon: Files },
    { id: 'attendance', label: 'Attendance', icon: Clock }
  ];

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/manage-workspace')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Building className="w-6 h-6 text-accent-dark" />
                {workspace.name}
              </h1>
              <p className="text-gray-600 mt-1">{workspace.description || t('workspace.detail.noDescription')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-300 mb-6">
            <div className="flex border-b border-gray-300 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-accent-dark border-b-2 border-accent-dark'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'edit' && <WorkspaceEditTab workspace={workspace} />}
          {activeTab === 'collaborate' && <WorkspaceCollaborateTab workspaceId={workspace._id} />}
          {activeTab === 'members' && <WorkspaceMembersTab workspaceId={workspace._id} />}
          {activeTab === 'clients' && <WorkspaceClientsTab workspaceId={workspace._id} />}
          {activeTab === 'projects' && (
            <WorkspaceProjectsTab 
              workspaceId={workspace._id} 
              selectedClientId={selectedClientId}
              onClearClientFilter={() => setSelectedClientId(null)}
            />
          )}
          {activeTab === 'documents' && <VaultIntegration workspaceId={workspace._id} />}
          {activeTab === 'attendance' && <WorkspaceAttendanceTab workspaceId={workspace._id} />}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDetailView;
