import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

interface NotionSyncStatusProps {
    synced: boolean;
    notionUrl?: string;
    lastSyncedAt?: Date;
    compact?: boolean;
}

const NotionSyncStatus: React.FC<NotionSyncStatusProps> = ({
    synced,
    notionUrl,
    lastSyncedAt,
    compact = false
}) => {
    if (!synced) return null;

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    if (compact) {
        return (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded text-xs text-gray-600 dark:text-gray-400">
                <FileText className="w-3 h-3" />
                <span>Notion</span>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <FileText className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Synced to Notion
                </span>
            </div>

            {lastSyncedAt && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(lastSyncedAt)}
                </span>
            )}

            {notionUrl && (
                <a
                    href={notionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Open in Notion"
                >
                    <ExternalLink className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </a>
            )}
        </div>
    );
};

export default NotionSyncStatus;
