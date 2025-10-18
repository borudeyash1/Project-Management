import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MoreHorizontal, 
  Check, 
  Calendar as CalendarIcon,
  RefreshCw,
  Plus,
  Clock,
  Repeat,
  Pin,
  ListPlus,
  Filter,
  Tag,
  SortAsc,
  Focus,
  Timer,
  Target,
  BarChart3
} from 'lucide-react';

const PlannerSection = () => {
  const { dispatch } = useApp();
  const showToast = (message, type = 'info') => dispatch({ type: 'ADD_TOAST', payload: { message, type } });

  const [viewMode, setViewMode] = useState('weekly');
  const [focusMode, setFocusMode] = useState(false);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);

  // Dummy planner data
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design hero section', due: 'Today', priority: 'High', status: 'In Progress', pinned: true, recurring: false, tags: ['UI'] },
    { id: 2, title: 'Write test cases', due: 'Tomorrow', priority: 'Medium', status: 'To Do', pinned: false, recurring: true, tags: ['QA'] },
    { id: 3, title: 'Team retro notes', due: 'Fri', priority: 'Low', status: 'To Do', pinned: false, recurring: false, tags: ['Docs'] },
    { id: 4, title: 'API integration', due: 'This week', priority: 'High', status: 'In Progress', pinned: false, recurring: false, tags: ['Backend'] },
    { id: 5, title: 'Set up monitoring dashboards', due: 'This month', priority: 'Medium', status: 'To Do', pinned: false, recurring: false, tags: ['Ops'] },
    { id: 6, title: 'Prepare launch email', due: 'Mon', priority: 'High', status: 'To Do', pinned: true, recurring: false, tags: ['Marketing'] },
    { id: 7, title: 'Refactor auth module', due: 'Wed', priority: 'Low', status: 'Backlog', pinned: false, recurring: false, tags: ['Backend'] },
    { id: 8, title: 'Polish animations', due: 'Today', priority: 'Low', status: 'To Do', pinned: false, recurring: false, tags: ['UI'] },
    { id: 9, title: 'Customer interview', due: 'Thu', priority: 'Medium', status: 'In Progress', pinned: false, recurring: true, tags: ['Research'] },
    { id: 10, title: 'Security review', due: 'Next week', priority: 'High', status: 'To Do', pinned: false, recurring: false, tags: ['Security'] },
    { id: 11, title: 'Sync calendar', due: 'Today', priority: 'Low', status: 'To Do', pinned: false, recurring: false, tags: ['Ops'] },
    { id: 12, title: 'Draft release notes', due: 'Fri', priority: 'Medium', status: 'In Progress', pinned: false, recurring: false, tags: ['Docs'] },
    { id: 13, title: 'Bug triage', due: 'Today', priority: 'High', status: 'Backlog', pinned: false, recurring: true, tags: ['Bug'] },
    { id: 14, title: 'Design QA checklist', due: 'Thu', priority: 'Medium', status: 'To Do', pinned: false, recurring: false, tags: ['QA'] },
    { id: 15, title: 'Improve lighthouse score', due: 'Next week', priority: 'High', status: 'To Do', pinned: true, recurring: false, tags: ['Frontend'] }
  ]);
  const [checklist, setChecklist] = useState([
    { id: 'c1', text: 'Confirm stakeholder list', done: false },
    { id: 'c2', text: 'Draft OKRs', done: true },
    { id: 'c3', text: 'Book sprint demo', done: false },
    { id: 'c4', text: 'Create test plan', done: false },
    { id: 'c5', text: 'Sync with marketing', done: false },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterTag, setFilterTag] = useState('All');

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      (filterPriority === 'All' || t.priority === filterPriority) &&
      (filterStatus === 'All' || t.status === filterStatus) &&
      (filterTag === 'All' || (t.tags || []).includes(filterTag))
    ).filter(t => (focusMode ? t.status !== 'Done' : true));
  }, [tasks, filterPriority, filterStatus, filterTag, focusMode]);

  const addTask = () => {
    const title = newTaskTitle.trim();
    if (!title) {
      showToast('Enter a task title', 'warning');
      return;
    }
    const task = { id: Date.now(), title, due: 'Today', priority: 'Medium', status: 'To Do', pinned: false, recurring: false, tags: [] };
    setTasks([task, ...tasks]);
    setNewTaskTitle('');
    showToast('Task added', 'success');
  };

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'Done' ? 'To Do' : 'Done' } : t));
  };

  const pinTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));
  };

  const toggleRecurring = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, recurring: !t.recurring } : t));
  };

  const setReminder = (id) => {
    const task = tasks.find(t => t.id === id);
    showToast(`Reminder set for "${task?.title}"`, 'info');
  };

  const addSubtask = (id) => {
    showToast('Subtask dialog (prototype)', 'info');
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    showToast('Task removed', 'warning');
  };
  const priorityColor = (p) => (
    p === 'High' ? 'bg-rose-100 border-rose-200 text-rose-700' :
    p === 'Medium' ? 'bg-amber-100 border-amber-200 text-amber-700' :
    'bg-emerald-100 border-emerald-200 text-emerald-700'
  );

  const statusOptions = ['To Do','In Progress','Done'];
  const priorityOptions = ['High','Medium','Low'];


  const toggleChecklist = (cid) => {
    setChecklist(checklist.map(c => c.id === cid ? { ...c, done: !c.done } : c));
  };

  // Add checklist item
  const [newChecklist, setNewChecklist] = useState('');
  const addChecklist = () => {
    const text = newChecklist.trim();
    if (!text) return;
    setChecklist([{ id: 'c'+Date.now(), text, done: false }, ...checklist]);
    setNewChecklist('');
    showToast('Checklist item added', 'success');
  };

  // Pomodoro timer effect (prototype)
  useEffect(() => {
    if (!pomodoroRunning) return;
    const id = setInterval(() => {
      setPomodoroSeconds(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setPomodoroRunning(false);
          showToast('Pomodoro finished. Take a short break!', 'success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pomodoroRunning]);

  const toggleCheck = (e) => {
    const icon = e.target.querySelector('i') || e.target;
    if (!icon) return;
    const isOn = icon.classList.contains('opacity-100');
    icon.classList.toggle('opacity-100', !isOn);
    icon.classList.toggle('opacity-0', isOn);
    e.target.classList.toggle('bg-emerald-50', !isOn);
    e.target.classList.toggle('border-emerald-200', !isOn);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Row: Quick Views & Calendar / Controls */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Quick Views */}
        <div className="xl:col-span-4 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Quick Views</h3>
            <button className="text-slate-500 hover:text-slate-900"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-slate-500">Today</div>
              <div className="text-xl font-semibold tracking-tight mt-1">4</div>
              <div className="text-[11px] text-slate-500 mt-1">Tasks & events</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-slate-500">This Week</div>
              <div className="text-xl font-semibold tracking-tight mt-1">12</div>
              <div className="text-[11px] text-slate-500 mt-1">Planned items</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-slate-500">Upcoming</div>
              <div className="text-xl font-semibold tracking-tight mt-1">8</div>
              <div className="text-[11px] text-slate-500 mt-1">Beyond this week</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-rose-600">Overdue</div>
              <div className="text-xl font-semibold tracking-tight mt-1 text-rose-600">2</div>
              <div className="text-[11px] text-slate-500 mt-1">Missed deadlines</div>
            </div>
          </div>
        </div>

        {/* Calendar / Sync / View modes */}
        <div className="xl:col-span-8 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Calendar</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm inline-flex items-center gap-1">
                <RefreshCw className="w-4 h-4" /> Sync
              </button>
              <button className={`px-3 py-2 rounded-lg border border-border text-sm ${viewMode==='daily'?'bg-yellow-100':''}`} onClick={() => setViewMode('daily')}>Daily</button>
              <button className={`px-3 py-2 rounded-lg border border-border text-sm ${viewMode==='weekly'?'bg-yellow-100':''}`} onClick={() => setViewMode('weekly')}>Weekly</button>
              <button className={`px-3 py-2 rounded-lg border border-border text-sm ${viewMode==='monthly'?'bg-yellow-100':''}`} onClick={() => setViewMode('monthly')}>Monthly</button>
            </div>
          </div>
          {/* Mini calendar widget (static grid for prototype) */}
          <div className="mt-4 grid grid-cols-7 gap-2 text-center">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
              <div key={d} className="text-xs text-slate-500">{d}</div>
            ))}
            {Array.from({length: 28}).map((_,i) => (
              <button key={i} className={`h-10 rounded-lg border text-xs ${i===12?'bg-yellow-100 border-yellow-400':'border-border hover:bg-slate-50'}`}>{i+1}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Task Summary & Filters */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Task Summary */}
        <div className="xl:col-span-8 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-[18px] tracking-tight font-semibold">Task Summary</h3>
            <div className="flex items-center gap-2">
              <input 
                className="px-3 py-2 rounded-lg border border-border text-sm"
                placeholder="Add a task..."
                value={newTaskTitle}
                onChange={(e)=>setNewTaskTitle(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter') addTask(); }}
              />
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm inline-flex items-center gap-1" onClick={addTask}><Plus className="w-4 h-4" /> Add Task</button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Priority</span>
              <select className="px-2 py-1 rounded-md border border-border text-xs" value={filterPriority} onChange={(e)=>setFilterPriority(e.target.value)}>
                {['All','High','Medium','Low'].map(p=> <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Status</span>
              <select className="px-2 py-1 rounded-md border border-border text-xs" value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}>
                {['All','To Do','In Progress','Done'].map(s=> <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Tag</span>
              <select className="px-2 py-1 rounded-md border border-border text-xs" value={filterTag} onChange={(e)=>setFilterTag(e.target.value)}>
                {['All','UI','Backend','QA','Docs'].map(t=> <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Task lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg border border-border p-3">
              <div className="text-sm font-medium">My Tasks</div>
              <ul className="mt-2 space-y-2 text-sm">
                {filteredTasks.map(t => (
                  <li key={t.id} className={`rounded-md border ${t.pinned?'border-primary':'border-border'} p-2`}> 
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <button className="h-4 w-4 rounded border border-border flex items-center justify-center" onClick={()=>toggleTaskStatus(t.id)}>
                          {t.status==='Done' ? <Check className="w-3 h-3" /> : null}
                        </button>
                        <span className={`truncate ${t.status==='Done'?'line-through text-slate-400':''}`}>{t.title}</span>
                        {t.recurring && <Repeat className="w-3.5 h-3.5 text-slate-500" />}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${priorityColor(t.priority)}`}>{t.priority}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-50 border border-border text-slate-600">{t.due}</span>
                        {t.tags?.map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 border border-border">{tag}</span>)}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <select className="text-xs px-2 py-1 rounded border border-border" value={t.status} onChange={(e)=>setTasks(tasks.map(x=>x.id===t.id?{...x,status:e.target.value}:x))}>
                          {statusOptions.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <select className="text-xs px-2 py-1 rounded border border-border" value={t.priority} onChange={(e)=>setTasks(tasks.map(x=>x.id===t.id?{...x,priority:e.target.value}:x))}>
                          {priorityOptions.map(p => <option key={p}>{p}</option>)}
                        </select>
                        <button className="text-xs px-2 py-1 rounded border border-border hover:bg-slate-50" onClick={()=>pinTask(t.id)}>{t.pinned?'Unpin':'Pin'}</button>
                        <button className="text-xs px-2 py-1 rounded border border-border hover:bg-slate-50" onClick={()=>setReminder(t.id)}>Remind</button>
                        <button className="text-xs px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50" onClick={()=>removeTask(t.id)}>Delete</button>
                      </div>
                    </div>
                  </li>
                ))}
                {filteredTasks.length===0 && (
                  <li className="text-xs text-slate-500">No tasks match current filters.</li>
                )}
              </ul>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-sm font-medium">Checklist</div>
              <div className="mt-2 flex items-center gap-2">
                <input className="flex-1 px-2 py-1 rounded-md border border-border text-sm" placeholder="Add checklist item..." value={newChecklist} onChange={(e)=>setNewChecklist(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') addChecklist(); }} />
                <button className="px-2 py-1 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={addChecklist}>Add</button>
              </div>
              <ul className="mt-2 space-y-2 text-sm">
                {checklist.map(c => (
                  <li key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="h-4 w-4 rounded border border-border flex items-center justify-center" onClick={()=>toggleChecklist(c.id)}>
                        {c.done && <Check className="w-3 h-3" />}
                      </button>
                      <span className={`${c.done?'line-through text-slate-400':''}`}>{c.text}</span>
                    </div>
                    <button className="text-xs px-2 py-1 rounded border border-border hover:bg-slate-50" onClick={()=>showToast('Checklist updated','success')}>Update</button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[11px] text-slate-500">Use this checklist to break down a larger task.</div>
            </div>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="xl:col-span-4 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Filters & Sorting</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm inline-flex items-center gap-1"><Filter className="w-4 h-4" /> Filter</button>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm inline-flex items-center gap-1"><SortAsc className="w-4 h-4" /> Sort</button>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-slate-500 mb-2">By Priority</div>
            <div className="flex flex-wrap gap-2">
              {['All','High','Medium','Low'].map((p)=> (
                <button key={p} className={`px-2.5 py-1.5 rounded-full border text-xs ${filterPriority===p?'bg-yellow-100 border-yellow-400':'border-border hover:bg-slate-50'}`} onClick={()=>setFilterPriority(p)}>{p}</button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-slate-500 mb-2">By Project</div>
            <div className="flex flex-wrap gap-2">
              {['NovaTech Website','Mobile App','Internal'].map((p)=> (
                <button key={p} className="px-2.5 py-1.5 rounded-full border border-border text-xs hover:bg-slate-50">{p}</button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-slate-500 mb-2">By Tag</div>
            <div className="flex flex-wrap gap-2">
              {['All','UI','Backend','QA','Docs'].map((t)=> (
                <button key={t} className={`px-2.5 py-1.5 rounded-full border text-xs inline-flex items-center gap-1 ${filterTag===t?'bg-yellow-100 border-yellow-400':'border-border hover:bg-slate-50'}`} onClick={()=>setFilterTag(t)}><Tag className="w-3.5 h-3.5" /> {t}</button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-slate-500 mb-2">By Status</div>
            <div className="flex flex-wrap gap-2">
              {['All','To Do','In Progress','Done'].map((s)=> (
                <button key={s} className={`px-2.5 py-1.5 rounded-full border text-xs ${filterStatus===s?'bg-yellow-100 border-yellow-400':'border-border hover:bg-slate-50'}`} onClick={()=>setFilterStatus(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row: Focus & Productivity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Focus & Productivity</h3>
            <div className="flex items-center gap-2">
              <button className={`px-3 py-2 rounded-lg border border-border text-sm inline-flex items-center gap-1 ${focusMode?'bg-yellow-100':''}`} onClick={()=>setFocusMode(!focusMode)}><Focus className="w-4 h-4" /> Focus Mode</button>
              <button className={`px-3 py-2 rounded-lg border border-border text-sm inline-flex items-center gap-1 ${pomodoroRunning?'bg-yellow-100':''}`} onClick={()=>setPomodoroRunning(!pomodoroRunning)}><Timer className="w-4 h-4" /> Pomodoro</button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-medium">Pomodoro Timer</div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">
                {String(Math.floor(pomodoroSeconds/60)).padStart(2,'0')}:{String(pomodoroSeconds%60).padStart(2,'0')}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={()=>setPomodoroRunning(true)}>Start</button>
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={()=>setPomodoroRunning(false)}>Pause</button>
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={()=>{setPomodoroRunning(false);setPomodoroSeconds(25*60);}}>Reset</button>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">Prototype timer (no background ticking)</div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-medium">Progress Tracker</div>
              <div className="mt-3">
                <div className="h-2 w-full bg-slate-100 rounded-full">
                  <div className="h-2 rounded-full bg-yellow-500" style={{width:'58%'}}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>58% done</span>
                  <span>14/24 tasks</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg border border-border p-2 text-center">
                  <div className="text-slate-500">To Do</div>
                  <div className="text-sm font-semibold">8</div>
                </div>
                <div className="rounded-lg border border-border p-2 text-center">
                  <div className="text-slate-500">In Progress</div>
                  <div className="text-sm font-semibold">6</div>
                </div>
                <div className="rounded-lg border border-border p-2 text-center">
                  <div className="text-slate-500">Done</div>
                  <div className="text-sm font-semibold">10</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="xl:col-span-4 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Focus Area</h3>
            <Target className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-3 text-sm text-slate-600">Hide completed items and non-essential UI to focus on priority work.</div>
          <div className="mt-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Focus: Website launch tasks</span>
              <BarChart3 className="w-4 h-4 text-slate-500" />
            </div>
            <ul className="mt-2 space-y-2 text-sm">
              <li>Finalize responsive grid</li>
              <li>QA checklist pass</li>
              <li>Deploy preview build</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerSection;


