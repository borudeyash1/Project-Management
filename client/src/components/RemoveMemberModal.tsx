import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RemoveMemberModalProps {
  isOpen: boolean;
  memberName: string;
  memberEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RemoveMemberModal({
  isOpen,
  memberName,
  memberEmail,
  onConfirm,
  onCancel
}: RemoveMemberModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText.toUpperCase() !== 'REMOVE') return;

    setIsRemoving(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      setIsRemoving(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setIsRemoving(false);
    onCancel();
  };

  const isConfirmValid = confirmText.toUpperCase() === 'REMOVE';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg max-w-md w-full p-6 shadow-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Remove Member</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isRemoving}
            className={`disabled:opacity-50 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            You are about to remove <strong>{memberName}</strong> ({memberEmail}) from this workspace.
          </p>

          <div className={`rounded-lg p-4 mb-4 border ${isDarkMode
              ? 'bg-yellow-900/20 border-yellow-900/50'
              : 'bg-yellow-50 border-yellow-200'
            }`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>What will happen:</h4>
            <ul className={`text-sm space-y-1 list-disc list-inside ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
              <li>Member will be removed from the workspace</li>
              <li>They will lose access to all workspace projects</li>
              <li>Their historical data (tasks, activities) will be preserved</li>
              <li>They can be re-invited later if needed</li>
            </ul>
          </div>

          <div className={`rounded-lg p-4 mb-4 border ${isDarkMode
              ? 'bg-red-900/20 border-red-900/50'
              : 'bg-red-50 border-red-200'
            }`}>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
              ⚠️ This action cannot be undone easily. The member will need to be re-invited to regain access.
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Type <span className="font-bold text-red-600">REMOVE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isRemoving}
              placeholder="Type REMOVE"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
              autoFocus
            />
            {confirmText && !isConfirmValid && (
              <p className="text-sm text-red-600 mt-1">
                Please type "REMOVE" exactly as shown
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isRemoving}
            className={`flex-1 px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmValid || isRemoving}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRemoving ? 'Removing...' : 'Remove Member'}
          </button>
        </div>
      </div>
    </div>
  );
}
