import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Clock, Send } from 'lucide-react';

const TimesheetModal = () => {
  const { state, dispatch } = useApp();
  const [entry, setEntry] = useState({ date: '', hours: '', task: '', notes: '' });
  const [log, setLog] = useState([
    { id: 1, date: '2024-10-22', hours: 3.5, task: 'Responsive layout', notes: '' },
    { id: 2, date: '2024-10-23', hours: 2, task: 'API integration', notes: 'Auth' }
  ]);

  const close = () => dispatch({ type: 'TOGGLE_MODAL', payload: 'timesheet' });
  const showToast = (m,t='info') => dispatch({ type: 'ADD_TOAST', payload: { message: m, type: t } });
  if (!state.modals.timesheet) return null;

  const add = () => {
    if (!entry.date || !entry.hours) { showToast('Date and hours required', 'error'); return; }
    setLog(prev => [...prev, { id: Date.now(), ...entry, hours: parseFloat(entry.hours) }]);
    setEntry({ date: '', hours: '', task: '', notes: '' });
    showToast('Time logged', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Timesheet</h2>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Log billable hours per task
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-100" onClick={close}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Date</label>
              <input type="date" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={entry.date} onChange={(e)=>setEntry(p=>({...p,date:e.target.value}))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Hours</label>
              <input type="number" step="0.25" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={entry.hours} onChange={(e)=>setEntry(p=>({...p,hours:e.target.value}))} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1">Task</label>
              <input type="text" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={entry.task} onChange={(e)=>setEntry(p=>({...p,task:e.target.value}))} placeholder="Task name" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1">Notes</label>
              <textarea rows="2" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={entry.notes} onChange={(e)=>setEntry(p=>({...p,notes:e.target.value}))} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={add}>
              <Clock className="w-4 h-4 mr-1 inline-block" /> Log Time
            </button>
          </div>

          <div className="rounded-lg border border-border">
            <div className="px-4 py-3 border-b border-border font-medium">Recent Entries</div>
            <div className="p-3 space-y-2 max-h-40 overflow-auto">
              {log.map((r)=> (
                <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <div className="text-sm">
                    <div className="font-medium">{r.task || 'General'}</div>
                    <div className="text-xs text-slate-500">{r.date} • {r.hours}h</div>
                  </div>
                  <div className="text-xs text-slate-500 max-w-[50%] truncate">{r.notes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetModal;



