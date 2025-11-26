import React from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { Edit2, FolderInput, Link2, Trash2 } from 'lucide-react';

interface FileContextMenuProps {
  children: React.ReactNode;
  onRename: () => void;
  onMove: () => void;
  onGetLink: () => void;
  onDelete: () => void;
}

const FileContextMenu: React.FC<FileContextMenuProps> = ({
  children,
  onRename,
  onMove,
  onGetLink,
  onDelete,
}) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[220px] bg-[#2C2C2C] rounded-lg p-1 shadow-xl border border-[#3C3C3C]"
          style={{
            minWidth: '220px',
            backgroundColor: '#2C2C2C',
            borderRadius: '0.5rem',
            padding: '0.25rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            border: '1px solid #3C3C3C',
          }}
        >
          <ContextMenu.Item
            className="flex items-center gap-3 px-3 py-2 text-sm text-white rounded hover:bg-[#3C3C3C] cursor-pointer outline-none"
            onSelect={onRename}
          >
            <Edit2 className="w-4 h-4" />
            <span>Rename</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            className="flex items-center gap-3 px-3 py-2 text-sm text-white rounded hover:bg-[#3C3C3C] cursor-pointer outline-none"
            onSelect={onMove}
          >
            <FolderInput className="w-4 h-4" />
            <span>Move to...</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px bg-[#3C3C3C] my-1" />

          <ContextMenu.Item
            className="flex items-center gap-3 px-3 py-2 text-sm text-white rounded hover:bg-[#3C3C3C] cursor-pointer outline-none"
            onSelect={onGetLink}
          >
            <Link2 className="w-4 h-4" />
            <span>Get Shareable Link</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px bg-[#3C3C3C] my-1" />

          <ContextMenu.Item
            className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 rounded hover:bg-red-500/10 cursor-pointer outline-none"
            onSelect={onDelete}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

export default FileContextMenu;
