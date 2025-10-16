import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, SlidersHorizontal, ArrowUpDown, FolderPlus, Kanban, Calendar, GanttChart, Lock } from 'lucide-react';

const ProjectsListSection = () => {
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

  return (
    <div className="p-4 sm:p-6 space-y-6">
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
                  className="w-48 rounded-lg border border-border bg-white pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
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
              className="px-3 py-2 rounded-lg text-white text-sm hover:opacity-95 bg-primary"
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
    </div>
  );
};

export default ProjectsListSection;


