import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Shield, Monitor, Download, ArrowRight, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';

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
  useTheme();
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
    // Extract the unique filename from the download URL or file path
    // This ensures we hit the backend controller which handles local files and stats
    let filename = '';
    if (release.downloadUrl) {
      filename = release.downloadUrl.split('/').pop() || '';
    }

    if (!filename) {
      console.error('Could not determine filename for release');
      return;
    }

    const baseUrl = process.env.REACT_APP_API_URL || '/api';
    const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '');
    const downloadEndpoint = `${cleanBaseUrl}/api/releases/download/${filename}`;

    window.open(downloadEndpoint, '_self');
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
      icon: Mail,
      link: 'https://mail.sartthi.com',
      color: 'from-blue-500 to-cyan-500',
      features: ['Unified Inbox', 'Smart Filtering', 'Secure Encryption'],
      status: 'active'
    },
    {
      id: 'calendar',
      name: 'Sartthi Calendar',
      description: 'Automated tasks sync directly to your Google Calendar. Set a task in Sartthi, and see it instantly in your calendar, ensuring you never miss a deadline while keeping your data secure.',
      icon: Calendar,
      link: 'https://calendar.sartthi.com',
      color: 'from-purple-500 to-pink-500',
      features: ['Two-way Sync', 'Smart Scheduling', 'Team Availability'],
      status: 'active'
    },
    {
      id: 'vault',
      name: 'Sartthi Vault',
      description: 'Your private, secure workspace in Google Drive. We create a dedicated "Sartthi Vault" folder - we ONLY access files you store there, never your personal files. Your data stays in YOUR Google Drive with enterprise-grade security.',
      icon: Shield,
      link: 'https://vault.sartthi.com',
      color: 'from-green-500 to-emerald-500',
      features: ['Zero-Knowledge Encryption', 'Google Drive Integration', 'Secure Sharing'],
      status: 'active'
    }
  ];

  const latestWindowsRelease = releases.find(r => r.platform === 'windows' && r.isLatest);
  const olderReleases = releases.filter(r => !r.isLatest && r.platform === 'windows');

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-white to-white relative overflow-hidden`}>
      <div className={`absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse`}></div>
      <div className={`absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000`}></div>

      <SharedNavbar />

      <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 bg-amber-100 text-amber-700`}>
              <Monitor className="w-4 h-4" />
              Our Ecosystem
            </span>
            <h1 className={`text-4xl md:text-6xl font-bold text-gray-900 mb-6`}>
              Our <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Apps</span>
            </h1>
            <p className={`text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed font-medium`}>
              A complete suite of tools designed to boost your productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {apps.map((app) => (
              <div key={app.id} className={`group bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/90 rounded-2xl p-8 border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <app.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold text-gray-900 mb-4`}>{app.name}</h3>
                <p className={`text-gray-700 leading-relaxed mb-6`}>
                  {app.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {app.features.map((feature, i) => (
                    <li key={i} className={`flex items-center gap-2 text-sm text-gray-700 font-medium`}>
                      <div className={`w-1.5 h-1.5 bg-blue-600 rounded-full`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${app.status === 'active'
                    ? 'bg-accent hover:bg-accent-hover text-white shadow-lg hover:shadow-accent/50'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed font-bold'
                  }`}>
                  {app.status === 'active' ? 'Launch App' : 'Coming Soon'}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop App Section */}
          <div className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl`}>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-start gap-12">
              <div className="flex-1 text-center md:text-left w-full">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent mb-6 border border-accent/30">
                  <Monitor size={20} />
                  <span className="font-semibold">Desktop Application</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Sartthi Desktop</h2>
                <p className={`text-lg mb-8 text-gray-300 max-w-2xl`}>
                  Experience the full power of Sartthi on your desktop. Native notifications,
                  offline support, and deeper system integration for maximum performance.
                </p>

                {loading ? (
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    Loading releases...
                  </div>
                ) : latestWindowsRelease ? (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-center md:items-start">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleDownload(latestWindowsRelease)}
                          className={`bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-accent/50 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group`}
                        >
                          <Download size={24} />
                          Download for Windows
                        </button>
                        <div className={`flex justify-between text-sm text-gray-400 px-1`}>
                          <span>Version {latestWindowsRelease.version}</span>
                          <span>{formatFileSize(latestWindowsRelease.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg border border-gray-700 bg-gray-900`}>
                    <p className="text-center text-gray-400">No desktop releases available at the moment.</p>
                  </div>
                )}
              </div>

              {/* Right Side: Older Versions & Illustration */}
              <div className="flex-1 w-full max-w-md flex flex-col gap-6">
                <div className={`aspect-video rounded-xl overflow-hidden border-4 border-gray-700 bg-gray-900 shadow-2xl relative group`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Monitor className={`w-32 h-32 text-gray-800`} />
                  </div>
                </div>

                {/* Older Versions List - Always visible if exists */}
                {olderReleases.length > 0 && (
                  <div className="rounded-xl border border-gray-700 bg-gray-900/50 overflow-hidden">
                    <div className="p-4 bg-gray-800/50 border-b border-gray-700 font-semibold text-gray-300 flex items-center gap-2">
                      <Download size={16} />
                      Older Versions
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      {olderReleases.map((release) => (
                        <div
                          key={release._id}
                          className={`flex items-center justify-between p-3 border-b border-gray-700 last:border-0 hover:bg-gray-800 transition-colors`}
                        >
                          <div>
                            <div className={`font-medium text-white text-sm`}>
                              v{release.version}
                            </div>
                            <div className={`text-xs text-gray-400`}>
                              {new Date(release.createdAt).toLocaleDateString()} • {formatFileSize(release.fileSize)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(release)}
                            className={`p-2 rounded-lg text-gray-400 hover:text-accent hover:bg-gray-700 transition-colors`}
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
};

export default SartthiApps;
