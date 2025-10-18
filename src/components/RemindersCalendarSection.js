import React, { useMemo, useState } from 'react';
import { Check, Bell, Repeat, AlarmClock, CalendarClock, Clock, Filter, Plus, Pencil, Trash2, CornerDownRight } from 'lucide-react';

const RemindersCalendarSection = () => {
  const [reminders, setReminders] = useState([
    { id: 1, title: 'Submit timesheet', at: new Date(Date.now()+60*60*1000), type: 'Task', project: 'Ops', priority: 'High', recurring: false, status: 'Active' },
    { id: 2, title: 'Sprint planning', at: new Date(Date.now()+24*60*60*1000), type: 'Event', project: 'Platform', priority: 'Medium', recurring: false, status: 'Active' },
    { id: 3, title: 'Pay invoices', at: new Date(Date.now()+3*24*60*60*1000), type: 'Custom', project: 'Finance', priority: 'Low', recurring: true, status: 'Active' },
    { id: 4, title: 'Follow up with Beta users', at: new Date(Date.now()-2*60*60*1000), type: 'Task', project: 'Growth', priority: 'High', recurring: false, status: 'Active' },
    { id: 5, title: 'Quarterly review', at: new Date(Date.now()+8*24*60*60*1000), type: 'Event', project: 'Leadership', priority: 'Medium', recurring: false, status: 'Active' },
    { id: 6, title: 'Database backup audit', at: new Date(Date.now()+2*60*60*1000), type: 'Task', project: 'Ops', priority: 'High', recurring: true, status: 'Active' },
    { id: 7, title: 'Legal contract renewal', at: new Date(Date.now()+10*24*60*60*1000), type: 'Custom', project: 'Legal', priority: 'Medium', recurring: false, status: 'Active' },
    { id: 8, title: 'Design review', at: new Date(Date.now()+5*24*60*60*1000), type: 'Event', project: 'Website', priority: 'Low', recurring: false, status: 'Active' },
    { id: 9, title: 'Incident drill', at: new Date(Date.now()+6*24*60*60*1000), type: 'Event', project: 'SRE', priority: 'High', recurring: false, status: 'Active' },
    { id: 10, title: 'Customer webinar', at: new Date(Date.now()+12*24*60*60*1000), type: 'Event', project: 'Marketing', priority: 'Medium', recurring: false, status: 'Active' },
    { id: 11, title: 'Renew SSL', at: new Date(Date.now()+14*24*60*60*1000), type: 'Task', project: 'Ops', priority: 'High', recurring: false, status: 'Active' },
    { id: 12, title: 'Design system sync', at: new Date(Date.now()+9*24*60*60*1000), type: 'Event', project: 'Website', priority: 'Low', recurring: true, status: 'Active' },
  ]);
  const [filters, setFilters] = useState({ date: 'Today', type: 'All', project: 'All', status: 'Active', startDate: '', endDate: '' });
  const [form, setForm] = useState({ title: '', date: '', time: '', repeat: 'None', type: 'Task', project: '', priority: 'Medium', channel: 'In-app' });

  const toggleDone = (id) => setReminders(rs => rs.map(r => r.id===id? { ...r, status: r.status === 'Completed' ? 'Active' : 'Completed' } : r));
  const snooze = (id, minutes) => setReminders(rs => rs.map(r => r.id===id? { ...r, at: new Date(r.at.getTime() + minutes*60*1000) } : r));
  const remove = (id) => setReminders(rs => rs.filter(r => r.id!==id));
  const reschedule = (id, date) => setReminders(rs => rs.map(r => r.id===id? { ...r, at: date } : r));
  const create = () => {
    if (!form.title || !form.date || !form.time) return;
    const at = new Date(`${form.date}T${form.time}`);
    const recurring = form.repeat !== 'None';
    const next = { id: Date.now(), title: form.title, at, type: form.type, project: form.project || 'General', priority: form.priority, recurring, status: 'Active' };
    setReminders([next, ...reminders]);
    setForm({ title: '', date: '', time: '', repeat: 'None', type: 'Task', project: '', priority: 'Medium', channel: 'In-app' });
  };

  const now = new Date();
  const endOfToday = new Date(now); endOfToday.setHours(23,59,59,999);
  const endOfWeek = new Date(now); endOfWeek.setDate(now.getDate() + (6 - ((now.getDay()+6)%7))); endOfWeek.setHours(23,59,59,999);

  const byFilters = useMemo(() => reminders.filter(r => {
    if (filters.status !== 'All' && r.status !== filters.status) return false;
    if (filters.type !== 'All' && r.type !== filters.type) return false;
    if (filters.project !== 'All' && r.project !== filters.project) return false;
    if (filters.date === 'Today') {
      const start = new Date(now.getFullYear(),now.getMonth(),now.getDate());
      return (r.at <= endOfToday && r.at >= start);
    }
    if (filters.date === 'This Week') {
      const start = new Date(now.getFullYear(),now.getMonth(),now.getDate());
      return (r.at <= endOfWeek && r.at >= start);
    }
    if (filters.date === 'Later') {
      return r.at > endOfWeek;
    }
    if (filters.date === 'Range') {
      if (!filters.startDate || !filters.endDate) return true; // wait until both dates set
      const start = new Date(filters.startDate + 'T00:00:00');
      const end = new Date(filters.endDate + 'T23:59:59');
      return r.at >= start && r.at <= end;
    }
    return true;
  }), [reminders, filters, endOfToday, endOfWeek, now]);

  const groups = useMemo(() => {
    const today = [];
    const week = [];
    const later = [];
    byFilters.forEach(r => {
      if (r.at <= endOfToday) today.push(r);
      else if (r.at <= endOfWeek) week.push(r);
      else later.push(r);
    });
    const sort = (arr) => arr.sort((a,b)=> a.at - b.at);
    return { today: sort(today), week: sort(week), later: sort(later) };
  }, [byFilters]);

  const badgeFor = (r) => {
    const overdue = r.at < now && r.status !== 'Completed';
    const soon = r.at >= now && (r.at - now) < 2*60*60*1000;
    if (overdue) return 'bg-rose-50 text-rose-600 border-rose-200';
    if (soon) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-border';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div id="reminders" className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] tracking-tight font-semibold">Reminders</h3>
          <button className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500 hover:bg-yellow-600 inline-flex items-center gap-1" onClick={create}><Plus className="w-4 h-4"/> Quick Add</button>
        </div>

          {/* Create Reminder */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <input className="col-span-2 rounded-md border border-border px-3 py-2" placeholder="Title / Description" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            <input className="rounded-md border border-border px-3 py-2" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
            <input className="rounded-md border border-border px-3 py-2" type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} />
            <select className="rounded-md border border-border px-3 py-2" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              {['Task','Event','Custom'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input className="rounded-md border border-border px-3 py-2" placeholder="Linked Project (optional)" value={form.project} onChange={e=>setForm({...form,project:e.target.value})} />
            <select className="rounded-md border border-border px-3 py-2" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
              {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="rounded-md border border-border px-3 py-2" value={form.repeat} onChange={e=>setForm({...form,repeat:e.target.value})}>
              {['None','Daily','Weekly','Monthly','Custom'].map(r => <option key={r}>{r}</option>)}
            </select>
            <select className="rounded-md border border-border px-3 py-2" value={form.channel} onChange={e=>setForm({...form,channel:e.target.value})}>
              {['In-app','Push','Email'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

        {/* Filters */}
        <div className="mt-4 flex items-center gap-2 text-xs flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          <select className="rounded-md border border-border px-2 py-1" value={filters.date} onChange={e=>setFilters({...filters,date:e.target.value})}>
            {['Today','This Week','Later','Range','All'].map(o => <option key={o}>{o}</option>)}
          </select>
          {filters.date === 'Range' && (
            <>
              <input className="rounded-md border border-border px-2 py-1" type="date" value={filters.startDate} onChange={e=>setFilters({...filters,startDate:e.target.value})} />
              <span className="text-slate-500">to</span>
              <input className="rounded-md border border-border px-2 py-1" type="date" value={filters.endDate} onChange={e=>setFilters({...filters,endDate:e.target.value})} />
            </>
          )}
          <select className="rounded-md border border-border px-2 py-1" value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})}>
            {['All','Task','Event','Custom'].map(o => <option key={o}>{o}</option>)}
          </select>
          <select className="rounded-md border border-border px-2 py-1" value={filters.project} onChange={e=>setFilters({...filters,project:e.target.value})}>
            {['All','Ops','Platform','Finance','Growth','Leadership','General','Legal','Website'].map(o => <option key={o}>{o}</option>)}
          </select>
          <select className="rounded-md border border-border px-2 py-1" value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>
            {['Active','Snoozed','Completed','All'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

          {/* Upcoming Groups */}
          <div className="mt-4 space-y-4">
            {[
              { key: 'today', label: 'Today', icon: <AlarmClock className="w-4 h-4"/> },
              { key: 'week', label: 'This Week', icon: <CalendarClock className="w-4 h-4"/> },
              { key: 'later', label: 'Later', icon: <Clock className="w-4 h-4"/> },
            ].map(g => (
              <div key={g.key}>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2 inline-flex items-center gap-2">{g.icon} {g.label}</div>
                <div className="space-y-3">
                  {groups[g.key].map(r => (
                    <div key={r.id} className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <button 
                          className={`h-5 w-5 rounded-md border flex items-center justify-center ${r.status==='Completed'?'bg-emerald-50 border-emerald-200':''}`}
                          onClick={()=>toggleDone(r.id)}
                        >
                          <Check className={`w-4 h-4 ${r.status==='Completed'?'opacity-100':'opacity-0'}`} />
                        </button>
                        <div>
                          <div className="text-sm font-medium inline-flex items-center gap-1">
                            <Bell className="w-4 h-4 text-slate-500"/> {r.title}
                            {r.recurring && <Repeat className="w-3.5 h-3.5 text-slate-500"/>}
                          </div>
                          <div className="text-xs text-slate-500">
                            {r.at.toLocaleString()} <span className="mx-1">•</span> {r.type} <span className="mx-1">•</span> {r.project}
                          </div>
                          <div className="mt-1 inline-flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeFor(r)}`}>{r.status === 'Completed' ? 'Completed' : (r.at < now ? 'Overdue' : 'Scheduled')}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              r.priority==='High'?'bg-rose-50 text-rose-700 border-rose-200':
                              r.priority==='Medium'?'bg-amber-50 text-amber-700 border-amber-200':'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>{r.priority}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="text-xs px-2 py-1 rounded border border-border hover:bg-slate-50" onClick={()=>snooze(r.id,10)}>Snooze 10m</button>
                        <button className="text-xs px-2 py-1 rounded border border-border hover:bg-slate-50" onClick={()=>snooze(r.id,60)}>1h</button>
                        <button className="text-xs px-2 py-1 rounded border border-border hover:bg-slate-50" onClick={()=>snooze(r.id,60*24)}>1d</button>
                        <button className="text-xs px-2 py-1 rounded border border-border hover:bg-slate-50" onClick={()=>reschedule(r.id, new Date(Date.now()+2*60*60*1000))}><CornerDownRight className="w-3.5 h-3.5 inline mr-1"/>Reschedule</button>
                        <button className="text-xs px-2 py-1 rounded border border-amber-200 text-amber-700 hover:bg-amber-50"><Pencil className="w-3.5 h-3.5 inline mr-1"/>Edit</button>
                        <button className="text-xs px-2 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50" onClick={()=>remove(r.id)}><Trash2 className="w-3.5 h-3.5 inline mr-1"/>Delete</button>
                      </div>
                    </div>
                  ))}
                  {groups[g.key].length===0 && (
                    <div className="text-xs text-slate-500">No reminders.</div>
                  )}
                </div>
              </div>
            ))}
          </div>

        {/* Notification Settings (prototype) */}
        <div className="mt-5 border-t border-border pt-4">
          <div className="text-sm font-medium mb-2">Notification Settings</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <select className="rounded-md border border-border px-3 py-2" defaultValue="10m before">
              {['5m before','10m before','30m before','1h before'].map(x=> <option key={x}>{x}</option>)}
            </select>
            <select className="rounded-md border border-border px-3 py-2" defaultValue="In-app">
              {['In-app','Push','Email'].map(x=> <option key={x}>{x}</option>)}
            </select>
            <div className="col-span-2 text-xs text-slate-500">Do Not Disturb: 10pm – 7am</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemindersCalendarSection;


