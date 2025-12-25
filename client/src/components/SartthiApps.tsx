import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calendar, Shield, Monitor, Download, Clock, Folder as FolderIcon, FileText, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import './BlobCard.css';

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

  // Widget Data State
  const [emails, setEmails] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [vaultFiles, setVaultFiles] = useState<any[]>([]);
  const [widgetsLoading, setWidgetsLoading] = useState(true);

  useEffect(() => {
    fetchReleases();
    fetchWidgetData();
  }, []);

  const fetchWidgetData = async () => {
    try {
      setWidgetsLoading(true);

      // Fetch Mail
      try {
        const mailRes = await api.get('/sartthi/mail/messages', { params: { folder: 'inbox' } });
        if (mailRes.data?.emails) {
          setEmails(mailRes.data.emails.slice(0, 4));
        }
      } catch (e) {
        console.error("Failed to fetch mails", e);
      }

      // Fetch Calendar
      try {
        const calRes = await api.get('/sartthi/calendar/events');
        if (calRes.data?.events) {
          // Filter for upcoming events and sort
          const upcoming = calRes.data.events
            .map((e: any) => ({
              ...e,
              startTime: new Date(e.startTime),
              endTime: new Date(e.endTime)
            }))
            .sort((a: any, b: any) => a.startTime.getTime() - b.startTime.getTime())
            .slice(0, 4);
          setEvents(upcoming);
        }
      } catch (e) {
        console.error("Failed to fetch events", e);
      }

      // Fetch Vault
      try {
        // Vault might be at /vault/files based on server.ts
        const vaultRes = await api.get('/vault/files');
        if (vaultRes.data) {
          // Filter for folders first, then files
          const files = vaultRes.data
            .sort((a: any, b: any) => {
              if (a.type === 'folder' && b.type !== 'folder') return -1;
              if (a.type !== 'folder' && b.type === 'folder') return 1;
              return 0;
            })
            .slice(0, 5);
          setVaultFiles(files);
        }
      } catch (e) {
        console.error("Failed to fetch vault files", e);
      }

    } catch (error) {
      console.error('Error fetching widget data:', error);
    } finally {
      setWidgetsLoading(false);
    }
  };

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

  const latestWindowsRelease = releases.find(r => r.platform === 'windows' && r.isLatest);
  const olderReleases = releases.filter(r => !r.isLatest && r.platform === 'windows');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-white to-white relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#44a0d1]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#fcdd05]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <SharedNavbar />

      <div className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 bg-amber-100 text-amber-700">
              <Monitor className="w-4 h-4" />
              Integrated Ecosystem
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Sartthi <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Suite</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Your productivity hub. Access Mail, Calendar, and Vault in one place.
            </p>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {/* Mail Widget */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
                    <Mail size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Sartthi Mail</h3>
                </div>
                {emails.length > 0 && <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">Recent</span>}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {widgetsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100/50 rounded-xl animate-pulse" />)}
                  </div>
                ) : emails.length > 0 ? (
                  emails.map((email: any) => (
                    <div key={email.id} className="p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900 text-sm truncate">{email.sender || email.from}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full">{new Date(email.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h4 className="font-medium text-gray-800 text-sm mb-1 truncate group-hover:text-blue-600 transition-colors">{email.subject}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{email.preview || email.body}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Mail size={32} className="opacity-20" />
                    </div>
                    <p>No recent emails</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/mail" className="flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 gap-2 group">
                  Open Sartthi Mail
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Calendar Widget */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-xl text-purple-600 shadow-sm">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Sartthi Calendar</h3>
                </div>
                {events.length > 0 && <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-3 py-1 rounded-full border border-purple-100">Upcoming</span>}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {widgetsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100/50 rounded-xl animate-pulse" />)}
                  </div>
                ) : events.length > 0 ? (
                  events.map((event: any) => (
                    <div key={event.id} className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group">
                      <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-gray-100 pr-4">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{event.startTime.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-bold text-gray-800">{event.startTime.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate group-hover:text-purple-600 transition-colors">{event.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 w-fit px-2 py-1 rounded-md">
                          <Clock size={12} />
                          {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                          {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Calendar size={32} className="opacity-20" />
                    </div>
                    <p>No upcoming events</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/calendar" className="flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20 gap-2 group">
                  Open Sartthi Calendar
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Vault Widget */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl text-green-600 shadow-sm">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Sartthi Vault</h3>
                </div>
                <span className="text-xs font-semibold bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100">Secure</span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {widgetsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100/50 rounded-xl animate-pulse" />)}
                  </div>
                ) : vaultFiles.length > 0 ? (
                  vaultFiles.map((file: any) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all cursor-pointer group">
                      <div className={`p-2.5 rounded-lg transition-colors ${file.type === 'folder' ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-200' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'}`}>
                        {file.type === 'folder' ? <FolderIcon size={18} fill="currentColor" /> : <FileText size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm truncate group-hover:text-green-700 transition-colors">{file.name}</h4>
                        <span className="text-xs text-gray-500">{file.size ? file.size : 'Folder'}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-green-500 transition-colors" />
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Shield size={32} className="opacity-20" />
                    </div>
                    <p>Vault is empty</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/vault" className="flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/20 gap-2 group">
                  Open Sartthi Vault
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop App Section */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#44a0d1]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-start gap-12">
              <div className="flex-1 text-center md:text-left w-full">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#44a0d1]/20 text-[#44a0d1] mb-6 border border-[#44a0d1]/30">
                  <Monitor size={20} />
                  <span className="font-semibold">Desktop Application</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Sartthi Desktop</h2>
                <p className="text-lg mb-8 text-gray-300 max-w-2xl">
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
                          className="bg-gradient-to-r from-[#44a0d1] to-[#3688b5] hover:from-[#3688b5] hover:to-[#2b6d8a] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center gap-3"
                        >
                          <Download size={24} />
                          Download for Windows
                        </button>
                        <div className="flex justify-between text-sm text-gray-400 px-1">
                          <span>Version {latestWindowsRelease.version}</span>
                          <span>{formatFileSize(latestWindowsRelease.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-gray-700 bg-gray-900">
                    <p className="text-center text-gray-400">No desktop releases available at the moment.</p>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full max-w-md flex flex-col gap-6">
                <div className="aspect-video rounded-xl overflow-hidden border-4 border-gray-700 bg-gray-900 shadow-2xl relative group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Monitor className="w-32 h-32 text-gray-800" />
                  </div>
                </div>

                {olderReleases.length > 0 && (
                  <div className="rounded-xl border border-gray-700 bg-gray-900/50 overflow-hidden">
                    <div className="p-4 bg-gray-800/50 border-b border-gray-700 font-semibold text-gray-300 flex items-center gap-2">
                      <Download size={16} />
                      Older Versions
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {olderReleases.map((release) => (
                        <div
                          key={release._id}
                          className="flex items-center justify-between p-3 border-b border-gray-700 last:border-0 hover:bg-gray-800 transition-colors"
                        >
                          <div>
                            <div className="font-medium text-white text-sm">
                              v{release.version}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(release.createdAt).toLocaleDateString()} • {formatFileSize(release.fileSize)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(release)}
                            className="p-2 rounded-lg text-gray-400 hover:text-[#44a0d1] hover:bg-gray-700 transition-colors"
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
      <div className="relative z-20">
        <SharedFooter />
      </div>
    </div>
  );
};

export default SartthiApps;
