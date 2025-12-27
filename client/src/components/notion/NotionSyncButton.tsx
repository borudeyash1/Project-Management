import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader, Check, AlertCircle } from 'lucide-react';

interface NotionSyncButtonProps {
    type: 'task' | 'note' | 'meeting';
    itemId: string;
    item: any;
    isSynced: boolean;
    notionUrl?: string;
    onSync: () => Promise<void>;
    className?: string;
    compact?: boolean;
}

const NotionSyncButton: React.FC<NotionSyncButtonProps> = ({
    type,
    itemId,
    item,
    isSynced,
    notionUrl,
    onSync,
    className = '',
    compact = false
}) => {
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSync = async () => {
        setSyncing(true);
        setError(null);

        try {
            await onSync();
        } catch (err: any) {
            setError(err.message || 'Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    if (compact) {
        // Compact version for task cards/lists
        return (
            <div className="relative group">
                {isSynced && notionUrl ? (
                    <a
                        href={notionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
                        title="Open in Notion"
                    >
                        <FileText className="w-3 h-3" />
                        <span>Notion</span>
                    </a>
                ) : (
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 ${className}`}
                        title="Sync to Notion"
                    >
                        {syncing ? (
                            <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                            <FileText className="w-3 h-3" />
                        )}
                        <span>Sync</span>
                    </button>
                )}
            </div>
        );
    }

    // Full version for forms/modals
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <motion.button
                    onClick={handleSync}
                    disabled={syncing || isSynced}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isSynced
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-default'
                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                        } ${className}`}
                >
                    {syncing ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Syncing to Notion...</span>
                        </>
                    ) : isSynced ? (
                        <>
                            <Check className="w-4 h-4" />
                            <span>Synced to Notion</span>
                        </>
                    ) : (
                        <>
                            <FileText className="w-4 h-4" />
                            <span>Sync to Notion</span>
                        </>
                    )}
                </motion.button>

                {isSynced && notionUrl && (
                    <a
                        href={notionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <span>Open in Notion</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                )}
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </motion.div>
            )}

            {isSynced && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    This {type} is synced with Notion. Updates in Sartthi won't automatically sync.
                </p>
            )}
        </div>
    );
};

export default NotionSyncButton;
