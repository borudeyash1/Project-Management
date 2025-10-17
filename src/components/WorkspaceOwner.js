import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserPlus, 
  FolderPlus, 
  TrendingUp, 
  Flame, 
  ShieldCheck, 
  MoreHorizontal,
  Building2,
  User,
  Settings
} from 'lucide-react';

const WorkspaceOwner = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('wsOverview');

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const toggleModal = (modalName) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: modalName });
  };

  const createProjectFromWorkspace = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'createProject' });
  };

  const enterProject = (name) => {
    dispatch({ type: 'SET_PROJECT', payload: name });
    dispatch({ type: 'SET_SECTION', payload: 'project' });
  };

  const getWorkspaceInitials = () => {
    return state.currentWorkspace.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const getWorkspaceRole = () => {
    return state.workspaces.find(w => w.name === state.currentWorkspace)?.type || 'Owner';
  };

  const isOwner = getWorkspaceRole() === 'Owner';

  // Derived workspace stats (prototype-calculated from global state)
  const totalProjects = state.projects.length;
  const activeProjects = state.projects.filter(p => p.status === 'Active').length;
  const completedProjects = state.projects.filter(p => p.status === 'Completed').length;
  const totalTasks = state.tasks.length;
  const inProgressTasks = state.tasks.filter(t => t.status === 'In Progress').length;
  const backlogTasks = state.tasks.filter(t => t.status === 'Backlog').length;

  // Mock monthly series for charts (kept static to preserve visual styling)
  const monthlyRevenue = [22, 28, 31, 26, 35, 38, 42, 47, 44, 49, 53, 57];
  const monthlyBurn = [12, 14, 15, 16, 17, 17, 18, 18, 17, 19, 20, 21];

  const maxRev = Math.max(...monthlyRevenue) || 1;
  const maxBurn = Math.max(...monthlyBurn) || 1;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold tracking-tight bg-yellow-500">
              {getWorkspaceInitials()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] sm:text-[22px] font-semibold tracking-tight">{state.currentWorkspace}</h2>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                  isOwner 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {getWorkspaceRole()}
                </span>
              </div>
              <div className="text-xs text-slate-500">You are viewing the workspace area</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => toggleModal('inviteEmployee')}
            >
              <UserPlus className="w-4 h-4 mr-1 inline-block" />
              Invite
            </button>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={createProjectFromWorkspace}
            >
              <FolderPlus className="w-4 h-4 mr-1 inline-block" />
              New project
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'wsOverview' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('wsOverview')}
            >
              Overview
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'wsMembers' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('wsMembers')}
            >
              Members
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'wsProjects' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('wsProjects')}
            >
              Projects
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'wsRequests' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('wsRequests')}
            >
              Requests
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'wsClients' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('wsClients')}
            >
              Clients
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'wsEmployees' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('wsEmployees')}
            >
              Employees
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'wsRequests' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('wsRequests')}
            >
              Requests
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'wsAdvertise' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('wsAdvertise')}
            >
              Advertise
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'wsSettings' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('wsSettings')}
            >
              Settings
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'wsCollaborate' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('wsCollaborate')}
            >
              Collaborate
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'wsOverview' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Active projects</div>
                <div className="text-xl font-semibold tracking-tight mt-1">7</div>
                <div className="h-2 w-full bg-slate-100 rounded-full mt-2">
                  <div className="h-2 rounded-full bg-yellow-500" style={{width: '60%'}}></div>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Utilization</div>
                <div className="text-xl font-semibold tracking-tight mt-1">72%</div>
                <div className="h-2 w-full bg-slate-100 rounded-full mt-2">
                  <div className="h-2 rounded-full bg-emerald-500" style={{width: '72%'}}></div>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Burn rate</div>
                <div className="text-xl font-semibold tracking-tight mt-1">$18.4k</div>
                <div className="text-[11px] text-orange-600 mt-1 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  +4% MoM
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Revenue (MTD)</div>
                <div className="text-xl font-semibold tracking-tight mt-1">$42.7k</div>
                <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +9% MoM
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="h-48 rounded-lg border border-border bg-slate-50 flex items-center justify-center text-slate-500">Chart placeholder</div>
            </div>
          </div>
          <div className="xl:col-span-4 bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] tracking-tight font-semibold">Upcoming milestones</h3>
              <button className="text-sm text-slate-600 hover:text-slate-900">View</button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Site handoff</div>
                  <div className="text-xs text-slate-500">Oct 28</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">NovaTech</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Payroll cycle close</div>
                  <div className="text-xs text-slate-500">Oct 30</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Internal</span>
              </div>
            </div>
          </div>
          {/* Simple inline charts - keep styling consistent with placeholders */}
          <div className="xl:col-span-8 bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">Performance</h3>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              {/* Revenue sparkline */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Revenue trend</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">MTD ${monthlyRevenue[monthlyRevenue.length - 1]}k</span>
                </div>
                <div className="mt-3 h-20 flex items-end gap-1">
                  {monthlyRevenue.map((v, i) => (
                    <div key={i} className="flex-1 bg-yellow-100 rounded-sm" style={{ height: `${(v / maxRev) * 100}%` }} />
                  ))}
                </div>
              </div>
              {/* Burn sparkline */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Burn rate</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">MoM +4%</span>
                </div>
                <div className="mt-3 h-20 flex items-end gap-1">
                  {monthlyBurn.map((v, i) => (
                    <div key={i} className="flex-1 bg-orange-200 rounded-sm" style={{ height: `${(v / maxBurn) * 100}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Projects</div>
                <div className="text-xl font-semibold tracking-tight mt-1">{totalProjects}</div>
                <div className="text-[11px] text-slate-500 mt-1">{activeProjects} active • {completedProjects} done</div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Tasks</div>
                <div className="text-xl font-semibold tracking-tight mt-1">{totalTasks}</div>
                <div className="text-[11px] text-slate-500 mt-1">{inProgressTasks} in progress • {backlogTasks} backlog</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'wsMembers' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Members</h3>
            <button 
              className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => showToast('Invite dialog coming soon', 'info')}
            >
              Invite
            </button>
          </div>
          <div className="mt-4 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr className="border-b border-border">
                  <th className="text-left font-medium py-2 pr-3">Name</th>
                  <th className="text-left font-medium py-2 pr-3">Role</th>
                  <th className="text-left font-medium py-2 pr-3">Email</th>
                  <th className="text-right font-medium py-2 pl-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <img className="h-7 w-7 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Alex" />
                      <div>
                        <div className="font-medium">Alex Johnson</div>
                        <div className="text-xs text-slate-500">@alex</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Owner</span>
                  </td>
                  <td className="py-3 pr-3">alex@proxima.app</td>
                  <td className="py-3 pl-3 text-right">
                    <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50">Manage</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <img className="h-7 w-7 rounded-full" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop" alt="Priya" />
                      <div>
                        <div className="font-medium">Priya Patel</div>
                        <div className="text-xs text-slate-500">@priya</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Admin</span>
                  </td>
                  <td className="py-3 pr-3">priya@proxima.app</td>
                  <td className="py-3 pl-3 text-right">
                    <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50">Manage</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'wsProjects' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Projects</h3>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={createProjectFromWorkspace}
            >
              <FolderPlus className="w-4 h-4 mr-1 inline-block" />
              New project
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">NovaTech Website</div>
                  <div className="text-xs text-slate-500">Active • Due Oct 25</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Active</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex -space-x-2">
                  <img className="h-7 w-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop" alt="Sam" />
                  <img className="h-7 w-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop" alt="Priya" />
                </div>
                <button 
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm"
                  onClick={() => enterProject('NovaTech Website')}
                >
                  Open
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Mobile App</div>
                  <div className="text-xs text-slate-500">On Hold • Due Nov 10</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-border">On Hold</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex -space-x-2">
                  <img className="h-7 w-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Alex" />
                  <img className="h-7 w-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop" alt="Priya" />
                </div>
                <button 
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm"
                  onClick={() => enterProject('Mobile App')}
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'wsRequests' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-7 bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] tracking-tight font-semibold">Workload & deadline requests</h3>
              <button 
                className="text-sm text-slate-600 hover:text-slate-900"
                onClick={() => showToast('Auto-approve toggled', 'info')}
              >
                Auto-approve rules
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop" alt="Priya" />
                    <div>
                      <div className="text-sm"><span className="font-medium">Priya</span> requested a due date change for task "Final QA pass".</div>
                      <div className="text-xs text-slate-500 mt-1">Requested: Oct 27 → Oct 30 • Reason: QA environment delays</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">Deadline</span>
                </div>
                <div className="flex items-center gap-2 mt-3 justify-end">
                <button 
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm"
                  onClick={() => {/* decline logic placeholder: remove or mark declined in real app */}}
                >
                    Decline
                  </button>
                  <button 
                    className="px-3 py-1.5 rounded-lg text-white text-sm bg-yellow-500"
                    onClick={() => {/* approve logic placeholder */}}
                  >
                    Approve
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Alex" />
                    <div>
                      <div className="text-sm"><span className="font-medium">Alex</span> requested workload rebalance for "Sprint 18 tasks".</div>
                      <div className="text-xs text-slate-500 mt-1">Reduce from 8 to 6 tasks • Reason: PTO on Friday</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Workload</span>
                </div>
                <div className="flex items-center gap-2 mt-3 justify-end">
                <button 
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm"
                  onClick={() => {/* reschedule logic placeholder */}}
                >
                    Reschedule
                  </button>
                  <button 
                    className="px-3 py-1.5 rounded-lg text-white text-sm bg-yellow-500"
                    onClick={() => {/* approve logic placeholder */}}
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-5 bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">Capacity overview</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">Design</div>
                <div className="w-40">
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-2 rounded-full bg-emerald-500" style={{width: '64%'}}></div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 text-right">64% utilized</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Engineering</div>
                <div className="w-40">
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-2 rounded-full bg-orange-500" style={{width: '88%'}}></div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 text-right">88% utilized</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">QA</div>
                <div className="w-40">
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-2 rounded-full bg-blue-500" style={{width: '42%'}}></div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 text-right">42% utilized</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'wsClients' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Clients</h3>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={() => toggleModal('client')}
            >
              <UserPlus className="w-4 h-4 mr-1 inline-block" />
              Add Client
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold bg-blue-500">
                  NT
                </div>
                <div>
                  <div className="font-medium">NovaTech</div>
                  <div className="text-xs text-slate-500">3 active projects</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm flex-1" onClick={() => toggleModal('client')}>
                  View Projects
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={() => toggleModal('client')}>
                  Edit
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold bg-emerald-500">
                  AC
                </div>
                <div>
                  <div className="font-medium">Alpha Corp</div>
                  <div className="text-xs text-slate-500">1 active project</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm flex-1" onClick={() => toggleModal('client')}>
                  View Projects
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={() => toggleModal('client')}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'wsEmployees' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Employees</h3>
            <div className="flex items-center gap-2">
            <button 
              className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => toggleModal('inviteEmployee')}
            >
                <UserPlus className="w-4 h-4 mr-1 inline-block" />
                Invite Employee
              </button>
              <button 
                className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
                onClick={() => showToast('Manual request dialog opened', 'info')}
              >
                Manual Request
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr className="border-b border-border">
                  <th className="text-left font-medium py-2 pr-3">Name</th>
                  <th className="text-left font-medium py-2 pr-3">Role</th>
                  <th className="text-left font-medium py-2 pr-3">Email</th>
                  <th className="text-left font-medium py-2 pr-3">Projects</th>
                  <th className="text-right font-medium py-2 pl-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <img className="h-7 w-7 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Alex" />
                      <div>
                        <div className="font-medium">Alex Johnson</div>
                        <div className="text-xs text-slate-500">@alex</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Owner</span>
                  </td>
                  <td className="py-3 pr-3">alex@proxima.app</td>
                  <td className="py-3 pr-3">3 projects</td>
                  <td className="py-3 pl-3 text-right">
                    <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50">Manage</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <img className="h-7 w-7 rounded-full" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop" alt="Priya" />
                      <div>
                        <div className="font-medium">Priya Patel</div>
                        <div className="text-xs text-slate-500">@priya</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Project Manager</span>
                  </td>
                  <td className="py-3 pr-3">priya@proxima.app</td>
                  <td className="py-3 pr-3">2 projects</td>
                  <td className="py-3 pl-3 text-right">
                    <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50">Manage</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <img className="h-7 w-7 rounded-full" src="https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop" alt="Sam" />
                      <div>
                        <div className="font-medium">Sam Wilson</div>
                        <div className="text-xs text-slate-500">@sam</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Developer</span>
                  </td>
                  <td className="py-3 pr-3">sam@proxima.app</td>
                  <td className="py-3 pr-3">1 project</td>
                  <td className="py-3 pl-3 text-right">
                    <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50">Manage</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advertise Tab */}
      {activeTab === 'wsAdvertise' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="text-[18px] tracking-tight font-semibold">Promote Your Workspace</h3>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-medium mb-2">Social Media Promotion</h4>
              <p className="text-sm text-slate-600 mb-3">Share your workspace on social platforms to attract new members.</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">
                  Share on LinkedIn
                </button>
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">
                  Share on Twitter
                </button>
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">
                  Copy Link
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-medium mb-2">Workspace Visibility</h4>
              <p className="text-sm text-slate-600 mb-3">Make your workspace discoverable in our public directory.</p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-border" defaultChecked />
                  <span className="text-sm">Show in public directory</span>
                </label>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-medium mb-2">Invite Codes</h4>
              <p className="text-sm text-slate-600 mb-3">Generate invite codes for easy sharing.</p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" 
                  value="PROXIMA2024" 
                  readOnly 
                />
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">
                  Copy
                </button>
                <button className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500">
                  Generate New
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collaborate Tab */}
      {activeTab === 'wsCollaborate' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Collaborators</h3>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={() => showToast('Add collaborator dialog opened', 'info')}
            >
              <UserPlus className="w-4 h-4 mr-1 inline-block" />
              Add Collaborator
            </button>
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop" alt="Priya" />
                  <div>
                    <div className="font-medium">Priya Patel</div>
                    <div className="text-xs text-slate-500">priya@proxima.app</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select className="rounded-lg border border-border px-3 py-1 text-sm">
                    <option>Full Access</option>
                    <option>Limited Access</option>
                    <option>Read Only</option>
                  </select>
                  <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop" alt="Sam" />
                  <div>
                    <div className="font-medium">Sam Wilson</div>
                    <div className="text-xs text-slate-500">sam@proxima.app</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select className="rounded-lg border border-border px-3 py-1 text-sm">
                    <option>Limited Access</option>
                    <option>Full Access</option>
                    <option>Read Only</option>
                  </select>
                  <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'wsSettings' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="text-[18px] tracking-tight font-semibold">Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium block mb-1">Workspace name</label>
              <input 
                type="text" 
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                placeholder="Workspace name"
                defaultValue={state.currentWorkspace}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Default visibility</label>
              <select className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
                <option>Private</option>
                <option>Public</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Region</label>
              <select className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
                <option>Global</option>
                <option>North America</option>
                <option>Europe</option>
                <option>Asia Pacific</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Calendar Sync</label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="relative inline-flex h-5 w-9 rounded-full bg-slate-200 transition-colors peer-checked:bg-yellow-500">
                  <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-all peer-checked:left-4"></span>
                </span>
                Enable Google Calendar sync
              </label>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Theme Color</label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white shadow-sm"></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Custom Roles</label>
              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    Project Manager • Can create/edit projects, manage team
                  </div>
                  <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">Edit</button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    Accountant • Can view payroll, export reports
                  </div>
                  <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">Edit</button>
                </div>
                <button className="w-full px-3 py-2 rounded-lg border border-dashed border-border hover:bg-slate-50 text-sm">Add Role</button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">About</label>
              <textarea 
                rows="3" 
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                placeholder="Workspace description"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button 
              className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => showToast('Changes discarded', 'info')}
            >
              Discard
            </button>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={() => showToast('Saved', 'success')}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceOwner;
