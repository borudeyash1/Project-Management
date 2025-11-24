import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Search,
  Menu,
  X,
  Home,
  PlayCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import SEO from './SEO';
import * as documentationService from '../services/documentationService';

interface DocArticle {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  subcategory?: string;
  videoUrl?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DocCategory {
  name: string;
  slug: string;
  icon: string;
  articles: DocArticle[];
  expanded: boolean;
}

const Docs: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [currentArticle, setCurrentArticle] = useState<DocArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Category metadata
  const categoryMetadata: Record<string, { name: string; icon: string }> = {
    'getting-started': { name: 'Getting Started', icon: '🚀' },
    'user-guide': { name: 'User Guide', icon: '📖' },
    'api-reference': { name: 'API Reference', icon: '⚙️' },
    'tutorials': { name: 'Tutorials', icon: '🎓' },
    'faq': { name: 'FAQ', icon: '❓' }
  };

  // Load articles from API
  const loadDocs = async () => {
    try {
      setLoading(true);
      const articles = await documentationService.getAllDocs();
      
      // Group articles by category
      const grouped: Record<string, DocArticle[]> = {};
      articles.forEach(article => {
        if (!grouped[article.category]) {
          grouped[article.category] = [];
        }
        grouped[article.category].push(article);
      });

      // Convert to category array
      const categoriesArray: DocCategory[] = Object.keys(grouped).map(categorySlug => {
        const meta = categoryMetadata[categorySlug] || { name: categorySlug, icon: '📄' };
        return {
          name: meta.name,
          slug: categorySlug,
          icon: meta.icon,
          articles: grouped[categorySlug].sort((a, b) => a.order - b.order),
          expanded: true
        };
      });

      setCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to load documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {
    // Load article based on slug
    if (slug) {
      documentationService.getDocBySlug(slug).then(article => {
        if (article && article.isPublished) {
          setCurrentArticle(article);
        } else {
          setCurrentArticle(null);
        }
      });
    } else {
      // Load first article by default
      const firstArticle = categories[0]?.articles[0];
      if (firstArticle) {
        setCurrentArticle(firstArticle);
        navigate(`/docs/${firstArticle.slug}`, { replace: true });
      }
    }
  }, [slug, categories, navigate]);

  const toggleCategory = (categorySlug: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.slug === categorySlug ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const selectArticle = (article: DocArticle) => {
    setCurrentArticle(article);
    navigate(`/docs/${article.slug}`);
    setSidebarOpen(false);
  };

  // Helper function to convert YouTube/Vimeo URLs to embed URLs
  const getVideoEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
      return url;
    }

    return null;
  };

  const Sidebar = () => (
    <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border-r h-full overflow-y-auto`}>
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('docs.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-accent`}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4">
        {categories.map((category) => (
          <div key={category.slug} className="mb-4">
            <button
              onClick={() => toggleCategory(category.slug)}
              className={`w-full flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {category.name}
                </span>
              </div>
              {category.expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {category.expanded && (
              <div className="ml-8 mt-2 space-y-1">
                {category.articles.map((article) => (
                  <button
                    key={article._id}
                    onClick={() => selectArticle(article)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentArticle?._id === article._id
                      ? isDarkMode
                        ? 'bg-accent/20 text-accent'
                        : 'bg-accent/10 text-accent-dark'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {article.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'bg-gradient-to-b from-amber-50 via-white to-white'}`}>
      <SEO
        title="Documentation"
        description="Complete documentation for Sartthi - Learn how to use our project management and payroll suite effectively"
        keywords="documentation, user guide, help, tutorial, sartthi docs"
        url="/docs"
      />

      <SharedNavbar />

      <div className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Header */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('docs.title')}
            </h1>
          </div>

          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <Sidebar />
              </div>
            </div>

            {/* Sidebar - Mobile Drawer */}
            {sidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
                <div
                  className={`w-80 h-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Sidebar />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {currentArticle ? (
                <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-8 shadow-xl`}>
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 text-sm mb-6">
                    <Home className="w-4 h-4 text-gray-400" />
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">{t('docs.breadcrumbDocs')}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {currentArticle.title}
                    </span>
                  </div>

                  {/* Video */}
                  {currentArticle.videoUrl && (() => {
                    const embedUrl = getVideoEmbedUrl(currentArticle.videoUrl);
                    return embedUrl ? (
                      <div className="mb-8 rounded-lg overflow-hidden">
                        <div className="aspect-video">
                          <iframe
                            src={embedUrl}
                            title={currentArticle.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Markdown Content */}
                  <div className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children }) {
                          const match = /language-(\w+)/.exec(className || '');
                          if (match) {
                            return (
                              <SyntaxHighlighter
                                style={vscDarkPlus as any}
                                language={match[1]}
                                PreTag="div"
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            );
                          }
                          return (
                            <code className={className}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {currentArticle.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className={`${isDarkMode ? 'bg-gray-800/60' : 'bg-white'} rounded-2xl p-12 text-center`}>
                  <BookOpen className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('docs.noArticleTitle')}
                  </h2>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {t('docs.noArticleDescription')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SharedFooter />
    </div>
  );
};

export default Docs;
