import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, BookOpen, LogIn, UserPlus, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SharedNavbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-800/20 backdrop-blur-md border-b border-gray-700/20' : 'bg-white/20 backdrop-blur-md border-b border-white/20'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className={`text-2xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-yellow-400 to-orange-500' : 'from-yellow-600 to-orange-600'} bg-clip-text text-transparent`}>
                TaskFlowHQ
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/"
                className={`${isActive('/') ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <Home size={16} />
                Home
              </Link>
              <Link
                to="/about"
                className={`${isActive('/about') ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <Info size={16} />
                About
              </Link>
              <Link
                to="/user-guide"
                className={`${isActive('/user-guide') ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <BookOpen size={16} />
                User Guide
              </Link>
            </div>
          </div>

          {/* Auth Buttons and Theme Changer */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className={`${isActive('/login') ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
            >
              <LogIn size={16} />
              Login
            </Link>
            <Link
              to="/register"
              className={`bg-gradient-to-r ${isDarkMode ? 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'} text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg`}
            >
              <UserPlus size={16} />
              Register
            </Link>
            <button
              onClick={toggleTheme}
              className={`${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'} p-2 rounded-lg transition-colors duration-200`}
              title="Toggle Theme"
            >
              <Palette size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SharedNavbar;
