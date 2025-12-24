import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import WorkspaceModeSwitcher from './WorkspaceModeSwitcher';
import UserDisplay from './UserDisplay';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import { SparklesText } from './ui/sparkles-text';
import { useTheme } from '../context/ThemeContext';
import DropdownTransition from './animations/DropdownTransition';
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
  Home,
  FolderOpen,
  Calendar as CalendarIcon,
  Bell as BellIcon,
  Building,
  BarChart3,
  Target,
  FileEdit,
  Mail,
  Shield
} from 'lucide-react';
import { redirectToDesktopSplash, shouldHandleInDesktop } from '../constants/desktop';
import { useTranslation } from 'react-i18next';
import { useDock } from '../context/DockContext';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();
  const { preferences, applyTheme } = useTheme();
  const { dockPosition } = useDock();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch notifications count
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifications = await apiService.getNotifications();
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();

    // Refresh count every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

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
    // Refresh count when opening notifications
    apiService.getNotifications().then(notifications => {
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    });
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

  // Mobile navigation items
  const mobileNavItems = [
    { id: 'home', label: 'Home', translationKey: 'navigation.home', icon: Home, path: '/home' },
    { id: 'notes', label: 'Notes', translationKey: 'navigation.notes', icon: FileEdit, path: '/notes' },
    { id: 'projects', label: 'Projects', translationKey: 'navigation.projects', icon: FolderOpen, path: '/projects' },
    { id: 'planner', label: 'Planner', translationKey: 'planner.title', icon: CalendarIcon, path: '/planner' },
    { id: 'notifications', label: 'Notifications', translationKey: 'navigation.notifications', icon: BellIcon, path: '/notifications' },
    { id: 'reminders', label: 'Reminders', translationKey: 'navigation.reminders', icon: BellIcon, path: '/reminders' },
    { id: 'workspace', label: 'Workspace', translationKey: 'workspace.title', icon: Building, path: '/workspace' },
    { id: 'reports', label: 'Reports', translationKey: 'navigation.reports', icon: BarChart3, path: '/reports' },
    { id: 'goals', label: 'Goals', translationKey: 'dashboard.insights', icon: Target, path: '/goals' },
    { id: 'mail', label: 'Sartthi Mail', translationKey: 'navigation.sartthiMail', icon: Mail, path: 'https://mail.sartthi.com' },
    { id: 'calendar', label: 'Sartthi Calendar', translationKey: 'navigation.sartthiCalendar', icon: CalendarIcon, path: 'https://calendar.sartthi.com' }
  ];

  const handleMobileNavClick = (path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
    dispatch({ type: 'TOGGLE_SIDEBAR' }); // Close menu after navigation
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
        {/* Refresh Button */}
        <button
          className="refresh-button p-2 rounded-lg border border-border dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => {
            // Dispatch custom event for components to listen to
            window.dispatchEvent(new CustomEvent('refreshData'));
          }}
          title="Refresh Data"
        >
          <svg
            className="refresh-icon w-4 h-4 text-gray-700 dark:text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg border border-border dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 relative"
          onClick={toggleNotifications}
        >
          <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
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


          <DropdownTransition
            isOpen={showLanguageMenu}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-border dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 text-sm ${i18n.language === lang.code ? 'bg-slate-100 dark:bg-gray-700' : ''
                    }`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="dark:text-gray-200">{lang.name}</span>
                </button>
              ))}
            </div>
          </DropdownTransition>
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
          <DropdownTransition
            isOpen={isUserMenuOpen}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-border dark:border-gray-600 rounded-xl shadow-2xl z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('settings.profileSettings')}</h3>
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
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all duration-200 overflow-hidden group ${preferences.theme === 'light'
                    ? 'bg-blue-50 border-blue-400 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  {preferences.theme === 'light' && (
                    <div className="absolute inset-0 bg-blue-400/10 dark:bg-blue-500/10 blur-xl rounded-full scale-150" />
                  )}
                  <Sun className="w-4 h-4 mb-1.5 relative z-10" />
                  <span className="text-[11px] font-semibold relative z-10">Light</span>
                  <span className="text-[9px] opacity-60 leading-tight relative z-10">{t('settings.themeDescriptions.light')}</span>
                </button>
                <button
                  onClick={() => applyTheme('dark')}
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all duration-200 overflow-hidden group ${preferences.theme === 'dark'
                    ? 'bg-blue-50 border-blue-400 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  {preferences.theme === 'dark' && (
                    <div className="absolute inset-0 bg-blue-400/10 dark:bg-blue-500/10 blur-xl rounded-full scale-150" />
                  )}
                  <Moon className="w-4 h-4 mb-1.5 relative z-10" />
                  <span className="text-[11px] font-semibold relative z-10">Dark</span>
                  <span className="text-[9px] opacity-60 leading-tight relative z-10">{t('settings.themeDescriptions.dark')}</span>
                </button>
                <button
                  onClick={() => applyTheme('system')}
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all duration-200 overflow-hidden group ${preferences.theme === 'system'
                    ? 'bg-blue-50 border-blue-400 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  {preferences.theme === 'system' && (
                    <div className="absolute inset-0 bg-blue-400/10 dark:bg-blue-500/10 blur-xl rounded-full scale-150" />
                  )}
                  <Monitor className="w-4 h-4 mb-1.5 relative z-10" />
                  <span className="text-[11px] font-semibold relative z-10">System</span>
                  <span className="text-[9px] opacity-60 leading-tight relative z-10">{t('settings.themeDescriptions.system')}</span>
                </button>
              </div>
            </div>
          </DropdownTransition>
        </div>
      </div>

      {/* Refresh Button Animation Styles */}
      <style>{`
        .refresh-button:active .refresh-icon {
          animation: spin_refresh 0.5s linear;
        }

        @keyframes spin_refresh {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Mobile Navigation Menu */}
      {!state.sidebar.collapsed && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            onClick={toggleSidebar}
          />

          {/* Mobile Menu - Compact Fit Content */}
          <div className="fixed top-14 left-0 w-72 h-auto max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-2xl z-[70] md:hidden overflow-y-auto transform transition-transform duration-300 ease-in-out rounded-br-2xl border-b border-r border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Navigation</h2>

              {/* Navigation Items - Icon Grid with Small Labels */}
              <div className="grid grid-cols-4 gap-3">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = window.location.pathname === item.path;
                  // Shorten specific labels for mobile grid if needed
                  let label = t(item.translationKey);
                  if (item.id === 'mail') label = 'Mail';
                  if (item.id === 'calendar') label = 'Calendar';

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNavClick(item.path)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all aspect-square ${isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      title={t(item.translationKey)}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-[10px] leading-tight font-medium text-center truncate w-full">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
