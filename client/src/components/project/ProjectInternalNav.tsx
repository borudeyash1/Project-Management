import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const project = state.projects.find(p => p._id === projectId);
  const isProjectManager = project?.teamMembers?.some(
    (m: any) => m.user === state.userProfile._id && (m.role === 'project-manager' || m.permissions?.canManageProject)
  ) || false;
  const isOwner = state.workspaces.find(w => w._id === project?.workspace)?.owner === state.userProfile._id;
  const canManage = isProjectManager || isOwner;

  const projectTabs: ProjectTab[] = [
    {
      id: 'overview',
      label: t('project.tabs.overview'),
      icon: LayoutDashboard,
      path: `/project/${projectId}/overview`
    },
    {
      id: 'info',
      label: t('project.tabs.info'),
      icon: Info,
      path: `/project/${projectId}/info`
    },
    {
      id: 'team',
      label: t('project.tabs.team'),
      icon: Users,
      path: `/project/${projectId}/team`
    },
    {
      id: 'tasks',
      label: t('project.tabs.tasks'),
      icon: CheckSquare,
      path: `/project/${projectId}/tasks`
    },
    {
      id: 'timeline',
      label: t('project.tabs.timeline'),
      icon: Calendar,
      path: `/project/${projectId}/timeline`
    },
    {
      id: 'progress',
      label: t('project.tabs.progress'),
      icon: Target,
      path: `/project/${projectId}/progress`
    },
    {
      id: 'workload',
      label: 'Workload & Deadlines',
      icon: Clock,
      path: `/project/${projectId}/workload`
    },
    {
      id: 'reports',
      label: t('project.tabs.reports'),
      icon: BarChart3,
      path: `/project/${projectId}/reports`
    },
    {
      id: 'documents',
      label: t('project.tabs.documents'),
      icon: FileText,
      path: `/project/${projectId}/documents`
    },
    {
      id: 'inbox',
      label: t('project.tabs.inbox'),
      icon: MessageSquare,
      path: `/project/${projectId}/inbox`
    },
    {
      id: 'settings',
      label: t('project.tabs.settings'),
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

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeTab = visibleTabs.find(tab => isActiveTab(tab.path));
    if (activeTab && tabRefs.current[activeTab.id]) {
      const element = tabRefs.current[activeTab.id];
      if (element) {
        setIndicatorStyle({
          left: element.offsetLeft,
          width: element.offsetWidth
        });
      }
    }
  }, [location.pathname, visibleTabs]);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
      <div className="px-6">
        <div className="relative flex items-center gap-1 overflow-x-auto">
          {/* Smooth sliding indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-accent-dark dark:bg-accent-light transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`
            }}
          />

          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActiveTab(tab.path);

            return (
              <button
                key={tab.id}
                ref={(el) => (tabRefs.current[tab.id] = el)}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${active
                    ? 'text-accent-dark dark:text-accent-light'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
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
