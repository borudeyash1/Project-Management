import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Search,
  Eye,
  Image as ImageIcon,
  Type,
  Calendar,
  MapPin,
  Palette
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import * as contentService from '../../services/contentService';
import { ContentBanner } from '../../services/contentService';

const AdminContent: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [banners, setBanners] = useState<ContentBanner[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<ContentBanner> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const availableRoutes = [
    { value: '/', label: 'Home (Landing Page)' },
    { value: '/about', label: 'About' },
    { value: '/user-guide', label: 'User Guide' },
    { value: '/pricing', label: 'Pricing' },
    { value: '/home', label: 'Dashboard (/home)' },
    { value: '/docs', label: 'Documentation' }
  ];

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      console.log('Loading banners...');
      const data = await contentService.getAllBanners();
      console.log('Banners loaded:', data);
      console.log('Setting banners state with:', data);
      setBanners(data);
      console.log('Banners state should now be:', data);
    } catch (error: any) {
      console.error('Failed to load banners:', error);
      addToast('Failed to load banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentBanner({
      title: '',
      content: '',
      type: 'text',
      backgroundColor: '#FF006B',
      textColor: '#FFFFFF',
      height: 60,
      placement: 'top',
      routes: [],
      isActive: true,
      priority: 0
    });
    setIsEditing(true);
  };

  const handleEdit = (banner: ContentBanner) => {
    setCurrentBanner(banner);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentBanner || !currentBanner.title || !currentBanner.content) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    if (!currentBanner.routes || currentBanner.routes.length === 0) {
      addToast('Please select at least one route', 'error');
      return;
    }

    try {
      setSaving(true);
      if (currentBanner._id) {
        await contentService.updateBanner(currentBanner._id, currentBanner);
        addToast('Banner updated successfully', 'success');
      } else {
        await contentService.createBanner(currentBanner);
        addToast('Banner created successfully', 'success');
      }

      await loadBanners();
      setIsEditing(false);
      setCurrentBanner(null);
    } catch (error: any) {
      console.error('Failed to save banner:', error);
      addToast(error.response?.data?.message || 'Failed to save banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      await contentService.deleteBanner(id);
      addToast('Banner deleted successfully', 'success');
      await loadBanners();
    } catch (error: any) {
      console.error('Failed to delete banner:', error);
      addToast('Failed to delete banner', 'error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentBanner(null);
  };

  const toggleRoute = (route: string) => {
    setCurrentBanner(prev => {
      const routes = prev?.routes || [];
      const newRoutes = routes.includes(route)
        ? routes.filter(r => r !== route)
        : [...routes, route];
      return { ...prev, routes: newRoutes };
    });
  };

  const filteredBanners = banners.filter(banner => {
    const title = banner?.title || '';
    const content = banner?.content || '';
    const query = searchQuery.toLowerCase();
    return title.toLowerCase().includes(query) || content.toLowerCase().includes(query);
  });

  console.log('Search query:', searchQuery);
  console.log('Current banners state:', banners);
  console.log('Filtered banners:', filteredBanners);
  console.log('Loading:', loading);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'bg-gradient-to-b from-amber-50 via-white to-white'}`}>
      <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border-b sticky top-0 z-10 backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Content Management
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage promotional banners and offers
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-gray-900 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Banner
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-xl`}>
              <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentBanner?._id ? 'Edit Banner' : 'Create Banner'}
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={currentBanner?.title || ''}
                    onChange={(e) => setCurrentBanner(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    placeholder="Black Friday Sale"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Content *
                  </label>
                  <textarea
                    value={currentBanner?.content || ''}
                    onChange={(e) => setCurrentBanner(prev => ({ ...prev, content: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    rows={3}
                    placeholder="Get 50% OFF - Limited Time Offer! 🎉"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Type
                  </label>
                  <div className="flex gap-2">
                    {['text', 'image', 'both'].map(type => (
                      <button
                        key={type}
                        onClick={() => setCurrentBanner(prev => ({ ...prev, type: type as any }))}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${currentBanner?.type === type
                          ? 'bg-accent text-gray-900 border-accent'
                          : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        {type === 'text' && <Type className="w-4 h-4 inline mr-1" />}
                        {type === 'image' && <ImageIcon className="w-4 h-4 inline mr-1" />}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL (if type includes image) */}
                {(currentBanner?.type === 'image' || currentBanner?.type === 'both') && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={currentBanner?.imageUrl || ''}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                      placeholder="https://example.com/banner.png"
                    />
                  </div>
                )}

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <Palette className="w-4 h-4 inline mr-1" />
                      Background
                    </label>
                    <input
                      type="color"
                      value={currentBanner?.backgroundColor || '#FF006B'}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <Palette className="w-4 h-4 inline mr-1" />
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={currentBanner?.textColor || '#FFFFFF'}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Height: {currentBanner?.height || 60}px
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    value={currentBanner?.height || 60}
                    onChange={(e) => setCurrentBanner(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Placement */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Placement
                  </label>
                  <div className="flex gap-2">
                    {['top', 'bottom'].map(placement => (
                      <button
                        key={placement}
                        onClick={() => setCurrentBanner(prev => ({ ...prev, placement: placement as any }))}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${currentBanner?.placement === placement
                          ? 'bg-accent text-gray-900 border-accent'
                          : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        {placement.charAt(0).toUpperCase() + placement.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Routes */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Show on Routes *
                  </label>
                  <div className="space-y-2">
                    {availableRoutes.map(route => (
                      <label key={route.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentBanner?.routes?.includes(route.value) || false}
                          onChange={() => toggleRoute(route.value)}
                          className="w-4 h-4 text-accent focus:ring-accent rounded"
                        />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {route.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={currentBanner?.startDate ? new Date(currentBanner.startDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, startDate: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={currentBanner?.endDate ? new Date(currentBanner.endDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, endDate: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                    />
                  </div>
                </div>

                {/* Priority & Active */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Priority
                    </label>
                    <input
                      type="number"
                      value={currentBanner?.priority || 0}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentBanner?.isActive !== false}
                        onChange={(e) => setCurrentBanner(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 text-accent focus:ring-accent rounded"
                      />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Active
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Banner'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-xl sticky top-24`}>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5" />
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Live Preview
                </h2>
              </div>

              <div className="space-y-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  This is how your banner will appear:
                </p>

                {/* Preview */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <div
                    style={{
                      backgroundColor: currentBanner?.backgroundColor || '#FF006B',
                      color: currentBanner?.textColor || '#FFFFFF',
                      height: `${currentBanner?.height || 60}px`
                    }}
                    className="flex items-center justify-center px-4 relative"
                  >
                    {(currentBanner?.type === 'image' || currentBanner?.type === 'both') && currentBanner?.imageUrl && (
                      <img
                        src={currentBanner.imageUrl}
                        alt="Preview"
                        className="h-full max-h-[80%] w-auto object-contain mr-4"
                      />
                    )}
                    {(currentBanner?.type === 'text' || currentBanner?.type === 'both') && (
                      <p className="font-bold text-center">
                        {currentBanner?.content || 'Your content here...'}
                      </p>
                    )}
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p><strong>Placement:</strong> {currentBanner?.placement || 'top'}</p>
                  <p><strong>Routes:</strong> {currentBanner?.routes?.length || 0} selected</p>
                  <p><strong>Status:</strong> {currentBanner?.isActive !== false ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search banners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                />
              </div>
            </div>

            {/* Banners List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-gray-800/60' : 'bg-white'} rounded-2xl p-12 text-center`}>
                <ImageIcon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  No Banners Found
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {searchQuery ? 'Try adjusting your search' : 'Create your first promotional banner'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBanners.map((banner) => (
                  <div
                    key={banner._id}
                    className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {banner.title}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${banner.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {banner.content}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className={`px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            {banner.type}
                          </span>
                          <span className={`px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            {banner.placement}
                          </span>
                          <span className={`px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            {banner.routes.length} routes
                          </span>
                          <span className={`px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            {banner.height}px
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors`}
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div
                        style={{
                          backgroundColor: banner.backgroundColor,
                          color: banner.textColor,
                          height: `${Math.min(banner.height, 80)}px`
                        }}
                        className="rounded-lg flex items-center justify-center px-4 text-sm"
                      >
                        {banner.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContent;
