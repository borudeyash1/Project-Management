import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Info,
  Users,
  MessageSquare,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  Clock,
  Target,
  FileText
} from 'lucide-react';

interface ProjectTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  managerOnly?: boolean;
}

const ProjectInternalNav: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  const project = state.projects.find(p => p._id === projectId);
  const isProjectManager = project?.teamMembers?.some(
    (m: any) => m.user === state.userProfile._id && (m.role === 'project-manager' || m.permissions?.canManageProject)
  ) || false;
  const isOwner = state.workspaces.find(w => w._id === project?.workspace)?.owner === state.userProfile._id;
  const canManage = isProjectManager || isOwner;

  const projectTabs: ProjectTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      path: `/project/${projectId}/overview`
    },
    {
      id: 'info',
      label: 'Project Info',
      icon: Info,
      path: `/project/${projectId}/info`
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users,
      path: `/project/${projectId}/team`
    },
    {
      id: 'tasks',
      label: 'Tasks & Board',
      icon: CheckSquare,
      path: `/project/${projectId}/tasks`
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Calendar,
      path: `/project/${projectId}/timeline`
    },
    {
      id: 'progress',
      label: 'Progress Tracker',
      icon: Target,
      path: `/project/${projectId}/progress`
    },
    {
      id: 'workload',
      label: 'Workload',
      icon: Clock,
      path: `/project/${projectId}/workload`,
      managerOnly: true
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: Clock,
      path: `/project/${projectId}/attendance`,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      path: `/project/${projectId}/reports`
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      path: `/project/${projectId}/documents`
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: MessageSquare,
      path: `/project/${projectId}/inbox`
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: `/project/${projectId}/settings`,
      managerOnly: true
    }
  ];

  // Filter tabs based on user role
  const visibleTabs = projectTabs.filter(tab => !tab.managerOnly || canManage);

  const isActiveTab = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
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

export default ProjectInternalNav;
