import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building, 
  Plus, 
  TrendingUp, 
  Timer, 
  BadgeCheck, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  FolderPlus,
  Kanban,
  Calendar,
  GanttChart,
  Lock,
  MoreHorizontal,
  Check,
  Target,
  Bell,
  CalendarDays
} from 'lucide-react';

const Dashboard = () => {
  const { state, dispatch } = useApp();

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const toggleModal = (modalName) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: modalName });
  };

  const enterWorkspace = (name) => {
    dispatch({ type: 'SET_WORKSPACE', payload: name });
    dispatch({ type: 'SET_SECTION', payload: 'workspaceOwner' });
  };

  const enterProject = (name) => {
    dispatch({ type: 'SET_PROJECT', payload: name });
    dispatch({ type: 'SET_SECTION', payload: 'project' });
  };

  const openTaskDrawer = (title) => {
    dispatch({ type: 'SET_TASK_DRAWER_TITLE', payload: title });
    dispatch({ type: 'TOGGLE_TASK_DRAWER', payload: true });
  };

  const toggleCheck = (e) => {
    const icon = e.target.querySelector('i') || e.target;
    const isOn = icon.classList.contains('opacity-100');
    icon.classList.toggle('opacity-100', !isOn);
    icon.classList.toggle('opacity-0', isOn);
    e.target.classList.toggle('bg-emerald-50', !isOn);
    e.target.classList.toggle('border-emerald-200', !isOn);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Welcome + KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[22px] tracking-tight font-semibold">Good afternoon, Alex</h2>
                <p className="text-sm text-slate-600 mt-1">Here's what's happening with your work today</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button 
                  className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
                  onClick={() => toggleModal('createWorkspace')}
                >
                  <Building className="w-4 h-4 mr-1 inline-block" />
                  Create workspace
                </button>
                <button 
                  className="px-3 py-2 rounded-lg text-white text-sm hover:opacity-95 bg-yellow-500"
                  onClick={() => showToast('Quick add', 'info')}
                >
                  <Plus className="w-4 h-4 mr-1 inline-block" />
                  New
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Active projects</div>
                <div className="text-xl font-semibold tracking-tight mt-1">12</div>
                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +2 this week
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Tasks due</div>
                <div className="text-xl font-semibold tracking-tight mt-1">26</div>
                <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  5 overdue
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">This week's hours</div>
                <div className="text-xl font-semibold tracking-tight mt-1">38.5</div>
                <div className="text-xs text-slate-500 mt-1">Timesheet synced</div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Payroll status</div>
                <div className="text-xl font-semibold tracking-tight mt-1">$24,380</div>
                <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Ready
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] tracking-tight font-semibold">Upcoming deadlines</h3>
              <button className="text-sm text-slate-600 hover:text-slate-900">View all</button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Marketing site launch</div>
                  <div className="text-xs text-slate-500">Due today • 5:00 PM</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">High</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Payroll approval</div>
                  <div className="text-xs text-slate-500">Due tomorrow • 11:00 AM</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">On track</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Onboarding docs</div>
                  <div className="text-xs text-slate-500">Fri • 3:00 PM</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Medium</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-5 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] tracking-tight font-semibold">Payroll & Timesheets</h3>
              <button className="text-sm text-slate-600 hover:text-slate-900">Open</button>
            </div>
            <div className="mt-3">
              <div className="h-2 w-full bg-slate-100 rounded-full">
                <div className="h-2 rounded-full bg-yellow-500" style={{width: '70%'}}></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>70% approved</span>
                <span>Cycle ends in 3d</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects list with gated tabs */}
      <div id="projectsList" className="bg-white border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-[18px] tracking-tight font-semibold">Projects</h3>
            <p className="text-xs text-slate-500">Manage and track your work</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  className="w-48 rounded-lg border border-border bg-white pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                  placeholder="Search projects..."
                />
              </div>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">
                <SlidersHorizontal className="w-4 h-4 mr-1 inline-block" />
                Filters
              </button>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">
                <ArrowUpDown className="w-4 h-4 mr-1 inline-block" />
                Sort
              </button>
            </div>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm hover:opacity-95 bg-yellow-500"
              onClick={() => showToast('New project', 'info')}
            >
              <FolderPlus className="w-4 h-4 mr-1 inline-block" />
              Add Project
            </button>
          </div>
        </div>

        <div className="px-3 pt-3">
          <div className="inline-flex items-center gap-2 p-1 bg-slate-50 border border-border rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-white border border-border text-sm">List</button>
            <button 
              className="group px-3 py-1.5 rounded-md text-sm text-slate-500 inline-flex items-center gap-1"
              onClick={() => toggleModal('pricing')}
            >
              <Kanban className="w-4 h-4 text-slate-400" />
              Kanban
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button 
              className="group px-3 py-1.5 rounded-md text-sm text-slate-500 inline-flex items-center gap-1"
              onClick={() => toggleModal('pricing')}
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              Calendar
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button 
              className="group px-3 py-1.5 rounded-md text-sm text-slate-500 inline-flex items-center gap-1"
              onClick={() => toggleModal('pricing')}
            >
              <GanttChart className="w-4 h-4 text-slate-400" />
              Gantt
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr className="border-b border-border">
                  <th className="text-left font-medium py-2 pr-3">Project</th>
                  <th className="text-left font-medium py-2 pr-3">Client</th>
                  <th className="text-left font-medium py-2 pr-3">Status</th>
                  <th className="text-left font-medium py-2 pr-3">Due</th>
                  <th className="text-left font-medium py-2 pr-3">Assignees</th>
                  <th className="text-right font-medium py-2 pl-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-3">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-slate-500">Marketing • {project.priority} priority</div>
                    </td>
                    <td className="py-3 pr-3">{project.client}</td>
                    <td className="py-3 pr-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        project.status === 'Active' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        project.status === 'On Hold' ? 'bg-slate-100 text-slate-700 border-border' :
                        'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3">{project.due}</td>
                    <td className="py-3 pr-3">
                      <div className="flex -space-x-2">
                        {project.assignees.map((assignee, index) => (
                          <img 
                            key={index}
                            className="h-7 w-7 rounded-full border-2 border-white" 
                            src={assignee.avatar}
                            alt={assignee.name}
                          />
                        ))}
                        {project.assignees.length > 2 && (
                          <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs text-slate-600">
                            +{project.assignees.length - 2}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button 
                        className="px-2 py-1 rounded-md border border-border hover:bg-slate-50"
                        onClick={() => {
                          enterWorkspace(project.client);
                          enterProject(project.name);
                        }}
                      >
                        Visit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Planner & Tracker */}
      <div id="planner" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Personal Planner</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">Today</button>
              <button className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500">Add</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Write Q4 goals</div>
                <button className="text-slate-500 hover:text-slate-900">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 text-xs text-slate-500">Due: Today 5:00 PM</div>
              <div className="mt-3 flex items-center gap-2">
                <button 
                  className="task-check h-5 w-5 rounded-md border border-border flex items-center justify-center hover:bg-slate-50"
                  onClick={toggleCheck}
                >
                  <Check className="w-4 h-4 opacity-0" />
                </button>
                <span className="text-sm">Mark complete</span>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">1:1 with PM</div>
                <button className="text-slate-500 hover:text-slate-900">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 text-xs text-slate-500">Tomorrow 10:00 AM</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">Meeting</span>
              </div>
            </div>
          </div>
        </div>
        <div id="tracker" className="lg:col-span-4 bg-white border border-border rounded-xl p-5">
          <h3 className="text-[18px] tracking-tight font-semibold">Goals & Habits</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Ship website</div>
                <div className="text-xs text-slate-500">Progress</div>
              </div>
              <div className="w-40">
                <div className="h-2 bg-slate-100 rounded-full">
                <div className="h-2 rounded-full bg-yellow-500" style={{width: '56%'}}></div>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 text-right">56%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Daily standup</div>
                <div className="text-xs text-slate-500">Habit</div>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminders & Calendar anchors */}
      <div id="reminders" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div id="calendar" className="lg:col-span-8 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Calendar</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">Week</button>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">Month</button>
              <button className="px-3 py-2 rounded-lg text-white text-sm bg-primary">Add event</button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center">
            <div className="text-xs text-slate-500">Mon</div>
            <div className="text-xs text-slate-500">Tue</div>
            <div className="text-xs text-slate-500">Wed</div>
            <div className="text-xs text-slate-500">Thu</div>
            <div className="text-xs text-slate-500">Fri</div>
            <div className="text-xs text-slate-500">Sat</div>
            <div className="text-xs text-slate-500">Sun</div>
            <div className="col-span-7 h-40 rounded-lg border border-border bg-slate-50 flex items-center justify-center text-slate-500">Calendar placeholder</div>
          </div>
        </div>
        <div className="lg:col-span-4 bg-white border border-border rounded-xl p-5">
          <h3 className="text-[18px] tracking-tight font-semibold">Reminders</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  className="task-check h-5 w-5 rounded-md border border-border flex items-center justify-center hover:bg-slate-50"
                  onClick={toggleCheck}
                >
                  <Check className="w-4 h-4 opacity-0" />
                </button>
                <div>
                  <div className="text-sm font-medium">Submit timesheet</div>
                  <div className="text-xs text-slate-500">Today • 6:00 PM</div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
