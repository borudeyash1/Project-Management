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
  Palette,
  Move
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import * as contentService from '../../services/contentService';
import CustomPlacementModal from './CustomPlacementModal';
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
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);

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

  useEffect(() => {
    // Listen for canvas editor updates
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'BANNER_UPDATE' && event.data.data) {
        console.log('Received banner update from canvas:', event.data.data);
        setCurrentBanner(event.data.data);
      }

      if (event.data.type === 'CANVAS_COMPLETE' && event.data.data) {
        console.log('Canvas editing complete:', event.data.data);
        const canvasData = event.data.data;

        // Merge canvas data with current banner (which has title, content, routes)
        const mergedData = { ...currentBanner, ...canvasData };
        setCurrentBanner(mergedData);

        // Auto-save if all required fields are present
        if (mergedData.title && mergedData.content && mergedData.routes && mergedData.routes.length > 0) {
          (async () => {
            try {
              if (mergedData._id) {
                await contentService.updateBanner(mergedData._id, mergedData);
                addToast('Banner updated successfully!', 'success');
              } else {
                await contentService.createBanner(mergedData);
                addToast('Banner created successfully!', 'success');
              }
              await loadBanners();
              setIsEditing(false);
              setCurrentBanner(null);
            } catch (error: any) {
              console.error('Failed to save:', error);
              addToast('Canvas applied. Please save manually.', 'warning');
              setIsEditing(true);
            }
          })();
        } else {
          addToast('Canvas changes applied! Please complete the form and save.', 'info');
          setIsEditing(true);
        }
      }

      if (event.data.type === 'REQUEST_BANNER_DATA') {
        // Send current banner data to canvas editor
        event.source?.postMessage({
          type: 'BANNER_DATA',
          data: currentBanner
        }, event.origin as any);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentBanner]);

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
      priority: 0,
      borderRadius: 0,
      fontSize: 16,
      fontWeight: 700,
      padding: 16
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

    if (currentBanner.height && currentBanner.height > 200) {
      addToast('Banner height cannot exceed 200px', 'error');
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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save banner';
      addToast(errorMessage, 'error');
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
                  <div className="space-y-3">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <ImageIcon className="w-4 h-4 inline mr-1" />
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
                      placeholder="https://example.com/banner.png or https://drive.google.com/..."
                    />

                    {/* Image Preview */}
                    {currentBanner?.imageUrl && (
                      <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Preview:
                        </p>
                        <div className="flex items-center justify-center p-2 bg-white/10 rounded">
                          <img
                            src={currentBanner.imageUrl}
                            alt="Banner preview"
                            className="max-h-20 w-auto object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent && !parent.querySelector('.error-text')) {
                                const errorText = document.createElement('p');
                                errorText.className = 'error-text text-xs text-red-500';
                                errorText.textContent = 'Failed to load image. Please check the URL.';
                                parent.appendChild(errorText);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Image Dimensions */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Image Width (px)
                        </label>
                        <input
                          type="number"
                          value={currentBanner?.imageWidth || ''}
                          onChange={(e) => setCurrentBanner(prev => ({ ...prev, imageWidth: e.target.value ? parseInt(e.target.value) : undefined }))}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-accent`}
                          placeholder="Auto"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Image Height (px)
                        </label>
                        <input
                          type="number"
                          value={currentBanner?.imageHeight || ''}
                          onChange={(e) => setCurrentBanner(prev => ({ ...prev, imageHeight: e.target.value ? parseInt(e.target.value) : undefined }))}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-accent`}
                          placeholder="Auto"
                        />
                      </div>
                    </div>
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

                {/* Typography */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Font Size: {currentBanner?.fontSize || 16}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="48"
                      value={currentBanner?.fontSize || 16}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Font Weight: {currentBanner?.fontWeight || 700}
                    </label>
                    <select
                      value={currentBanner?.fontWeight || 700}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, fontWeight: parseInt(e.target.value) }))}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                    >
                      <option value="100">Thin (100)</option>
                      <option value="200">Extra Light (200)</option>
                      <option value="300">Light (300)</option>
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi Bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>
                </div>

                {/* Spacing */}
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Padding: {currentBanner?.padding || 16}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentBanner?.padding || 16}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, padding: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Border Radius: {currentBanner?.borderRadius || 0}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={currentBanner?.borderRadius || 0}
                    onChange={(e) => setCurrentBanner(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Placement */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Placement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['top', 'bottom', 'popup', 'custom'].map(placement => (
                      <button
                        key={placement}
                        onClick={() => setCurrentBanner(prev => ({ ...prev, placement: placement as any }))}
                        className={`px-4 py-2 rounded-lg border transition-colors ${currentBanner?.placement === placement
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
                  {currentBanner?.placement === 'custom' && (
                    <button
                      onClick={() => setIsPlacementModalOpen(true)}
                      className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                    >
                      <Move className="w-4 h-4" />
                      Configure Custom Placement
                    </button>
                  )}
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
                      value={currentBanner?.startDate ? (() => {
                        const date = new Date(currentBanner.startDate);
                        const offset = date.getTimezoneOffset();
                        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                        return localDate.toISOString().slice(0, 16);
                      })() : ''}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
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
                      value={currentBanner?.endDate ? (() => {
                        const date = new Date(currentBanner.endDate);
                        const offset = date.getTimezoneOffset();
                        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                        return localDate.toISOString().slice(0, 16);
                      })() : ''}
                      onChange={(e) => setCurrentBanner(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Live Preview
                  </h2>
                </div>
                <button
                  onClick={() => {
                    const canvasUrl = `/admin/canvas-editor`;
                    const canvasWindow = window.open(canvasUrl, '_blank');
                    if (canvasWindow) {
                      // Pass banner data via postMessage after window loads
                      setTimeout(() => {
                        canvasWindow.postMessage({
                          type: 'BANNER_DATA',
                          data: currentBanner
                        }, window.location.origin);
                      }, 500);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-gray-900 rounded-lg font-medium transition-colors"
                  title="Open full-screen canvas editor in new tab"
                >
                  <Palette className="w-4 h-4" />
                  Open Canvas Editor
                </button>
              </div>

              <div className="space-y-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  This is how your banner will appear on the public pages:
                </p>

                {/* Banner Preview */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden backdrop-blur-sm">
                  {currentBanner?.imageUrl && currentBanner.type === 'image' ? (
                    /* Show exported canvas image */
                    <div className="relative w-full" style={{ height: `${currentBanner?.height || 88}px` }}>
                      <img
                        src={currentBanner.imageUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                        style={{
                          borderRadius: currentBanner?.borderRadius ? `${currentBanner.borderRadius}px` : '0px',
                        }}
                      />
                    </div>
                  ) : (
                    /* Show constructed preview */
                    <div
                      style={{
                        backgroundColor: currentBanner?.backgroundColor || '#FF006B',
                        color: currentBanner?.textColor || '#FFFFFF',
                        height: `${currentBanner?.height || 88}px`,
                        borderRadius: currentBanner?.borderRadius ? `${currentBanner.borderRadius}px` : '0px',
                        padding: currentBanner?.padding ? `${currentBanner.padding}px` : '16px',
                      }}
                      className="flex items-center justify-center relative backdrop-blur-md bg-opacity-90"
                    >
                      {/* Image */}
                      {(currentBanner?.type === 'image' || currentBanner?.type === 'both') && currentBanner?.imageUrl && (
                        <div className="cursor-move hover:opacity-80 transition-opacity">
                          <img
                            src={currentBanner.imageUrl}
                            alt="Preview"
                            className="object-contain"
                            style={{
                              maxHeight: `${(currentBanner.height || 88) * 0.8}px`,
                              height: currentBanner.imageHeight ? `${currentBanner.imageHeight}px` : 'auto',
                              width: currentBanner.imageWidth ? `${currentBanner.imageWidth}px` : 'auto',
                            }}
                          />
                        </div>
                      )}

                      {/* Text */}
                      {(currentBanner?.type === 'text' || currentBanner?.type === 'both') && (
                        <div className={`${currentBanner?.type === 'both' ? 'ml-4' : ''}`}>
                          <p
                            className="text-center drop-shadow-sm select-none"
                            style={{
                              fontSize: currentBanner?.fontSize ? `${currentBanner.fontSize}px` : '16px',
                              fontWeight: currentBanner?.fontWeight || 700,
                            }}
                          >
                            {currentBanner?.content || 'Your content here...'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Formatting Info */}
                <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>Placement:</strong> {currentBanner?.placement || 'top'}</p>
                    <p><strong>Height:</strong> {currentBanner?.height || 60}px</p>
                    <p><strong>Font Size:</strong> {currentBanner?.fontSize || 16}px</p>
                    <p><strong>Font Weight:</strong> {currentBanner?.fontWeight || 700}</p>
                    <p><strong>Padding:</strong> {currentBanner?.padding || 16}px</p>
                    <p><strong>Border Radius:</strong> {currentBanner?.borderRadius || 0}px</p>
                    <p><strong>Routes:</strong> {currentBanner?.routes?.length || 0} selected</p>
                    <p><strong>Status:</strong> {currentBanner?.isActive !== false ? 'Active' : 'Inactive'}</p>
                  </div>
                  <p className="text-xs italic mt-2 text-blue-500">
                    💡 Tip: Drag the image or text to reposition them in the preview
                  </p>
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
                      {banner.type === 'image' && banner.imageUrl ? (
                        <div className="rounded-lg overflow-hidden" style={{ height: `${Math.min(banner.height, 120)}px` }}>
                          <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div
                          style={{
                            background: banner.backgroundType === 'gradient' && banner.gradientStart && banner.gradientEnd
                              ? `linear-gradient(${banner.gradientDirection || 'to right'}, ${banner.gradientStart}, ${banner.gradientEnd})`
                              : banner.backgroundColor,
                            color: banner.textColor,
                            height: `${Math.min(banner.height, 80)}px`
                          }}
                          className="rounded-lg flex items-center justify-center px-4 text-sm"
                        >
                          {banner.content}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {isPlacementModalOpen && currentBanner && (
        <CustomPlacementModal
          isOpen={isPlacementModalOpen}
          onClose={() => setIsPlacementModalOpen(false)}
          onSave={(data) => {
            setCurrentBanner(prev => ({
              ...prev,
              customX: data.x,
              customY: data.y,
              customWidth: data.width
            }));
            setIsPlacementModalOpen(false);
          }}
          initialData={{
            x: currentBanner.customX || 50,
            y: currentBanner.customY || 50,
            width: currentBanner.customWidth || 300
          }}
          bannerPreviewUrl={currentBanner.imageUrl}
        />
      )}
    </div>
  );
};

export default AdminContent;
