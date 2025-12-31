import React, { useState, useEffect } from 'react';
import {
  Upload, Download, Package, Trash2, Edit, CheckCircle,
  XCircle, Monitor, Apple, Plus, X, HardDrive
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { validateAdminToken, clearExpiredTokens } from '../../utils/tokenUtils';
import api from '../../services/api';
import AdminDockNavigation from './AdminDockNavigation';

interface Release {
  _id: string;
  version: string;
  versionName: string;
  description: string;
  releaseNotes: string;
  platform: 'windows' | 'macos' | 'linux';
  architecture: 'x64' | 'arm64' | 'universal';
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  downloadCount: number;
  isLatest: boolean;
  isActive: boolean;
  releaseDate: string;
  uploadedBy: {
    name: string;
    email: string;
  };
}

const ReleaseManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [releases, setReleases] = useState<Release[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    version: '',
    versionName: '',
    description: '',
    releaseNotes: '',
    platform: 'windows' as 'windows' | 'macos' | 'linux',
    architecture: 'x64' as 'x64' | 'arm64' | 'universal',
    isLatest: true,
    uploadType: 'file' as 'file' | 'url',
    downloadUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Clear expired tokens first
    clearExpiredTokens();

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken || !validateAdminToken(adminToken)) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/my-admin/login';
      return;
    }
    localStorage.setItem('accessToken', adminToken);

    fetchReleases();
    fetchStats();
  }, []);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      console.log('🔍 [RELEASES] Fetching releases...');

      const response = await api.get('/releases');

      if (response?.success) {
        console.log('✅ [RELEASES] Fetched', response.data.length, 'releases');
        setReleases(response.data);
      }
    } catch (error: any) {
      console.error('❌ [RELEASES] Failed to fetch releases:', error);
      addToast(error?.message || 'Failed to load releases', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/releases/admin/stats');
      if (response?.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('❌ [RELEASES] Failed to fetch stats:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateRelease = async () => {
    // Validate based on upload type
    if (formData.uploadType === 'file' && !selectedFile) {
      addToast('Please select a file', 'error');
      return;
    }

    if (formData.uploadType === 'url' && !formData.downloadUrl) {
      addToast('Please enter a download URL', 'error');
      return;
    }

    if (!formData.version || !formData.versionName || !formData.description || !formData.releaseNotes) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setUploading(true);
      console.log('🔍 [RELEASES] Creating release...');

      let data;

      if (formData.uploadType === 'file') {
        // File upload
        const formDataToSend = new FormData();
        formDataToSend.append('file', selectedFile!);
        formDataToSend.append('version', formData.version);
        formDataToSend.append('versionName', formData.versionName);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('releaseNotes', formData.releaseNotes);
        formDataToSend.append('platform', formData.platform);
        formDataToSend.append('architecture', formData.architecture);
        formDataToSend.append('isLatest', formData.isLatest.toString());

        data = await api.uploadRelease(formDataToSend, (percent) => {
          setUploadProgress(percent);
        });
      } else {
        // URL upload
        const response = await api.post('/releases/create-from-url', {
          version: formData.version,
          versionName: formData.versionName,
          description: formData.description,
          releaseNotes: formData.releaseNotes,
          platform: formData.platform,
          architecture: formData.architecture,
          isLatest: formData.isLatest,
          downloadUrl: formData.downloadUrl
        });
        data = response;
      }

      if (data?.success) {
        console.log('✅ [RELEASES] Release created successfully');
        addToast('Release created successfully!', 'success');
        setShowCreateModal(false);
        setFormData({
          version: '',
          versionName: '',
          description: '',
          releaseNotes: '',
          platform: 'windows',
          architecture: 'x64',
          isLatest: true,
          uploadType: 'file',
          downloadUrl: ''
        });
        setSelectedFile(null);
        fetchReleases();
        fetchStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('❌ [RELEASES] Failed to create release:', error);
      addToast(error?.message || 'Failed to create release', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteRelease = async (id: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;

    try {
      console.log('🔍 [RELEASES] Deleting release:', id);
      const response = await api.delete(`/releases/${id}`);

      if (response?.success) {
        console.log('✅ [RELEASES] Release deleted');
        addToast('Release deleted successfully', 'success');
        fetchReleases();
        fetchStats();
      }
    } catch (error: any) {
      console.error('❌ [RELEASES] Failed to delete release:', error);
      addToast(error?.message || 'Failed to delete release', 'error');
    }
  };

  const handleToggleLatest = async (id: string, currentValue: boolean) => {
    try {
      const response = await api.put(`/releases/${id}`, {
        isLatest: !currentValue
      });

      if (response?.success) {
        addToast('Release updated', 'success');
        fetchReleases();
      }
    } catch (error: any) {
      addToast(error?.message || 'Failed to update release', 'error');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'windows': return <Monitor className="w-5 h-5 text-accent" />;
      case 'macos': return <Apple className="w-5 h-5 text-gray-600" />;
      case 'linux': return <HardDrive className="w-5 h-5 text-orange-500" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Desktop App Releases
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>
              Manage desktop application versions for Windows, macOS, and Linux
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            New Release
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Total Releases</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                    {stats.totalReleases}
                  </p>
                </div>
                <Package className="w-8 h-8 text-accent" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Total Downloads</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                    {stats.totalDownloads}
                  </p>
                </div>
                <Download className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {stats.platformStats.map((platform: any) => (
              <div key={platform._id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} capitalize`}>{platform._id}</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                      {platform.downloads}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>
                      {platform.count} releases
                    </p>
                  </div>
                  {getPlatformIcon(platform._id)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Releases Table */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-600'} uppercase tracking-wider`}>
                    Version
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-600'} uppercase tracking-wider`}>
                    Platform
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-600'} uppercase tracking-wider`}>
                    File
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-600'} uppercase tracking-wider`}>
                    Downloads
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-600'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-600'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {releases.map((release) => (
                  <tr key={release._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {release.versionName}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                          v{release.version}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(release.platform)}
                        <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                          {release.platform} ({release.architecture})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-700' : 'text-gray-900'}`}>
                          {release.fileName}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                          {formatFileSize(release.fileSize)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-green-500" />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-700' : 'text-gray-900'}`}>
                          {release.downloadCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {release.isLatest && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-500">
                            Latest
                          </span>
                        )}
                        {release.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLatest(release._id, release.isLatest)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                          title={release.isLatest ? 'Unmark as latest' : 'Mark as latest'}
                        >
                          <CheckCircle className={`w-5 h-5 ${release.isLatest ? 'text-green-500' : 'text-gray-600'}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteRelease(release._id, release.fileName)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                          title="Delete release"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Release Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create New Release
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                      Version *
                    </label>
                    <input
                      type="text"
                      placeholder="1.0.0"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                      Version Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Summer Release 2025"
                      value={formData.versionName}
                      onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                    Description *
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of this release"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                    Release Notes *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="What's new in this version..."
                    value={formData.releaseNotes}
                    onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                      Platform *
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    >
                      <option value="windows">Windows</option>
                      <option value="macos">macOS</option>
                      <option value="linux">Linux</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                      Architecture *
                    </label>
                    <select
                      value={formData.architecture}
                      onChange={(e) => setFormData({ ...formData, architecture: e.target.value as any })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    >
                      <option value="x64">x64</option>
                      <option value="arm64">ARM64</option>
                      <option value="universal">Universal</option>
                    </select>
                  </div>
                </div>

                {/* Upload Type Selection */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                    Upload Type *
                  </label>
                  <select
                    value={formData.uploadType}
                    onChange={(e) => setFormData({ ...formData, uploadType: e.target.value as 'file' | 'url' })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="file">File Upload</option>
                    <option value="url">URL</option>
                  </select>
                </div>

                {/* File Upload */}
                {formData.uploadType === 'file' && (
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                      Upload File *
                    </label>
                    <div className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-6`}>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".exe,.dmg,.pkg,.deb,.rpm,.appimage,.zip,.tar.gz"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <Upload className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mb-2`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                        </span>
                        {selectedFile && (
                          <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>
                            {formatFileSize(selectedFile.size)}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {/* URL Input */}
                {formData.uploadType === 'url' && (
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-700'} mb-2`}>
                      Download URL *
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/app-v1.0.0.exe"
                      value={formData.downloadUrl}
                      onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      Enter the URL where the application can be downloaded from
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isLatest"
                    checked={formData.isLatest}
                    onChange={(e) => setFormData({ ...formData, isLatest: e.target.checked })}
                    className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="isLatest" className={`text-sm ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
                    Mark as latest version
                  </label>
                </div>

                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 ${isDarkMode
                        ? 'border-gray-600 hover:bg-gray-700 text-white'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-900'
                      } font-semibold transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRelease}
                    disabled={uploading}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${uploading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                      }`}
                  >
                    {uploading ? `Uploading... ${uploadProgress}%` : 'Create Release'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Dock Navigation */}
      <AdminDockNavigation />
    </div>
  );
};

export default ReleaseManagement;
