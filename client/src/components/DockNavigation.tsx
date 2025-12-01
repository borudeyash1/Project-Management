import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Shield,
  Mail,
  FileEdit
} from 'lucide-react';
import { Dock, DockIcon } from './ui/Dock';
import { apiService } from '../services/api';
import { redirectToDesktopSplash, shouldHandleInDesktop } from '../constants/desktop';
import { getAppUrl } from '../utils/appUrls';
import AppInfoCard from './AppInfoCard';
import StickyNote from './StickyNote';

interface NavItem {
  id: string;
  label: string;
  translationKey: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const DockNavigation: React.FC = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState<'mail' | 'calendar' | 'vault' | null>(null);
  // Check if user owns any workspace
  const isWorkspaceOwner = useMemo(() => {
    const ownsWorkspace = state.workspaces.some(w => {
      // Handle both string ID and populated object
      const ownerId = typeof w.owner === 'string' ? w.owner : (w.owner as any)?._id;
      return ownerId === state.userProfile._id;
    });
    console.log('[DockNavigation] Checking workspace ownership:', {
      workspacesCount: state.workspaces.length,
      userId: state.userProfile._id,
      ownsWorkspace,
      workspaces: state.workspaces.map(w => ({
        id: w._id,
        name: w.name,
        owner: w.owner,
        ownerId: typeof w.owner === 'string' ? w.owner : (w.owner as any)?._id
      }))
    });
    return ownsWorkspace;
  }, [state.workspaces, state.userProfile._id]);

