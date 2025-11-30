import React, { useState, useEffect, useRef } from 'react';
import {
  Folder, File as FileIcon, Image as ImageIcon, Video, Music, FileText,
  Upload, Pin, PinOff, Search, LayoutGrid, List, X
} from 'lucide-react';
import axios from 'axios';

interface VaultDocument {
  _id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'audio' | 'document';
  size?: number;
  formattedSize?: string;
  url?: string;
  thumbnailUrl?: string;
  isPinned: boolean;
  quickAccessEnabled: boolean;
  uploadedBy: {
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface VaultIntegrationProps {
  workspaceId: string;
}

const VaultIntegration: React.FC<VaultIntegrationProps> = ({ workspaceId }) => {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [workspaceId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/vault-workspace/documents/${workspaceId}`);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinDocument = async (documentId: string, isPinned: boolean) => {
    try {
      const endpoint = isPinned ? '/api/vault-workspace/unpin' : '/api/vault-workspace/pin';
      await axios.post(endpoint, { documentId, workspaceId });
      fetchDocuments();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspaceId', workspaceId);
      
      await axios.post(`/api/vault-workspace/upload/${workspaceId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowUploadModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedDocs = filteredDocuments.filter(doc => doc.isPinned);
  const regularDocs = filteredDocuments.filter(doc => !doc.isPinned);

  return (
    <div className="bg-white rounded-lg border border-gray-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Workspace Documents</h3>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-accent text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No documents found</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 text-accent-dark hover:text-blue-700"
            >
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pinned Documents */}
            {pinnedDocs.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Pin className="w-4 h-4" />
                  Pinned Documents
                </h4>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {pinnedDocs.map(doc => (
                      <DocumentCard
                        key={doc._id}
                        document={doc}
                        onPin={handlePinDocument}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pinnedDocs.map(doc => (
                      <DocumentRow
                        key={doc._id}
                        document={doc}
                        onPin={handlePinDocument}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Regular Documents */}
            {regularDocs.length > 0 && (
              <div>
                {pinnedDocs.length > 0 && (
                  <h4 className="text-sm font-medium text-gray-700 mb-3">All Documents</h4>
                )}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {regularDocs.map(doc => (
                      <DocumentCard
                        key={doc._id}
                        document={doc}
                        onPin={handlePinDocument}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {regularDocs.map(doc => (
                      <DocumentRow
                        key={doc._id}
                        document={doc}
                        onPin={handlePinDocument}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
          uploading={uploading}
        />
      )}
    </div>
  );
};

// Document Card Component
const DocumentCard: React.FC<{
  document: VaultDocument;
  onPin: (id: string, isPinned: boolean) => void;
}> = ({ document, onPin }) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder className="w-12 h-12 text-yellow-500" />;
      case 'image': return <ImageIcon className="w-12 h-12 text-green-500" />;
      case 'video': return <Video className="w-12 h-12 text-red-500" />;
      case 'audio': return <Music className="w-12 h-12 text-purple-500" />;
      case 'document': return <FileText className="w-12 h-12 text-blue-500" />;
      default: return <FileIcon className="w-12 h-12 text-gray-500" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-accent hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        {getFileIcon(document.type)}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin(document._id, document.isPinned);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {document.isPinned ? (
            <PinOff className="w-4 h-4 text-gray-600 hover:text-red-600" />
          ) : (
            <Pin className="w-4 h-4 text-gray-600 hover:text-accent-dark" />
          )}
        </button>
      </div>
      <h4 className="font-medium text-gray-900 text-sm truncate mb-1">{document.name}</h4>
      <p className="text-xs text-gray-600">{document.formattedSize || 'Folder'}</p>
      <p className="text-xs text-gray-500 mt-1">
        {new Date(document.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

// Document Row Component
const DocumentRow: React.FC<{
  document: VaultDocument;
  onPin: (id: string, isPinned: boolean) => void;
}> = ({ document, onPin }) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder className="w-5 h-5 text-yellow-500" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-green-500" />;
      case 'video': return <Video className="w-5 h-5 text-red-500" />;
      case 'audio': return <Music className="w-5 h-5 text-purple-500" />;
      case 'document': return <FileText className="w-5 h-5 text-blue-500" />;
      default: return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-accent hover:bg-gray-50 transition-all cursor-pointer group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {getFileIcon(document.type)}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate">{document.name}</h4>
          <p className="text-xs text-gray-600">
            {document.formattedSize || 'Folder'} • {new Date(document.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPin(document._id, document.isPinned);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {document.isPinned ? (
          <PinOff className="w-4 h-4 text-gray-600 hover:text-red-600" />
        ) : (
          <Pin className="w-4 h-4 text-gray-600 hover:text-accent-dark" />
        )}
      </button>
    </div>
  );
};

// Upload Modal Component
const UploadModal: React.FC<{
  onClose: () => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}> = ({ onClose, onUpload, uploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={uploading}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold mb-4">Upload Document</h3>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-accent bg-accent/5" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your file here, or{" "}
                <button
                  onClick={() => inputRef.current?.click()}
                  className="text-accent-dark hover:underline font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-400">Max file size: 50MB</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultIntegration;
