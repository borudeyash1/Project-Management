import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Maximize2,
    Minimize2,
    GripHorizontal,
    Folder,
    File,
    ArrowLeft,
    Download,
    Loader2,
    HardDrive,
    UploadCloud,
    Plus,
    Trash2,
    Check,
    XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { storageService, StorageFile } from '../../services/storageService';

const DropboxWidget: React.FC = () => {
    const { state, dispatch, addToast } = useApp();
    const navigate = useNavigate();

    // Widget State
    const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 100 });
    const [isExpanded, setIsExpanded] = useState(false);

    // Dragging Widget State
    const [isDraggingWidget, setIsDraggingWidget] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Content State
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'Dropbox', path: '' }]);

    // Drag & Drop Files State
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Folder Creation State
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // --- Widget Drag Logic ---
    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent dragging if clicking buttons/inputs
        if ((e.target as HTMLElement).closest('button, input')) return;

        setIsDraggingWidget(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingWidget) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDraggingWidget(false);
        };

        if (isDraggingWidget) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingWidget, dragOffset]);

    // --- File Fetching & Nav ---
    const fetchFiles = async (path: string) => {
        try {
            setLoading(true);
            const data = await storageService.listFiles('dropbox', path);
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

    // Only fetch if widget is open
    useEffect(() => {
        if (state.modals.dropboxWidget) {
            fetchFiles(currentPath);
        }
    }, [state.modals.dropboxWidget, currentPath]);

    const handleNavigate = (path: string, name: string) => {
        setCurrentPath(path);
        setBreadcrumbs(prev => [...prev, { name, path }]);
        setIsCreatingFolder(false); // Reset folder creation on nav
    };

    const handleNavigateUp = () => {
        if (breadcrumbs.length <= 1) return;
        const newBreadcrumbs = [...breadcrumbs];
        newBreadcrumbs.pop();
        const parent = newBreadcrumbs[newBreadcrumbs.length - 1];
        setCurrentPath(parent.path);
        setBreadcrumbs(newBreadcrumbs);
        setIsCreatingFolder(false);
    };

    // --- CRUD Operations ---
    const handleUpload = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;

        // We only handle single file upload for simplicity in this widget or basic loop
        const file = fileList[0];

        try {
            setLoading(true);
            await storageService.uploadFile('dropbox', file, currentPath);
            addToast('File uploaded successfully', 'success');
            await fetchFiles(currentPath);
        } catch (error) {
            console.error('Upload failed', error);
            addToast('Upload failed', 'error');
        } finally {
            setLoading(false);
            setIsDragOver(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            setLoading(true);
            // Construct path: currentPath + / + name
            // If currentPath is empty, it's root, so just /name
            const path = currentPath ? `${currentPath}/${newFolderName}` : `/${newFolderName}`;

            await storageService.createFolder('dropbox', path);
            addToast('Folder created', 'success');
            setNewFolderName('');
            setIsCreatingFolder(false);
            await fetchFiles(currentPath);
        } catch (error) {
            console.error('Create folder failed', error);
            addToast('Failed to create folder', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, file: StorageFile) => {
        e.stopPropagation(); // Prevent nav
        if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;

        try {
            setLoading(true);
            await storageService.deleteFile('dropbox', file.path);
            addToast('Item deleted', 'success');
            await fetchFiles(currentPath);
        } catch (error) {
            console.error('Delete failed', error);
            addToast('Delete failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileClick = async (file: StorageFile) => {
        if (file.type === 'folder') {
            handleNavigate(file.path, file.name);
        } else {
            try {
                const { link } = await storageService.getDownloadLink('dropbox', file.path);
                window.open(link, '_blank');
            } catch (e) {
                addToast('Failed to open file', 'error');
            }
        }
    };

    // --- Drag & Drop Container Logic ---
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };
    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        await handleUpload(e.dataTransfer.files);
    };

    // --- Utils ---
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // IMPORTANT: Return null check MOVED to end to respect Hook Rules
    if (!state.modals.dropboxWidget) return null;

    // --- Render ---
    return (
        <div
            style={{
                left: position.x,
                top: position.y,
                width: isExpanded ? 600 : 340,
                height: isExpanded ? 600 : 500,
                transition: isDraggingWidget ? 'none' : 'width 0.3s, height 0.3s'
            }}
            className="fixed bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-[9999] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onDragOver={onDragOver}
        >
            {/* Drag Overlay */}
            {isDragOver && (
                <div
                    className="absolute inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center"
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 animate-bounce">
                        <UploadCloud size={32} className="text-blue-500" />
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Drop to Upload</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div
                onMouseDown={handleMouseDown}
                className="h-10 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 cursor-move select-none"
            >
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium text-sm">
                    <HardDrive size={16} className="text-[#0061FE]" />
                    <span>Dropbox</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button
                        onClick={() => {
                            dispatch({ type: 'TOGGLE_MODAL', payload: 'dropboxWidget' });
                            navigate('/dropbox');
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 transition-colors"
                        title="Open Full Page"
                    >
                        <ArrowLeft size={14} className="rotate-45" />
                    </button>
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'dropboxWidget' })}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded text-gray-500 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Toolbar / Breadcrumbs */}
            <div className="h-12 px-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 gap-2">
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <button
                        onClick={handleNavigateUp}
                        disabled={breadcrumbs.length <= 1}
                        className={`p-1.5 rounded-lg transition-colors ${breadcrumbs.length <= 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={currentPath || 'Root'}>
                        {breadcrumbs[breadcrumbs.length - 1].name}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                        className={`p-1.5 rounded-md transition-colors ${isCreatingFolder ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        title="New Folder"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Upload File"
                    >
                        <UploadCloud size={16} />
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => handleUpload(e.target.files)}
                        />
                    </button>
                </div>
            </div>

            {/* Folder Creation Input Row */}
            {isCreatingFolder && (
                <div className="p-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex gap-2 animate-in slide-in-from-top-2">
                    <input
                        autoFocus
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Folder name..."
                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                    <button onClick={handleCreateFolder} className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                        <Check size={14} />
                    </button>
                    <button onClick={() => setIsCreatingFolder(false)} className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-600 rounded hover:bg-gray-300">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-2">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-xs">Loading...</span>
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 select-none" onDrop={onDrop}>
                        <Folder size={32} className="opacity-20" />
                        <span className="text-xs">Empty Folder</span>
                        <span className="text-[10px] opacity-60">Drag files here to upload</span>
                    </div>
                ) : (
                    files.map(file => (
                        <div
                            key={file.id}
                            onClick={() => handleFileClick(file)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group transition-colors relative"
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

                            {/* Hover Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pr-1">
                                {file.type === 'file' && (
                                    <Download size={14} className="text-gray-400 hover:text-blue-500 transition-colors" />
                                )}
                                <button
                                    onClick={(e) => handleDelete(e, file)}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Status */}
            <div className="h-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 text-[10px] text-gray-400 select-none">
                <span>{files.length} items</span>
                <div className="flex items-center gap-2">
                    {loading && <span className="animate-pulse text-blue-500">Syncing...</span>}
                    <span>{isExpanded ? 'Expanded View' : 'Compact View'}</span>
                </div>
            </div>
        </div>
    );
};

export default DropboxWidget;
