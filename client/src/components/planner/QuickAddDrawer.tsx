import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface QuickAddDrawerProps {
  onClose: () => void;
}

const QuickAddDrawer: React.FC<QuickAddDrawerProps> = ({ onClose }) => {
  const [input, setInput] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Quick Add Task
          </h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-600 dark:hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Design homepage due Friday high priority @john"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
          autoFocus
        />
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-200">
          <p>Try: "Task name due [date] [priority] @assignee #tag"</p>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddDrawer;
