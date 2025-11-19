import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Home,
  FolderOpen,
  Calendar,
  Clock,
  Bell,
  Building,
  BarChart3,
  Users,
  FileText,
  Target,
  LogOut,
  Settings,
  User,
  Shield
} from 'lucide-react';
import { Dock, DockIcon } from './ui/Dock';
import { apiService } from '../services/api';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const DockNavigation: React.FC = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [showWorkspaces, setShowWorkspaces] = useState(false);

  // Check if user owns any workspace
  const isWorkspaceOwner = useMemo(() => {
    if (state.roles.currentUserRole === 'owner') {
      return true;
    }
    return state.workspaces.some(w => w.owner === state.userProfile._id);
  }, [state.workspaces, state.userProfile._id, state.roles.currentUserRole]);

  // Build main nav items dynamically
  const mainNavItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { id: 'home', label: 'Home', icon: Home, path: '/home' },
      { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/projects' },
      { id: 'planner', label: 'Planner', icon: Calendar, path: '/planner' },
      { id: 'tracker', label: 'Tracker', icon: Clock, path: '/tracker' },
      { id: 'tasks', label: 'Tasks', icon: FileText, path: '/tasks' },
      { id: 'reminders', label: 'Reminders', icon: Bell, path: '/reminders' },
      { id: 'workspace', label: 'Workspace', icon: Building, path: '/workspace' },
      { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
      { id: 'team', label: 'Team', icon: Users, path: '/team' },
      { id: 'goals', label: 'Goals', icon: Target, path: '/goals' }
    ];

    // Add Manage Workspace tab if user owns any workspace
    if (isWorkspaceOwner) {
      items.push({
        id: 'manage-workspace',
        label: 'Manage Workspace',
        icon: Shield,
        path: '/manage-workspace'
      });
    }

    return items;
  }, [isWorkspaceOwner]);

  const handleItemClick = (item: NavItem) => {
    navigate(item.path);
    dispatch({ type: 'SET_SECTION', payload: item.id });
  };

  const handleLogout = async () => {
    try {
      console.log('🔒 [USER DOCK] Logging out...');
      await apiService.logout();
      
      // Clear session storage
      sessionStorage.clear();
      
      dispatch({ type: 'LOGOUT' });
      console.log('✅ [USER DOCK] Session cleared, redirecting to login');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if API call fails, clear local session
      sessionStorage.clear();
      dispatch({ type: 'LOGOUT' });
      navigate('/login', { replace: true });
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/home' && location.pathname.startsWith(path));
  };

  return (
    <>
      {/* Main Dock */}
      <Dock direction="middle">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <DockIcon
              key={item.id}
              onClick={() => handleItemClick(item)}
              active={active}
              tooltip={item.label}
            >
              <Icon className="w-5 h-5" />
            </DockIcon>
          );
        })}

        {/* Workspace Icons - Show all joined/created workspaces */}
        {state.workspaces.slice(0, 3).map((workspace) => (
          <DockIcon
            key={workspace._id}
            onClick={() => {
              dispatch({ type: 'SET_MODE', payload: 'Workspace' });
              dispatch({ type: 'SET_WORKSPACE', payload: workspace._id });
              navigate(`/workspace/${workspace._id}/overview`);
            }}
            active={state.currentWorkspace === workspace._id}
            tooltip={workspace.name}
          >
            <Building className="w-5 h-5" />
          </DockIcon>
        ))}

        {/* More Workspaces if > 3 */}
        {state.workspaces.length > 3 && (
          <DockIcon
            onClick={() => setShowWorkspaces(true)}
            tooltip="More Workspaces"
          >
            <Building className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              +{state.workspaces.length - 3}
            </span>
          </DockIcon>
        )}

        {/* Settings */}
        <DockIcon
          onClick={() => navigate('/settings')}
          active={location.pathname === '/settings'}
          tooltip="Settings"
        >
          <Settings className="w-5 h-5" />
        </DockIcon>

        {/* Profile */}
        <DockIcon
          onClick={() => navigate('/profile')}
          active={location.pathname === '/profile'}
          tooltip="Profile"
        >
          <User className="w-5 h-5" />
        </DockIcon>

        {/* Logout */}
        <DockIcon
          onClick={handleLogout}
          tooltip="Logout"
          className="!bg-red-100 dark:!bg-red-900/30 !text-red-600 dark:!text-red-400 hover:!bg-red-200 dark:hover:!bg-red-900/50"
        >
          <LogOut className="w-5 h-5" />
        </DockIcon>
      </Dock>

      {/* Workspace Selector Modal */}
      {showWorkspaces && state.workspaces.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
          onClick={() => setShowWorkspaces(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Select Workspace
            </h3>
            
            {/* My Workspaces */}
            {state.workspaces.filter(w => w.owner === state.userProfile._id).length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  My Workspaces
                </div>
                <div className="space-y-2">
                  {state.workspaces
                    .filter(w => w.owner === state.userProfile._id)
                    .map((workspace) => (
                      <button
                        key={workspace._id}
                        onClick={() => {
                          dispatch({ type: 'SET_MODE', payload: 'Workspace' });
                          dispatch({ type: 'SET_WORKSPACE', payload: workspace._id });
                          navigate(`/workspace/${workspace._id}/overview`);
                          setShowWorkspaces(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Building className="w-5 h-5 text-blue-600" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {workspace.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {workspace.memberCount} members
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Joined Workspaces */}
            {state.workspaces.filter(w => w.owner !== state.userProfile._id).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Joined Workspaces
                </div>
                <div className="space-y-2">
                  {state.workspaces
                    .filter(w => w.owner !== state.userProfile._id)
                    .map((workspace) => (
                      <button
                        key={workspace._id}
                        onClick={() => {
                          dispatch({ type: 'SET_MODE', payload: 'Workspace' });
                          dispatch({ type: 'SET_WORKSPACE', payload: workspace._id });
                          navigate(`/workspace/${workspace._id}/overview`);
                          setShowWorkspaces(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Building className="w-5 h-5 text-purple-600" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {workspace.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {workspace.memberCount} members
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DockNavigation;
