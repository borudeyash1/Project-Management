import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

const RequestChangeModal = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    type: 'Deadline change',
    fromDate: '',
    toDate: '',
    reason: '',
    notifyStakeholders: false
  });

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const toggleModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'requestChange' });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = () => {
    toggleModal();
    showToast('Request submitted', 'success');
  };

  if (!state.modals.requestChange) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={toggleModal}></div>
      <div className="relative w-full max-w-lg bg-white rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-[18px] font-semibold tracking-tight">Request change</h3>
          <button 
            className="p-2 rounded-md hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
            onClick={toggleModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Type</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option>Deadline change</option>
              <option>Workload change</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">From</label>
              <input 
                type="date" 
                name="fromDate"
                value={formData.fromDate}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">To</label>
              <input 
                type="date" 
                name="toDate"
                value={formData.toDate}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Reason</label>
            <textarea 
              rows="3" 
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm" 
              placeholder="Provide context..."
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              name="notifyStakeholders"
              checked={formData.notifyStakeholders}
              onChange={handleInputChange}
              className="peer sr-only" 
            />
            <span className="relative inline-flex h-5 w-9 rounded-full bg-slate-200 transition-colors peer-checked:bg-yellow-500">
              <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-all peer-checked:left-4"></span>
            </span>
            Notify stakeholders
          </label>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2">
          <button 
            className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
            onClick={toggleModal}
          >
            Cancel
          </button>
          <button 
            className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestChangeModal;
