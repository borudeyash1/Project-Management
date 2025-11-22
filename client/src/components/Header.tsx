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
import { redirectToDesktopSplash, shouldHandleInDesktop } from '../constants/desktop';

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

    if (shouldHandleInDesktop()) {
      redirectToDesktopSplash();
      return;
    }

    navigate('/login');
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-border dark:border-gray-600 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <AnimatedThemeToggler />
        
        <button
          className="p-2 rounded-lg border border-border dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 md:hidden"
          onClick={toggleSidebar}
        >
          {state.sidebar.collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>

        {/* Sartthi Logo */}
        <div className="flex items-center">
          <img src="/2.png" alt="Sartthi Logo" className="h-6 w-auto m-2" />
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
              className="w-64 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              placeholder="Search projects, tasks, people..."
            />
          </div>
        </div>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg border border-border dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 relative"
          onClick={toggleNotifications}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            3
          </span>
        </button>

        {/* Settings */}
        <button
          className="p-2 rounded-lg border border-border dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 dark:text-gray-700"
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
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-border dark:border-gray-600 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border dark:border-gray-600">
                <UserDisplay
                  name={state.userProfile.fullName}
                  plan={state.userProfile.subscription?.plan || 'free'}
                  avatar={state.userProfile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop'}
                  size="md"
                  badgePosition="right"
                  className="mb-2"
                />
                <div className="text-sm text-slate-500 dark:text-gray-200">{state.userProfile.email}</div>
              </div>

              <div className="p-2">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 dark:text-gray-700 text-sm"
                  onClick={() => {
                    navigate('/profile');
                    dispatch({ type: 'TOGGLE_USER_MENU' });
                  }}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>

                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 dark:text-gray-700 text-sm"
                  onClick={() => {
                    navigate('/settings');
                    dispatch({ type: 'TOGGLE_USER_MENU' });
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>

                <hr className="my-2" />

                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 text-sm text-red-600 dark:text-red-600"
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
