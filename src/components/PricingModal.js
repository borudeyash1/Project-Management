import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ListChecks, Sparkles, Building2 } from 'lucide-react';

const PricingModal = () => {
  const { state, dispatch } = useApp();

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const toggleModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'pricing' });
  };

  if (!state.modals.pricing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={toggleModal}></div>
      <div className="relative w-full max-w-3xl bg-white rounded-xl border border-border shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-[22px] tracking-tight font-semibold">Upgrade to unlock views</h3>
          <button 
            className="p-2 rounded-md hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
            onClick={toggleModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4 p-6">
          <div className="rounded-lg border border-border p-4 bg-white">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold tracking-tight">Starter</h4>
            </div>
            <p className="text-sm text-slate-600 mt-2">List view, reminders, basic reports.</p>
            <div className="mt-4">
              <span className="text-2xl font-semibold tracking-tight">$0</span>
              <span className="text-sm text-slate-500">/mo</span>
            </div>
            <button 
              className="mt-4 w-full px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => showToast('Free plan active', 'info')}
            >
              Current
            </button>
          </div>
          <div className="rounded-lg border border-border p-4 bg-white ring-1 ring-yellow-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple" />
              <h4 className="font-semibold tracking-tight">Pro</h4>
            </div>
            <p className="text-sm text-slate-600 mt-2">Kanban, Calendar, Gantt, analytics.</p>
            <div className="mt-4">
              <span className="text-2xl font-semibold tracking-tight">$9</span>
              <span className="text-sm text-slate-500">/user/mo</span>
            </div>
            <button 
              className="mt-4 w-full px-3 py-2 rounded-lg text-white hover:opacity-95 text-sm bg-yellow-500"
              onClick={() => {
                showToast('Free trial started', 'success');
                toggleModal();
              }}
            >
              Start free trial
            </button>
            <p className="text-xs text-slate-500 mt-2">7-day free trial. No card required.</p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-white">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal" />
              <h4 className="font-semibold tracking-tight">Business</h4>
            </div>
            <p className="text-sm text-slate-600 mt-2">SSO, permissions, advanced reporting.</p>
            <div className="mt-4">
              <span className="text-2xl font-semibold tracking-tight">$19</span>
              <span className="text-sm text-slate-500">/user/mo</span>
            </div>
            <button 
              className="mt-4 w-full px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => showToast('We will reach out shortly', 'success')}
            >
              Contact sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
