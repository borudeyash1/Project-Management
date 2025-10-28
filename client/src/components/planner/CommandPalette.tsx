import React, { useState } from 'react';
import { X, Search, Command } from 'lucide-react';

interface CommandPaletteProps {
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
  const [search, setSearch] = useState('');

  const commands = [
    { id: '1', name: 'Create New Task', shortcut: '⌘N' },
    { id: '2', name: 'Switch to Board View', shortcut: '1' },
    { id: '3', name: 'Switch to List View', shortcut: '2' },
    { id: '4', name: 'Switch to Timeline View', shortcut: '3' },
    { id: '5', name: 'Switch to Calendar View', shortcut: '4' },
    { id: '6', name: 'Switch to My Work', shortcut: '5' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Command className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.map(cmd => (
            <button
              key={cmd.id}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
              onClick={onClose}
            >
              <span className="text-gray-900 dark:text-white">{cmd.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{cmd.shortcut}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
