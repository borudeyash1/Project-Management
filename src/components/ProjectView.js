import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  MessageSquare,
  BarChart3,
  Calendar,
  CheckSquare,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Star,
  Trophy,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ProjectView = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('projectDashboard');
  const [taskView, setTaskView] = useState('kanban'); // kanban, list, calendar, gantt
  const [dragState, setDragState] = useState({ draggingTaskId: null });
  const [calendarDate, setCalendarDate] = useState(new Date());

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const backToWorkspace = () => {
    dispatch({ type: 'SET_SECTION', payload: 'workspaceOwner' });
  };

  const getProjectInitials = () => {
    return state.currentProject.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  // Mock project data
  const projectData = {
    name: state.currentProject,
    status: 'Active',
    progress: 75,
    startDate: '2024-10-01',
    endDate: '2024-10-25',
    priority: 'High',
    client: 'NovaTech',
    description: 'Complete redesign of the NovaTech website with modern UI/UX and improved performance.',
    teamMembers: [
      { id: 1, name: 'Alex Johnson', role: 'Project Manager', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop', status: 'online' },
      { id: 2, name: 'Priya Patel', role: 'Frontend Developer', avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop', status: 'online' },
      { id: 3, name: 'Sam Wilson', role: 'Backend Developer', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop', status: 'away' },
      { id: 4, name: 'Maria Garcia', role: 'UI Designer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop', status: 'offline' },
      { id: 5, name: 'Jordan Lee', role: 'QA Engineer', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop', status: 'online' },
      { id: 6, name: 'Nina Kumar', role: 'Business Analyst', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=100&auto=format&fit=crop', status: 'online' }
    ],
    tasks: [
      { id: 1, title: 'Design homepage mockup', status: 'completed', priority: 'High', assignee: 'Maria Garcia', startDate: '2024-10-05', endDate: '2024-10-12', dueDate: '2024-10-15', progress: 100 },
      { id: 2, title: 'Implement responsive layout', status: 'in-progress', priority: 'High', assignee: 'Priya Patel', startDate: '2024-10-11', endDate: '2024-10-20', dueDate: '2024-10-20', progress: 80 },
      { id: 3, title: 'Setup API endpoints', status: 'in-progress', priority: 'Medium', assignee: 'Sam Wilson', startDate: '2024-10-10', endDate: '2024-10-18', dueDate: '2024-10-18', progress: 60 },
      { id: 4, title: 'Write unit tests', status: 'todo', priority: 'Medium', assignee: 'Alex Johnson', startDate: '2024-10-20', endDate: '2024-10-22', dueDate: '2024-10-22', progress: 0 },
      { id: 5, title: 'Performance optimization', status: 'todo', priority: 'Low', assignee: 'Priya Patel', startDate: '2024-10-21', endDate: '2024-10-25', dueDate: '2024-10-25', progress: 0 },
      { id: 6, title: 'Deploy to staging', status: 'todo', priority: 'High', assignee: 'Sam Wilson', startDate: '2024-10-23', endDate: '2024-10-24', dueDate: '2024-10-24', progress: 0 },
      { id: 7, title: 'Prepare release notes', status: 'todo', priority: 'Medium', assignee: 'Jordan Lee', startDate: '2024-10-24', endDate: '2024-10-25', dueDate: '2024-10-25', progress: 0 },
      { id: 8, title: 'UX copy review', status: 'in-progress', priority: 'Low', assignee: 'Nina Kumar', startDate: '2024-10-18', endDate: '2024-10-21', dueDate: '2024-10-21', progress: 25 },
      { id: 9, title: 'Cross-browser testing', status: 'todo', priority: 'Medium', assignee: 'Jordan Lee', startDate: '2024-10-22', endDate: '2024-10-24', dueDate: '2024-10-24', progress: 0 },
      { id: 10, title: 'SEO audit', status: 'todo', priority: 'Low', assignee: 'Alex Johnson', startDate: '2024-10-19', endDate: '2024-10-23', dueDate: '2024-10-23', progress: 0 }
    ],
    milestones: [
      { id: 1, name: 'Design Phase Complete', date: '2024-10-15', status: 'completed' },
      { id: 2, name: 'Development Phase Complete', date: '2024-10-20', status: 'in-progress' },
      { id: 3, name: 'Testing Phase Complete', date: '2024-10-22', status: 'pending' },
      { id: 4, name: 'Production Deployment', date: '2024-10-25', status: 'pending' }
    ],
    stats: {
      totalTasks: 6,
      completedTasks: 1,
      inProgressTasks: 2,
      pendingTasks: 3,
      teamUtilization: 85,
      budgetUsed: 65,
      daysRemaining: 5
    }
  };

  const [tasks, setTasks] = useState(projectData.tasks);

  const recomputeStats = (taskList) => ({
    totalTasks: taskList.length,
    completedTasks: taskList.filter(t => t.status === 'completed').length,
    inProgressTasks: taskList.filter(t => t.status === 'in-progress').length,
    pendingTasks: taskList.filter(t => t.status === 'todo').length,
    teamUtilization: projectData.stats.teamUtilization,
    budgetUsed: projectData.stats.budgetUsed,
    daysRemaining: projectData.stats.daysRemaining
  });

  const moveDraggedTask = (newStatus) => {
    const id = dragState.draggingTaskId;
    if (!id) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    setDragState({ draggingTaskId: null });
  };

  // Calendar helpers
  const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const daysInMonth = (date) => endOfMonth(date).getDate();
  const addMonths = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1);
  const formatMonthYear = (date) => date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const isTaskOnDay = (t, y, m, d) => {
    const start = new Date(t.startDate || t.dueDate);
    const end = new Date(t.endDate || t.dueDate);
    const current = new Date(y, m, d);
    return current >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
           current <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
  };
  const priorityBadge = (p) => (
    p === 'High' ? 'bg-red-200 text-red-700' : p === 'Medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-slate-200 text-slate-700'
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'todo': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-lg border border-border hover:bg-slate-50"
              onClick={backToWorkspace}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold tracking-tight bg-yellow-500">
              {getProjectInitials()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <select
                  className="text-[20px] sm:text-[22px] font-semibold tracking-tight bg-transparent focus-visible:outline-none"
                  value={state.currentProject}
                  onChange={(e) => dispatch({ type: 'SET_PROJECT', payload: e.target.value })}
                >
                  {state.projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${getStatusColor(projectData.status)}`}>
                  {projectData.status}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${getPriorityColor(projectData.priority)}`}>
                  {projectData.priority}
                </span>
              </div>
              <div className="text-xs text-slate-500">{projectData.client} • {projectData.daysRemaining} days remaining</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'taskRating' })}
            >
              <Star className="w-4 h-4 mr-1 inline-block" />
              Rate Tasks
            </button>
            <button 
              className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'manageProject' })}
            >
              Manage Project
            </button>
            <button 
              className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'polls' })}
            >
              <MessageSquare className="w-4 h-4 mr-1 inline-block" />
              Polls
            </button>
            <button 
              className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'leaderboard' })}
            >
              <Trophy className="w-4 h-4 mr-1 inline-block" />
              Leaderboard
            </button>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'taskDetails' })}
            >
              <Plus className="w-4 h-4 mr-1 inline-block" />
              Add Task
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'projectDashboard' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('projectDashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'projectTeam' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('projectTeam')}
            >
              Team
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'projectTasks' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('projectTasks')}
            >
              Tasks
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'projectTimeline' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('projectTimeline')}
            >
              Timeline
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'projectInbox' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('projectInbox')}
            >
              Inbox
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'projectAnalytics' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('projectAnalytics')}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'projectDashboard' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">Project Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Progress</div>
                <div className="text-xl font-semibold tracking-tight mt-1">{projectData.progress}%</div>
                <div className="h-2 w-full bg-slate-100 rounded-full mt-2">
                  <div className="h-2 rounded-full bg-yellow-500" style={{width: `${projectData.progress}%`}}></div>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Tasks</div>
                <div className="text-xl font-semibold tracking-tight mt-1">{projectData.stats.totalTasks}</div>
                <div className="text-[11px] text-slate-500 mt-1">{projectData.stats.completedTasks} completed</div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Team Utilization</div>
                <div className="text-xl font-semibold tracking-tight mt-1">{projectData.stats.teamUtilization}%</div>
                <div className="text-[11px] text-slate-500 mt-1">High activity</div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-slate-500">Budget Used</div>
                <div className="text-xl font-semibold tracking-tight mt-1">{projectData.stats.budgetUsed}%</div>
                <div className="text-[11px] text-slate-500 mt-1">On track</div>
              </div>
            </div>
            <div className="mt-5">
              <div className="h-48 rounded-lg border border-border bg-slate-50 flex items-center justify-center text-slate-500">Project Timeline Chart</div>
            </div>
          </div>
          <div className="xl:col-span-4 bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">Recent Activity</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600" />
                <div>
                  <div className="text-sm">Maria completed "Design homepage mockup"</div>
                  <div className="text-xs text-slate-500">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Play className="w-4 h-4 mt-0.5 text-blue-600" />
                <div>
                  <div className="text-sm">Priya started "Implement responsive layout"</div>
                  <div className="text-xs text-slate-500">4 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 mt-0.5 text-slate-600" />
                <div>
                  <div className="text-sm">Alex commented on "Setup API endpoints"</div>
                  <div className="text-xs text-slate-500">6 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'projectTeam' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Team Members</h3>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'inviteEmployee' })}
            >
              <Plus className="w-4 h-4 mr-1 inline-block" />
              Add Member
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectData.teamMembers.map((member) => (
              <div key={member.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img className="h-10 w-10 rounded-full" src={member.avatar} alt={member.name} />
                    <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                      member.status === 'online' ? 'bg-emerald-500' :
                      member.status === 'away' ? 'bg-yellow-500' : 'bg-slate-400'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-slate-500">{member.role}</div>
                    <div className="text-xs text-slate-400 capitalize">{member.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg border border-border hover:bg-slate-50">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg border border-border hover:bg-slate-50">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'projectTasks' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] tracking-tight font-semibold">Tasks</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button 
                  className={`px-3 py-1.5 rounded-md text-sm ${taskView === 'kanban' ? 'bg-yellow-100' : 'hover:bg-slate-50 border border-border'}`}
                  onClick={() => setTaskView('kanban')}
                >
                  Kanban
                </button>
                <button 
                  className={`px-3 py-1.5 rounded-md text-sm ${taskView === 'list' ? 'bg-yellow-100' : 'hover:bg-slate-50 border border-border'}`}
                  onClick={() => setTaskView('list')}
                >
                  List
                </button>
                <button 
                  className={`px-3 py-1.5 rounded-md text-sm ${taskView === 'calendar' ? 'bg-yellow-100' : 'hover:bg-slate-50 border border-border'}`}
                  onClick={() => setTaskView('calendar')}
                >
                  Calendar
                </button>
                <button 
                  className={`px-3 py-1.5 rounded-md text-sm ${taskView === 'gantt' ? 'bg-yellow-100' : 'hover:bg-slate-50 border border-border'}`}
                  onClick={() => setTaskView('gantt')}
                >
                  Gantt
                </button>
              </div>
              <button 
                className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
                onClick={() => showToast('New task added', 'success')}
              >
                <Plus className="w-4 h-4 mr-1 inline-block" />
                Add Task
              </button>
            </div>
          </div>

          {taskView === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border p-4"
                   onDragOver={(e) => e.preventDefault()}
                   onDrop={() => moveDraggedTask('todo')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">To Do</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{recomputeStats(tasks).pendingTasks}</span>
                </div>
                <div className="space-y-2">
                  {tasks.filter(task => task.status === 'todo').map(task => (
                    <div key={task.id}
                         className="rounded-lg border border-border p-3 bg-white cursor-move hover:shadow-md transition-shadow"
                         draggable
                         onDragStart={() => setDragState({ draggingTaskId: task.id })}
                         onDragEnd={() => setDragState({ draggingTaskId: null })}
                         onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'taskDetails' })}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{task.assignee}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="h-1 w-full bg-slate-100 rounded-full">
                          <div className="h-1 rounded-full bg-yellow-500" style={{width: `${task.progress}%`}}></div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{task.progress}% complete</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border p-4"
                   onDragOver={(e) => e.preventDefault()}
                   onDrop={() => moveDraggedTask('in-progress')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">In Progress</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">{recomputeStats(tasks).inProgressTasks}</span>
                </div>
                <div className="space-y-2">
                  {tasks.filter(task => task.status === 'in-progress').map(task => (
                    <div key={task.id}
                         className="rounded-lg border border-border p-3 bg-white cursor-move hover:shadow-md transition-shadow"
                         draggable
                         onDragStart={() => setDragState({ draggingTaskId: task.id })}
                         onDragEnd={() => setDragState({ draggingTaskId: null })}
                         onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'taskDetails' })}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{task.assignee}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="h-1 w-full bg-slate-100 rounded-full">
                          <div className="h-1 rounded-full bg-yellow-500" style={{width: `${task.progress}%`}}></div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{task.progress}% complete</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border p-4"
                   onDragOver={(e) => e.preventDefault()}
                   onDrop={() => moveDraggedTask('completed')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Completed</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">{recomputeStats(tasks).completedTasks}</span>
                </div>
                <div className="space-y-2">
                  {tasks.filter(task => task.status === 'completed').map(task => (
                    <div key={task.id} className="rounded-lg border border-border p-3 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm line-through text-slate-500">{task.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{task.assignee}</div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {taskView === 'list' && (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="text-slate-600">
                  <tr className="border-b border-border">
                    <th className="text-left font-medium py-2 pr-3">Task</th>
                    <th className="text-left font-medium py-2 pr-3">Assignee</th>
                    <th className="text-left font-medium py-2 pr-3">Status</th>
                    <th className="text-left font-medium py-2 pr-3">Priority</th>
                    <th className="text-left font-medium py-2 pr-3">Due Date</th>
                    <th className="text-left font-medium py-2 pr-3">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td className="py-3 pr-3">
                        <div className="font-medium">{task.title}</div>
                      </td>
                      <td className="py-3 pr-3">{task.assignee}</td>
                      <td className="py-3 pr-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 pr-3">{task.dueDate}</td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-slate-100 rounded-full">
                            <div className="h-1 rounded-full bg-yellow-500" style={{width: `${task.progress}%`}}></div>
                          </div>
                          <span className="text-xs">{task.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {taskView === 'calendar' && (
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-1">
                  <button className="p-1 rounded border border-border hover:bg-slate-50" onClick={() => setCalendarDate(prev => addMonths(prev, -1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 rounded border border-border hover:bg-slate-50" onClick={() => setCalendarDate(new Date())}>
                    Today
                  </button>
                  <button className="p-1 rounded border border-border hover:bg-slate-50" onClick={() => setCalendarDate(prev => addMonths(prev, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm font-medium">{formatMonthYear(calendarDate)}</div>
                <div />
              </div>

              <div className="grid grid-cols-7 gap-2 text-xs text-slate-500">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="text-center py-1">{d}</div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {(() => {
                  const first = startOfMonth(calendarDate);
                  const total = daysInMonth(calendarDate);
                  const blanks = first.getDay();
                  const cells = [];
                  for (let b = 0; b < blanks; b++) cells.push(<div key={`b-${b}`} className="min-h-[86px] border border-border rounded-md bg-slate-50" />);
                  for (let day = 1; day <= total; day++) {
                    const y = calendarDate.getFullYear();
                    const m = calendarDate.getMonth();
                    const tasksForDay = tasks.filter(t => isTaskOnDay(t, y, m, day));
                    cells.push(
                      <div key={day} className="min-h-[86px] border border-border rounded-md p-1">
                        <div className="text-[10px] text-slate-500">{day}</div>
                        <div className="space-y-1 mt-1">
                          {tasksForDay.slice(0, 4).map(t => (
                            <div key={t.id} className={`text-[10px] truncate px-1 py-0.5 rounded ${priorityBadge(t.priority)}`}>{t.title}</div>
                          ))}
                          {tasksForDay.length > 4 && (
                            <div className="text-[10px] text-slate-500">+{tasksForDay.length - 4} more</div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  const pad = 42 - cells.length;
                  for (let p = 0; p < pad; p++) cells.push(<div key={`p-${p}`} className="min-h-[86px] border border-border rounded-md bg-slate-50" />);
                  return cells;
                })()}
              </div>
            </div>
          )}

          {taskView === 'gantt' && (
            <div className="rounded-lg border border-border p-3">
              <div className="overflow-auto">
                <div className="min-w-[900px]">
                  <div className="flex border-b border-border text-[10px] text-slate-500">
                    <div className="w-64 px-2 py-1">Task</div>
                    <div className="flex-1 grid" style={{gridTemplateColumns: `repeat(30, 24px)`}}>
                      {Array.from({length: 30}).map((_, i) => (
                        <div key={i} className="h-8 flex items-center justify-center border-l border-border">{i+1}</div>
                      ))}
                    </div>
                  </div>
                  {tasks.map(t => {
                    const start = new Date(t.startDate || t.dueDate);
                    const end = new Date(t.endDate || t.dueDate);
                    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
                    const offset = Math.max(0, Math.floor((start - monthStart) / (1000*60*60*24)));
                    const length = Math.max(1, Math.floor((end - start) / (1000*60*60*24)) + 1);
                    return (
                      <div key={t.id} className="flex items-center border-b border-border">
                        <div className="w-64 px-2 py-2 text-sm truncate">{t.title}</div>
                        <div className="relative flex-1 grid" style={{gridTemplateColumns: `repeat(30, 24px)`}}>
                          <div className="absolute h-5 rounded bg-yellow-300" style={{ left: `${offset*24}px`, width: `${length*24}px`, top: '6px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'projectTimeline' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="text-[18px] tracking-tight font-semibold">Project Timeline</h3>
          <div className="mt-4 space-y-4">
            {projectData.milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.status === 'completed' ? 'bg-emerald-500 text-white' :
                  milestone.status === 'in-progress' ? 'bg-blue-500 text-white' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {milestone.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                   milestone.status === 'in-progress' ? <Clock className="w-4 h-4" /> :
                   <div className="w-2 h-2 rounded-full bg-slate-600"></div>}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{milestone.name}</div>
                  <div className="text-sm text-slate-500">{milestone.date}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  milestone.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  milestone.status === 'in-progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {milestone.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inbox Tab */}
      {activeTab === 'projectInbox' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Project Inbox</h3>
              <button 
                className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
                onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'documentsHub' })}
              >
              <MessageSquare className="w-4 h-4 mr-1 inline-block" />
              New Message
            </button>
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop" alt="Priya" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Priya Patel</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Frontend Developer</span>
                    <span className="text-xs text-slate-500">2 hours ago</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">The responsive layout is almost complete. Should I proceed with the mobile optimization?</div>
                </div>
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop" alt="Sam" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Sam Wilson</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">Backend Developer</span>
                    <span className="text-xs text-slate-500">4 hours ago</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">API endpoints are ready for testing. The documentation has been updated.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'projectAnalytics' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">Project Analytics</h3>
            <div className="mt-4">
              <div className="h-64 rounded-lg border border-border bg-slate-50 flex items-center justify-center text-slate-500">Analytics Charts</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg border border-border p-3">
                <div className="text-sm font-medium">Predicted Completion</div>
                <div className="text-2xl font-semibold mt-1">Oct 26</div>
                <div className="text-xs text-slate-500">Based on current velocity</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-sm font-medium">Risk: Scope Creep</div>
                <div className="text-2xl font-semibold mt-1 text-orange-600">Medium</div>
                <div className="text-xs text-slate-500">Monitor new requirements</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-sm font-medium">Resource Alert</div>
                <div className="text-2xl font-semibold mt-1 text-red-600">Backend 95%</div>
                <div className="text-xs text-slate-500">Consider rebalancing</div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-4 bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">Key Metrics</h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-border p-3">
                <div className="text-sm font-medium">Velocity</div>
                <div className="text-2xl font-semibold mt-1">12</div>
                <div className="text-xs text-slate-500">Tasks completed this week</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-sm font-medium">Burndown</div>
                <div className="text-2xl font-semibold mt-1">85%</div>
                <div className="text-xs text-slate-500">On track for deadline</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-sm font-medium">Team Efficiency</div>
                <div className="text-2xl font-semibold mt-1">92%</div>
                <div className="text-xs text-slate-500">Above average</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="w-full px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
                  onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'documentsHub' })}
                >
                  Documents Hub
                </button>
                <button 
                  className="w-full px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
                  onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'timesheet' })}
                >
                  Log Time
                </button>
              </div>
              <button 
                className="w-full px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
                onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'exportReports' })}
              >
                Export Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;
