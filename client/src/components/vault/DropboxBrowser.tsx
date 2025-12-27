import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, LayoutGrid, List, Search, Plus, Upload, FolderPlus, Loader, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AssetCard from './AssetCard';
import AssetRow from './AssetRow';
import { storageService, StorageFile } from '../../services/storageService';
import { useApp } from '../../context/AppContext';

const DropboxBrowser: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useApp();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPath, setCurrentPath] = useState(''); // Dropbox root is ''
    const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; path: string }[]>([{ name: 'Dropbox', path: '' }]);
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchFiles(currentPath);
    }, [currentPath]);

    const fetchFiles = async (path: string) => {
        try {
            setLoading(true);
            const data = await storageService.listFiles('dropbox', path);
            setFiles(data);
        } catch (error: any) {
            console.error('Failed to fetch files:', error);
            addToast('Failed to load files: ' + (error.message || 'Unknown error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path: string, name: string) => {
        setCurrentPath(path);

        // Update breadcrumbs
        const index = breadcrumbs.findIndex(b => b.path === path);
        if (index !== -1) {
            // Clicked on existing crumb
            setBreadcrumbs(breadcrumbs.slice(0, index + 1));
        } else {
            // New folder
            setBreadcrumbs([...breadcrumbs, { name, path }]);
        }
    };

    const handleFileClick = async (file: StorageFile) => {
        if (file.type === 'folder') {
            handleNavigate(file.path, file.name);
        } else {
            // Download/Open file
            try {
                addToast('Getting download link...', 'info');
                const { link } = await storageService.getDownloadLink('dropbox', file.path);
                window.open(link, '_blank');
            } catch (error) {
                addToast('Failed to open file', 'error');
            }
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const file = fileList[0];
        try {
            addToast(`Uploading ${file.name}...`, 'info');
            await storageService.uploadFile('dropbox', file, currentPath);
            addToast('Upload complete', 'success');
            fetchFiles(currentPath); // Refresh
        } catch (error) {
            addToast('Upload failed', 'error');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (file: StorageFile) => {
        if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) return;

        try {
            await storageService.deleteFile('dropbox', file.path);
            addToast('Deleted successfully', 'success');
            setFiles(files.filter(f => f.id !== file.id));
        } catch (error) {
            addToast('Delete failed', 'error');
        }
    };

    const handleCreateFolder = async () => {
        const name = prompt('Enter folder name:');
        if (!name) return;

        const newPath = currentPath === '' ? `/${name}` : `${currentPath}/${name}`;
        try {
            await storageService.createFolder('dropbox', newPath);
            addToast('Folder created', 'success');
            fetchFiles(currentPath);
        } catch (error) {
            addToast('Failed to create folder', 'error');
        }
    };

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Adapt StorageFile to AssetCard/Row props if needed
    // AssetCard expects: id, name, type, size?, modified
    // Our types match closely enough, but let's transform just in case 'type' mapping needs care
    const mapToFileAsset = (f: StorageFile) => ({
        id: f.id,
        name: f.name,
        type: (f.type === 'folder' ? 'folder' : 'file') as any, // Simple mapping, could enhance for images/etc
        size: f.size ? formatBytes(f.size) : undefined,
        modified: f.modified ? new Date(f.modified).toLocaleDateString() : '',
        path: f.path // extra prop, might need custom row
    });

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="h-full bg-app-bg text-text-primary flex flex-col">
            {/* Header */}
            <div className="border-b border-border-subtle bg-app-bg">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Left: Back & Breadcrumbs */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-hover-bg rounded-lg">
                            <ArrowLeft size={20} className="text-text-lighter" />
                        </button>
                        <div className="flex items-center gap-2">
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={crumb.path || 'root'}>
                                    <button
                                        className={`text-sm transition-colors ${index === breadcrumbs.length - 1
                                            ? 'text-white font-medium'
                                            : 'text-text-lighter hover:text-text-muted'
                                            }`}
                                        onClick={() => handleNavigate(crumb.path, crumb.name)}
                                    >
                                        {crumb.name}
                                    </button>
                                    {index < breadcrumbs.length - 1 && (
                                        <ChevronRight size={14} className="text-text-lighter" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" size={16} />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-sidebar-bg border border-border-subtle rounded-lg pl-9 pr-4 py-1.5 text-sm text-text-light placeholder-text-lighter focus:outline-none focus:border-border-light transition-colors w-64"
                            />
                        </div>

                        {/* View Toggler */}
                        <div className="bg-border-subtle p-1 rounded-lg flex gap-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-hover-bg text-white shadow-sm' : 'text-text-muted hover:text-text-light'
                                    }`}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-hover-bg text-white shadow-sm' : 'text-text-muted hover:text-text-light'
                                    }`}
                            >
                                <List size={16} />
                            </button>
                        </div>

                        {/* Upload Button */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-accent-blue hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded-lg transition-colors text-sm flex items-center gap-2"
                        >
                            <Upload size={16} />
                            Upload
                        </button>
                        <button
                            onClick={handleCreateFolder}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-1.5 px-4 rounded-lg transition-colors text-sm flex items-center gap-2"
                        >
                            <FolderPlus size={16} />
                            New Folder
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader className="animate-spin text-accent-blue" size={32} />
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="text-center text-text-lighter mt-20">
                        <p>No files found in this folder</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                        {filteredFiles.map((file) => (
                            <div key={file.id} className="relative group">
                                <AssetCard
                                    {...mapToFileAsset(file)}
                                    // @ts-ignore
                                    onClick={() => handleFileClick(file)}
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div>
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_150px_120px] gap-4 px-4 py-2 border-b border-border-subtle">
                            <div className="text-2xs font-bold uppercase text-text-lighter">Name</div>
                            <div className="text-2xs font-bold uppercase text-text-lighter">Modified</div>
                            <div className="text-2xs font-bold uppercase text-text-lighter text-right">Size</div>
                        </div>

                        {filteredFiles.map((file) => (
                            <div key={file.id} className="relative group">
                                <AssetRow
                                    {...mapToFileAsset(file)}
                                    // @ts-ignore
                                    onClick={() => handleFileClick(file)}
                                />
                                {/* Delete button overlay for list view row could be tricky, maybe just use context menu or rely on grid for now for delete */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DropboxBrowser;
