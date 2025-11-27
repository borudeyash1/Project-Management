import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Shield, Monitor, Download, ArrowRight, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

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

const SartthiApps: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOlderVersions, setShowOlderVersions] = useState(false);

  useEffect(() => {
    fetchReleases();
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
    let url = release.downloadUrl;

    // Fix for localhost URLs in production/remote environments
    if (url.includes('localhost') && !window.location.hostname.includes('localhost')) {
      try {
        // If it's a localhost URL but we're not on localhost, try to convert it to a relative path
        // or use the current base URL
        const urlObj = new URL(url);
        // Keep the path and query, discard the localhost origin
        const relativePath = urlObj.pathname + urlObj.search;
        
        let baseUrl = process.env.REACT_APP_API_URL || '/api';
        baseUrl = baseUrl.replace(/\/api\/?$/, '');
        baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        
        // If the path starts with /uploads, we can likely serve it from the API server
        if (relativePath.startsWith('/uploads')) {
            url = `${baseUrl}${relativePath}`;
        }
      } catch (e) {
        console.error('Error parsing download URL:', e);
      }
    }

    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      let baseUrl = process.env.REACT_APP_API_URL || '/api';
      baseUrl = baseUrl.replace(/\/api\/?$/, '');
      baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      window.open(`${baseUrl}${url}`, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const apps = [
    {
      id: 'mail',
      name: 'Sartthi Mail',
      description: 'Experience a connected workspace where your emails, calendar, and tasks work in harmony. Manage your workspace with your connected email and enjoy a seamless, secure experience.',
      icon: <Mail className="w-12 h-12 text-blue-500" />,
      link: 'https://mail.sartthi.com',
      color: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'calendar',
      name: 'Sartthi Calendar',
      description: 'Automated tasks sync directly to your Google Calendar. Set a task in Sartthi, and see it instantly in your calendar, ensuring you never miss a deadline while keeping your data secure.',
      icon: <Calendar className="w-12 h-12 text-purple-500" />,
      link: 'https://calendar.sartthi.com',
      color: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500',
      buttonColor: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'vault',
      name: 'Sartthi Vault',
      description: 'Your private, secure workspace in Google Drive. We create a dedicated "Sartthi Vault" folder - we ONLY access files you store there, never your personal files. Your data stays in YOUR Google Drive with enterprise-grade security. Disconnect anytime, your files remain yours.',
      icon: <Shield className="w-12 h-12 text-green-500" />,
      link: 'https://vault.sartthi.com',
      color: 'bg-green-500/10 border-green-500/20 hover:border-green-500',
      buttonColor: 'bg-green-500 hover:bg-green-600',
      isVault: true // Special flag for vault
    }
  ];

  const latestWindowsRelease = releases.find(r => r.platform === 'windows' && r.isLatest);
  const olderReleases = releases.filter(r => !r.isLatest && r.platform === 'windows');

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Our Apps</h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            A complete suite of tools designed to boost your productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {apps.map((app) => (
            <div 
              key={app.id}
              className={`rounded-2xl p-8 border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${app.color} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="mb-6">{app.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{app.name}</h3>
              <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {app.description}
              </p>
              <a 
                href={app.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${app.buttonColor}`}
              >
                Launch App <ExternalLink size={18} />
              </a>
            </div>
          ))}
        </div>

        {/* Desktop App Section */}
        <div className={`rounded-3xl p-8 md:p-12 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-2xl overflow-hidden relative`}>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
                <Monitor size={20} />
                <span className="font-semibold">Desktop Application</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Sartthi Desktop</h2>
              <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Experience the full power of Sartthi on your desktop. Native notifications, 
                offline support, and deeper system integration for maximum performance.
              </p>
              
              {loading ? (
                <div className="flex items-center gap-2 text-accent">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  Loading releases...
                </div>
              ) : latestWindowsRelease ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => handleDownload(latestWindowsRelease)}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-lg transition-all shadow-lg hover:shadow-accent/25"
                    >
                      <Download size={24} />
                      Download for Windows
                    </button>
                    <div className={`flex flex-col justify-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>Version {latestWindowsRelease.version}</span>
                      <span>{formatFileSize(latestWindowsRelease.fileSize)}</span>
                    </div>
                  </div>

                  {olderReleases.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowOlderVersions(!showOlderVersions)}
                        className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                      >
                        {showOlderVersions ? 'Hide older versions' : 'Show older versions'}
                        <ArrowRight size={16} className={`transform transition-transform ${showOlderVersions ? 'rotate-90' : ''}`} />
                      </button>

                      {showOlderVersions && (
                        <div className={`mt-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} overflow-hidden`}>
                          {olderReleases.map((release) => (
                            <div 
                              key={release._id}
                              className={`flex items-center justify-between p-4 border-b last:border-0 ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'} transition-colors`}
                            >
                              <div>
                                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  v{release.version}
                                </div>
                                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(release.createdAt).toLocaleDateString()} • {formatFileSize(release.fileSize)}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownload(release)}
                                className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'} transition-colors`}
                                title="Download"
                              >
                                <Download size={20} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-center">No desktop releases available at the moment.</p>
                </div>
              )}
            </div>
            
            <div className="flex-1 w-full max-w-md">
              <div className={`aspect-video rounded-xl overflow-hidden border-4 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-gray-50'} shadow-2xl relative group`}>
                <div className="absolute inset-0 flex items-center justify-center">
                   {/* Placeholder for app screenshot or illustration */}
                   <Monitor className={`w-32 h-32 ${isDarkMode ? 'text-gray-800' : 'text-gray-200'}`} />
                </div>
                {/* You could add an actual screenshot image here if available */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SartthiApps;
