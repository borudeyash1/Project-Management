import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  UserCheck,
  Settings,
  MessageSquare,
  Megaphone,
  UserPlus,
  Briefcase,
  UserCircle
} from 'lucide-react';

interface WorkspaceTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  ownerOnly?: boolean;
}

const WorkspaceInternalNav: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId: routeWorkspaceId } = useParams<{ workspaceId: string }>();

  const activeWorkspaceId = state.currentWorkspace || routeWorkspaceId || state.workspaces[0]?._id || '';
  const currentWorkspace = state.workspaces.find(w => w._id === activeWorkspaceId);
  const isOwner = currentWorkspace?.owner === state.userProfile._id;

  const handleQuickInvite = () => {
    if (!activeWorkspaceId) return;
    sessionStorage.setItem('workspaceMembersOpenInvite', 'true');
    window.dispatchEvent(new Event('workspace:open-invite'));
    navigate(`/workspace/${activeWorkspaceId}/members`);
  };

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: t('workspace.tabs.overview'),
      icon: LayoutDashboard,
      path: `/workspace/${activeWorkspaceId}/overview`
    },
    {
      id: 'members',
      label: t('workspace.tabs.members'),
      icon: Users,
      path: `/workspace/${activeWorkspaceId}/members`
    },
    {
      id: 'projects',
      label: t('workspace.tabs.projects'),
      icon: FolderKanban,
      path: `/workspace/${activeWorkspaceId}/projects`
    },
    {
      id: 'clients',
      label: t('workspace.tabs.clients'),
      icon: Briefcase,
      path: `/workspace/${activeWorkspaceId}/clients`,
      ownerOnly: true
    },
    {
      id: 'profile',
      label: t('workspace.tabs.profile'),
      icon: UserCircle,
      path: `/workspace/${activeWorkspaceId}/profile`
    },
    {
      id: 'collaborate',
      label: t('workspace.tabs.collaborate'),
      icon: UserPlus,
      path: `/workspace/${activeWorkspaceId}/collaborate`,
      ownerOnly: true
    },
    {
      id: 'inbox',
      label: t('workspace.tabs.inbox'),
      icon: MessageSquare,
      path: `/workspace/${activeWorkspaceId}/inbox`
    }
  ];

  // Filter tabs based on user role
  const visibleTabs = workspaceTabs.filter(tab => !tab.ownerOnly || isOwner);

  const isActiveTab = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
      <div className="px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActiveTab(tab.path);

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? 'border-accent-dark text-accent-dark dark:text-accent-light'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        {isOwner && (
          <button
            onClick={handleQuickInvite}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-accent text-gray-900 hover:bg-accent-hover transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {t('workspace.nav.addMember')}
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkspaceInternalNav;
