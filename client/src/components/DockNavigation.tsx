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
  FileText as NotionIcon, // Using FileText as generic Notion icon or import proper one if available
  LayoutGrid,
  MessageSquare
} from 'lucide-react';
import { Dock, DockIcon } from './ui/Dock';
import { useDock } from '../context/DockContext';
import { apiService } from '../services/api';
import { redirectToDesktopSplash, shouldHandleInDesktop } from '../constants/desktop';
import { getAppUrl } from '../utils/appUrls';
import AppInfoCard from './AppInfoCard';
import AIChatbot from './AIChatbot';
import { useStickyNotes } from '../context/StickyNotesContext';
import { SpotifyLogo, DropboxLogo, NotionLogo, JiraLogo, ZendeskLogo, SlackLogo, LinearLogo, DiscordLogo, FigmaLogo, SartthiMailLogo, SartthiCalendarLogo, SartthiVaultLogo } from './icons/BrandLogos';

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
        translationKey: 'workspace.settings.title',
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
          <SartthiMailLogo size={20} />
        </DockIcon>

        {/* Sartthi Calendar */}
        <DockIcon
          onClick={() => handleAppClick('calendar')}
          tooltip={t('navigation.sartthiCalendar')}
        >
          <SartthiCalendarLogo size={20} />
        </DockIcon>

        {/* Sartthi Vault */}
        <DockIcon
          onClick={() => handleAppClick('vault')}
          tooltip={t('navigation.sartthiVault')}
        >
          <SartthiVaultLogo size={20} />
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
              className="text-[#0061FE] hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <DropboxLogo size={22} />
            </DockIcon>
          </div>
        )}

        {/* [NEW] Notion Widget Toggle */}
        {(state.userProfile.connectedAccounts?.notion?.activeAccountId ||
          (state.userProfile.connectedAccounts?.notion?.accounts?.length ?? 0) > 0) && (
            <DockIcon
              onClick={() => window.dispatchEvent(new CustomEvent('TOGGLE_NOTION_WIDGET'))}
              tooltip="Notion"
              className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <NotionLogo size={22} />
            </DockIcon>
          )}

        {/* [NEW] Jira Widget Toggle */}
        {!!state.userProfile.connectedAccounts?.jira?.activeAccountId && (
          <DockIcon
            onClick={() => window.dispatchEvent(new CustomEvent('TOGGLE_JIRA_WIDGET'))}
            tooltip="Jira"
            className="text-[#0052CC] hover:bg-[#DEEBFF] dark:hover:bg-[#0052CC]/20"
          >
            <JiraLogo size={22} />
          </DockIcon>
        )}

        {/* [NEW] Zendesk Widget Toggle */}
        {!!state.userProfile.connectedAccounts?.zendesk?.activeAccountId && (
          <DockIcon
            onClick={() => window.dispatchEvent(new CustomEvent('TOGGLE_ZENDESK_WIDGET'))}
            tooltip="Zendesk"
            className="text-[#03363D] hover:bg-[#03363D]/10 dark:hover:bg-[#03363D]/30 dark:text-gray-300"
          >
            <ZendeskLogo size={22} />
          </DockIcon>
        )}

        {/* [NEW] Slack Widget Toggle */}
        {!!state.userProfile.connectedAccounts?.slack?.activeAccountId && (
          <DockIcon
            onClick={() => window.dispatchEvent(new CustomEvent('TOGGLE_SLACK_WIDGET'))}
            tooltip="Slack"
            className="text-[#4A154B] hover:bg-[#4A154B]/10 dark:hover:bg-[#4A154B]/30 dark:text-gray-300"
          >
            <SlackLogo size={22} />
          </DockIcon>
        )}

        {/* [NEW] Linear Widget Toggle */}
        {!!state.userProfile.connectedAccounts?.linear?.activeAccountId && (
          <DockIcon
            onClick={() => window.dispatchEvent(new CustomEvent('TOGGLE_LINEAR_WIDGET'))}
            tooltip="Linear"
            className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 dark:text-blue-400"
          >
            <LinearLogo size={22} />
          </DockIcon>
        )}

        {/* [NEW] Figma Widget Toggle */}
        {!!state.userProfile.connectedAccounts?.figma?.activeAccountId && (
          <DockIcon
            onClick={() => window.dispatchEvent(new CustomEvent('TOGGLE_FIGMA_WIDGET'))}
            tooltip="Figma"
            className="text-[#0ACF83] hover:bg-[#0ACF83]/10 dark:hover:bg-[#0ACF83]/20"
          >
            <FigmaLogo size={22} />
          </DockIcon>
        )}

        {/* [NEW] Chat Widget Toggle */}
        <DockIcon
          onClick={() => window.dispatchEvent(new CustomEvent('TOGGLE_CHAT_WIDGET'))}
          tooltip="Discord Chat"
          className="text-[#5865f2] hover:bg-[#5865f2]/10 dark:hover:bg-[#5865f2]/20"
        >
          <DiscordLogo size={22} />
        </DockIcon>

        {/* Spotify */}
        {state.userProfile.connectedAccounts?.spotify?.activeAccountId && (
          <div
            className="relative group"
            onMouseEnter={(e) => handleIconEnter('spotify', e)}
            onMouseLeave={handleIconLeave}
          >
            <DockIcon
              onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'spotifyWidget' })}
              tooltip="Spotify"
              active={state.modals.spotifyWidget}
              className="text-[#1DB954]"
            >
              <SpotifyLogo size={22} />
            </DockIcon>
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

      {/* Portal Spotify Menu */}
      {hoveredItem === 'spotify' && hoveredRect && createPortal(
        <div
          className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200"
          style={getMenuPositionStyle()}
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <div className="bg-[#121212] border border-[#282828] rounded-xl shadow-2xl py-1 min-w-[160px]">
            <div className="text-xs font-semibold text-[#1DB954] mb-1 px-3 pt-2 uppercase tracking-wider">Spotify</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'TOGGLE_MODAL', payload: 'spotifyWidget' });
                setHoveredItem(null);
              }}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#282828] flex items-center gap-2 transition-colors"
            >
              <SpotifyLogo size={14} />
              Open Player
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/music');
                setHoveredItem(null);
              }}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#282828] flex items-center gap-2 transition-colors"
            >
              <LayoutGrid size={14} />
              Open Library
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
