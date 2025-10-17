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
  Settings,
  MessageSquare,
  Bot,
  Calendar,
  CheckSquare,
  ArrowLeft,
  Bell,
  Clock,
  Target,
  BarChart3,
  Users,
  FileText,
  Star,
  AlertCircle
} from 'lucide-react';

const WorkspaceMember = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('memberDashboard');

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const enterProject = (name) => {
    dispatch({ type: 'SET_PROJECT', payload: name });
    dispatch({ type: 'SET_SECTION', payload: 'project' });
  };

  const getWorkspaceInitials = () => {
    return state.currentWorkspace.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const getWorkspaceRole = () => {
    return state.workspaces.find(w => w.name === state.currentWorkspace)?.type || 'Member';
  };

  // Mock data for member view
  const allocatedProjects = [
    { name: 'NovaTech Website', status: 'Active', progress: 75, dueDate: 'Oct 25', tasks: 8, completed: 6 },
    { name: 'Mobile App', status: 'In Progress', progress: 45, dueDate: 'Nov 10', tasks: 12, completed: 5 },
    { name: 'Dashboard Redesign', status: 'Planning', progress: 20, dueDate: 'Dec 5', tasks: 15, completed: 3 }
  ];

  const notifications = [
    { id: 1, title: 'New task assigned', message: 'UI Review for NovaTech Website', time: '2 hours ago', unread: true },
    { id: 2, title: 'Deadline reminder', message: 'Mobile App prototype due tomorrow', time: '4 hours ago', unread: true },
    { id: 3, title: 'Team update', message: 'Sprint planning meeting at 3 PM', time: '1 day ago', unread: false }
  ];

  const personalTasks = [
    { id: 1, title: 'Complete UI mockups', project: 'NovaTech Website', priority: 'High', dueDate: 'Oct 25', status: 'In Progress' },
    { id: 2, title: 'Code review for login module', project: 'Mobile App', priority: 'Medium', dueDate: 'Oct 26', status: 'Pending' },
    { id: 3, title: 'Update documentation', project: 'Dashboard Redesign', priority: 'Low', dueDate: 'Oct 30', status: 'Pending' }
  ];

  const chatbotMessages = [
    { id: 1, sender: 'bot', message: 'Hi! I can help you with your tasks, deadlines, and project updates. What would you like to know?' },
    { id: 2, sender: 'user', message: 'What are my upcoming deadlines?' },
    { id: 3, sender: 'bot', message: 'You have 3 upcoming deadlines: UI Review (Oct 25), Mobile App prototype (Oct 26), and Documentation update (Oct 30). Would you like details on any specific task?' }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-lg border border-border hover:bg-slate-50"
              onClick={() => dispatch({ type: 'SET_SECTION', payload: 'workspace' })}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold tracking-tight bg-yellow-500">
              {getWorkspaceInitials()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] sm:text-[22px] font-semibold tracking-tight">{state.currentWorkspace}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  {getWorkspaceRole()}
                </span>
              </div>
              <div className="text-xs text-slate-500">Member workspace view</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-lg border border-border hover:bg-slate-50 relative"
              onClick={() => showToast('Notifications', 'info')}
            >
              <Bell className="w-4 h-4" />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </button>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={() => showToast('Quick task added', 'success')}
            >
              <CheckSquare className="w-4 h-4 mr-1 inline-block" />
              Quick Task
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'memberDashboard' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('memberDashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'memberProfile' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('memberProfile')}
            >
              Profile
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'memberInbox' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('memberInbox')}
            >
              Inbox
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'memberChatbot' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('memberChatbot')}
            >
              Chatbot
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'memberPlanner' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('memberPlanner')}
            >
              Personal Planner
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'memberProjects' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('memberProjects')}
            >
              Projects
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'memberDashboard' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">My Projects</h3>
            <div className="mt-4 space-y-3">
              {allocatedProjects.map((project, index) => (
                <div key={index} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-slate-500">{project.status} • Due {project.dueDate}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      project.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-slate-50 text-slate-600 border border-border'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full">
                      <div className="h-2 rounded-full bg-yellow-500" style={{width: `${project.progress}%`}}></div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span>{project.completed}/{project.tasks} tasks completed</span>
                      <button 
                        className="px-3 py-1 rounded-lg border border-border hover:bg-slate-50"
                        onClick={() => enterProject(project.name)}
                      >
                        Enter Project
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="xl:col-span-4 bg-white border border-border rounded-xl p-5">
            <h3 className="text-[18px] tracking-tight font-semibold">Notifications</h3>
            <div className="mt-4 space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`rounded-lg border border-border p-3 ${notification.unread ? 'bg-yellow-50' : ''}`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-4 h-4 mt-0.5 ${notification.unread ? 'text-yellow-600' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{notification.title}</div>
                      <div className="text-xs text-slate-600 mt-1">{notification.message}</div>
                      <div className="text-xs text-slate-500 mt-1">{notification.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'memberProfile' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="text-[18px] tracking-tight font-semibold">Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium block mb-1">Full Name</label>
              <input 
                type="text" 
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                placeholder="Enter your full name"
                defaultValue="Alex Johnson"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <input 
                type="email" 
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                placeholder="Enter your email"
                defaultValue="alex@proxima.app"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Phone</label>
              <input 
                type="tel" 
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                placeholder="Enter your phone number"
                defaultValue="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Position</label>
              <input 
                type="text" 
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                placeholder="Your position"
                defaultValue="Frontend Developer"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">Bio</label>
              <textarea 
                rows="3" 
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                placeholder="Tell us about yourself"
                defaultValue="Experienced frontend developer with expertise in React and modern web technologies."
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
              onClick={() => showToast('Profile updated', 'success')}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Inbox Tab */}
      {activeTab === 'memberInbox' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Inbox</h3>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={() => showToast('New message started', 'success')}
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
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Project Manager</span>
                    <span className="text-xs text-slate-500">2 hours ago</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Hey Alex, can you review the UI mockups for the NovaTech project? We need to finalize them by tomorrow.</div>
                </div>
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Sam" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Sam Wilson</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Developer</span>
                    <span className="text-xs text-slate-500">4 hours ago</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Great work on the login module! The code review looks good.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Tab */}
      {activeTab === 'memberChatbot' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-yellow-600" />
            <h3 className="text-[18px] tracking-tight font-semibold">AI Assistant</h3>
          </div>
          <div className="h-64 border border-border rounded-lg p-4 overflow-y-auto bg-slate-50">
            {chatbotMessages.map((msg) => (
              <div key={msg.id} className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-xs p-3 rounded-lg text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-white border border-border'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input 
              type="text" 
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
              placeholder="Ask me about your tasks, deadlines, or projects..."
            />
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={() => showToast('Message sent', 'success')}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Personal Planner Tab */}
      {activeTab === 'memberPlanner' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Personal Planner</h3>
            <button 
              className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
              onClick={() => showToast('New task added', 'success')}
            >
              <CheckSquare className="w-4 h-4 mr-1 inline-block" />
              Add Task
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {personalTasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-border" />
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-slate-500">{task.project} • Due {task.dueDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-200' :
                      task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                      'bg-slate-50 text-slate-600 border border-border'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      task.status === 'Pending' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'memberProjects' && (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">All Projects</h3>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                className="rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                placeholder="Search projects..."
              />
              <select className="rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
                <option>All Status</option>
                <option>Active</option>
                <option>In Progress</option>
                <option>Planning</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {allocatedProjects.map((project, index) => (
              <div key={index} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-slate-500">{project.status} • Due {project.dueDate}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                    project.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                    'bg-slate-50 text-slate-600 border border-border'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full">
                    <div className="h-2 rounded-full bg-yellow-500" style={{width: `${project.progress}%`}}></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-500">{project.completed}/{project.tasks} tasks</span>
                    <button 
                      className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm"
                      onClick={() => enterProject(project.name)}
                    >
                      Enter Project
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceMember;
