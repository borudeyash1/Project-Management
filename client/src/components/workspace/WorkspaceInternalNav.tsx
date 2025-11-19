import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId: routeWorkspaceId } = useParams<{ workspaceId: string }>();

  const activeWorkspaceId = state.currentWorkspace || routeWorkspaceId || state.workspaces[0]?._id || '';
  const currentWorkspace = state.workspaces.find(w => w._id === activeWorkspaceId);
  const isOwner = currentWorkspace?.owner === state.userProfile._id || state.roles.currentUserRole === 'owner';

  const handleQuickInvite = () => {
    if (!activeWorkspaceId) return;
    sessionStorage.setItem('workspaceMembersOpenInvite', 'true');
    window.dispatchEvent(new Event('workspace:open-invite'));
    navigate(`/workspace/${activeWorkspaceId}/members`);
  };

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      path: `/workspace/${activeWorkspaceId}/overview`
    },
    {
      id: 'members',
      label: 'Members',
      icon: Users,
      path: `/workspace/${activeWorkspaceId}/members`
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      path: `/workspace/${activeWorkspaceId}/projects`
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Briefcase,
      path: `/workspace/${activeWorkspaceId}/clients`,
      ownerOnly: true
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserCircle,
      path: `/workspace/${activeWorkspaceId}/profile`
    },
    {
      id: 'collaborate',
      label: 'Collaborate',
      icon: UserPlus,
      path: `/workspace/${activeWorkspaceId}/collaborate`,
      ownerOnly: true
    },
    {
      id: 'inbox',
      label: 'Inbox',
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
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300'
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
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add member
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkspaceInternalNav;
