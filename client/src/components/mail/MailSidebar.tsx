import React from 'react';
import { Inbox, Send, Star, Archive, Trash2, Tag, Settings } from 'lucide-react';

interface MailSidebarProps {
  activeFolder?: string;
  onFolderChange?: (folder: string) => void;
}

interface FolderItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

const MailSidebar: React.FC<MailSidebarProps> = ({
  activeFolder = 'inbox',
  onFolderChange,
}) => {
  const folders: FolderItem[] = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox size={16} />, count: 12 },
    { id: 'starred', label: 'Starred', icon: <Star size={16} /> },
    { id: 'sent', label: 'Sent', icon: <Send size={16} /> },
    { id: 'archive', label: 'Archive', icon: <Archive size={16} /> },
    { id: 'trash', label: 'Trash', icon: <Trash2 size={16} /> },
  ];

  const labels: FolderItem[] = [
    { id: 'work', label: 'Work', icon: <Tag size={16} />, count: 5 },
    { id: 'personal', label: 'Personal', icon: <Tag size={16} />, count: 3 },
    { id: 'important', label: 'Important', icon: <Tag size={16} />, count: 2 },
  ];

  return (
    <div className="w-64 bg-sidebar-bg border-r border-border-subtle h-full flex flex-col">
      {/* Compose Button */}
      <div className="p-4">
        <button className="w-full bg-accent-blue hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">
          Compose
        </button>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2">
        <nav className="space-y-0.5">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onFolderChange?.(folder.id)}
              className={`
                w-full flex items-center gap-3 py-1.5 px-2 rounded-md text-13 transition-colors
                ${
                  activeFolder === folder.id
                    ? 'bg-border-subtle text-white font-medium'
                    : 'text-text-muted hover:bg-hover-bg hover:text-text-light'
                }
              `}
            >
              <span className="flex-shrink-0">{folder.icon}</span>
              <span className="flex-1 text-left">{folder.label}</span>
              {folder.count !== undefined && (
                <span className="text-xs text-text-lighter">{folder.count}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Labels Section */}
        <div className="mt-6">
          <h3 className="px-2 text-2xs font-bold uppercase text-text-lighter mb-2">
            Labels
          </h3>
          <nav className="space-y-0.5">
            {labels.map((label) => (
              <button
                key={label.id}
                onClick={() => onFolderChange?.(label.id)}
                className={`
                  w-full flex items-center gap-3 py-1.5 px-2 rounded-md text-13 transition-colors
                  ${
                    activeFolder === label.id
                      ? 'bg-border-subtle text-white font-medium'
                      : 'text-text-muted hover:bg-hover-bg hover:text-text-light'
                  }
                `}
              >
                <span className="flex-shrink-0">{label.icon}</span>
                <span className="flex-1 text-left">{label.label}</span>
                {label.count !== undefined && (
                  <span className="text-xs text-text-lighter">{label.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings */}
      <div className="p-2 border-t border-border-subtle">
        <button className="w-full flex items-center gap-3 py-1.5 px-2 rounded-md text-13 text-text-muted hover:bg-hover-bg hover:text-text-light transition-colors">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default MailSidebar;
