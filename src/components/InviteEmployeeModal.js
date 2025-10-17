import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send } from 'lucide-react';

const InviteEmployeeModal = () => {
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');

  const close = () => dispatch({ type: 'TOGGLE_MODAL', payload: 'inviteEmployee' });
  const showToast = (m,t='info') => dispatch({ type: 'ADD_TOAST', payload: { message: m, type: t } });
  if (!state.modals.inviteEmployee) return null;

  const sendInvite = () => {
    if (!email) { showToast('Enter an email', 'error'); return; }
    showToast(`Invite sent to ${email} as ${role}`, 'success');
    setEmail('');
    setRole('Member');
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Invite Employee</h2>
          <button className="p-2 rounded-lg hover:bg-slate-100" onClick={close}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="name@company.com" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Role</label>
            <select className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={role} onChange={(e)=>setRole(e.target.value)}>
              <option>Member</option>
              <option>Project Manager</option>
              <option>Accountant</option>
              <option>Developer</option>
              <option>Designer</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={close}>Cancel</button>
            <button className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500" onClick={sendInvite}>
              <Send className="w-4 h-4 mr-1 inline-block" /> Send Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteEmployeeModal;



