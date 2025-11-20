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
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import SEO from './SEO';

interface DocArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  subcategory?: string;
  videoUrl?: string;
  order: number;
}

interface DocCategory {
  name: string;
  slug: string;
  icon: string;
  articles: DocArticle[];
  expanded?: boolean;
}

// Sample documentation data - will be replaced with API calls
const sampleDocs: DocCategory[] = [
  {
    name: 'Getting Started',
    slug: 'getting-started',
    icon: '🚀',
    articles: [
      {
        id: '1',
        title: 'Introduction',
        slug: 'introduction',
        category: 'getting-started',
        content: `# Welcome to Sartthi Documentation

Sartthi is a comprehensive project management and payroll suite designed to streamline your workflow and boost productivity.

## What is Sartthi?

Sartthi combines powerful project management tools with integrated payroll features, making it the perfect solution for teams of all sizes.

### Key Features

- **Project Management**: Organize tasks, track progress, and collaborate with your team
- **Payroll Integration**: Manage employee compensation seamlessly
- **Real-time Collaboration**: Work together with your team in real-time
- **Analytics & Reporting**: Get insights into your projects and team performance

## Getting Started

Follow our quick start guide to begin using Sartthi in minutes!`,
        order: 1
      },
      {
        id: '2',
        title: 'Installation',
        slug: 'installation',
        category: 'getting-started',
        content: `# Installation Guide

Get Sartthi up and running in just a few steps.

## System Requirements

- Node.js 16.x or higher
- MongoDB 5.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-org/sartthi.git
cd sartthi
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
\`\`\`

### 3. Configure Environment

Create a \`.env\` file in the server directory:

\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sartthi
JWT_SECRET=your_secret_key_here
\`\`\`

### 4. Start the Application

\`\`\`bash
# Start server
cd server
npm run dev

# Start client (in another terminal)
cd client
npm start
\`\`\`

Your application should now be running at \`http://localhost:3000\`!`,
        order: 2
      }
    ]
  },
  {
    name: 'User Guide',
    slug: 'user-guide',
    icon: '📖',
    articles: [
      {
        id: '3',
        title: 'Creating Projects',
        slug: 'creating-projects',
        category: 'user-guide',
        content: `# Creating Projects

Learn how to create and manage projects in Sartthi.

## Creating a New Project

1. Navigate to your workspace dashboard
2. Click the **"+ New Project"** button
3. Fill in the project details:
   - Project Name
   - Description
   - Start and End Dates
   - Team Members
   - Priority Level

## Project Settings

Configure your project settings to match your workflow:

- **Visibility**: Public or Private
- **Permissions**: Set team member roles
- **Notifications**: Configure alert preferences
- **Integrations**: Connect external tools

## Best Practices

- Use descriptive project names
- Set realistic deadlines
- Assign clear roles to team members
- Regular status updates`,
        order: 1
      }
    ]
  }
];

const Docs: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [categories, setCategories] = useState<DocCategory[]>(sampleDocs);
  const [currentArticle, setCurrentArticle] = useState<DocArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Load article based on slug
    if (slug) {
      const article = categories
        .flatMap(cat => cat.articles)
        .find(art => art.slug === slug);
      setCurrentArticle(article || null);
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

  const Sidebar = () => (
    <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border-r h-full overflow-y-auto`}>
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDarkMode
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
              className={`w-full flex items-center justify-between p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
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
                    key={article.id}
                    onClick={() => selectArticle(article)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentArticle?.id === article.id
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
              Documentation
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
                    <span className="text-gray-400">Docs</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {currentArticle.title}
                    </span>
                  </div>

                  {/* Video */}
                  {currentArticle.videoUrl && (
                    <div className="mb-8 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-900 flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-white/50" />
                        {/* Video player will be added here */}
                      </div>
                    </div>
                  )}

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
                    No Article Selected
                  </h2>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Select an article from the sidebar to get started
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
