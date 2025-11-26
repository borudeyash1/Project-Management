import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Grid, List, Search, ChevronRight, Home, Upload as UploadIcon, Clock } from 'lucide-react';
import AssetCard from './AssetCard';
import AssetRow from './AssetRow';
import FileContextMenu from './FileContextMenu';
import DropzoneOverlay from './DropzoneOverlay';
import FilePreviewModal from './FilePreviewModal';
import UploadModal from './UploadModal';
import VaultLayout from './VaultLayout';
import { vaultApi } from '../services/vaultApi';
import { useToast } from '../context/ToastContext';

interface Asset {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'audio';
  extension?: string;
  size?: string;
  modifiedDate?: string;
  thumbnail?: string;
  url?: string;
  viewLink?: string;
}

const VaultPage: React.FC = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeView, setActiveView] = useState('home');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<Asset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: 'root', name: 'My Vault' },
  ]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);

  // Fetch files from API
  useEffect(() => {
    loadFiles();
  }, [currentFolderId]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const files = await vaultApi.listFiles(currentFolderId);
      setAssets(files);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles);
    setShowUploadModal(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const handleAssetClick = (id: string) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAssets(newSelected);
  };

  const handleAssetDoubleClick = (asset: Asset) => {
    if (asset.type === 'folder') {
      setBreadcrumbs([...breadcrumbs, { id: asset.id, name: asset.name }]);
      setCurrentFolderId(asset.id);
    } else {
      const fileWithUrl = {
        ...asset,
        url: vaultApi.getFileViewUrl(asset.id),
      };
      setPreviewFile(fileWithUrl);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    const folderId = newBreadcrumbs[newBreadcrumbs.length - 1].id;
    setCurrentFolderId(folderId === 'root' ? undefined : folderId);
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentFiles = [...assets]
    .filter(a => a.type !== 'folder')
    .sort((a, b) => new Date(b.modifiedDate || 0).getTime() - new Date(a.modifiedDate || 0).getTime())
    .slice(0, 4);

  return (
    <VaultLayout activeView={activeView} onViewChange={setActiveView}>
      <div {...getRootProps()} className="flex-1 flex flex-col h-full relative">
        <input {...getInputProps()} />
        <DropzoneOverlay isActive={isDragActive} />

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 backdrop-blur-md bg-app-bg/50 sticky top-0 z-20">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 flex-1">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    index === breadcrumbs.length - 1
                      ? 'bg-white/10 text-white font-medium shadow-sm'
                      : 'text-text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {index === 0 && <Home className="w-4 h-4" />}
                  {crumb.name}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-text-muted/50" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Search */}
          <div className="relative mx-8 flex-1 max-w-xl group">
            <div className="absolute inset-0 bg-accent-blue/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-sidebar-bg/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center px-4 py-2.5 shadow-lg transition-all focus-within:ring-2 focus-within:ring-accent-blue/50 focus-within:border-accent-blue/50">
              <Search className="w-5 h-5 text-text-muted mr-3" />
              <input
                type="text"
                placeholder="Search your vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-text-primary placeholder-text-muted focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="flex bg-sidebar-bg/80 backdrop-blur-xl rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-accent-blue text-white shadow-lg shadow-blue-500/20'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-accent-blue text-white shadow-lg shadow-blue-500/20'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-accent-blue to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-medium transform hover:-translate-y-0.5"
            >
              <UploadIcon className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-accent-blue rounded-full animate-spin"></div>
              </div>
              <p className="text-text-muted animate-pulse">Accessing secure vault...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Recent Files Section */}
              {!currentFolderId && !searchQuery && recentFiles.length > 0 && activeView === 'home' && (
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent-blue" />
                    Recent Activity
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentFiles.map((file) => (
                      <div 
                        key={file.id}
                        onClick={() => handleAssetClick(file.id)}
                        onDoubleClick={() => handleAssetDoubleClick(file)}
                        className="group bg-card-bg/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:border-accent-blue/30 hover:bg-card-bg transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-lg bg-white/5 text-accent-blue group-hover:scale-110 transition-transform">
                              <div className="font-bold text-xs uppercase">{file.extension || 'FILE'}</div>
                            </div>
                            {file.size && <span className="text-xs text-text-muted font-medium">{file.size}</span>}
                          </div>
                          <h3 className="font-medium text-white truncate mb-1" title={file.name}>{file.name}</h3>
                          <p className="text-xs text-text-muted">Edited {file.modifiedDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* All Files Section */}
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-accent-blue rounded-full" />
                  {currentFolderId ? 'Folder Contents' : 'All Files'}
                </h2>
                
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {filteredAssets.map((asset) => (
                      <FileContextMenu
                        key={asset.id}
                        onRename={() => console.log('Rename', asset.name)}
                        onMove={() => console.log('Move', asset.name)}
                        onGetLink={() => console.log('Get link', asset.name)}
                        onDelete={() => console.log('Delete', asset.name)}
                      >
                        <div className="relative">
                          <AssetCard
                            name={asset.name}
                            type={asset.type}
                            extension={asset.extension}
                            thumbnail={asset.thumbnail}
                            isSelected={selectedAssets.has(asset.id)}
                            onClick={() => handleAssetClick(asset.id)}
                            onDoubleClick={() => handleAssetDoubleClick(asset)}
                          />
                        </div>
                      </FileContextMenu>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card-bg/30 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2">Size</div>
                      <div className="col-span-3">Modified</div>
                      <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y divide-white/5">
                      {filteredAssets.map((asset) => (
                        <FileContextMenu
                          key={asset.id}
                          onRename={() => console.log('Rename', asset.name)}
                          onMove={() => console.log('Move', asset.name)}
                          onGetLink={() => console.log('Get link', asset.name)}
                          onDelete={() => console.log('Delete', asset.name)}
                        >
                          <div>
                            <AssetRow
                              name={asset.name}
                              type={asset.type}
                              extension={asset.extension}
                              size={asset.size || '-'}
                              modifiedDate={asset.modifiedDate || '-'}
                              isSelected={selectedAssets.has(asset.id)}
                              onClick={() => handleAssetClick(asset.id)}
                              onDoubleClick={() => handleAssetDoubleClick(asset)}
                            />
                          </div>
                        </FileContextMenu>
                      ))}
                    </div>
                  </div>
                )}

                {filteredAssets.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-white">No files found</p>
                    <p className="text-sm mt-2 opacity-60">Try adjusting your search or upload new files</p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {/* File Preview Modal */}
        <FilePreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          file={previewFile}
          onDownload={async (fileId) => {
            try {
              const file = assets.find(a => a.id === fileId);
              if (file) {
                await vaultApi.downloadFile(fileId, file.name);
                toast.success('File downloaded successfully');
              }
            } catch (error) {
              console.error('Download failed:', error);
              toast.error('Failed to download file');
            }
          }}
          onShare={(fileId) => {
            const file = assets.find(a => a.id === fileId);
            if (file?.viewLink) {
              navigator.clipboard.writeText(file.viewLink);
              toast.success('Link copied to clipboard!');
            }
          }}
          onRename={async (fileId) => {
            const file = assets.find(a => a.id === fileId);
            const newName = prompt('Enter new name:', file?.name);
            if (newName && newName !== file?.name) {
              try {
                await vaultApi.renameFile(fileId, newName);
                setPreviewFile(null);
                loadFiles();
                toast.success('File renamed successfully');
              } catch (error) {
                console.error('Rename failed:', error);
                toast.error('Failed to rename file');
              }
            }
          }}
          onDelete={async (fileId) => {
            if (confirm('Are you sure you want to delete this file?')) {
              try {
                await vaultApi.deleteFile(fileId);
                setPreviewFile(null);
                loadFiles();
                toast.success('File deleted successfully');
              } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete file');
              }
            }
          }}
        />

        {/* Upload Modal */}
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={async (files) => {
            try {
              for (const file of files) {
                await vaultApi.uploadFile(file, currentFolderId);
              }
              setShowUploadModal(false);
              loadFiles();
              toast.success('Files uploaded successfully');
            } catch (error) {
              console.error('Upload failed:', error);
              toast.error('Failed to upload files');
            }
          }}
        />
      </div>
    </VaultLayout>
  );
};

export default VaultPage;