  // Build main nav items dynamically
  const mainNavItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { id: 'home', label: 'Home', translationKey: 'navigation.home', icon: Home, path: '/home' },
      { id: 'notes', label: 'Notes', translationKey: 'navigation.notes', icon: FileEdit, path: '/notes' },
      { id: 'projects', label: 'Projects', translationKey: 'navigation.projects', icon: FolderOpen, path: '/projects' },
      { id: 'planner', label: 'Planner', translationKey: 'planner.title', icon: Calendar, path: '/planner' },
      { id: 'tracker', label: 'Tracker', translationKey: 'tracker.title', icon: Clock, path: '/tracker' },
      { id: 'tasks', label: 'Tasks', translationKey: 'navigation.tasks', icon: FileText, path: '/tasks' },
      { id: 'reminders', label: 'Reminders', translationKey: 'navigation.notifications', icon: Bell, path: '/reminders' },
      { id: 'workspace', label: 'Workspace', translationKey: 'workspace.title', icon: Building, path: '/workspace' },
      { id: 'reports', label: 'Reports', translationKey: 'navigation.reports', icon: BarChart3, path: '/reports' },
      { id: 'team', label: 'Team', translationKey: 'navigation.team', icon: Users, path: '/team' },
      { id: 'goals', label: 'Goals', translationKey: 'dashboard.insights', icon: Target, path: '/goals' }
    ];

    // Add Manage Workspace tab if user owns any workspace
    if (isWorkspaceOwner) {
      items.push({
        id: 'manage-workspace',
        label: 'Manage Workspace',
        translationKey: 'workspace.settings',
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
      console.log(' [USER DOCK] Logging out...');
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    sessionStorage.clear();
    dispatch({ type: 'LOGOUT' });
    console.log(' [USER DOCK] Session cleared, redirecting to login');

    if (shouldHandleInDesktop()) {
      redirectToDesktopSplash();
      return;
    }

    navigate('/login', { replace: true });
  };

  const handleAppClick = (appName: 'mail' | 'calendar' | 'vault') => {
    // Check if module is connected
    const isConnected = state.userProfile.modules?.[appName]?.refreshToken;

    if (!isConnected) {
      // Show info card
      setShowInfoCard(appName);
      return;
    }

    // Module is connected, open the app
    const url = getAppUrl(appName);

    // Pass the token via URL parameter for seamless SSO across subdomains
    const token = localStorage.getItem('accessToken');
    if (token) {
      const separator = url.includes('?') ? '&' : '?';
      const authUrl = `${url}${separator}token=${token}`;
      window.open(authUrl, '_blank');
      return;
    }

    window.open(url, '_blank');
  };

  const isActive = (path: string) => {
    return location.pathname === path ||
      (path !== '/home' && location.pathname.startsWith(path));
  };

  const [activeStickyNotes, setActiveStickyNotes] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleCreateStickyNote = () => {
    const id = Date.now().toString();
    setActiveStickyNotes(prev => [...prev, id]);
  };

  const handleCloseStickyNote = (id: string) => {
    setActiveStickyNotes(prev => prev.filter(noteId => noteId !== id));
  };

  return (
    <>
      {/* Sticky Notes Layer */}
      {activeStickyNotes.map(id => (
        <StickyNote
          key={id}
          id={id} // Pass ID for auto-save to work correctly if we want to persist specific instances
          onClose={() => handleCloseStickyNote(id)}
        />
      ))}

      {/* Main Dock */}
      <Dock direction="middle">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const isEnglish = i18n.language === 'en';
          const isNotes = item.id === 'notes';

          return (
            <div
              key={item.id}
              className="relative group"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <DockIcon
                onClick={() => handleItemClick(item)}
                active={active}
                tooltip={isEnglish ? t(item.translationKey) : `${t(item.translationKey)} (${item.label})`}
              >
                <Icon className="w-5 h-5" />
              </DockIcon>

              {/* Notes Hover Menu */}
              {isNotes && hoveredItem === 'notes' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[120px] z-50 animate-in fade-in slide-in-from-bottom-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateStickyNote();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-300 border border-yellow-400"></span>
                    Sticky Note
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/notes');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FileText size={14} />
                    All Notes
                  </button>
                </div>
              )}
            </div>
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
            <span className="absolute -top-1 -right-1 bg-accent text-gray-900 text-xs rounded-full w-4 h-4 flex items-center justify-center">
              +{state.workspaces.length - 3}
            </span>
          </DockIcon>
        )}

        {/* Sartthi Mail */}
        <DockIcon
          onClick={() => handleAppClick('mail')}
          tooltip={t('navigation.sartthiMail')}
        >
          <Mail className="w-5 h-5" />
        </DockIcon>

        {/* Sartthi Calendar */}
        <DockIcon
          onClick={() => handleAppClick('calendar')}
          tooltip={t('navigation.sartthiCalendar')}
        >
          <Calendar className="w-5 h-5" />
        </DockIcon>

        {/* Sartthi Vault */}
        <DockIcon
          onClick={() => handleAppClick('vault')}
          tooltip={t('navigation.sartthiVault')}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </DockIcon>

        {/* Settings */}
        <DockIcon
          onClick={() => navigate('/settings')}
          active={location.pathname === '/settings'}
          tooltip={t('navigation.settings')}
        >
          <Settings className="w-5 h-5" />
        </DockIcon>

        {/* Profile */}
        <DockIcon
          onClick={() => navigate('/profile')}
          active={location.pathname === '/profile'}
          tooltip={t('navigation.profile')}
        >
          <User className="w-5 h-5" />
        </DockIcon>

        {/* Logout */}
        <DockIcon
          onClick={handleLogout}
          tooltip={t('common.logout')}
          className="!bg-red-100 dark:!bg-red-900/30 !text-red-600 dark:!text-red-600 hover:!bg-red-200 dark:hover:!bg-red-900/50"
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
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
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
                        <Building className="w-5 h-5 text-accent-dark" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {workspace.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-200">
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
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
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
                          <div className="text-sm text-gray-600 dark:text-gray-200">
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
      {/* App Info Card */}
      {showInfoCard && (
        <AppInfoCard
          app={showInfoCard}
          onClose={() => setShowInfoCard(null)}
          onConnect={() => {
            const token = localStorage.getItem('accessToken');
            window.location.href = `/api/auth/sartthi/connect-${showInfoCard}?token=${token}`;
          }}
          onOpen={() => {
            const url = getAppUrl(showInfoCard);
            const token = localStorage.getItem('accessToken');
            if (token) {
              const separator = url.includes('?') ? '&' : '?';
              const authUrl = `${url}${separator}token=${token}`;
              window.open(authUrl, '_blank');
            } else {
              window.open(url, '_blank');
            }
            setShowInfoCard(null);
          }}
        />
      )}
    </>
  );
};

export default DockNavigation;
