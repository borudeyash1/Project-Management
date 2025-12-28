import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { useDock } from '../../context/DockContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  MessageSquare,
  UserPlus,
  Briefcase,
  UserCircle,
  Calendar,
  Palette,
  Trello,
  FileText,
  Headphones,
  Hash
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
  const { dockPosition } = useDock();
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId: routeWorkspaceId } = useParams<{ workspaceId: string }>();

  const activeWorkspaceId = state.currentWorkspace || routeWorkspaceId || state.workspaces[0]?._id || '';
  const currentWorkspace = state.workspaces.find(w => w._id === activeWorkspaceId);
  const isOwner = currentWorkspace?.owner === state.userProfile._id;

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
      id: 'attendance',
      label: t('workspace.detail.tabs.attendance'),
      icon: Calendar,
      path: `/workspace/${activeWorkspaceId}/attendance`
    },
    {
      id: 'projects',
      label: t('workspace.tabs.projects'),
      icon: FolderKanban,
      path: `/workspace/${activeWorkspaceId}/projects`
    },
    {
      id: 'design',
      label: 'Design',
      icon: Palette,
      path: `/workspace/${activeWorkspaceId}/design`
    },
    {
      id: 'jira',
      label: 'Jira',
      icon: Trello,
      path: `/workspace/${activeWorkspaceId}/jira`
    },
    {
      id: 'notion',
      label: 'Notion',
      icon: FileText,
      path: `/workspace/${activeWorkspaceId}/notion`
    },
    {
      id: 'zendesk',
      label: 'Zendesk',
      icon: Headphones,
      path: `/workspace/${activeWorkspaceId}/zendesk`
    },
    {
      id: 'slack',
      label: 'Slack',
      icon: Hash,
      path: `/workspace/${activeWorkspaceId}/slack`
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
    // Hidden - Not fully implemented yet
    // {
    //   id: 'collaborate',
    //   label: t('workspace.tabs.collaborate'),
    //   icon: UserPlus,
    //   path: `/workspace/${activeWorkspaceId}/collaborate`,
    //   ownerOnly: true
    // },
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
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${active
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
      </div>
    </div>
  );
};

export default WorkspaceInternalNav;
