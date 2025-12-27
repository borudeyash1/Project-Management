import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Video,
  Search,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import * as documentationService from '../../services/documentationService';
import AdminDockNavigation from './AdminDockNavigation';

interface DocArticle {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  subcategory?: string;
  videoUrl?: string;
  featuredImage?: string;
  learnMoreUrl?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminDocs: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [articles, setArticles] = useState<DocArticle[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<DocArticle> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [contentHistory, setContentHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'getting-started', label: 'Getting Started' },
    { value: 'user-guide', label: 'User Guide' },
    { value: 'api-reference', label: 'API Reference' },
    { value: 'tutorials', label: 'Tutorials' },
    { value: 'faq', label: 'FAQ' },
    { value: 'custom', label: '✨ Custom Category' }
  ];

  useEffect(() => {
    // Check and set admin token first
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      localStorage.setItem('accessToken', adminToken);
      // Small delay to ensure token is set in API service
      setTimeout(() => {
        loadArticles();
      }, 100);
    } else {
      setLoading(false);
      addToast('Please log in as admin', 'error');
      window.location.href = '/my-admin/login';
    }
  }, [selectedCategory]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await documentationService.getAdminDocs(selectedCategory);
      setArticles(data);
    } catch (error: any) {
      console.error('Failed to load documentation:', error);
      addToast('Failed to load documentation articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (content: string) => {
    const newHistory = contentHistory.slice(0, historyIndex + 1);
    newHistory.push(content);
    setContentHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentArticle(prev => ({ ...prev, content: contentHistory[newIndex] }));
    }
  };

  const handleRedo = () => {
    if (historyIndex < contentHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentArticle(prev => ({ ...prev, content: contentHistory[newIndex] }));
    }
  };

  const handleContentChange = (newContent: string) => {
    setCurrentArticle(prev => ({ ...prev, content: newContent }));
    saveToHistory(newContent);
  };

  const handleCreateNew = () => {
    const initialContent = '';
    setCurrentArticle({
      title: '',
      slug: '',
      content: initialContent,
      category: 'getting-started',
      videoUrl: '',
      order: articles.length + 1,
      isPublished: true
    });
    setContentHistory([initialContent]);
    setHistoryIndex(0);
    setIsEditing(true);
  };

  const handleEdit = (article: DocArticle) => {
    setCurrentArticle(article);
    setContentHistory([article.content]);
    setHistoryIndex(0);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentArticle || !currentArticle.title || !currentArticle.slug || !currentArticle.content || !currentArticle.category) {
      addToast('Please fill in all required fields (title, slug, category, content)', 'error');
      return;
    }

    try {
      setSaving(true);
      if (currentArticle._id) {
        await documentationService.updateDoc(currentArticle._id, currentArticle);
        addToast('Documentation updated successfully', 'success');
      } else {
        await documentationService.createDoc(currentArticle);
        addToast('Documentation created successfully', 'success');
      }

      await loadArticles();
      setIsEditing(false);
      setCurrentArticle(null);
    } catch (error: any) {
      console.error('Failed to save documentation:', error);
      addToast(error.response?.data?.message || 'Failed to save documentation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await documentationService.deleteDoc(id);
      addToast('Documentation deleted successfully', 'success');
      await loadArticles();
    } catch (error: any) {
      console.error('Failed to delete documentation:', error);
      addToast('Failed to delete documentation', 'error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentArticle(null);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
                  Documentation Management
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create and manage documentation articles
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-gray-900 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Article
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-8 shadow-xl`}>
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={currentArticle?.title || ''}
                  onChange={(e) => setCurrentArticle(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  placeholder="Enter article title"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={currentArticle?.slug || ''}
                  onChange={(e) => setCurrentArticle(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  placeholder="article-url-slug"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Category *
                </label>
                <select
                  value={currentArticle?.category === 'custom' || !categories.find(c => c.value === currentArticle?.category) ? 'custom' : currentArticle?.category || ''}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setCurrentArticle(prev => ({ ...prev, category: customCategory || 'custom' }));
                    } else {
                      setCurrentArticle(prev => ({ ...prev, category: e.target.value }));
                      setCustomCategory('');
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                >
                  {categories.filter(cat => cat.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                {/* Custom Category Input */}
                {(currentArticle?.category === 'custom' || !categories.find(c => c.value === currentArticle?.category)) && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customCategory || (currentArticle?.category !== 'custom' ? currentArticle?.category : '') || ''}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/\s+/g, '-');
                        setCustomCategory(value);
                        setCurrentArticle(prev => ({ ...prev, category: value }));
                      }}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                      placeholder="Enter custom category (e.g., advanced-features)"
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Use lowercase with hyphens (e.g., "my-custom-category")
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Video URL (Optional)
                </label>
                <div className="flex gap-2">
                  <Video className="w-5 h-5 text-gray-400 mt-3" />
                  <input
                    type="url"
                    value={currentArticle?.videoUrl || ''}
                    onChange={(e) => setCurrentArticle(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className={`flex-1 px-4 py-3 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Featured Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={currentArticle?.featuredImage || ''}
                  onChange={(e) => setCurrentArticle(prev => ({ ...prev, featuredImage: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  placeholder="https://images.unsplash.com/..."
                />
                {currentArticle?.featuredImage && (
                  <img 
                    src={currentArticle.featuredImage} 
                    alt="Preview" 
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Learn More URL (Optional)
                </label>
                <input
                  type="url"
                  value={currentArticle?.learnMoreUrl || ''}
                  onChange={(e) => setCurrentArticle(prev => ({ ...prev, learnMoreUrl: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  placeholder="https://example.com/learn-more"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  URL for the "Learn More" button on the docs page
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Content (Markdown) *
                </label>
                
                {/* Formatting Toolbar */}
                <div className={`flex flex-wrap gap-1 p-2 rounded-t-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  {/* Undo/Redo */}
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className={`px-3 py-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} disabled:opacity-30 disabled:cursor-not-allowed`}
                    title="Undo (Ctrl+Z)"
                  >
                    ↶
                  </button>

                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyIndex >= contentHistory.length - 1}
                    className={`px-3 py-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} disabled:opacity-30 disabled:cursor-not-allowed`}
                    title="Redo (Ctrl+Y)"
                  >
                    ↷
                  </button>

                  <div className={`w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} mx-1`} />

                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.querySelector('textarea[placeholder*="Heading"]') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = textarea.value.substring(start, end) || 'Bold Text';
                        const newText = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end);
                        handleContentChange(newText);
                        setTimeout(() => textarea.focus(), 0);
                      }
                    }}
                    className={`px-3 py-1 rounded font-bold ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    title="Bold"
                  >
                    B
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.querySelector('textarea[placeholder*="Heading"]') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = textarea.value.substring(start, end) || 'Italic Text';
                        const newText = textarea.value.substring(0, start) + `*${selectedText}*` + textarea.value.substring(end);
                        handleContentChange(newText);
                        setTimeout(() => textarea.focus(), 0);
                      }
                    }}
                    className={`px-3 py-1 rounded italic ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    title="Italic"
                  >
                    I
                  </button>

                  <div className={`w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} mx-1`} />

                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.querySelector('textarea[placeholder*="Heading"]') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const selectedText = textarea.value.substring(start, textarea.value.indexOf('\n', start)) || 'Heading';
                        const newText = textarea.value.substring(0, start) + `# ${selectedText}\n` + textarea.value.substring(start + selectedText.length);
                        handleContentChange(newText);
                        setTimeout(() => textarea.focus(), 0);
                      }
                    }}
                    className={`px-3 py-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    title="Heading 1"
                  >
                    H1
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.querySelector('textarea[placeholder*="Heading"]') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const selectedText = textarea.value.substring(start, textarea.value.indexOf('\n', start)) || 'Heading';
                        const newText = textarea.value.substring(0, start) + `## ${selectedText}\n` + textarea.value.substring(start + selectedText.length);
                        handleContentChange(newText);
                        setTimeout(() => textarea.focus(), 0);
                      }
                    }}
                    className={`px-3 py-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    title="Heading 2"
                  >
                    H2
                  </button>

                  <div className={`w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} mx-1`} />

                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.querySelector('textarea[placeholder*="Heading"]') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const newText = textarea.value.substring(0, start) + `\n- List item 1\n- List item 2\n- List item 3\n` + textarea.value.substring(start);
                        handleContentChange(newText);
                        setTimeout(() => textarea.focus(), 0);
                      }
                    }}
                    className={`px-3 py-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    title="Bullet List"
                  >
                    • List
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.querySelector('textarea[placeholder*="Heading"]') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const newText = textarea.value.substring(0, start) + `\n1. First item\n2. Second item\n3. Third item\n` + textarea.value.substring(start);
                        handleContentChange(newText);
                        setTimeout(() => textarea.focus(), 0);
                      }
                    }}
                    className={`px-3 py-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    title="Numbered List"
                  >
                    1. List
                  </button>

                  <div className={`w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} mx-1`} />

                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.querySelector('textarea[placeholder*="Heading"]') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const newText = textarea.value.substring(0, start) + `\n\`\`\`\ncode here\n\`\`\`\n` + textarea.value.substring(start);
                        handleContentChange(newText);
                        setTimeout(() => textarea.focus(), 0);
                      }
                    }}
                    className={`px-3 py-1 rounded font-mono ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    title="Code Block"
                  >
                    {'</>'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.querySelector('textarea[placeholder*="Heading"]') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = textarea.value.substring(start, end) || 'link text';
                        const newText = textarea.value.substring(0, start) + `[${selectedText}](url)` + textarea.value.substring(end);
                        handleContentChange(newText);
                        setTimeout(() => textarea.focus(), 0);
                      }
                    }}
                    className={`px-3 py-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    title="Link"
                  >
                    🔗
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const imageUrl = prompt('Enter image URL:');
                      if (imageUrl) {
                        const textarea = document.querySelector('textarea[placeholder*="Heading"]') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const newText = textarea.value.substring(0, start) + `\n![Image description](${imageUrl})\n` + textarea.value.substring(start);
                          handleContentChange(newText);
                          setTimeout(() => textarea.focus(), 0);
                        }
                      }
                    }}
                    className={`px-3 py-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    title="Insert Image"
                  >
                    🖼️
                  </button>
                </div>

                <textarea
                  value={currentArticle?.content || ''}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className={`w-full h-96 px-4 py-3 rounded-b-lg border border-t-0 ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm`}
                  placeholder="# Heading&#10;&#10;Your content here in **Markdown** format..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={currentArticle?.isPublished || false}
                  onChange={(e) => setCurrentArticle(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="w-4 h-4 text-accent focus:ring-accent rounded"
                />
                <label htmlFor="isPublished" className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Publish this article (make it visible to users)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Article'}
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
        ) : (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-accent`}
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-3 rounded-lg border ${isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-accent`}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-gray-800/60' : 'bg-white'} rounded-2xl p-12 text-center`}>
                <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  No Articles Found
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first documentation article'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <div
                    key={article._id}
                    className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border rounded-xl p-6 hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {article.title}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${article.isPublished
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                            {article.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          /{article.slug} • {categories.find(c => c.value === article.category)?.label}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Last updated: {new Date(article.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(`/docs/${article.slug}`, '_blank')}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                          title="Preview"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(article)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors`}
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <AdminDockNavigation />
    </div>
  );
};

export default AdminDocs;
