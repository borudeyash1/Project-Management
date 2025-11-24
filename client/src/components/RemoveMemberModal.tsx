import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

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
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Remove Member</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isRemoving}
            className="text-gray-600 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            You are about to remove <strong>{memberName}</strong> ({memberEmail}) from this workspace.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">What will happen:</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Member will be removed from the workspace</li>
              <li>They will lose access to all workspace projects</li>
              <li>Their historical data (tasks, activities) will be preserved</li>
              <li>They can be re-invited later if needed</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ This action cannot be undone easily. The member will need to be re-invited to regain access.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold text-red-600">REMOVE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isRemoving}
              placeholder="Type REMOVE"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
