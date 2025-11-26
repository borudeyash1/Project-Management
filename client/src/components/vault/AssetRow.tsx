import React from 'react';
import { Folder, FileText, Image, Video, Music, File } from 'lucide-react';

interface AssetRowProps {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'audio';
  size?: string;
  modified: string;
  onClick?: () => void;
}

const AssetRow: React.FC<AssetRowProps> = ({
  name,
  type,
  size = '-',
  modified,
  onClick,
}) => {
  const getIcon = () => {
    const iconProps = { size: 18, strokeWidth: 2 };
    
    switch (type) {
      case 'folder':
        return <Folder {...iconProps} className="text-yellow-500" />;
      case 'image':
        return <Image {...iconProps} className="text-blue-400" />;
      case 'video':
        return <Video {...iconProps} className="text-purple-400" />;
      case 'audio':
        return <Music {...iconProps} className="text-green-400" />;
      case 'file':
        return <FileText {...iconProps} className="text-gray-400" />;
      default:
        return <File {...iconProps} className="text-gray-400" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className="
        grid grid-cols-[1fr_150px_120px] gap-4 items-center
        border-b border-border-subtle py-2 px-4
        hover:bg-sidebar-bg transition-colors cursor-pointer
        text-sm text-text-light
      "
    >
      {/* Name with icon */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0">{getIcon()}</div>
        <span className="truncate">{name}</span>
      </div>

      {/* Modified date */}
      <div className="text-text-lighter text-xs">
        {modified}
      </div>

      {/* Size */}
      <div className="text-text-lighter text-xs text-right">
        {size}
      </div>
    </div>
  );
};

export default AssetRow;
