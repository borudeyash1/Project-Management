import React, { useState } from 'react';
import './Folder.css';

interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  onClick?: () => void;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map(c => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const Folder: React.FC<FolderProps> = ({ 
  color = '#5227FF', 
  size = 1, 
  items = [], 
  className = '',
  onClick 
}) => {
  const maxItems = 3;
  const papers = [...items.slice(0, maxItems)];
  while (papers.length < maxItems) {
    papers.push(null);
  }

  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState<{x: number, y: number}[]>(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );

  const folderBackColor = darkenColor(color, 0.08);

  const handleMouseEnter = () => {
    setOpen(true);
    setPaperOffsets(
      Array.from({ length: maxItems }, () => ({
        x: Math.random() * 40 - 20,
        y: Math.random() * 20 - 10,
      }))
    );
  };

  const handleMouseLeave = () => {
    setOpen(false);
    setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
  };

  return (
    <div
      className={`folder ${open ? 'open' : ''} ${className}`}
      style={{
        '--folder-color': color,
        '--folder-back-color': folderBackColor,
        transform: `scale(${size})`
      } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div className="folder-back"></div>
      <div className="papers">
        {papers.map((item, index) => (
          <div
            key={index}
            className="paper"
            style={{
              transform: `translate(${paperOffsets[index].x}px, ${paperOffsets[index].y}px) rotate(${Math.random() * 6 - 3}deg)`,
              zIndex: maxItems - index,
            }}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="folder-front"></div>
    </div>
  );
};

export default Folder;
