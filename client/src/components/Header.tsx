import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import WorkspaceModeSwitcher from './WorkspaceModeSwitcher';
import UserDisplay from './UserDisplay';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import { SparklesText } from './ui/sparkles-text';
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const toggleUserMenu = () => {
    dispatch({ type: 'TOGGLE_USER_MENU' });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const toggleNotifications = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'notifications' });
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear tokens and state
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch({ type: 'LOGOUT' });
    dispatch({ type: 'TOGGLE_USER_MENU' });
    navigate('/login');
  };

  const handleTestRoleChange = (role: 'owner' | 'project-manager' | 'employee') => {
    dispatch({ type: 'SET_CURRENT_USER_ROLE', payload: role });
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-border dark:border-gray-700 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <AnimatedThemeToggler />
        
        <button
          className="p-2 rounded-lg border border-border dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 md:hidden"
          onClick={toggleSidebar}
        >
          {state.sidebar.collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md flex items-center justify-center text-white font-semibold tracking-tight bg-yellow-500">
            S
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold tracking-tight dark:text-gray-100">
              <SparklesText>Sartthi</SparklesText>
            </div>
            <div className="text-xs text-slate-500 dark:text-gray-400">Project & Payroll Suite</div>
          </div>
        </div>

        {/* Workspace Mode Switcher */}
        <WorkspaceModeSwitcher />
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              className="w-64 rounded-lg border border-border dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-gray-100 pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              placeholder="Search projects, tasks, people..."
            />
          </div>
        </div>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg border border-border dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 relative"
          onClick={toggleNotifications}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            3
          </span>
        </button>

        {/* Settings */}
        <button
          className="p-2 rounded-lg border border-border dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 dark:text-gray-300"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
            onClick={toggleUserMenu}
          >
            <UserDisplay
              name={state.userProfile.fullName}
              plan={state.userProfile.subscription?.plan || 'free'}
              avatar={state.userProfile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop'}
              size="sm"
              badgePosition="overlay"
            />
            <div className="hidden sm:block text-left ml-1">
              <div className="text-xs text-slate-500">{state.userProfile.designation}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* User Dropdown */}
          {state.userMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border dark:border-gray-700">
                <UserDisplay
                  name={state.userProfile.fullName}
                  plan={state.userProfile.subscription?.plan || 'free'}
                  avatar={state.userProfile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop'}
                  size="md"
                  badgePosition="right"
                  className="mb-2"
                />
                <div className="text-sm text-slate-500 dark:text-gray-400">{state.userProfile.email}</div>
              </div>

              <div className="p-2">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 dark:text-gray-300 text-sm"
                  onClick={() => {
                    navigate('/profile');
                    dispatch({ type: 'TOGGLE_USER_MENU' });
                  }}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>

                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 dark:text-gray-300 text-sm"
                  onClick={() => {
                    navigate('/settings');
                    dispatch({ type: 'TOGGLE_USER_MENU' });
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>

                <div className="mt-2 mb-2 rounded-lg bg-slate-50 dark:bg-gray-900/40 px-3 py-2">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 mb-1 uppercase">
                    Test User Role
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      className={`flex-1 min-w-[60px] px-2 py-1 text-[11px] rounded-full border ${
                        state.roles.currentUserRole === 'owner'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                      onClick={() => handleTestRoleChange('owner')}
                    >
                      Workspace Owner
                    </button>
                    <button
                      className={`flex-1 min-w-[60px] px-2 py-1 text-[11px] rounded-full border ${
                        state.roles.currentUserRole === 'project-manager'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                      onClick={() => handleTestRoleChange('project-manager')}
                    >
                      Project Manager
                    </button>
                    <button
                      className={`flex-1 min-w-[60px] px-2 py-1 text-[11px] rounded-full border ${
                        state.roles.currentUserRole === 'employee'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                      onClick={() => handleTestRoleChange('employee')}
                    >
                      Employee
                    </button>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 dark:text-gray-500">
                    Testing only  changes affect visible tabs and permissions.
                  </div>
                </div>

                <hr className="my-2" />

                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 text-sm text-red-600 dark:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
