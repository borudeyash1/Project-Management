import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Info,
  FileText,
  BadgeDollarSign,
  LogIn,
  UserPlus,
  Palette,
  Menu,
  X,
  Languages,
  Grid
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const SharedNavbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const location = useLocation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setShowLanguageMenu(false);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/apps', label: 'Our Apps', icon: <Grid size={18} /> },
    { path: '/about', label: 'About', icon: <Info size={18} /> },
    { path: '/docs', label: 'Docs', icon: <FileText size={18} /> },
    { path: '/pricing', label: 'Pricing', icon: <BadgeDollarSign size={18} /> },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isDarkMode ? 'bg-gray-900/90 backdrop-blur-md border-b border-gray-800' : 'bg-white/90 backdrop-blur-md border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/2.png" alt="Sartthi Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-accent/10 text-accent'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Language Selector */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Change Language"
              >
                <Languages size={20} />
              </button>

              {showLanguageMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} overflow-hidden z-50`}>
                  <div className="py-1 max-h-96 overflow-y-auto custom-scrollbar">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-4 py-2 text-left flex items-center gap-3 ${
                          i18n.language === lang.code
                            ? 'bg-accent/10 text-accent'
                            : isDarkMode
                              ? 'text-gray-200 hover:bg-gray-700'
                              : 'text-gray-800 hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Toggle Theme"
            >
              <Palette size={20} />
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

            <Link
              to="/login"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                isActive('/login')
                  ? 'bg-accent/10 text-accent'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LogIn size={18} />
              Login
            </Link>
            <Link
              to="/register"
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/40 transform hover:-translate-y-0.5"
            >
              <UserPlus size={18} />
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Palette size={20} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } ${isDarkMode ? 'bg-gray-900 border-b border-gray-800' : 'bg-white border-b border-gray-200'}`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-accent/10 text-accent'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {link.icon}
                {link.label}
              </div>
            </Link>
          ))}

          <div className={`my-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}></div>

          <div className="space-y-2">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LogIn size={18} />
                Login
              </div>
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-medium text-white bg-accent hover:bg-accent-hover text-center shadow-md"
            >
              Register Now
            </Link>
          </div>
          
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <p className={`px-3 text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Language
            </p>
            <div className="grid grid-cols-2 gap-2 px-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    i18n.language === lang.code
                      ? 'bg-accent/10 text-accent'
                      : isDarkMode
                        ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SharedNavbar;
