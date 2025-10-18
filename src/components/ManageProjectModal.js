import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, AlertTriangle, CheckCircle, Pause, Archive, Trash2 } from 'lucide-react';

const ManageProjectModal = () => {
  const { state, dispatch } = useApp();
  const [status, setStatus] = useState('Active');
  const [reason, setReason] = useState('');

  const close = () => dispatch({ type: 'TOGGLE_MODAL', payload: 'manageProject' });
  const showToast = (message, type = 'info') => dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  if (!state.modals.manageProject) return null;

  const apply = () => {
    showToast(`Project set to ${status}`, 'success');
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Manage Project</h2>
          <button className="p-2 rounded-lg hover:bg-slate-100" onClick={close}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {['Draft','Active','Paused','Finished','Abandoned','Archived'].map(s => (
                <button key={s} className={`px-3 py-2 rounded-lg border text-sm ${status===s?'bg-yellow-100 border-yellow-300':'border-border hover:bg-slate-50'}`} onClick={() => setStatus(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Reason/Notes</label>
            <textarea rows="3" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" value={reason} onChange={(e)=>setReason(e.target.value)} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={close}>Cancel</button>
            <button className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500" onClick={apply}>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProjectModal;



