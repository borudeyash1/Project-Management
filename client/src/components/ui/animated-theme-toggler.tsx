import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AnimatedThemeTogglerProps {
  className?: string;
  duration?: number;
}

export const AnimatedThemeToggler: React.FC<AnimatedThemeTogglerProps> = ({ 
  className = '', 
  duration = 400 
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), duration);
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative p-2 rounded-lg border border-border dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors ${className}`}
      aria-label="Toggle theme"
      disabled={isAnimating}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun
          className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-${duration} ${
            isDarkMode
              ? 'opacity-0 rotate-90 scale-0'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        
        {/* Moon Icon */}
        <Moon
          className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-${duration} ${
            isDarkMode
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  );
};

export default AnimatedThemeToggler;
