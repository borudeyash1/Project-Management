import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Save } from 'lucide-react';

const ClientModal = () => {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({ name: '', email: '', contact: '', notes: '' });
  const close = () => dispatch({ type: 'TOGGLE_MODAL', payload: 'client' });
  const showToast = (m,t='info') => dispatch({ type: 'ADD_TOAST', payload: { message: m, type: t } });
  if (!state.modals.client) return null;

  const save = () => {
    if (!form.name) { showToast('Client name required', 'error'); return; }
    showToast('Client saved', 'success');
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Client</h2>
          <button className="p-2 rounded-lg hover:bg-slate-100" onClick={close}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Name</label>
            <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.name} onChange={(e)=>setForm(p=>({...p,name:e.target.value}))} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.email} onChange={(e)=>setForm(p=>({...p,email:e.target.value}))} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Contact</label>
            <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.contact} onChange={(e)=>setForm(p=>({...p,contact:e.target.value}))} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Notes</label>
            <textarea rows="2" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.notes} onChange={(e)=>setForm(p=>({...p,notes:e.target.value}))} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={close}>Cancel</button>
            <button className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500" onClick={save}>
              <Save className="w-4 h-4 mr-1 inline-block" /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;



