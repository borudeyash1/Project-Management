import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, ExternalLink, Loader } from 'lucide-react';
import { notionService, NotionPage } from '../../services/notionService';
import { useApp } from '../../context/AppContext';

// Event for toggling
export const toggleNotionWidget = () => {
    window.dispatchEvent(new CustomEvent('TOGGLE_NOTION_WIDGET'));
};

const NotionWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'search' | 'database'>('search'); // [NEW] View state
    const [currentDatabase, setCurrentDatabase] = useState<{ id: string; title: string } | null>(null); // [NEW] Current DB
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NotionPage[]>([]);
    const [databaseItems, setDatabaseItems] = useState<NotionPage[]>([]); // [NEW] DB Items
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingItems, setIsLoadingItems] = useState(false); // [NEW] Loading state for items
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    const { state } = useApp();
    const notionConnected = (state.userProfile?.connectedAccounts?.notion?.accounts?.length ?? 0) > 0 ||
        !!state.userProfile?.connectedAccounts?.notion?.activeAccountId;

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('TOGGLE_NOTION_WIDGET', handleToggle);
        return () => window.removeEventListener('TOGGLE_NOTION_WIDGET', handleToggle);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    useEffect(() => {
        if (isOpen && view === 'search') {
            // Auto-search (fetch recent) on open if query is empty
            if (!query.trim()) {
                handleSearch('');
            } else if (debouncedQuery.trim().length > 0) {
                handleSearch(debouncedQuery);
            }
        }
    }, [isOpen, debouncedQuery, view]); // Depend on view to refresh when going back

    const handleSearch = async (searchQuery: string = '') => {
        setIsSearching(true);
        try {
            const data = await notionService.search(searchQuery);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleItemClick = async (item: NotionPage, e: React.MouseEvent) => {
        if (item.object === 'database') {
            e.preventDefault();
            setView('database');
            setCurrentDatabase({ id: item.id, title: item.title });
            fetchDatabaseItems(item.id);
        }
        // Else let default behavior (link open) happen
    };

    const fetchDatabaseItems = async (databaseId: string) => {
        setIsLoadingItems(true);
        setDatabaseItems([]);
        try {
            const items = await notionService.getDatabaseItems(databaseId);
            setDatabaseItems(items);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingItems(false);
        }
    };

    const handleBack = () => {
        setView('search');
        setCurrentDatabase(null);
        setDatabaseItems([]);
    };

    if (!notionConnected) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-24 right-20 w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl z-[60] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-white/50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2 max-w-[80%]">
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shrink-0">
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">N</span>
                            </div>
                            {view === 'database' ? (
                                <div className="flex items-center gap-1 min-w-0">
                                    <button
                                        onClick={handleBack}
                                        className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                    >
                                        Search
                                    </button>
                                    <span className="text-gray-400">/</span>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                                        {currentDatabase?.title}
                                    </h3>
                                </div>
                            ) : (
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Notion Search</h3>
                            )}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="bg-white/30 dark:bg-gray-900/30">
                        {view === 'search' ? (
                            <>
                                {/* Search Input */}
                                <div className="p-4">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search pages or databases..."
                                            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 transition-all shadow-sm"
                                            autoFocus
                                        />
                                        {isSearching ? (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                                            </div>
                                        ) : query && (
                                            <button
                                                onClick={() => { setQuery(''); setResults([]); }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                                            >
                                                <X className="w-3 h-3 text-gray-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Results List */}
                                <div className="max-h-[300px] overflow-y-auto px-2 pb-2 custom-scrollbar">
                                    {results.length > 0 ? (
                                        <div className="space-y-1">
                                            {results.map((page) => (
                                                <a
                                                    key={page.id}
                                                    href={page.url}
                                                    target="_blank" // Always open in new tab unless handled
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => handleItemClick(page, e)}
                                                    className="flex items-center gap-3 p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 rounded-xl transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-800/30 cursor-pointer"
                                                >
                                                    <div className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm">
                                                        {page.icon?.emoji ? (
                                                            <span className="text-lg leading-none">{page.icon.emoji}</span>
                                                        ) : page.icon?.external || page.icon?.file ? (
                                                            <img
                                                                src={page.icon.external?.url || page.icon.file?.url}
                                                                alt=""
                                                                className="w-full h-full rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <FileText className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {page.title}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${page.object === 'database' ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                                                                {page.object === 'database' ? 'Database' : 'Page'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {page.object === 'database' ? (
                                                        <span className="text-xs text-blue-500 opacity-60 group-hover:opacity-100">Open</span>
                                                    ) : (
                                                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500" />
                                                    )}
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center select-none">
                                            {/* Empty State Logic (Same as before) */}
                                            {query ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <p className="text-sm text-gray-500">No results found for "{query}"</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-inner">
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-8 h-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Search your workspace</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="max-h-[350px] overflow-y-auto px-2 pb-2 pt-2 custom-scrollbar">
                                {/* Database Items View */}
                                <div className="px-2 mb-2 flex items-center gap-2">
                                    <button onClick={handleBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 12H5M12 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Database Items</span>
                                </div>

                                {isLoadingItems ? (
                                    <div className="py-12 flex justify-center">
                                        <Loader className="w-6 h-6 text-blue-500 animate-spin" />
                                    </div>
                                ) : databaseItems.length > 0 ? (
                                    <div className="space-y-1">
                                        {databaseItems.map((item) => (
                                            <a
                                                key={item.id}
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 rounded-xl transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-800/30"
                                            >
                                                <div className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {item.title || 'Untitled'}
                                                    </h4>
                                                </div>
                                                <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-500 text-sm">
                                        No items found in this database.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700/50 flex justify-between">
                        <span>{view === 'database' ? 'Showing most recent' : 'Press ESC to close'}</span>
                        <span className="flex items-center gap-1">Powered by Notion API</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotionWidget;
