import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, FileText, BadgeDollarSign, Grid, Globe, ChevronDown, Menu, X, Sparkles, LogIn, UserPlus, Palette, Languages } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const SharedNavbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const location = useLocation();
  // Check if we are on a public page where we want to hide the theme toggle and language changer
  const isPublicPage = ['/', '/about', '/apps', '/docs', '/pricing', '/login', '/register', '/user-guide'].some(path => location.pathname === path || location.pathname.startsWith('/docs'));
  
  // Force light theme logic for public pages
  const effectiveDarkMode = isPublicPage ? false : isDarkMode;

  // Scroll detection for navbar behavior
  const [scrolled, setScrolled] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const products = [
    { name: 'Sartthi Mail', icon: '📧', path: '/mail', description: 'Professional email' },
    { name: 'Calendar', icon: '📅', path: '/calendar', description: 'Smart scheduling' },
    { name: 'Vault', icon: '🔒', path: '/vault', description: 'Secure storage' },
    { name: 'Desktop', icon: '💻', path: '/desktop', description: 'Native app' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
        setShowProductsMenu(false);
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
    { path: '/ai', label: 'AI', icon: <Sparkles size={18} /> },
    { path: '/about', label: 'About', icon: <Info size={18} /> },
    { path: '/docs', label: 'Docs', icon: <FileText size={18} /> },
    { path: '/pricing', label: 'Pricing', icon: <BadgeDollarSign size={18} /> },
  ];

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 
      transition-all duration-500 ease-in-out
      ${scrolled 
        ? 'bg-white/95 backdrop-blur-md py-3 border-b border-gray-200' 
        : 'bg-transparent py-6'
      }
    `} 
    style={scrolled ? { boxShadow: '0 4px 6px -1px rgba(68, 160, 209, 0.1), 0 2px 4px -1px rgba(68, 160, 209, 0.06)' } : {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/2.png" alt="Sartthi Logo" className={`transition-all duration-500 ${scrolled ? 'h-8' : 'h-10'} w-auto`} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {/* Products Dropdown */}
            <div className="relative" ref={productsDropdownRef}>
              <button
                onClick={() => setShowProductsMenu(!showProductsMenu)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 text-gray-900 hover:bg-yellow-50 hover:text-gray-900"
              >
                <Grid size={18} />
                Products
              </button>
              
              {showProductsMenu && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-fadeIn">
                  {products.map((product) => (
                    <Link
                      key={product.path}
                      to={product.path}
                      className="flex items-start gap-4 px-4 py-3 hover:bg-yellow-50 transition-colors duration-200"
                      onClick={() => setShowProductsMenu(false)}
                    >
                      <span className="text-3xl">{product.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Regular Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-yellow-50 text-gray-900 font-semibold'
                    : 'text-gray-900 hover:bg-yellow-50 hover:text-gray-900'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Language Selector - Hidden on public pages */}
            {!isPublicPage && (
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="p-2 rounded-lg transition-colors duration-200 text-gray-700 hover:bg-yellow-50 hover:text-gray-900"
                  title="Change Language"
                >
                  <Languages size={20} />
                </button>

                {showLanguageMenu && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl ${effectiveDarkMode && !isPublicPage ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} overflow-hidden z-50`}>
                    <div className="py-1 max-h-96 overflow-y-auto custom-scrollbar">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full px-4 py-2 text-left flex items-center gap-3 ${
                            i18n.language === lang.code
                              ? 'bg-accent/10 text-accent'
                              : effectiveDarkMode && !isPublicPage
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
            )}

            {!isPublicPage && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${effectiveDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                title="Toggle Theme"
              >
                <Palette size={20} />
              </button>
            )}

            <div className="h-6 w-px bg-white/30 mx-2"></div>

            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50"
            >
              <LogIn size={18} />
              Login
            </Link>
            <Link
              to="/register"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-lg hover:scale-105 transform ${
                scrolled
                  ? 'bg-[#FFD700] text-gray-900 hover:bg-[#FFC700]'
                  : 'bg-[#FFD700] text-gray-900 hover:bg-[#FFC700]'
              }`}
            >
              <UserPlus size={18} />
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {!isPublicPage && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${effectiveDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Palette size={20} />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg transition-colors duration-200 text-white/90 hover:bg-white/10 hover:text-white"
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
        } bg-white/95 border-b border-gray-200 shadow-sm`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-yellow-50 text-gray-900 font-semibold'
                  : 'text-gray-700 hover:bg-yellow-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {link.icon}
                {link.label}
              </div>
            </Link>
          ))}

          <div className="my-4 border-t border-white/20"></div>

          <div className="space-y-2">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-medium transition-colors text-gray-700 hover:bg-yellow-50 hover:text-gray-900"
            >
              <div className="flex items-center gap-3">
                <LogIn size={18} />
                Login
              </div>
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-300 text-center shadow-md"
            >
              Register Now
            </Link>
          </div>
          
          {/* Language Section - Hidden on public pages */}
          {!isPublicPage && (
            <div className={`mt-4 pt-4 border-t ${effectiveDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`px-3 text-xs font-semibold uppercase tracking-wider mb-3 ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Language
              </p>
              <div className="grid grid-cols-2 gap-2 px-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      i18n.language === lang.code
                        ? effectiveDarkMode ? 'bg-accent/20 text-accent' : 'bg-accent/10 text-accent'
                        : effectiveDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SharedNavbar;
