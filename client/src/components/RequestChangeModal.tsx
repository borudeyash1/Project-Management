import React from 'react';
import { useApp } from '../context/AppContext';

const RequestChangeModal: React.FC = () => {
  const { state, dispatch } = useApp();
  if (!state.modals.requestChange) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Request Change</h2>
        <p className="text-slate-600 mb-4">Request change modal placeholder.</p>
        <button onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'requestChange' })} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Close</button>
      </div>
    </div>
  );
};
export default RequestChangeModal;
