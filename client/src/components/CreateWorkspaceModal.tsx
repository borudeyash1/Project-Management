import React from 'react';
import { useApp } from '../context/AppContext';

const CreateWorkspaceModal: React.FC = () => {
  const { state, dispatch } = useApp();

  if (!state.modals.createWorkspace) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Create Workspace</h2>
        <p className="text-slate-600 mb-4">Create workspace modal will be implemented here.</p>
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
            onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'createWorkspace' })}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'createWorkspace' })}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
