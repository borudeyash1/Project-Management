import React, { useMemo, useState } from 'react';
import { BarChart2, TrendingUp, CheckCircle, AlertTriangle, Clock3, Target, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TrackerSection = () => {
  const { state } = useApp();
  const [window, setWindow] = useState('This Week');
  const [status, setStatus] = useState('All');

  // Derive progress stats from global tasks (prototype)
  const seed = (state.tasks && state.tasks.length ? state.tasks : [
    { id: 201, title: 'Landing page polish', status: 'In Progress', project: 'Website', category: 'UI' },
    { id: 202, title: 'Core API rate limit', status: 'To Do', project: 'Platform', category: 'Backend' },
    { id: 203, title: 'User survey round 2', status: 'Done', project: 'Research', category: 'UX' },
    { id: 204, title: 'Payment retries', status: 'In Progress', project: 'Billing', category: 'Backend' },
    { id: 205, title: 'Introduce feature flags', status: 'Backlog', project: 'Platform', category: 'DevEx' },
    { id: 206, title: 'Onboarding email series', status: 'To Do', project: 'Growth', category: 'Marketing' },
    { id: 207, title: 'Cache invalidation', status: 'Done', project: 'Platform', category: 'Ops' },
    { id: 208, title: 'Dark mode QA', status: 'In Progress', project: 'Website', category: 'QA' },
    { id: 209, title: 'k6 perf baseline', status: 'To Do', project: 'Platform', category: 'SRE' },
    { id: 210, title: 'Security headers audit', status: 'Backlog', project: 'Platform', category: 'Security' },
  ]);
  const [items, setItems] = useState(seed);
  const total = items.length;
  const done = items.filter(t => t.status === 'Done').length;
  const inProgress = items.filter(t => t.status === 'In Progress').length;
  const backlog = items.filter(t => t.status === 'Backlog' || t.status === 'To Do').length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const filtered = useMemo(() => {
    if (status === 'All') return items;
    if (status === 'Done') return items.filter(t => t.status === 'Done');
    if (status === 'In Progress') return items.filter(t => t.status === 'In Progress');
    if (status === 'Backlog') return items.filter(t => t.status === 'Backlog' || t.status === 'To Do');
    return items;
  }, [items, status]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header & window filter */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-slate-600" />
            <h3 className="text-[18px] tracking-tight font-semibold">Tracker</h3>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            {['Today','This Week','This Month'].map(w => (
              <button key={w} className={`px-3 py-1.5 rounded-md border text-sm ${window===w?'bg-yellow-100 border-yellow-400':'border-border hover:bg-slate-50'}`} onClick={()=>setWindow(w)}>{w}</button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs text-slate-500">Progress</div>
            <div className="text-xl font-semibold tracking-tight mt-1">{percent}%</div>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-2">
              <div className="h-2 rounded-full bg-emerald-500" style={{width: `${percent}%`}}></div>
            </div>
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
            <div className="text-xs text-slate-500 inline-flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Done</div>
            <div className="text-xl font-semibold tracking-tight mt-1">{done}</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs text-slate-500 inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> In Progress</div>
            <div className="text-xl font-semibold tracking-tight mt-1">{inProgress}</div>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <div className="text-xs text-slate-500 inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Backlog</div>
            <div className="text-xl font-semibold tracking-tight mt-1">{backlog}</div>
          </div>
        </div>
      </div>

      {/* Status filter & list */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-600" />
            <div className="text-sm font-medium">Tasks</div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            {['All','To Do','In Progress','Done','Backlog'].map(s => (
              <button key={s} className={`px-3 py-1.5 rounded-md border text-sm ${status===s?'bg-yellow-100 border-yellow-400':'border-border hover:bg-slate-50'}`} onClick={()=>setStatus(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className="mt-4 divide-y divide-border">
          {filtered.map(t => (
            <div key={t.id} className="py-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="text-xs text-slate-500">{t.project} • {t.category}</div>
              </div>
              <div className="flex items-center gap-2">
                <select className="text-xs px-2 py-1 rounded border border-border" value={t.status} onChange={(e)=>{
                  const v = e.target.value;
                  setItems(prev => prev.map(x=> x.id===t.id ? { ...x, status: v } : x));
                }}>
                  {['To Do','In Progress','Done','Backlog'].map(s => <option key={s}>{s}</option>)}
                </select>
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  t.status==='Done' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  t.status==='In Progress' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  t.status==='Backlog' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                  'bg-slate-50 border-border text-slate-600'
                }`}>{t.status}</span>
              </div>
            </div>
          ))}
          {filtered.length===0 && (
            <div className="py-6 text-xs text-slate-500">No tasks for the selected status.</div>
          )}
        </div>
      </div>

      {/* Velocity chart (weekly bars with average) */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium inline-flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Velocity</div>
          <div className="text-xs text-slate-500">Story points per week (demo)</div>
        </div>
        {(() => {
          const weeks = [
            { label: 'W-7', points: 12 },
            { label: 'W-6', points: 18 },
            { label: 'W-5', points: 15 },
            { label: 'W-4', points: 22 },
            { label: 'W-3', points: 19 },
            { label: 'W-2', points: 25 },
            { label: 'W-1', points: 28 },
            { label: 'Now', points: 24 },
          ];
          const max = Math.max(...weeks.map(w => w.points)) || 1;
          const avg = Math.round(weeks.reduce((s,w)=>s+w.points,0)/weeks.length);
          return (
            <div className="mt-4">
              <div className="relative h-40 border border-border rounded-lg p-3">
                {/* average line */}
                <div className="absolute left-3 right-3" style={{bottom: `${(avg/max)*100}%`}}>
                  <div className="h-[2px] bg-slate-300/80"></div>
                  <div className="text-[10px] text-slate-500 mt-1">Avg {avg} pts</div>
                </div>
                <div className="h-full flex items-end gap-3">
                  {weeks.map((w,i)=> (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end">
                      <div className={`w-full rounded-sm ${i%2? 'bg-sky-400':'bg-emerald-500'}`} style={{height:`${(w.points/max)*100}%`}} title={`${w.label}: ${w.points} pts`}></div>
                      <div className="text-[10px] text-slate-500 mt-1">{w.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default TrackerSection;


