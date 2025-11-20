import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AnimatedThemeTogglerProps {
  className?: string;
  duration?: number;
}

export const AnimatedThemeToggler: React.FC<AnimatedThemeTogglerProps> = ({ 
  className = '', 
  duration = 400 
}) => {
  const { state, dispatch } = useApp();
  const [isDark, setIsDark] = useState(state.settings.darkMode);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsDark(state.settings.darkMode);
  }, [state.settings.darkMode]);

  const toggleTheme = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newDarkMode = !isDark;
    
    // Update local state
    setIsDark(newDarkMode);
    
    // Update global state
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { darkMode: newDarkMode } 
    });
    
    // Update document class
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setTimeout(() => setIsAnimating(false), duration);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg border border-border dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors ${className}`}
      aria-label="Toggle theme"
      disabled={isAnimating}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun
          className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-${duration} ${
            isDark
              ? 'opacity-0 rotate-90 scale-0'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        
        {/* Moon Icon */}
        <Moon
          className={`absolute inset-0 w-5 h-5 text-accent transition-all duration-${duration} ${
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  );
};

export default AnimatedThemeToggler;
