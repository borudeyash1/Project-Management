import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Clock,
  Bell,
  FileText,
  Building,
  BarChart3,
  Users,
  Target,
  ChevronRight,
  Home,
  LogOut,
  Mail
} from 'lucide-react';
import { apiService } from '../services/api';
import { redirectToDesktopSplash, shouldHandleInDesktop } from '../constants/desktop';
import { getAppUrl } from '../utils/appUrls';


interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  children?: SidebarItem[];
}

const Sidebar: React.FC = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarItems: SidebarItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/home'
    },

    {
      id: 'projects',
      label: 'Projects',
      icon: FolderOpen,
      path: '/projects'
    },
    {
      id: 'planner',
      label: 'Planner',
      icon: Calendar,
      path: '/planner'
    },
    {
      id: 'tracker',
      label: 'Tracker',
      icon: Clock,
      path: '/tracker'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: FileText,
      path: '/tasks'
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: Bell,
      path: '/reminders'
    },
    {
      id: 'workspace',
      label: 'Workspace',
      icon: Building,
      path: '/workspace'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      path: '/reports'
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users,
      path: '/team'
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      path: '/goals'
    }
  ];

  // Bottom items removed - Settings and Profile are now only in header dropdown

  const handleItemClick = (item: SidebarItem) => {
    navigate(item.path);
    dispatch({ type: 'SET_SECTION', payload: item.id });
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    dispatch({ type: 'LOGOUT' });

    if (shouldHandleInDesktop()) {
      redirectToDesktopSplash();
      return;
    }

    navigate('/login');
  };

  const isActive = (item: SidebarItem) => {
    return location.pathname === item.path ||
           (item.path !== '/home' && location.pathname.startsWith(item.path));
  };


  return (
    <aside className={`bg-white dark:bg-gray-800 border-r border-border dark:border-gray-600 transition-all duration-300 ${
      state.sidebar.collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="h-full flex flex-col overflow-y-auto">
        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700'
                    : 'text-slate-700 dark:text-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!state.sidebar.collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {item.children && !state.sidebar.collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            );
          })}

          {/* Sartthi Apps Section */}
          {!state.sidebar.collapsed && (
            <div className="pt-4 mt-4 border-t border-gray-300 dark:border-gray-600">
              <div className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Sartthi Apps
              </div>
              <div className="space-y-1">
                {/* Sartthi Mail */}
                {/* Sartthi Mail */}
                <button
                  onClick={() => navigate('/mail')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-gray-100"
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">Sartthi Mail</span>
                </button>

                {/* Sartthi Calendar */}
                <button
                  onClick={() => navigate('/calendar')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-gray-100"
                >
                  <Calendar className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">Sartthi Calendar</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-border dark:border-gray-600 space-y-2">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-red-600 dark:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-700"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!state.sidebar.collapsed && (
              <span className="truncate">Logout</span>
            )}
          </button>
        </div>

        {/* Workspace Info */}
        {!state.sidebar.collapsed && (
          <div className="p-4 border-t border-border dark:border-gray-600">
            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-md flex items-center justify-center text-white font-semibold text-xs bg-accent">
                  {state.currentWorkspace.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{state.currentWorkspace}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-200">
                {state.workspaces.find(w => w.name === state.currentWorkspace)?.memberCount || 0} members
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
