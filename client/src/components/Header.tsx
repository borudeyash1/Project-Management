import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import WorkspaceModeSwitcher from './WorkspaceModeSwitcher';
import UserDisplay from './UserDisplay';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import { SparklesText } from './ui/sparkles-text';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  Monitor,
  Home
} from 'lucide-react';
import { redirectToDesktopSplash, shouldHandleInDesktop } from '../constants/desktop';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();
  const { preferences, applyTheme } = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const toggleNotifications = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'notifications' });
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLanguageMenu(false);
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
    setIsUserMenuOpen(false);

    if (shouldHandleInDesktop()) {
      redirectToDesktopSplash();
      return;
    }

    navigate('/login');
  };

  return (
    <header className="w-full h-14 bg-white dark:bg-gray-800 border-b border-border dark:border-gray-600 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
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
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-gray-400" />
            <input
              type="text"
              className="w-64 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              placeholder={t('forms.searchPlaceholder')}
            />
          </div>
        </div>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg border border-border dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 relative"
          onClick={toggleNotifications}
        >
          <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            3
          </span>
        </button>

        {/* Settings */}
        <button
          className="p-2 rounded-lg border border-border dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Language Switcher */}
        <div className="relative flex items-center">
          <button
            className="p-2 rounded-lg border border-border dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 flex items-center justify-center"
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          >
            <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>

          {showLanguageMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-border dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-2">
                {[
                  { code: 'en', name: 'English', flag: '🇬🇧' },
                  { code: 'ja', name: '日本語', flag: '🇯🇵' },
                  { code: 'ko', name: '한국어', flag: '🇰🇷' },
                  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
                  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
                  { code: 'fr', name: 'Français', flag: '🇫🇷' },
                  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                  { code: 'es', name: 'Español', flag: '🇪🇸' },
                  { code: 'pt', name: 'Português', flag: '🇵🇹' },
                  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
                  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
                  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
                  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
                  { code: 'sv', name: 'Svenska', flag: '🇸🇪' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 text-sm ${
                      i18n.language === lang.code ? 'bg-slate-100 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="dark:text-gray-200">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative flex items-center" ref={userMenuRef}>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
            onClick={toggleUserMenu}
          >
            <div className="pointer-events-none">
              <UserDisplay
                name={state.userProfile.fullName}
                plan={state.userProfile.subscription?.plan || 'free'}
                avatar={state.userProfile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop'}
                size="sm"
                badgePosition="overlay"
              />
            </div>
            <div className="hidden sm:block text-left ml-1 pointer-events-none">
              <div className="text-xs text-slate-500">{state.userProfile.designation}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-border dark:border-gray-600 rounded-xl shadow-2xl z-[100] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Profile Settings</h3>
                <button 
                  onClick={toggleUserMenu}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="p-4 flex items-center gap-4">
                <div className="relative">
                  {state.userProfile.avatarUrl ? (
                    <img
                      src={state.userProfile.avatarUrl}
                      alt={state.userProfile.fullName}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {state.userProfile.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{state.userProfile.fullName}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 truncate">{state.userProfile.email}</p>
                </div>
              </div>

              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {t('settings.theme')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyTheme('light')}
                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all duration-200 overflow-hidden group ${
                      preferences.theme === 'light'
                        ? 'bg-blue-50 border-blue-400 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {preferences.theme === 'light' && (
                      <div className="absolute inset-0 bg-blue-400/10 dark:bg-blue-500/10 blur-xl rounded-full scale-150" />
                    )}
                    <Sun className="w-4 h-4 mb-1.5 relative z-10" />
                    <span className="text-[11px] font-semibold relative z-10">Light</span>
                    <span className="text-[9px] opacity-60 leading-tight relative z-10">Bright</span>
                  </button>
                  <button
                    onClick={() => applyTheme('dark')}
                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all duration-200 overflow-hidden group ${
                      preferences.theme === 'dark'
                        ? 'bg-blue-50 border-blue-400 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {preferences.theme === 'dark' && (
                      <div className="absolute inset-0 bg-blue-400/10 dark:bg-blue-500/10 blur-xl rounded-full scale-150" />
                    )}
                    <Moon className="w-4 h-4 mb-1.5 relative z-10" />
                    <span className="text-[11px] font-semibold relative z-10">Dark</span>
                    <span className="text-[9px] opacity-60 leading-tight relative z-10">Easy</span>
                  </button>
                  <button
                    onClick={() => applyTheme('system')}
                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all duration-200 overflow-hidden group ${
                      preferences.theme === 'system'
                        ? 'bg-blue-50 border-blue-400 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {preferences.theme === 'system' && (
                      <div className="absolute inset-0 bg-blue-400/10 dark:bg-blue-500/10 blur-xl rounded-full scale-150" />
                    )}
                    <Monitor className="w-4 h-4 mb-1.5 relative z-10" />
                    <span className="text-[11px] font-semibold relative z-10">System</span>
                    <span className="text-[9px] opacity-60 leading-tight relative z-10">Auto</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
