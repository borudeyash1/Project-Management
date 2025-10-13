import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Share2, 
  Save, 
  Search, 
  Filter, 
  Download, 
  Kanban, 
  Calendar, 
  GanttChart, 
  Lock,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const Project = () => {
  const { state, dispatch } = useApp();

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const toggleModal = (modalName) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: modalName });
  };

  const openTaskDrawer = (title) => {
    dispatch({ type: 'SET_TASK_DRAWER_TITLE', payload: title });
    dispatch({ type: 'TOGGLE_TASK_DRAWER', payload: true });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Backlog':
        return <CheckCircle className="w-4 h-4 text-slate-500" />;
      case 'At Risk':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Backlog':
        return 'bg-slate-100 text-slate-700 border-border';
      case 'At Risk':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-border';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">
              <button 
                className="hover:underline"
                onClick={() => dispatch({ type: 'SET_SECTION', payload: 'workspaceOwner' })}
              >
                {state.currentWorkspace}
              </button>
              {' '}• Project
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-[20px] sm:text-[22px] font-semibold tracking-tight">{state.currentProject}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Active</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Due Oct 25</div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => showToast('Shared', 'success')}
            >
              <Share2 className="w-4 h-4 mr-1 inline-block" />
              Share
            </button>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-primary"
              onClick={() => showToast('Changes saved', 'success')}
            >
              <Save className="w-4 h-4 mr-1 inline-block" />
              Save
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="px-3 py-1.5 rounded-md bg-primary-100 text-sm">List</button>
          <button 
            className="px-3 py-1.5 rounded-md inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            onClick={() => toggleModal('pricing')}
          >
            <Kanban className="w-4 h-4" />
            Kanban
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button 
            className="px-3 py-1.5 rounded-md inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            onClick={() => toggleModal('pricing')}
          >
            <Calendar className="w-4 h-4" />
            Calendar
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button 
            className="px-3 py-1.5 rounded-md inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            onClick={() => toggleModal('pricing')}
          >
            <GanttChart className="w-4 h-4" />
            Gantt
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button 
            className="ml-auto px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm"
            onClick={() => showToast('Exported', 'success')}
          >
            <Download className="w-4 h-4 mr-1 inline-block" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Tasks</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  className="w-56 rounded-lg border border-border bg-white pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
                  placeholder="Search tasks..."
                />
              </div>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">
                <Filter className="w-4 h-4 mr-1 inline-block" />
                Filter
              </button>
            </div>
          </div>
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr className="border-b border-border">
                  <th className="text-left font-medium py-2 pr-3">Task</th>
                  <th className="text-left font-medium py-2 pr-3">Assignee</th>
                  <th className="text-left font-medium py-2 pr-3">Status</th>
                  <th className="text-left font-medium py-2 pr-3">Due</th>
                  <th className="text-right font-medium py-2 pl-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-3">
                      <button 
                        className="text-left font-medium hover:underline"
                        onClick={() => openTaskDrawer(task.title)}
                      >
                        {task.title}
                      </button>
                      <div className="text-xs text-slate-500">{task.project} • {task.category}</div>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <img className="h-6 w-6 rounded-full" src={task.assignee.avatar} alt={task.assignee.name} />
                        <span>{task.assignee.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3">{task.due}</td>
                    <td className="py-3 pl-3 text-right">
                      <button 
                        className="px-2 py-1 rounded-md border border-border hover:bg-slate-50"
                        onClick={() => openTaskDrawer(task.title)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] tracking-tight font-semibold">Milestones</h3>
              <button className="text-sm text-slate-600 hover:text-slate-900">View all</button>
            </div>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">M1: Design complete</div>
                  <div className="text-xs text-slate-500">Oct 20</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">On track</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">M2: Dev complete</div>
                  <div className="text-xs text-slate-500">Oct 24</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Planned</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">Progress</h3>
            <div className="mt-3">
              <div className="h-2 w-full bg-slate-100 rounded-full">
                <div className="h-2 rounded-full bg-primary" style={{width: '58%'}}></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>58% done</span>
                <span>6/10 tasks</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">Timeline</h3>
            <div className="mt-3 h-32 rounded-lg border border-border bg-slate-50 flex items-center justify-center text-slate-500">Mini calendar</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
