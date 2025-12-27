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
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NotionPage[]>([]);
    const [isSearching, setIsSearching] = useState(false);
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
        if (isOpen && debouncedQuery.trim().length > 0) {
            handleSearch();
        } else if (debouncedQuery.trim().length === 0) {
            setResults([]);
        }
    }, [debouncedQuery, isOpen]);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const data = await notionService.search(debouncedQuery);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
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
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">N</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Notion Search</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="p-4 bg-white/30 dark:bg-gray-900/30">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search pages..."
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
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 rounded-xl transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-800/30"
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
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Page</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500" />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center select-none">
                                {query ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                                            <Search className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="text-sm text-gray-500">No results found for "{query}"</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-inner">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-8 h-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Search your workspace</p>
                                            <p className="text-[10px] text-gray-400 max-w-[150px] mx-auto leading-relaxed">Type above to find pages, databases, and more.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700/50 flex justify-between">
                        <span>Press ESC to close</span>
                        <span className="flex items-center gap-1">Powered by Notion API</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotionWidget;
