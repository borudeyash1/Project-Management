import React from 'react';
import { RefreshCw, CheckCircle, AlertCircle, XCircle, Github } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SyncError {
    message: string;
    timestamp: string;
}

interface LinkedRepo {
    _id: string;
    owner: string;
    repo: string;
    fullName: string;
    autoCreateTasks: boolean;
    syncStatus: boolean;
    linkedAt: string;
    lastSyncAt?: string;
    syncErrors?: SyncError[];
}

interface GitHubSyncStatusProps {
    repo: LinkedRepo;
    onSync?: () => void;
    onUnlink?: () => void;
    className?: string;
}

const GitHubSyncStatus: React.FC<GitHubSyncStatusProps> = ({
    repo,
    onSync,
    onUnlink,
    className = ''
}) => {
    const hasErrors = repo.syncErrors && repo.syncErrors.length > 0;
    const isSyncing = false; // Could be prop if we track active syncing state

    return (
        <div className={`flex flex-col p-4 bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <Github className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900">{repo.fullName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${repo.syncStatus
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                {repo.syncStatus ? (
                                    <>
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        Sync Active
                                    </>
                                ) : (
                                    'Sync Paused'
                                )}
                            </span>
                            {repo.autoCreateTasks && (
                                <span className="text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                    Auto-create
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {onSync && (
                        <button
                            onClick={onSync}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Force Sync"
                        >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                    {onUnlink && (
                        <button
                            onClick={onUnlink}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Unlink Repository"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs">
                <div className="flex items-center text-gray-500">
                    {repo.lastSyncAt ? (
                        <>
                            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                            Synced {formatDistanceToNow(new Date(repo.lastSyncAt), { addSuffix: true })}
                        </>
                    ) : (
                        <span className="text-gray-400">Never synced</span>
                    )}
                </div>

                {hasErrors && (
                    <div className="group relative flex items-center text-red-500 cursor-help">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {repo.syncErrors!.length} Errors

                        {/* Tooltip */}
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {repo.syncErrors![0].message}
                            {repo.syncErrors!.length > 1 && ` (+${repo.syncErrors!.length - 1} more)`}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GitHubSyncStatus;
