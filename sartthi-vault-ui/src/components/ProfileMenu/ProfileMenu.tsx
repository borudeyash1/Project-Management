import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ProfileMenu.css';

interface ProfileMenuProps {
    user: {
        fullName: string;
        email: string;
    };
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { preferences, applyTheme, isDarkMode } = useTheme();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        applyTheme(theme);
    };

    const getInitials = () => {
        const names = user.fullName.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        // Fallback to email if name is single word or empty, or split single word 
        if (user.fullName.length > 0) {
            return user.fullName.substring(0, 2).toUpperCase();
        }
        return user.email.substring(0, 2).toUpperCase();
    };

    return (
        <div className="profile-menu" ref={menuRef}>
            <button
                className="profile-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Profile menu"
            >
                <div className="profile-avatar">
                    {getInitials()}
                </div>
            </button>

            {isOpen && (
                <div className="profile-dropdown">
                    {/* User Info */}
                    <div className="profile-info">
                        <div className="profile-avatar-large">
                            {getInitials()}
                        </div>
                        <div className="profile-details">
                            <div className="profile-name">{user.fullName}</div>
                            <div className="profile-email">{user.email}</div>
                        </div>
                    </div>

                    <div className="menu-divider"></div>

                    {/* Theme Selector */}
                    <div className="menu-section">
                        <div className="menu-section-title">Theme</div>
                        <div className="theme-options">
                            <button
                                className={`theme-option ${preferences.theme === 'light' ? 'active' : ''}`}
                                onClick={() => handleThemeChange('light')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                                <span>Light</span>
                            </button>

                            <button
                                className={`theme-option ${preferences.theme === 'dark' ? 'active' : ''}`}
                                onClick={() => handleThemeChange('dark')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                                <span>Dark</span>
                            </button>

                            <button
                                className={`theme-option ${preferences.theme === 'system' ? 'active' : ''}`}
                                onClick={() => handleThemeChange('system')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                                <span>System</span>
                            </button>
                        </div>
                    </div>

                    <div className="menu-divider"></div>

                    {/* Actions */}
                    <div className="menu-actions">
                        <button
                            className="menu-action"
                            onClick={() => window.open('/', '_blank')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <span>Go to Main App</span>
                        </button>

                        <button
                            className="menu-action"
                            onClick={() => {
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('selectedEmailId');
                                window.location.href = '/';
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileMenu;
