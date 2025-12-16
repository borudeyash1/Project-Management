import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
    animations: boolean;
    reducedMotion: boolean;
}

interface ThemeContextType {
    isDarkMode: boolean;
    preferences: UserPreferences;
    toggleTheme: () => void;
    updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
    applyTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const defaultPreferences: UserPreferences = {
    theme: 'system',
    accentColor: '#10B981', // Emerald/Green for Vault default
    fontSize: 'medium',
    density: 'comfortable',
    animations: true,
    reducedMotion: false
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

// In development, we use relative path for proxy. In production, we might use env var.
const API_URL = import.meta.env.VITE_API_URL || '';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Fetch preferences from main Sartthi API
    useEffect(() => {
        const fetchPreferences = async () => {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                // Load from localStorage for non-authenticated users
                const savedPrefs = localStorage.getItem('preferences');
                if (savedPrefs) {
                    try {
                        const parsed = JSON.parse(savedPrefs);
                        setPreferences(parsed);
                        applyAllSettings(parsed);
                    } catch (e) {
                        console.error('Failed to parse saved preferences:', e);
                    }
                }
                return;
            }

            try {
                const response = await fetch('/api/users/preferences', {
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        setPreferences(data.data);
                        applyAllSettings(data.data);
                        // Save to localStorage
                        localStorage.setItem('preferences', JSON.stringify(data.data));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch preferences:', error);
                // Fallback to localStorage
                const savedPrefs = localStorage.getItem('preferences');
                if (savedPrefs) {
                    try {
                        const parsed = JSON.parse(savedPrefs);
                        setPreferences(parsed);
                        applyAllSettings(parsed);
                    } catch (e) {
                        console.error('Failed to parse saved preferences:', e);
                    }
                }
            }
        };

        fetchPreferences();
    }, []);

    // Apply all theme settings
    const applyAllSettings = (prefs: UserPreferences) => {
        applyThemeMode(prefs.theme);
        applyAccentColor(prefs.accentColor);
        applyFontSize(prefs.fontSize);
        applyDensity(prefs.density);
        applyAnimations(prefs.animations, prefs.reducedMotion);
    };

    // Apply theme mode (light/dark/system)
    const applyThemeMode = (theme: 'light' | 'dark' | 'system') => {
        let shouldBeDark = false;

        if (theme === 'system') {
            shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            shouldBeDark = theme === 'dark';
        }

        setIsDarkMode(shouldBeDark);

        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Apply accent color
    const applyAccentColor = (color: string) => {
        document.documentElement.style.setProperty('--accent-color', color);
        document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(color));
    };

    // Apply font size
    const applyFontSize = (size: 'small' | 'medium' | 'large') => {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        document.documentElement.style.setProperty('--base-font-size', sizes[size]);
        document.documentElement.setAttribute('data-font-size', size);
    };

    // Apply density
    const applyDensity = (density: 'compact' | 'comfortable' | 'spacious') => {
        const densities = {
            compact: '0.75rem',
            comfortable: '1rem',
            spacious: '1.5rem'
        };
        document.documentElement.style.setProperty('--spacing-unit', densities[density]);
        document.documentElement.setAttribute('data-density', density);
    };

    // Apply animations
    const applyAnimations = (animations: boolean, reducedMotion: boolean) => {
        if (reducedMotion || !animations) {
            document.documentElement.style.setProperty('--animation-duration', '0ms');
            document.documentElement.setAttribute('data-animations', 'false');
        } else {
            document.documentElement.style.setProperty('--animation-duration', '200ms');
            document.documentElement.setAttribute('data-animations', 'true');
        }
    };

    // Helper function to convert hex to RGB
    const hexToRgb = (hex: string): string => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '16, 185, 129'; // Default Green for Vault
    };

    // Toggle theme (for navbar button)
    const toggleTheme = () => {
        const newTheme: 'light' | 'dark' = isDarkMode ? 'light' : 'dark';
        const newPrefs = { ...preferences, theme: newTheme };
        setPreferences(newPrefs);
        applyThemeMode(newTheme);

        // Save to localStorage
        localStorage.setItem('theme', newTheme);
        localStorage.setItem('preferences', JSON.stringify(newPrefs));

        // Save to API
        updatePreferences({ theme: newTheme }).catch(console.error);
    };

    // Apply theme programmatically
    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
        const newPrefs = { ...preferences, theme };
        setPreferences(newPrefs);
        applyThemeMode(theme);

        // Save to localStorage
        localStorage.setItem('theme', theme);
        localStorage.setItem('preferences', JSON.stringify(newPrefs));

        // Save to API
        updatePreferences({ theme }).catch(console.error);
    };

    // Update preferences
    const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
        const updated = { ...preferences, ...newPrefs };
        setPreferences(updated);
        applyAllSettings(updated);

        // Save to localStorage
        localStorage.setItem('preferences', JSON.stringify(updated));

        // Save to API
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                await fetch('/api/users/preferences', {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newPrefs)
                });
            } catch (error) {
                console.error('Failed to update preferences:', error);
                throw error;
            }
        }
    };

    // Listen for system theme changes
    useEffect(() => {
        if (preferences.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => {
                setIsDarkMode(e.matches);
                if (e.matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            };

            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [preferences.theme]);

    const value = {
        isDarkMode,
        preferences,
        toggleTheme,
        updatePreferences,
        applyTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
