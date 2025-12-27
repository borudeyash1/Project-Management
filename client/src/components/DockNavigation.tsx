import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
  FileEdit,
  MessageCircle,
  HardDrive,
  Music2,
  LayoutGrid
} from 'lucide-react';
import { Dock, DockIcon } from './ui/Dock';
import { useDock } from '../context/DockContext';
import { apiService } from '../services/api';
import { redirectToDesktopSplash, shouldHandleInDesktop } from '../constants/desktop';
import { getAppUrl } from '../utils/appUrls';
import AppInfoCard from './AppInfoCard';
import AIChatbot from './AIChatbot';
import { useStickyNotes } from '../context/StickyNotesContext';

interface NavItem {
  id: string;
  label: string;
  translationKey: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const DockNavigation: React.FC = () => {
  const { state, dispatch } = useApp();
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null); // [NEW]
  const { dockPosition } = useDock();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState<'mail' | 'calendar' | 'vault' | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Sticky Notes Hover Logic
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  const handleIconEnter = (itemId: string, e: React.MouseEvent) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setHoveredItem(itemId);
    setHoveredRect(e.currentTarget.getBoundingClientRect());
  };

  const handleIconLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setHoveredRect(null);
    }, 150); // Grace period to move mouse to menu
  };

  const handleMenuEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const handleMenuLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setHoveredRect(null);
    }, 150);
  };

  const getMenuPositionStyle = () => {
    if (!hoveredRect) return {};

    const gap = 8;
    // Default Bottom Dock: Menu above
    let style: React.CSSProperties = {
      left: hoveredRect.left + hoveredRect.width / 2,
      top: hoveredRect.top - gap,
      transform: 'translate(-50%, -100%)'
    };

    if (dockPosition === 'left') {
      style = {
        left: hoveredRect.right + gap,
        top: hoveredRect.top + hoveredRect.height / 2,
        transform: 'translate(0, -50%)'
      };
    } else if (dockPosition === 'right') {
      style = {
        left: hoveredRect.left - gap,
        top: hoveredRect.top + hoveredRect.height / 2,
        transform: 'translate(-100%, -50%)'
      };
    } else if (dockPosition === 'top') {
      style = {
        left: hoveredRect.left + hoveredRect.width / 2,
        top: hoveredRect.bottom + gap,
        transform: 'translate(-50%, 0)'
      };
    }

    return style;
  };


  // Check if user owns any workspace
  const isWorkspaceOwner = useMemo(() => {
    const ownsWorkspace = state.workspaces.some(w => {
      // Handle both string ID and populated object
      const ownerId = typeof w.owner === 'string' ? w.owner : (w.owner as any)?._id;
      return ownerId === state.userProfile._id;
    });
    // Removed console log to clean up
    return ownsWorkspace;
  }, [state.workspaces, state.userProfile._id]);

  // Build main nav items dynamically
  const mainNavItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { id: 'home', label: 'Home', translationKey: 'navigation.home', icon: Home, path: '/home' },
      { id: 'notes', label: 'Notes', translationKey: 'navigation.notes', icon: FileEdit, path: '/notes' },
      { id: 'projects', label: 'Projects', translationKey: 'navigation.projects', icon: FolderOpen, path: '/projects' },
      { id: 'planner', label: 'Planner', translationKey: 'planner.title', icon: Calendar, path: '/planner' },
      { id: 'notifications', label: 'Notifications', translationKey: 'navigation.notifications', icon: Bell, path: '/notifications' },
      { id: 'reminders', label: 'Reminders', translationKey: 'navigation.reminders', icon: Clock, path: '/reminders' },
      { id: 'workspace', label: 'Workspace', translationKey: 'workspace.title', icon: Building, path: '/workspace' },
      { id: 'reports', label: 'Reports', translationKey: 'navigation.reports', icon: BarChart3, path: '/reports' },
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
    // Check if module is connected (check both old and new structures)
    const hasRefreshToken = state.userProfile.modules?.[appName]?.refreshToken;
    const hasConnectedAccount = state.userProfile.connectedAccounts?.[appName]?.activeAccountId;
    const isConnected = hasRefreshToken || hasConnectedAccount;

    if (!isConnected) {
      // Navigate to settings page for account connection
      navigate('/settings', { state: { activeTab: 'connected-accounts', service: appName } });
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

  // Sticky Notes Context
  const { addNote } = useStickyNotes();

  const handleCreateStickyNote = () => {
    addNote();
    setHoveredItem(null); // Close menu
  };

  // Check if dock is in vertical mode (left/right)
  const isVerticalDock = dockPosition === 'left' || dockPosition === 'right';

  return (
    <>
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
              onMouseEnter={(e) => handleIconEnter(item.id, e)}
              onMouseLeave={handleIconLeave}
            >
              <DockIcon
                onClick={() => handleItemClick(item)}
                active={active}
                tooltip={isEnglish ? t(item.translationKey) : `${t(item.translationKey)} (${item.label})`}
                dockPosition={dockPosition}
              >
                <Icon className="w-5 h-5" />
              </DockIcon>
            </div>
          );
        })}


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

        {/* Dropbox - Only if connected */}
        {!!state.userProfile.connectedAccounts?.dropbox?.activeAccountId && (
          <div
            className="relative group"
            onMouseEnter={(e) => handleIconEnter('dropbox', e)}
            onMouseLeave={handleIconLeave}
          >
            <DockIcon
              onClick={() => navigate('/dropbox')}
              active={location.pathname === '/dropbox'}
              tooltip="Dropbox"
              className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <HardDrive className="w-5 h-5" />
            </DockIcon>
          </div>
        )}

        {/* Spotify */}
        {state.userProfile.connectedAccounts?.spotify?.activeAccountId && (
          <div
            className="relative group"
            onMouseEnter={() => setHoveredIcon('spotify')}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <DockIcon
              onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'spotifyWidget' })}
              tooltip="Spotify"
              active={state.modals.spotifyWidget}
              className="text-[#1DB954]"
            >
              <Music2 size={22} />
            </DockIcon>

            {/* Tooltip/Menu */}
            <AnimatePresence>
              {hoveredIcon === 'spotify' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: -10 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#121212] border border-[#282828] rounded-xl shadow-2xl p-2 min-w-[150px] z-50 text-gray-200"
                >
                  <div className="text-xs font-semibold text-[#1DB954] mb-2 px-2 uppercase tracking-wider">Spotify</div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'spotifyWidget' })}
                      className="text-left px-2 py-1.5 rounded-lg hover:bg-[#282828] text-sm flex items-center gap-2 transition-colors"
                    >
                      <Music2 size={14} /> Open Player
                    </button>
                    <button
                      onClick={() => navigate('/music')}
                      className="text-left px-2 py-1.5 rounded-lg hover:bg-[#282828] text-sm flex items-center gap-2 transition-colors"
                    >
                      <LayoutGrid size={14} /> Open Library
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

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

      {/* Portal Sticky Notes Menu */}
      {hoveredItem === 'notes' && hoveredRect && createPortal(
        <div
          className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200"
          style={getMenuPositionStyle()}
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[140px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateStickyNote();
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-300 border border-yellow-400"></span>
              {t('notes.stickyNote')}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/notes');
                setHoveredItem(null);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FileText size={14} />
              {t('notes.allNotes')}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Portal Dropbox Menu */}
      {hoveredItem === 'dropbox' && hoveredRect && createPortal(
        <div
          className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200"
          style={getMenuPositionStyle()}
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'TOGGLE_MODAL', payload: 'dropboxWidget' });
                setHoveredItem(null);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <HardDrive size={14} className="text-[#0061FE]" />
              Quick View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/dropbox');
                setHoveredItem(null);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FolderOpen size={14} />
              Open Dropbox
            </button>
          </div>
        </div>,
        document.body
      )}

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


          </div>
        </div>
      )}
      {/* App Info Card */}
      {showInfoCard && (
        <AppInfoCard
          app={showInfoCard}
          onClose={() => setShowInfoCard(null)}
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

      {/* AI Chatbot Modal */}
      <AIChatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  );
};

export default DockNavigation;
