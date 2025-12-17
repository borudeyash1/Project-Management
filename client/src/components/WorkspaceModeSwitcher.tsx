import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Building, Home, ChevronDown, Users, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import './WorkspaceModeSwitcher.css';

interface WorkspaceModeSwitcherProps {
  className?: string;
}

const WorkspaceModeSwitcher: React.FC<WorkspaceModeSwitcherProps> = ({ className = '' }) => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const handleModeChange = (mode: string, workspaceId?: string) => {
    dispatch({ type: 'SET_MODE', payload: mode });
    if (workspaceId) {
      dispatch({ type: 'SET_WORKSPACE', payload: workspaceId });
      
      const workspace = state.workspaces.find(w => w._id === workspaceId);
      if (workspace) {
        navigate(`/workspace/${workspaceId}/overview`);
        dispatch({ 
          type: 'ADD_TOAST', 
          payload: { 
            message: t('switcher.switchedTo', { name: workspace.name }), 
            type: 'success' 
          } 
        });
      }
    } else if (mode === 'Personal') {
      navigate('/home');
      dispatch({ 
        type: 'ADD_TOAST', 
        payload: { 
          message: t('switcher.switchedToPersonal'), 
          type: 'success' 
        } 
      });
    }
    setIsOpen(false);
  };

  const getCurrentModeDisplay = () => {
    if (state.mode === 'Personal') {
      return {
        icon: Home,
        label: t('switcher.personalMode'),
        description: t('switcher.individualWorkspace')
      };
    } else {
      const workspace = state.workspaces.find(w => w._id === state.currentWorkspace);
      return {
        icon: Building,
        label: workspace?.name || t('workspace.title'),
        description: t('switcher.teamWorkspace')
      };
    }
  };

  const currentMode = getCurrentModeDisplay();
  const CurrentIcon = currentMode.icon;

  return (
    <>
      <div className={`workspace-switcher-menu ${className}`}>
        <div className="workspace-switcher-item">
          <div 
            className={`workspace-switcher-link ${isDarkMode ? 'dark' : 'light'}`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <CurrentIcon className="workspace-icon" />
            <span className="workspace-label">{currentMode.label}</span>
            <svg className="workspace-arrow" viewBox="0 0 360 360">
              <g>
                <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"></path>
              </g>
            </svg>
          </div>

          <div 
            className={`workspace-switcher-submenu ${isDarkMode ? 'dark' : 'light'}`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {/* Personal Mode */}
            <div className="workspace-submenu-item">
              <div
                onClick={() => handleModeChange('Personal')}
                className={`workspace-submenu-link ${state.mode === 'Personal' ? 'active' : ''}`}
              >
                <Home className="workspace-submenu-icon" />
                <div className="workspace-submenu-content">
                  <div className="workspace-submenu-title">{t('switcher.personalMode')}</div>
                  <div className="workspace-submenu-desc">{t('switcher.individualWorkspace')}</div>
                </div>
                {state.mode === 'Personal' && (
                  <div className="workspace-active-dot" />
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="workspace-divider">
              <span className="workspace-divider-text">{t('switcher.workspaces')}</span>
            </div>

            {/* Workspaces */}
            {state.workspaces.map(workspace => (
              <div key={workspace._id} className="workspace-submenu-item">
                <div
                  onClick={() => handleModeChange('Workspace', workspace._id)}
                  className={`workspace-submenu-link ${
                    state.mode === 'Workspace' && state.currentWorkspace === workspace._id ? 'active' : ''
                  }`}
                >
                  <Building className="workspace-submenu-icon" />
                  <div className="workspace-submenu-content">
                    <div className="workspace-submenu-title">
                      {workspace.name}
                      {workspace.owner === state.userProfile._id && (
                        <Crown className="workspace-crown-icon" />
                      )}
                    </div>
                    <div className="workspace-submenu-desc">
                      {t('switcher.members', { count: workspace.memberCount })} • {workspace.type}
                    </div>
                  </div>
                  {state.mode === 'Workspace' && state.currentWorkspace === workspace._id && (
                    <div className="workspace-active-dot" />
                  )}
                </div>
              </div>
            ))}

            {/* Quick Actions Divider */}
            <div className="workspace-divider">
              <span className="workspace-divider-text">{t('switcher.quickActions')}</span>
            </div>

            {/* Quick Actions */}
            <div className="workspace-submenu-item">
              <div
                onClick={() => {
                  dispatch({ type: 'TOGGLE_MODAL', payload: 'createWorkspace' });
                  setIsOpen(false);
                }}
                className="workspace-submenu-link"
              >
                <Building className="workspace-submenu-icon" />
                <div className="workspace-submenu-content">
                  <div className="workspace-submenu-title">{t('switcher.createWorkspace')}</div>
                  <div className="workspace-submenu-desc">{t('switcher.createWorkspaceDesc')}</div>
                </div>
              </div>
            </div>

            <div className="workspace-submenu-item">
              <div
                onClick={() => {
                  navigate('/workspace');
                  setIsOpen(false);
                }}
                className="workspace-submenu-link"
              >
                <Users className="workspace-submenu-icon" />
                <div className="workspace-submenu-content">
                  <div className="workspace-submenu-title">{t('switcher.discoverWorkspaces')}</div>
                  <div className="workspace-submenu-desc">{t('switcher.discoverWorkspacesDesc')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkspaceModeSwitcher;
