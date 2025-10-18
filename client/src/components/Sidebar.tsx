import React from 'react';
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
  ChevronDown
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  children?: SidebarItem[];
}

const Sidebar: React.FC = () => {
  const { state, dispatch } = useApp();

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
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
    }
  ];

  const bottomItems: SidebarItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile'
    }
  ];

  const handleItemClick = (item: SidebarItem) => {
    dispatch({ type: 'SET_SECTION', payload: item.id });
  };

  const isActive = (itemId: string) => {
    return state.currentSection === itemId;
  };

  return (
    <aside className={`bg-white border-r border-border transition-all duration-300 ${
      state.sidebar.collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="h-full flex flex-col">
        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
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
        <div className="p-4 border-t border-border space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!state.sidebar.collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Workspace Info */}
        {!state.sidebar.collapsed && (
          <div className="p-4 border-t border-border">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-md flex items-center justify-center text-white font-semibold text-xs bg-yellow-500">
                  {state.currentWorkspace.charAt(0)}
                </div>
                <span className="text-sm font-medium truncate">{state.currentWorkspace}</span>
              </div>
              <div className="text-xs text-slate-500">
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
