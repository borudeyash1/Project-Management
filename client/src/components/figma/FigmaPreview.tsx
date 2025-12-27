import React, { useState } from 'react';
import { ExternalLink, MessageSquare, ThumbsUp, ThumbsDown, Eye, RefreshCw, Edit2, Check, X } from 'lucide-react';

interface FigmaPreviewProps {
    fileId: string;
    fileName: string;
    fileUrl: string;
    thumbnail?: string;
    frames?: {
        frameId: string;
        frameName: string;
        thumbnail: string;
    }[];
    status?: 'draft' | 'review' | 'client-review' | 'approved' | 'rejected';
    onApprove?: () => void;
    onReject?: () => void;
    onSync?: () => void;
    onUpdateUrl?: (newUrl: string) => void;
}

const FigmaPreview: React.FC<FigmaPreviewProps> = ({
    fileId,
    fileName,
    fileUrl,
    thumbnail,
    frames = [],
    status = 'draft',
    onApprove,
    onReject,
    onSync,
    onUpdateUrl
}) => {
    const [showFrames, setShowFrames] = useState(false);
    const [isEditingUrl, setIsEditingUrl] = useState(false);
    const [editedUrl, setEditedUrl] = useState(fileUrl);
    const [isSyncing, setIsSyncing] = useState(false);

    const getStatusBadge = () => {
        const badges = {
            draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
            review: { label: 'In Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
            'client-review': { label: 'Client Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
            approved: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
            rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
        };
        return badges[status];
    };

    const handleSync = async () => {
        if (!onSync) return;
        setIsSyncing(true);
        try {
            await onSync();
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveUrl = () => {
        if (onUpdateUrl && editedUrl !== fileUrl) {
            onUpdateUrl(editedUrl);
        }
        setIsEditingUrl(false);
    };

    const handleCancelEdit = () => {
        setEditedUrl(fileUrl);
        setIsEditingUrl(false);
    };

    const openInFigma = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const badge = getStatusBadge();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Thumbnail - Clickable */}
            <div
                className="relative aspect-video bg-gray-100 dark:bg-gray-900 cursor-pointer group"
                onClick={() => openInFigma(fileUrl)}
            >
                {thumbnail ? (
                    <>
                        <img
                            src={thumbnail}
                            alt={fileName}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white dark:bg-gray-800 rounded-full p-3">
                                    <ExternalLink size={24} className="text-gray-900 dark:text-white" />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <Eye size={48} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">No preview available</p>
                        </div>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                    </span>
                </div>

                {/* Sync Button */}
                {onSync && (
                    <div className="absolute top-3 left-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSync();
                            }}
                            disabled={isSyncing}
                            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Sync from Figma"
                        >
                            <RefreshCw
                                size={16}
                                className={`text-gray-700 dark:text-gray-300 ${isSyncing ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {fileName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {frames.length} frame{frames.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Editable URL */}
                <div className="mb-3">
                    {isEditingUrl ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={editedUrl}
                                onChange={(e) => setEditedUrl(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder="Figma file URL"
                            />
                            <button
                                onClick={handleSaveUrl}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                title="Save"
                            >
                                <Check size={18} />
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="p-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                title="Cancel"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                                title={fileUrl}
                            >
                                {fileUrl}
                            </a>
                            {onUpdateUrl && (
                                <button
                                    onClick={() => setIsEditingUrl(true)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Edit URL"
                                >
                                    <Edit2 size={14} className="text-gray-600 dark:text-gray-400" />
                                </button>
                            )}
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Open in Figma"
                            >
                                <ExternalLink size={14} className="text-gray-600 dark:text-gray-400" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Frames Preview - Clickable */}
                {frames.length > 0 && (
                    <div className="mb-3">
                        <button
                            onClick={() => setShowFrames(!showFrames)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            {showFrames ? 'Hide' : 'Show'} frames ({frames.length})
                        </button>

                        {showFrames && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                {frames.slice(0, 4).map((frame) => (
                                    <div
                                        key={frame.frameId}
                                        className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer group relative"
                                        onClick={() => openInFigma(`${fileUrl}?node-id=${frame.frameId}`)}
                                        title={`Open ${frame.frameName} in Figma`}
                                    >
                                        {frame.thumbnail ? (
                                            <>
                                                <img
                                                    src={frame.thumbnail}
                                                    alt={frame.frameName}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ExternalLink size={16} className="text-white" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Eye size={24} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                {(status === 'review' || status === 'client-review') && (onApprove || onReject) && (
                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {onReject && (
                            <button
                                onClick={onReject}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <ThumbsDown size={16} />
                                Reject
                            </button>
                        )}
                        {onApprove && (
                            <button
                                onClick={onApprove}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <ThumbsUp size={16} />
                                Approve
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FigmaPreview;
