import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ProfileSettings.css';

interface ProfileSettingsProps {
  user: {
    fullName: string;
    email: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, isOpen, onClose }) => {
  const { preferences, applyTheme } = useTheme();

  if (!isOpen) return null;

  const getInitials = () => {
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="profile-settings-overlay" onClick={onClose}>
      <div className="profile-settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-settings-header">
          <h2>Profile Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="profile-user-section">
          <div className="profile-avatar-large">
            {getInitials()}
          </div>
          <div className="profile-user-details">
            <h3>{user.fullName}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="settings-section">
          <h3 className="section-title">THEME</h3>
          <div className="theme-options-grid">
            <button
              className={`theme-card ${preferences.theme === 'light' ? 'active' : ''}`}
              onClick={() => applyTheme('light')}
            >
              <div className="theme-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              </div>
              <div className="theme-name">Light</div>
              <div className="theme-description">Bright and clear</div>
            </button>

            <button
              className={`theme-card ${preferences.theme === 'dark' ? 'active' : ''}`}
              onClick={() => applyTheme('dark')}
            >
              <div className="theme-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              </div>
              <div className="theme-name">Dark</div>
              <div className="theme-description">Easy on the eyes</div>
            </button>

            <button
              className={`theme-card ${preferences.theme === 'system' ? 'active' : ''}`}
              onClick={() => applyTheme('system')}
            >
              <div className="theme-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div className="theme-name">System</div>
              <div className="theme-description">Matches your device</div>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-actions">
          <button 
            className="action-btn secondary"
            onClick={() => window.open('/', '_blank')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Go to Main App
          </button>

          <button 
            className="action-btn danger"
            onClick={async () => {
              try {
                const token = localStorage.getItem('accessToken');
                const API_URL = import.meta.env.VITE_API_URL || '';
                if (token) {
                  await fetch(`${API_URL}/api/auth/sartthi/disconnect-mail`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                }
              } catch (error) {
                console.error('Error disconnecting mail:', error);
              } finally {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('selectedEmailId');
                window.location.href = '/';
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
