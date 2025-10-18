import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, DollarSign, Users, FileText } from 'lucide-react';

const PayrollModal = () => {
  const { state, dispatch } = useApp();

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const close = () => dispatch({ type: 'TOGGLE_MODAL', payload: 'payroll' });
  if (!state.modals.payroll) return null;

  const period = { month: 'October 2024', start: '2024-10-01', end: '2024-10-31' };
  const summary = { employees: 12, gross: 24500, deductions: 3200, net: 21300 };
  const employees = [
    { name: 'Alex Johnson', role: 'Project Manager', gross: 3200, deductions: 450, net: 2750 },
    { name: 'Priya Patel', role: 'Frontend Developer', gross: 2800, deductions: 350, net: 2450 },
    { name: 'Sam Wilson', role: 'Backend Developer', gross: 2900, deductions: 375, net: 2525 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Payroll</h2>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {period.month} • {period.start} – {period.end}
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-100" onClick={close}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)] space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-slate-500">Employees</div>
              <div className="text-xl font-semibold mt-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" /> {summary.employees}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-slate-500">Gross</div>
              <div className="text-xl font-semibold mt-1 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> {summary.gross.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-slate-500">Deductions</div>
              <div className="text-xl font-semibold mt-1">-{summary.deductions.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs text-slate-500">Net</div>
              <div className="text-xl font-semibold mt-1">{summary.net.toLocaleString()}</div>
            </div>
          </div>

          <div className="rounded-lg border border-border">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="font-medium">Employee Payouts</div>
              <button 
                className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm flex items-center gap-2"
                onClick={() => showToast('Payslips generated and sent', 'success')}
              >
                <FileText className="w-4 h-4" /> Generate Payslips
              </button>
            </div>
            <div className="p-3 overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="text-slate-600">
                  <tr className="border-b border-border">
                    <th className="text-left font-medium py-2 pr-3">Employee</th>
                    <th className="text-left font-medium py-2 pr-3">Role</th>
                    <th className="text-right font-medium py-2 pr-3">Gross</th>
                    <th className="text-right font-medium py-2 pr-3">Deductions</th>
                    <th className="text-right font-medium py-2 pr-3">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {employees.map((e, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-3">{e.name}</td>
                      <td className="py-2 pr-3">{e.role}</td>
                      <td className="py-2 pr-3 text-right">{e.gross.toLocaleString()}</td>
                      <td className="py-2 pr-3 text-right">-{e.deductions.toLocaleString()}</td>
                      <td className="py-2 pr-3 text-right">{e.net.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollModal;



