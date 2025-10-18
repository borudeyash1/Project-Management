import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Download, FileText, BarChart2, Calendar } from 'lucide-react';

const ExportReportsModal = () => {
  const { state, dispatch } = useApp();
  const [format, setFormat] = useState('pdf');
  const [range, setRange] = useState('this_month');
  const [include, setInclude] = useState({ performance: true, budget: true, timesheets: true });

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };
  const close = () => dispatch({ type: 'TOGGLE_MODAL', payload: 'exportReports' });
  if (!state.modals.exportReports) return null;

  const exportNow = () => {
    showToast(`Exported ${format.toUpperCase()} report`, 'success');
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Export Reports</h2>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Performance, Budget, Timesheets
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-100" onClick={close}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Date Range</label>
            <select 
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={include.performance} onChange={(e) => setInclude(p => ({...p, performance: e.target.checked}))} />
              Performance Metrics
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={include.budget} onChange={(e) => setInclude(p => ({...p, budget: e.target.checked}))} />
              Budget Summary
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={include.timesheets} onChange={(e) => setInclude(p => ({...p, timesheets: e.target.checked}))} />
              Timesheets
            </label>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Format</label>
            <div className="flex items-center gap-2">
              {['pdf','csv','xlsx'].map(f => (
                <button key={f} className={`px-3 py-2 rounded-lg border text-sm ${format===f?'bg-yellow-100 border-yellow-300':'border-border hover:bg-slate-50'}`} onClick={() => setFormat(f)}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={close}>Cancel</button>
            <button className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500 flex items-center gap-2" onClick={exportNow}>
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReportsModal;



