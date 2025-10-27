import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import WorkspaceModeSwitcher from './WorkspaceModeSwitcher';
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

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-border dark:border-gray-700 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg border border-border dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 md:hidden"
          onClick={toggleSidebar}
        >
          {state.sidebar.collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md flex items-center justify-center text-white font-semibold tracking-tight bg-yellow-500">
            TF
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold tracking-tight dark:text-gray-100">Saarthi</div>
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
            className="flex items-center gap-2 p-2 rounded-lg border border-border dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700"
            onClick={toggleUserMenu}
          >
            <img
              className="h-6 w-6 rounded-full"
              src={state.userProfile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop'}
              alt={state.userProfile.fullName}
            />
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium">{state.userProfile.fullName}</div>
              <div className="text-xs text-slate-500">{state.userProfile.designation}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* User Dropdown */}
          {state.userMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={state.userProfile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop'}
                    alt={state.userProfile.fullName}
                  />
                  <div>
                    <div className="font-medium dark:text-gray-100">{state.userProfile.fullName}</div>
                    <div className="text-sm text-slate-500 dark:text-gray-400">{state.userProfile.email}</div>
                  </div>
                </div>
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
