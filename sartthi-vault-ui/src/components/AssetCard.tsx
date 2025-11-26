import React from 'react';
import { Folder, FileText, Image, Video, Music, File } from 'lucide-react';

interface AssetCardProps {
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'audio';
  extension?: string;
  thumbnail?: string;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
  name,
  type,
  extension,
  thumbnail,
  isSelected = false,
  onClick,
  onDoubleClick,
}) => {
  const getFileIcon = () => {
    if (type === 'folder') {
      return <Folder className="w-12 h-12 text-blue-400" />;
    }

    // Smart icon based on extension
    const ext = extension?.toLowerCase();
    
    if (ext === 'pdf') {
      return <FileText className="w-12 h-12 text-red-400" />;
    }
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
      return <FileText className="w-12 h-12 text-green-400" />;
    }
    if (ext === 'doc' || ext === 'docx') {
      return <FileText className="w-12 h-12 text-blue-400" />;
    }
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp') {
      return thumbnail ? (
        <img src={thumbnail} alt={name} className="w-full h-full object-cover rounded" />
      ) : (
        <Image className="w-12 h-12 text-purple-400" />
      );
    }
    if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv') {
      return <Video className="w-12 h-12 text-pink-400" />;
    }
    if (ext === 'mp3' || ext === 'wav' || ext === 'flac') {
      return <Music className="w-12 h-12 text-orange-400" />;
    }

    return <File className="w-12 h-12 text-gray-400" />;
  };

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`
        group relative aspect-[4/5] rounded-2xl p-4 cursor-pointer
        transition-all duration-300 ease-out
        border border-transparent
        ${isSelected 
          ? 'bg-accent-blue/10 border-accent-blue/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
          : 'bg-card-bg hover:bg-hover-bg hover:border-border-subtle hover:shadow-xl hover:-translate-y-1'
        }
      `}
    >
      {/* Icon/Thumbnail Container */}
      <div className="h-2/3 flex items-center justify-center mb-4 relative">
        <div className={`
          relative z-10 transition-transform duration-300 group-hover:scale-110
          ${type === 'folder' ? 'drop-shadow-lg' : ''}
        `}>
          {getFileIcon()}
        </div>
        
        {/* Glow effect behind icon */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-xl" />
      </div>

      {/* File Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl">
        <p className="text-sm text-text-primary font-medium truncate leading-tight" title={name}>
          {name}
        </p>
        {extension && type !== 'folder' && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold text-text-muted bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
              {extension}
            </span>
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      <div className={`
        absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center
        transition-all duration-200
        ${isSelected 
          ? 'bg-accent-blue scale-100 opacity-100' 
          : 'bg-white/10 scale-90 opacity-0 group-hover:opacity-100 hover:bg-white/20'
        }
      `}>
        {isSelected && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
