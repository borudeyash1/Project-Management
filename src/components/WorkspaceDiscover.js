import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, MoreHorizontal } from 'lucide-react';

const WorkspaceDiscover = () => {
  const { state, dispatch } = useApp();

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const toggleModal = (modalName) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: modalName });
  };

  const joinWorkspace = (name) => {
    const newWorkspace = {
      name,
      initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      type: 'Member'
    };
    
    dispatch({ type: 'ADD_WORKSPACE', payload: newWorkspace });
    dispatch({ type: 'SET_WORKSPACE', payload: name });
    dispatch({ type: 'SET_SECTION', payload: 'workspaceOwner' });
    showToast(`Joined ${name}`, 'success');
  };

  const workspaces = [
    {
      name: 'NovaTech',
      initials: 'NT',
      members: 32,
      type: 'Public',
      description: 'Design & development studio. We build web experiences.',
      color: 'bg-primary',
      avatars: [
        'https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80',
        'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=100&auto=format&fit=crop'
      ]
    },
    {
      name: 'Acme Corp',
      initials: 'AC',
      members: 24,
      type: 'Private',
      description: 'Enterprise solutions and mobile platforms for retail and logistics.',
      color: 'bg-slate-900',
      avatars: [
        'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop'
      ]
    },
    {
      name: 'GreenLeaf Labs',
      initials: 'GL',
      members: 14,
      type: 'Public',
      description: 'Climate tech R&D — sensors, dashboards, and IoT analytics.',
      color: 'bg-teal',
      avatars: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop'
      ]
    },
    {
      name: 'Quantum Analytics',
      initials: 'QA',
      members: 51,
      type: 'Private',
      description: 'Data science consultancy — BI, ML pipelines, and ops.',
      color: 'bg-purple',
      avatars: [
        'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=100&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] tracking-tight font-semibold">Workspaces</h2>
          <p className="text-sm text-slate-600">Search, filter, and join workspaces</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
            onClick={() => toggleModal('createWorkspace')}
          >
            <Plus className="w-4 h-4 mr-1 inline-block" />
            Create
          </button>
          <div className="hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                className="w-72 rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
                placeholder="Search workspace..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="px-3 py-1.5 rounded-full border border-border bg-primary-100 text-sm">All</button>
        <button className="px-3 py-1.5 rounded-full border border-border hover:bg-slate-50 text-sm">Public</button>
        <button className="px-3 py-1.5 rounded-full border border-border hover:bg-slate-50 text-sm">Private</button>
        <button className="px-3 py-1.5 rounded-full border border-border hover:bg-slate-50 text-sm">Region: US</button>
        <button className="px-3 py-1.5 rounded-full border border-border hover:bg-slate-50 text-sm">Industry: Tech</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {workspaces.map((workspace, index) => (
          <div key={index} className="bg-white border border-border rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold tracking-tight ${workspace.color}`}>
                  {workspace.initials}
                </div>
                <div>
                  <div className="font-medium">{workspace.name}</div>
                  <div className="text-xs text-slate-500">{workspace.members} members • {workspace.type}</div>
                </div>
              </div>
              <button className="p-2 rounded-md hover:bg-slate-50">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mt-3">{workspace.description}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex -space-x-2">
                {workspace.avatars.map((avatar, idx) => (
                  <img 
                    key={idx}
                    className="h-7 w-7 rounded-full border-2 border-white" 
                    src={avatar}
                    alt="Member"
                  />
                ))}
                <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs text-slate-600">
                  +{workspace.members - 2}
                </div>
              </div>
              <button 
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  workspace.type === 'Public' 
                    ? 'text-white bg-primary' 
                    : 'border border-border hover:bg-slate-50'
                }`}
                onClick={() => joinWorkspace(workspace.name)}
              >
                {workspace.type === 'Public' ? 'Join' : 'Request access'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-slate-500">Showing 4 results</div>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-md border border-border hover:bg-slate-50 text-sm">Previous</button>
          <button className="px-3 py-1.5 rounded-md text-white text-sm bg-primary">Next</button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDiscover;
