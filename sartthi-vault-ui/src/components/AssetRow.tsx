import React from 'react';
import { Folder, FileText, Image, Video, Music, File } from 'lucide-react';

interface AssetRowProps {
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'audio';
  extension?: string;
  size: string;
  modifiedDate: string;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

const AssetRow: React.FC<AssetRowProps> = ({
  name,
  type,
  extension,
  size,
  modifiedDate,
  isSelected = false,
  onClick,
  onDoubleClick,
}) => {
  const getFileIcon = () => {
    if (type === 'folder') {
      return <Folder className="w-5 h-5 text-blue-400" />;
    }

    const ext = extension?.toLowerCase();
    
    if (ext === 'pdf') {
      return <FileText className="w-5 h-5 text-red-400" />;
    }
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
      return <FileText className="w-5 h-5 text-green-400" />;
    }
    if (ext === 'doc' || ext === 'docx') {
      return <FileText className="w-5 h-5 text-blue-400" />;
    }
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp') {
      return <Image className="w-5 h-5 text-purple-400" />;
    }
    if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv') {
      return <Video className="w-5 h-5 text-pink-400" />;
    }
    if (ext === 'mp3' || ext === 'wav' || ext === 'flac') {
      return <Music className="w-5 h-5 text-orange-400" />;
    }

    return <File className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`
        group grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer
        transition-all duration-200 border-l-2
        ${isSelected 
          ? 'bg-accent-blue/10 border-accent-blue' 
          : 'border-transparent hover:bg-white/5 hover:border-white/20'
        }
      `}
    >
      {/* Name */}
      <div className="col-span-6 flex items-center gap-3 min-w-0">
        <div className={`transition-transform duration-200 group-hover:scale-110 ${type === 'folder' ? 'text-accent-blue' : ''}`}>
          {getFileIcon()}
        </div>
        <span className={`text-sm font-medium truncate ${isSelected ? 'text-accent-blue' : 'text-text-primary group-hover:text-white'}`}>
          {name}
        </span>
      </div>

      {/* Size */}
      <div className="col-span-2 flex items-center">
        <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors">{size}</span>
      </div>

      {/* Modified Date */}
      <div className="col-span-3 flex items-center">
        <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors">{modifiedDate}</span>
      </div>

      {/* Selection Indicator */}
      <div className="col-span-1 flex items-center justify-end">
        <div className={`
          w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-200
          ${isSelected 
            ? 'bg-accent-blue border-accent-blue scale-100 opacity-100' 
            : 'border-white/20 scale-90 opacity-0 group-hover:opacity-100'
          }
        `}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetRow;
