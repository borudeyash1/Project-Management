import React, { useMemo, useState } from 'react';
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

  const joinWorkspace = (name, isPublic) => {
    if (isPublic) {
      const newWorkspace = {
        name,
        initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        type: 'Member'
      };
      dispatch({ type: 'ADD_WORKSPACE', payload: newWorkspace });
      dispatch({ type: 'SET_WORKSPACE', payload: name });
      dispatch({ type: 'SET_SECTION', payload: 'workspaceMember' });
      showToast(`Joined ${name}`, 'success');
    } else {
      dispatch({ type: 'ADD_PENDING_REQUEST', payload: { name, requestedAt: new Date().toISOString() } });
      showToast('Join request sent. Awaiting approval.', 'info');
    }
  };

  const allWorkspaces = [
    {
      name: 'NovaTech',
      initials: 'NT',
      members: 32,
      type: 'Public',
      description: 'Design & development studio. We build web experiences.',
      color: 'bg-yellow-500',
      category: 'Technology',
      location: 'San Francisco, CA',
      founded: '2020',
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
      category: 'Enterprise',
      location: 'New York, NY',
      founded: '2018',
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
      color: 'bg-emerald-500',
      category: 'Climate Tech',
      location: 'Austin, TX',
      founded: '2021',
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
      color: 'bg-purple-500',
      category: 'Data Science',
      location: 'Seattle, WA',
      founded: '2019',
      avatars: [
        'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=100&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'
      ]
    },
    {
      name: 'Creative Studio',
      initials: 'CS',
      members: 18,
      type: 'Public',
      description: 'Full-service creative agency specializing in branding and digital marketing.',
      color: 'bg-pink-500',
      category: 'Creative',
      location: 'Los Angeles, CA',
      founded: '2022',
      avatars: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop'
      ]
    },
    {
      name: 'FinTech Solutions',
      initials: 'FS',
      members: 67,
      type: 'Private',
      description: 'Financial technology platform for modern banking and payments.',
      color: 'bg-blue-500',
      category: 'FinTech',
      location: 'Chicago, IL',
      founded: '2017',
      avatars: [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop'
      ]
    }
  ];

  // Local UI state: search, type filter, pagination (prototype)
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    let list = allWorkspaces;
    
    // Type filter
    if (typeFilter !== 'All') list = list.filter(w => w.type === typeFilter);
    
    // Category filter
    if (categoryFilter !== 'All') list = list.filter(w => w.category === categoryFilter);
    
    // Search filter
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(w => 
        w.name.toLowerCase().includes(q) || 
        w.description.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.location.toLowerCase().includes(q)
      );
    }
    
    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'members': return b.members - a.members;
        case 'founded': return b.founded - a.founded;
        default: return 0;
      }
    });
    
    return list;
  }, [allWorkspaces, query, typeFilter, categoryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const setFilter = (val) => { setTypeFilter(val); setPage(1); };

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
                className="w-72 rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                placeholder="Search workspace..."
                value={query}
                onChange={(e)=>{ setQuery(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Type Filter */}
        {['All','Public','Private'].map(f => (
          <button 
            key={f}
            className={`px-3 py-1.5 rounded-full border text-sm ${typeFilter===f?'bg-yellow-100 border-yellow-400':'border-border hover:bg-slate-50'}`}
            onClick={()=>setFilter(f)}
          >
            {f}
          </button>
        ))}
        
        {/* Category Filter */}
        <select 
          className="px-3 py-1.5 rounded-full border border-border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
        >
          <option value="All">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Enterprise">Enterprise</option>
          <option value="Climate Tech">Climate Tech</option>
          <option value="Data Science">Data Science</option>
          <option value="Creative">Creative</option>
          <option value="FinTech">FinTech</option>
        </select>
        
        {/* Sort Filter */}
        <select 
          className="px-3 py-1.5 rounded-full border border-border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="members">Sort by Members</option>
          <option value="founded">Sort by Founded</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {current.map((workspace, index) => (
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
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  workspace.type === 'Public' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {workspace.type}
                </span>
                <button className="p-2 rounded-md hover:bg-slate-50">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-sm text-slate-600">{workspace.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span>📍 {workspace.location}</span>
                <span>🏢 Founded {workspace.founded}</span>
                <span className={`px-2 py-0.5 rounded-full ${
                  workspace.category === 'Technology' ? 'bg-blue-50 text-blue-600' :
                  workspace.category === 'Enterprise' ? 'bg-purple-50 text-purple-600' :
                  workspace.category === 'Climate Tech' ? 'bg-emerald-50 text-emerald-600' :
                  workspace.category === 'Data Science' ? 'bg-indigo-50 text-indigo-600' :
                  workspace.category === 'Creative' ? 'bg-pink-50 text-pink-600' :
                  workspace.category === 'FinTech' ? 'bg-green-50 text-green-600' :
                  'bg-slate-50 text-slate-600'
                }`}>
                  {workspace.category}
                </span>
              </div>
            </div>
            
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
                    ? 'text-white bg-yellow-500 hover:bg-yellow-600' 
                    : 'border border-border hover:bg-slate-50'
                }`}
                onClick={() => joinWorkspace(workspace.name, workspace.type === 'Public')}
              >
                {workspace.type === 'Public' ? 'Join' : 'Request access'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-slate-500">Showing {current.length} of {filtered.length}</div>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-md border border-border hover:bg-slate-50 text-sm" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Previous</button>
          <span className="text-xs text-slate-500 px-2">{page}/{totalPages}</span>
          <button className="px-3 py-1.5 rounded-md text-white text-sm bg-yellow-500 disabled:opacity-50" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDiscover;
