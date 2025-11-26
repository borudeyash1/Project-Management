import React, { useState } from 'react';
import { X, Download, Share2, Edit2, Trash2, ExternalLink, Play, Pause } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    type: 'folder' | 'file' | 'image' | 'video' | 'audio';
    extension?: string;
    size?: string;
    modifiedDate?: string;
    url?: string;
    thumbnail?: string;
  } | null;
  onDownload?: (fileId: string) => void;
  onShare?: (fileId: string) => void;
  onRename?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  onDownload,
  onShare,
  onRename,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen || !file) return null;

  const renderPreview = () => {
    const ext = file.extension?.toLowerCase();

    // Images
    if (file.type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return (
        <div className="flex items-center justify-center h-full bg-black/50 rounded-lg">
          <img
            src={file.url || file.thumbnail || '/placeholder-image.png'}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    // Videos
    if (file.type === 'video' || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) {
      return (
        <div className="relative h-full bg-black rounded-lg">
          <video
            src={file.url || '/placeholder-video.mp4'}
            controls
            className="w-full h-full rounded-lg"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    // Audio
    if (file.type === 'audio' || ['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(ext || '')) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-8">
          <div className="w-32 h-32 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
            {isPlaying ? (
              <Pause className="w-16 h-16 text-purple-400" />
            ) : (
              <Play className="w-16 h-16 text-purple-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{file.name}</h3>
          <p className="text-sm text-gray-400 mb-6">Audio File</p>
          <audio
            src={file.url || '/placeholder-audio.mp3'}
            controls
            className="w-full max-w-md"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    // PDF
    if (ext === 'pdf') {
      return (
        <div className="h-full bg-gray-900 rounded-lg">
          <iframe
            src={file.url || '/placeholder.pdf'}
            className="w-full h-full rounded-lg"
            title={file.name}
          />
        </div>
      );
    }

    // Documents (Word, Excel, etc.)
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg p-8">
          <div className="w-32 h-32 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
            <ExternalLink className="w-16 h-16 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{file.name}</h3>
          <p className="text-sm text-gray-400 mb-6">
            {ext?.toUpperCase()} Document
          </p>
          <button
            onClick={() => file.url && window.open(file.url, '_blank')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </button>
        </div>
      );
    }

    // Text files
    if (['txt', 'md', 'json', 'xml', 'csv'].includes(ext || '')) {
      return (
        <div className="h-full bg-gray-900 rounded-lg p-6 overflow-auto">
          <pre className="text-sm text-gray-300 font-mono">
            {/* Placeholder - would fetch actual content */}
            Loading file content...
          </pre>
        </div>
      );
    }

    // Default - unsupported file type
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-lg p-8">
        <div className="w-32 h-32 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-6">
          <ExternalLink className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{file.name}</h3>
        <p className="text-sm text-gray-400 mb-6">
          Preview not available for this file type
        </p>
        <button
          onClick={() => onDownload?.(file.id)}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download File
        </button>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-[#2C2C2C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2C2C2C]">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{file.name}</h2>
            <p className="text-sm text-gray-400">
              {file.size} • {file.modifiedDate}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onDownload?.(file.id)}
              className="p-2 hover:bg-[#2C2C2C] rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => onShare?.(file.id)}
              className="p-2 hover:bg-[#2C2C2C] rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => onRename?.(file.id)}
              className="p-2 hover:bg-[#2C2C2C] rounded-lg transition-colors"
              title="Rename"
            >
              <Edit2 className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => onDelete?.(file.id)}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
            </button>
            <div className="w-px h-6 bg-[#2C2C2C] mx-2" />
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2C2C2C] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-4 overflow-hidden">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
