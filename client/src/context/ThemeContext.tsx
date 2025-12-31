import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../services/api';
import { useApp } from './AppContext';

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
  accentColor: '#FBBF24',
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { state } = useApp();
  const location = useLocation();
  
  // Lazy initialization from localStorage to prevent flash of wrong theme
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const savedPrefs = localStorage.getItem('preferences');
    if (savedPrefs) {
      try {
        return JSON.parse(savedPrefs);
      } catch (e) {
        console.error('Failed to parse saved preferences:', e);
      }
    }
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      return { ...defaultPreferences, theme: savedTheme };
    }
    return defaultPreferences;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initial calculation based on preferences
    if (preferences.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return preferences.theme === 'dark';
  });
  
  const isAuthenticated = !!state.userProfile._id;

  // Define public routes where light mode is enforced
  const isPublicRoute = () => {
    const path = location.pathname;
    // Exact matches
    if (['/', '/about', '/pricing', '/apps', '/contact'].includes(path)) return true;
    // Prefix matches
    if (path.startsWith('/docs')) return true;
    if (path.startsWith('/auth')) return true;
    if (path.startsWith('/admin')) return true; // Admin pages default to light mode
    if (path.startsWith('/my-admin')) return true; // Admin login page
    return false;
  };

  // Fetch preferences from API if authenticated
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await apiService.get<UserPreferences>('/users/preferences');
        if (response.success && response.data) {
          setPreferences(response.data);
          // We don't immediately apply settings here, the effect below will handle it
          // based on the new preferences and current route
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      }
    };

    fetchPreferences();
  }, [isAuthenticated]);

  // Apply theme based on preferences and route
  useEffect(() => {
    const applyThemeSettings = () => {
      // 1. Determine if we should enforce light mode
      if (isPublicRoute()) {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      } else {
        // 2. Apply user preference
        applyThemeMode(preferences.theme);
      }

      // 3. Apply other settings (always apply these)
      applyAccentColor(preferences.accentColor);
      applyFontSize(preferences.fontSize);
      applyDensity(preferences.density);
      applyAnimations(preferences.animations, preferences.reducedMotion);
    };

    applyThemeSettings();
  }, [preferences, location.pathname]); // Re-run when preferences or route changes

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
      : '251, 191, 36'; // Default yellow
  };

  // Toggle theme (for navbar button)
  const toggleTheme = () => {
    // If on public route, we might not want to allow toggling, or we allow it but it only affects preference?
    // For now, let's allow it to update preference, and if we are on private route it will reflect immediately.
    // If on public route, it will update preference but visual might stay light until they go to dashboard.
    
    const newTheme: 'light' | 'dark' = isDarkMode ? 'light' : 'dark';
    // If we are forced light (public route) but user clicks toggle, they probably want dark.
    // But if we are enforcing light, maybe we shouldn't toggle visually?
    // Let's stick to standard toggle logic for preferences.
    
    // Actually, if we are on public route (isDarkMode=false forced), toggle will try to set 'dark'.
    
    const nextTheme: UserPreferences['theme'] = preferences.theme === 'dark' ? 'light' : 'dark'; // Simple toggle based on current pref
    
    const newPrefs = { ...preferences, theme: nextTheme };
    setPreferences(newPrefs);
    
    // Save to localStorage
    localStorage.setItem('theme', nextTheme);
    localStorage.setItem('preferences', JSON.stringify(newPrefs));
    
    // Save to API if authenticated
    if (isAuthenticated) {
      updatePreferences({ theme: nextTheme }).catch(console.error);
    }
  };

  // Apply theme programmatically
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const newPrefs = { ...preferences, theme };
    setPreferences(newPrefs);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('preferences', JSON.stringify(newPrefs));
    
    // Save to API if authenticated
    if (isAuthenticated) {
      updatePreferences({ theme }).catch(console.error);
    }
  };

  // Update preferences
  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    const updated: UserPreferences = { ...preferences, ...newPrefs };
    setPreferences(updated);
    // applyAllSettings called by effect
    
    // Save to localStorage
    localStorage.setItem('preferences', JSON.stringify(updated));
    
    // Save to API if authenticated
    if (isAuthenticated) {
      try {
        await apiService.put('/users/preferences', newPrefs);
      } catch (error) {
        console.error('Failed to update preferences:', error);
        throw error;
      }
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    if (preferences.theme === 'system' && !isPublicRoute()) {
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
  }, [preferences.theme, location.pathname]);

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
