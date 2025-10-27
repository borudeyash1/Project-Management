import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Clock,
  Bell,
  Settings,
  User,
  Building,
  ChevronRight,
  ChevronDown,
  Home,
  BarChart3,
  Users,
  FileText,
  Target,
  LogOut
} from 'lucide-react';
import { apiService } from '../services/api';

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
      dispatch({ type: 'LOGOUT' });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      dispatch({ type: 'LOGOUT' });
      navigate('/login');
    }
  };

  const isActive = (item: SidebarItem) => {
    return location.pathname === item.path ||
           (item.path !== '/home' && location.pathname.startsWith(item.path));
  };

  return (
    <aside className={`bg-white dark:bg-gray-800 border-r border-border dark:border-gray-700 transition-all duration-300 ${
      state.sidebar.collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="h-full flex flex-col">
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
                    : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-gray-100'
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
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-border dark:border-gray-700 space-y-2">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!state.sidebar.collapsed && (
              <span className="truncate">Logout</span>
            )}
          </button>
        </div>

        {/* Workspace Info */}
        {!state.sidebar.collapsed && (
          <div className="p-4 border-t border-border dark:border-gray-700">
            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-md flex items-center justify-center text-white font-semibold text-xs bg-yellow-500">
                  {state.currentWorkspace.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{state.currentWorkspace}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-400">
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
