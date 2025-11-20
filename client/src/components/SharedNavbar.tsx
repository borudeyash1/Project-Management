import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, BookOpen, LogIn, UserPlus, Palette, Download, Monitor, Apple, HardDrive, ChevronDown, BadgeDollarSign } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
// Logo is now in public folder

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
  const location = useLocation();
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      // Fetch ALL releases, not just latest
      const response = await api.get('/releases');
      if (response?.success) {
        // Sort releases: latest first, then by date
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
    window.open(`http://localhost:5000${release.downloadUrl}`, '_blank');
    setShowDownloadMenu(false);
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
              <Link to="/" className="flex items-center gap-3">
                <img src="/logo.svg" alt="Sartthi Logo" className="h-12 w-auto" />
                <div className="flex flex-col">
                  <span className={`text-2xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-yellow-400 to-orange-500' : 'from-yellow-600 to-orange-600'} bg-clip-text text-transparent`}>
                    Sartthi
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} -mt-1 font-medium`}>
                    Project & Payroll Suite
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/"
                className={`${isActive('/') ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-gray-200 hover:text-yellow-400' : 'text-gray-800 hover:text-yellow-600')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <Home size={16} />
                Home
              </Link>
              <Link
                to="/about"
                className={`${isActive('/about') ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-gray-200 hover:text-yellow-400' : 'text-gray-800 hover:text-yellow-600')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <Info size={16} />
                About
              </Link>
              <Link
                to="/user-guide"
                className={`${isActive('/user-guide') ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-gray-200 hover:text-yellow-400' : 'text-gray-800 hover:text-yellow-600')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <BookOpen size={16} />
                User Guide
              </Link>
              <Link
                to="/pricing"
                className={`${isActive('/pricing') ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-gray-200 hover:text-yellow-400' : 'text-gray-800 hover:text-yellow-600')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
              >
                <BadgeDollarSign size={16} />
                Pricing
              </Link>

              {/* Download Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className={`${isDarkMode ? 'text-gray-200 hover:text-yellow-400' : 'text-gray-800 hover:text-yellow-600'} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
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

          {/* Auth Buttons and Theme Changer */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className={`${isActive('/login') ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-gray-200 hover:text-yellow-400' : 'text-gray-800 hover:text-yellow-600')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2`}
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
