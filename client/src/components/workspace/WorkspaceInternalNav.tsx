import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Briefcase
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

  const currentWorkspace = state.workspaces.find(w => w._id === state.currentWorkspace);
  const isOwner = currentWorkspace?.owner === state.userProfile._id;

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      path: `/workspace/${state.currentWorkspace}/overview`
    },
    {
      id: 'members',
      label: 'Members',
      icon: Users,
      path: `/workspace/${state.currentWorkspace}/members`
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      path: `/workspace/${state.currentWorkspace}/projects`
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Briefcase,
      path: `/workspace/${state.currentWorkspace}/clients`,
      ownerOnly: true
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: UserCheck,
      path: `/workspace/${state.currentWorkspace}/requests`,
      ownerOnly: true
    },
    {
      id: 'collaborate',
      label: 'Collaborate',
      icon: UserPlus,
      path: `/workspace/${state.currentWorkspace}/collaborate`,
      ownerOnly: true
    },
    {
      id: 'advertise',
      label: 'Advertise',
      icon: Megaphone,
      path: `/workspace/${state.currentWorkspace}/advertise`,
      ownerOnly: true
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: MessageSquare,
      path: `/workspace/${state.currentWorkspace}/inbox`
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: `/workspace/${state.currentWorkspace}/settings`,
      ownerOnly: true
    }
  ];

  // Filter tabs based on user role
  const visibleTabs = workspaceTabs.filter(tab => !tab.ownerOnly || isOwner);

  const isActiveTab = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-6">
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
      </div>
    </div>
  );
};

export default WorkspaceInternalNav;
