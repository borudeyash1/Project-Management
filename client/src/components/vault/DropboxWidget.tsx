import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Maximize2,
    GripHorizontal,
    Folder,
    File,
    ArrowLeft,
    Download,
    Loader2,
    HardDrive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { storageService, StorageFile } from '../../services/storageService';

const DropboxWidget: React.FC = () => {
    const { state, dispatch, addToast } = useApp();
    const navigate = useNavigate();
    const [position, setPosition] = useState({ x: window.innerWidth - 340, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Content State
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'Dropbox', path: '' }]);

    // Close widget if not active
    if (!state.modals.dropboxWidget) return null;

    // --- Drag Logic (Adapted from StickyNote) ---
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    // --- File Logic ---
    const fetchFiles = async (path: string) => {
        try {
            setLoading(true);
            const data = await storageService.listFiles('dropbox', path);
            // Sort: Folders first, then files
            const sorted = data.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            });
            setFiles(sorted);
        } catch (error) {
            console.error('Failed to fetch dropbox files', error);
            addToast('Failed to load files', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (state.modals.dropboxWidget) {
            fetchFiles(currentPath);
        }
    }, [state.modals.dropboxWidget, currentPath]);

    const handleNavigate = (path: string, name: string) => {
        setCurrentPath(path);
        setBreadcrumbs(prev => [...prev, { name, path }]);
    };

    const handleNavigateUp = () => {
        if (breadcrumbs.length <= 1) return;
        const newBreadcrumbs = [...breadcrumbs];
        newBreadcrumbs.pop();
        const parent = newBreadcrumbs[newBreadcrumbs.length - 1];
        setCurrentPath(parent.path);
        setBreadcrumbs(newBreadcrumbs);
    };

    const handleFileClick = async (file: StorageFile) => {
        if (file.type === 'folder') {
            handleNavigate(file.path, file.name);
        } else {
            // Simple download trigger
            try {
                const { link } = await storageService.getDownloadLink('dropbox', file.path);
                window.open(link, '_blank');
            } catch (e) {
                addToast('Failed to open file', 'error');
            }
        }
    };

    const handleOpenFull = () => {
        dispatch({ type: 'TOGGLE_MODAL', payload: 'dropboxWidget' });
        navigate('/dropbox');
    };

    const handleClose = () => {
        dispatch({ type: 'TOGGLE_MODAL', payload: 'dropboxWidget' });
    };

    // Format size
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div
            style={{ left: position.x, top: position.y }}
            className="fixed w-80 h-[450px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-[9999] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            {/* Header */}
            <div
                onMouseDown={handleMouseDown}
                className="h-10 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 cursor-move select-none"
            >
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium text-sm">
                    <HardDrive size={16} className="text-[#0061FE]" />
                    <span>Dropbox Quick View</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleOpenFull}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 transition-colors"
                        title="Open Full Page"
                    >
                        <Maximize2 size={14} />
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded text-gray-500 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Breadcrumb / Nav Bar */}
            <div className="h-10 px-3 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                <button
                    onClick={handleNavigateUp}
                    disabled={breadcrumbs.length <= 1}
                    className={`p-1 rounded transition-colors ${breadcrumbs.length <= 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <ArrowLeft size={16} />
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {breadcrumbs[breadcrumbs.length - 1].name}
                </span>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <Loader2 size={24} className="animate-spin" />
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <Folder size={32} className="opacity-20" />
                        <span className="text-xs">Empty Folder</span>
                    </div>
                ) : (
                    files.map(file => (
                        <div
                            key={file.id}
                            onClick={() => handleFileClick(file)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group transition-colors"
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${file.type === 'folder'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0061FE]'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                }`}>
                                {file.type === 'folder' ? <Folder size={16} fill="currentColor" className="opacity-80" /> : <File size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                    {file.name}
                                </div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-2">
                                    <span>{file.type === 'folder' ? 'Folder' : formatSize(file.size || 0)}</span>
                                    <span>•</span>
                                    <span>{file.modified ? new Date(file.modified).toLocaleDateString() : 'Unknown'}</span>
                                </div>
                            </div>
                            {file.type === 'file' && (
                                <Download size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer Status */}
            <div className="h-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 text-[10px] text-gray-400">
                <span>{files.length} items</span>
                <span>{breadcrumbs.length > 1 ? currentPath : 'Root'}</span>
            </div>
        </div>
    );
};

export default DropboxWidget;
