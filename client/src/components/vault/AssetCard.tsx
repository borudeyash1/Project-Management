import React from 'react';
import { Folder, FileText, Image, Video, Music, File } from 'lucide-react';

interface AssetCardProps {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'audio';
  onClick?: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ name, type, onClick }) => {
  const getIcon = () => {
    const iconProps = { size: 48, strokeWidth: 1.5 };
    
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
        aspect-square bg-card-bg border border-border-subtle rounded-xl
        hover:bg-hover-bg transition-colors cursor-pointer
        flex flex-col items-center justify-center
        group
      "
    >
      {/* Icon */}
      <div className="mb-3 group-hover:scale-110 transition-transform">
        {getIcon()}
      </div>

      {/* Footer with name */}
      <div className="w-full border-t border-border-subtle px-3 py-2">
        <p className="text-xs text-center truncate text-text-light">
          {name}
        </p>
      </div>
    </div>
  );
};

export default AssetCard;
