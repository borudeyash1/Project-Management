import React from 'react';
import { useApp } from '../context/AppContext';

const TaskDetailsModal: React.FC = () => {
  const { state, dispatch } = useApp();
  if (!state.modals.taskDetails) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Task Details</h2>
        <p className="text-slate-600 mb-4">Task details modal placeholder.</p>
        <button onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'taskDetails' })} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Close</button>
      </div>
    </div>
  );
};
export default TaskDetailsModal;
