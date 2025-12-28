import React, { useState, useEffect } from 'react';
import { X, Search, Download, Loader, FileText, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';

interface NotionPagePickerProps {
    workspaceId: string;
    onClose: () => void;
    onImported: () => void;
}

const NotionPagePicker: React.FC<NotionPagePickerProps> = ({ workspaceId, onClose, onImported }) => {
    const { addToast } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim() || searchQuery === '') {
                searchNotion(searchQuery);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const searchNotion = async (query: string) => {
        try {
            setIsLoading(true);
            const response = await apiService.post('/notion/search', { query });
            setResults(response.data || []);
        } catch (error: any) {
            console.error('Search error:', error);
            // Don't show toast for every keystroke error, just log
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const handleImport = async () => {
        if (selectedItems.size === 0) {
            addToast('Please select at least one item to import', 'error');
            return;
        }

        try {
            setIsImporting(true);
            const itemsToImport = results.filter(item => selectedItems.has(item.id));

            const response = await apiService.post(`/notion/workspace/${workspaceId}/import`, {
                items: itemsToImport
            });

            const count = response.data?.length || 0;
            addToast(`Successfully imported ${count} task${count !== 1 ? 's' : ''} from Notion`, 'success');
            onImported();
            onClose();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to import tasks', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-6 h-6" />
                        Import from Notion
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Notion pages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Loader size={32} className="animate-spin mb-3" />
                            <p>Searching Notion...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No pages found. Try a different search.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {results.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleSelection(item.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${selectedItems.has(item.id)
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => toggleSelection(item.id)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded">
                                        {item.icon?.type === 'emoji' ? (
                                            <span>{item.icon.emoji}</span>
                                        ) : item.object === 'database' ? (
                                            <Database size={16} className="text-gray-500" />
                                        ) : (
                                            <FileText size={16} className="text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            Last edited: {new Date(item.last_edited_time).toLocaleDateString()}
                                            {item.parent?.type === 'database_id' && (
                                                <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px]">
                                                    Database Item
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <div className="text-sm text-gray-500">
                        {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={isImporting || selectedItems.size === 0}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isImporting ? (
                                <>
                                    <Loader size={18} className="animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Import Selected
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotionPagePicker;
