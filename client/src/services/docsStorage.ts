// Documentation Storage Service
// Provides localStorage-based persistence for documentation articles

const STORAGE_KEY = 'sartthi_docs_articles';

export interface DocArticle {
    id: string;
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

export interface DocCategory {
    name: string;
    slug: string;
    icon: string;
    articles: DocArticle[];
    expanded?: boolean;
}

// Sample default documentation
const defaultDocs: DocArticle[] = [
    {
        id: '1',
        title: 'Introduction to Sartthi',
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
        order: 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        order: 2,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
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
        order: 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

class DocsStorageService {
    // Initialize storage with default docs if empty
    private initializeStorage(): void {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (!existing) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDocs));
        }
    }

    // Get all articles
    getAllArticles(): DocArticle[] {
        this.initializeStorage();
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : defaultDocs;
    }

    // Get published articles only (for public docs page)
    getPublishedArticles(): DocArticle[] {
        return this.getAllArticles().filter(article => article.isPublished);
    }

    // Get article by slug
    getArticleBySlug(slug: string): DocArticle | null {
        const articles = this.getAllArticles();
        return articles.find(article => article.slug === slug) || null;
    }

    // Get articles by category
    getArticlesByCategory(category: string): DocArticle[] {
        return this.getAllArticles().filter(article => article.category === category);
    }

    // Save article (create or update)
    saveArticle(article: Partial<DocArticle>): DocArticle {
        const articles = this.getAllArticles();

        if (article.id) {
            // Update existing
            const index = articles.findIndex(a => a.id === article.id);
            if (index !== -1) {
                articles[index] = {
                    ...articles[index],
                    ...article,
                    updatedAt: new Date().toISOString()
                } as DocArticle;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
                return articles[index];
            }
        }

        // Create new
        const newArticle: DocArticle = {
            id: Date.now().toString(),
            title: article.title || '',
            slug: article.slug || '',
            content: article.content || '',
            category: article.category || 'getting-started',
            subcategory: article.subcategory,
            videoUrl: article.videoUrl,
            order: article.order || articles.length + 1,
            isPublished: article.isPublished || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        articles.push(newArticle);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        return newArticle;
    }

    // Delete article
    deleteArticle(id: string): boolean {
        const articles = this.getAllArticles();
        const filtered = articles.filter(article => article.id !== id);

        if (filtered.length < articles.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            return true;
        }

        return false;
    }

    // Group articles by category
    getArticlesGroupedByCategory(): DocCategory[] {
        const articles = this.getPublishedArticles();
        const categoryMap = new Map<string, DocArticle[]>();

        articles.forEach(article => {
            const existing = categoryMap.get(article.category) || [];
            existing.push(article);
            categoryMap.set(article.category, existing);
        });

        const categories: DocCategory[] = [];
        const categoryInfo: Record<string, { name: string; icon: string; order: number }> = {
            'getting-started': { name: 'Getting Started', icon: '🚀', order: 1 },
            'user-guide': { name: 'User Guide', icon: '📖', order: 2 },
            'api-reference': { name: 'API Reference', icon: '⚙️', order: 3 },
            'tutorials': { name: 'Tutorials', icon: '🎓', order: 4 }
        };

        categoryMap.forEach((articles, slug) => {
            const info = categoryInfo[slug] || { name: slug, icon: '📄', order: 99 };
            categories.push({
                name: info.name,
                slug,
                icon: info.icon,
                articles: articles.sort((a, b) => a.order - b.order),
                expanded: true
            });
        });

        return categories.sort((a, b) => {
            const aOrder = categoryInfo[a.slug]?.order || 99;
            const bOrder = categoryInfo[b.slug]?.order || 99;
            return aOrder - bOrder;
        });
    }

    // Listen for storage changes (for real-time sync across tabs)
    onStorageChange(callback: () => void): () => void {
        const handler = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                callback();
            }
        };

        window.addEventListener('storage', handler);

        // Return cleanup function
        return () => window.removeEventListener('storage', handler);
    }
}

// Export singleton instance
export const docsStorage = new DocsStorageService();
