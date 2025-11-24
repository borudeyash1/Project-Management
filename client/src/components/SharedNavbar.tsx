import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Info,
  BookOpen,
  FileText,
  BadgeDollarSign,
  Download,
  LogIn,
  UserPlus,
  Palette,
  Monitor,
  Apple,
  HardDrive,
  ChevronDown,
  Menu,
  X,
  Languages
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Release {
  _id: string;
  version: string;
  versionName: string;
  platform: 'windows' | 'macos' | 'linux';
  architecture: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  isLatest: boolean;
  createdAt: string;
}

const SharedNavbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const location = useLocation();
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Fetch releases when dropdown opens
  useEffect(() => {
    if (showDownloadMenu && releases.length === 0) {
      fetchReleases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDownloadMenu]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const response = await api.get('/releases');
      if (response?.success) {
        const sortedReleases = response.data.sort((a: Release, b: Release) => {
          if (a.isLatest && !b.isLatest) return -1;
          if (!a.isLatest && b.isLatest) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setReleases(sortedReleases);
      }
    } catch (error) {
      console.error('Failed to fetch releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (release: Release) => {
    if (release.downloadUrl.startsWith('http')) {
      window.open(release.downloadUrl, '_blank');
    } else {
      let baseUrl = process.env.REACT_APP_API_URL || '/api';
      // Remove /api suffix if present
      baseUrl = baseUrl.replace(/\/api\/?$/, '');
      baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      window.open(`${baseUrl}${release.downloadUrl}`, '_blank');
    }
    setShowDownloadMenu(false);
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setShowLanguageMenu(false);
    setIsMobileMenuOpen(false);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'windows': return <Monitor className="w-5 h-5 text-accent" />;
      case 'macos': return <Apple className="w-5 h-5 text-gray-600" />;
      case 'linux': return <HardDrive className="w-5 h-5 text-orange-500" />;
      default: return <Download className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-800/20 backdrop-blur-md border-b border-gray-700/20' : 'bg-white/20 backdrop-blur-md border-b border-white/20'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img src="/2.png" alt="Sartthi Logo" className="h-7 w-auto" />
              </Link>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/"
                className={`${isActive('/') ? 'text-accent' : (isDarkMode ? 'text-gray-200 hover:text-accent' : 'text-gray-800 hover:text-accent')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <Home size={16} />
                Home
              </Link>
              <Link
                to="/about"
                className={`${isActive('/about') ? 'text-accent' : (isDarkMode ? 'text-gray-200 hover:text-accent' : 'text-gray-800 hover:text-accent')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <Info size={16} />
                About
              </Link>
              <Link
                to="/user-guide"
                className={`${isActive('/user-guide') ? 'text-accent' : (isDarkMode ? 'text-gray-200 hover:text-accent' : 'text-gray-800 hover:text-accent')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <BookOpen size={16} />
                User Guide
              </Link>
              <Link
                to="/docs"
                className={`${isActive('/docs') ? 'text-accent' : (isDarkMode ? 'text-gray-200 hover:text-accent' : 'text-gray-800 hover:text-accent')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <FileText size={16} />
                Docs
              </Link>
              <Link
                to="/pricing"
                className={`${isActive('/pricing') ? 'text-accent' : (isDarkMode ? 'text-gray-200 hover:text-accent' : 'text-gray-800 hover:text-accent')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <BadgeDollarSign size={16} />
                Pricing
              </Link>

              {/* Download Dropdown */}
              <div className="relative inline-block" ref={dropdownRef}>
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className={`${isDarkMode ? 'text-gray-200 hover:text-accent' : 'text-gray-800 hover:text-accent'} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
                >
                  <Download size={16} />
                  Download
                  <ChevronDown size={14} className={`transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDownloadMenu && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} overflow-hidden z-50`}>
                    <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-300 bg-gray-50'}`}>
                      <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Download Desktop App
                      </h3>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                        Latest versions available
                      </p>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                        </div>
                      ) : releases.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Download className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            No releases available yet
                          </p>
                        </div>
                      ) : (
                        <div className="py-2">
                          {/* Latest Releases Section */}
                          {releases.some(r => r.isLatest) && (
                            <>
                              <div className={`px-4 py-2 text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                                Latest Releases
                              </div>
                              {releases.filter(r => r.isLatest).map((release) => (
                                <button
                                  key={release._id}
                                  onClick={() => handleDownload(release)}
                                  className={`w-full px-4 py-3 flex items-center gap-3 ${isDarkMode ? 'hover:bg-gray-700 bg-green-500/5' : 'hover:bg-gray-50 bg-green-50'} transition-colors border-l-2 border-green-500`}
                                >
                                  <div className="flex-shrink-0">
                                    {getPlatformIcon(release.platform)}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                                        {release.platform}
                                      </p>
                                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-500 text-white">
                                        Latest
                                      </span>
                                    </div>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                      {release.versionName} • v{release.version}
                                    </p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-0.5`}>
                                      {release.architecture} • {formatFileSize(release.fileSize)}
                                    </p>
                                  </div>
                                  <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                                </button>
                              ))}
                            </>
                          )}

                          {/* Previous Releases Section */}
                          {releases.some(r => !r.isLatest) && (
                            <>
                              <div className={`px-4 py-2 mt-2 text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                                Previous Releases
                              </div>
                              {releases.filter(r => !r.isLatest).map((release) => (
                                <button
                                  key={release._id}
                                  onClick={() => handleDownload(release)}
                                  className={`w-full px-4 py-3 flex items-center gap-3 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                                >
                                  <div className="flex-shrink-0">
                                    {getPlatformIcon(release.platform)}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                                      {release.platform}
                                    </p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                                      {release.versionName} • v{release.version}
                                    </p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-0.5`}>
                                      {release.architecture} • {formatFileSize(release.fileSize)}
                                    </p>
                                  </div>
                                  <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-300 bg-gray-50'}`}>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-center`}>
                        Choose your platform to download
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`text-accent hover:text-accent-dark p-2 rounded-lg transition-colors duration-200`}
              title="Toggle Theme"
            >
              <Palette size={20} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md ${isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-100'}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className={`${isActive('/login') ? 'text-accent' : (isDarkMode ? 'text-gray-200 hover:text-accent' : 'text-gray-800 hover:text-accent')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
            >
              <LogIn size={16} />
              Login
            </Link>
            <Link
              to="/register"
              className={`bg-accent hover:bg-accent-hover text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg`}
            >
              <UserPlus size={16} />
              Register
            </Link>
            <button
              onClick={toggleTheme}
              className={`text-accent hover:text-accent-dark p-2 rounded-lg transition-colors duration-200`}
              title="Toggle Theme"
            >
              <Palette size={20} />
            </button>

            {/* Language Dropdown */}
            <div className="relative inline-block" ref={languageDropdownRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`text-accent hover:text-accent-dark p-2 rounded-lg transition-colors duration-200`}
                title="Change Language"
              >
                <Languages size={20} />
              </button>

              {showLanguageMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} overflow-hidden z-50`}>
                  <div className="py-1 max-h-96 overflow-y-auto">
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
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-accent/10 text-accent' : (isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-100')}`}
          >
            <div className="flex items-center gap-2">
              <Home size={18} />
              Home
            </div>
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/about') ? 'bg-accent/10 text-accent' : (isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-100')}`}
          >
            <div className="flex items-center gap-2">
              <Info size={18} />
              About
            </div>
          </Link>
          <Link
            to="/user-guide"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/user-guide') ? 'bg-accent/10 text-accent' : (isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-100')}`}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} />
              User Guide
            </div>
          </Link>
          <Link
            to="/docs"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/docs') ? 'bg-accent/10 text-accent' : (isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-100')}`}
          >
            <div className="flex items-center gap-2">
              <FileText size={18} />
              Docs
            </div>
          </Link>
          <Link
            to="/pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/pricing') ? 'bg-accent/10 text-accent' : (isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-100')}`}
          >
            <div className="flex items-center gap-2">
              <BadgeDollarSign size={18} />
              Pricing
            </div>
          </Link>

          <div className={`pt-4 pb-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mt-2`}>
            {/* Language Selection for Mobile */}
            <div className="px-3 py-2">
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-2`}>
                Language
              </p>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                      i18n.language === lang.code
                        ? 'bg-accent/10 text-accent'
                        : isDarkMode
                          ? 'text-gray-200 hover:bg-gray-800'
                          : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-100'}`}
            >
              <div className="flex items-center gap-2">
                <LogIn size={18} />
                Login
              </div>
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 bg-accent hover:bg-accent-hover mt-2 mx-2 text-center shadow-md"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SharedNavbar;
