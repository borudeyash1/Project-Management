import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, MessageSquare, Bell } from 'lucide-react';

const NotificationsPanel = () => {
  const { state, dispatch } = useApp();
  if (!state.modals.notifications) return null;

  const close = () => dispatch({ type: 'TOGGLE_MODAL', payload: 'notifications' });

  const items = Array.from({ length: 24 }).map((_, i) => ({
    id: i + 1,
    type: i % 3 === 0 ? 'task' : i % 3 === 1 ? 'message' : 'system',
    title: i % 3 === 0 ? `Task updated #${i+1}` : i % 3 === 1 ? `New comment on Sprint ${Math.ceil((i+1)/3)}` : `System notice ${i+1}`,
    info: i % 3 === 0 ? 'Status changed to In Progress' : i % 3 === 1 ? '“Please review the API spec.”' : 'Maintenance scheduled tonight',
    time: `${(i%12)+1}:${(i*7)%60}`.padStart(5, '0') + (i%2 ? ' PM' : ' AM')
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/40">
      <div className="w-full max-w-md bg-white border border-border rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <div className="text-[16px] font-semibold tracking-tight">Notifications</div>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-100" onClick={close}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-auto divide-y divide-border">
          {items.map((n) => (
            <div key={n.id} className="p-3 flex items-start gap-3">
              {n.type === 'task' && <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600" />}
              {n.type === 'message' && <MessageSquare className="w-4 h-4 mt-0.5 text-blue-600" />}
              {n.type === 'system' && <Bell className="w-4 h-4 mt-0.5 text-yellow-600" />}
              <div className="flex-1">
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-slate-600">{n.info}</div>
              </div>
              <div className="text-[11px] text-slate-500 whitespace-nowrap">{n.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;


