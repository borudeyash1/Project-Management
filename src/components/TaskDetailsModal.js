import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCircle, 
  Circle, 
  Clock, 
  Flag, 
  User, 
  Calendar, 
  Paperclip, 
  Link, 
  Star,
  Plus,
  Edit,
  Trash2,
  Upload,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const TaskDetailsModal = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [type, setType] = useState('Task');
  const [priority, setPriority] = useState('Medium');
  const [due, setDue] = useState('');
  const [description, setDescription] = useState('');
  const [newMilestone, setNewMilestone] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedLinks, setUploadedLinks] = useState([]);
  const [taskStatus, setTaskStatus] = useState('In Progress');
  const [showVerification, setShowVerification] = useState(false);

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const closeModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'taskDetails' });
  };

  const createTask = () => {
    if (!title || !assignee || !due) {
      showToast('Title, assignee and due are required', 'error');
      return;
    }
    const newTask = {
      id: Date.now(),
      title,
      project: state.currentProject,
      category: type,
      assignee: { name: assignee },
      status: 'Backlog',
      due,
      description,
      priority
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    showToast('Task created', 'success');
    setTitle(''); setAssignee(''); setType('Task'); setPriority('Medium'); setDue(''); setDescription('');
    closeModal();
  };

  // Mock task data
  const taskData = {
    id: 1,
    title: 'Design homepage mockup',
    description: 'Create a modern, responsive homepage design for the NovaTech website with focus on user experience and conversion optimization.',
    status: taskStatus,
    priority: 'High',
    assignee: 'Maria Garcia',
    dueDate: '2024-10-25',
    createdAt: '2024-10-20',
    progress: 60,
    verificationStatus: 'pending',
    projectManager: 'Alex Johnson',
    milestones: [
      { id: 1, title: 'Wireframe creation', completed: true, dueDate: '2024-10-22' },
      { id: 2, title: 'Visual design mockup', completed: true, dueDate: '2024-10-23' },
      { id: 3, title: 'Responsive breakpoints', completed: false, dueDate: '2024-10-24' },
      { id: 4, title: 'Final review and approval', completed: false, dueDate: '2024-10-25' }
    ],
    subtasks: [
      { id: 1, title: 'Research competitor designs', completed: true },
      { id: 2, title: 'Create user personas', completed: true },
      { id: 3, title: 'Design hero section', completed: false },
      { id: 4, title: 'Design features section', completed: false },
      { id: 5, title: 'Design footer', completed: false }
    ],
    comments: [
      { id: 1, author: 'Alex Johnson', message: 'Great progress! The wireframe looks solid.', timestamp: '2024-10-22T10:30:00Z' },
      { id: 2, author: 'Maria Garcia', message: 'Working on the responsive design now. Should be ready by tomorrow.', timestamp: '2024-10-23T14:15:00Z' }
    ],
    attachments: [
      { id: 1, name: 'wireframe-v1.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Maria Garcia' },
      { id: 2, name: 'design-inspiration.png', type: 'image', size: '1.8 MB', uploadedBy: 'Maria Garcia' }
    ],
    links: [
      { id: 1, title: 'Figma Design File', url: 'https://figma.com/design/123', addedBy: 'Maria Garcia' },
      { id: 2, title: 'Design System Guide', url: 'https://design-system.com', addedBy: 'Alex Johnson' }
    ]
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    
    const milestone = {
      id: Date.now(),
      title: newMilestone,
      completed: false,
      dueDate: ''
    };
    
    showToast('Milestone added', 'success');
    setNewMilestone('');
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const subtask = {
      id: Date.now(),
      title: newSubtask,
      completed: false
    };
    
    showToast('Subtask added', 'success');
    setNewSubtask('');
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      author: 'Current User',
      message: newComment,
      timestamp: new Date().toISOString()
    };
    
    showToast('Comment added', 'success');
    setNewComment('');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type.split('/')[0],
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        uploadedBy: 'Current User'
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });
    showToast('Files uploaded successfully', 'success');
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    const title = prompt('Enter link title:');
    
    if (url && title) {
      const newLink = {
        id: Date.now(),
        title,
        url,
        addedBy: 'Current User'
      };
      setUploadedLinks(prev => [...prev, newLink]);
      showToast('Link added', 'success');
    }
  };

  const verifyTask = () => {
    setTaskStatus('Completed');
    showToast('Task verified and completed', 'success');
    setShowVerification(false);
  };

  const requestVerification = () => {
    setTaskStatus('Pending Review');
    showToast('Verification requested from project manager', 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'To Do': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (!state.modals.taskDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold">{taskData.title}</h2>
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(taskData.status)}`}>
                {taskData.status}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(taskData.priority)}`}>
                {taskData.priority}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {taskData.assignee}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Due {taskData.dueDate}
              </span>
              <span className="flex items-center gap-1">
                <Flag className="w-4 h-4" />
                {taskData.progress}% complete
              </span>
            </div>
          </div>
          <button 
            className="p-2 rounded-lg hover:bg-slate-100"
            onClick={closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'overview' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'assign' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('assign')}
            >
              Assign
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'milestones' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('milestones')}
            >
              Milestones
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'subtasks' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('subtasks')}
            >
              Subtasks
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'attachments' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('attachments')}
            >
              Attachments
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'comments' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Comments
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Assign Tab */}
          {activeTab === 'assign' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <input className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" value={title} onChange={(e)=>setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Assign to</label>
                  <select className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" value={assignee} onChange={(e)=>setAssignee(e.target.value)}>
                    <option value="">Select member</option>
                    {(state.projects.find(p=>p.name===state.currentProject)?.team || []).map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                    <option value="Alex Johnson">Alex Johnson</option>
                    <option value="Priya Patel">Priya Patel</option>
                    <option value="Sam Wilson">Sam Wilson</option>
                    <option value="Maria Garcia">Maria Garcia</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" value={type} onChange={(e)=>setType(e.target.value)}>
                    <option>Task</option>
                    <option>Bug</option>
                    <option>Feature</option>
                    <option>Improvement</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" value={priority} onChange={(e)=>setPriority(e.target.value)}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Deadline</label>
                  <input type="date" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" value={due} onChange={(e)=>setDue(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea rows="4" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" value={description} onChange={(e)=>setDescription(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={closeModal}>Cancel</button>
                <button className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500" onClick={createTask}>Create Task</button>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-slate-600">{taskData.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-3">
                  <h4 className="text-sm font-medium mb-2">Progress</h4>
                  <div className="h-2 w-full bg-slate-100 rounded-full">
                    <div className="h-2 rounded-full bg-yellow-500" style={{width: `${taskData.progress}%`}}></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{taskData.progress}% complete</div>
                </div>
                
                <div className="rounded-lg border border-border p-3">
                  <h4 className="text-sm font-medium mb-2">Time Tracking</h4>
                  <div className="text-sm text-slate-600">
                    <div>Estimated: 8 hours</div>
                    <div>Logged: 4.5 hours</div>
                    <div>Remaining: 3.5 hours</div>
                  </div>
                </div>
              </div>

              {/* Verification Section */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="text-sm font-medium mb-3">Task Verification</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Project Manager:</span>
                    <span className="text-sm font-medium">{taskData.projectManager}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      taskData.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-700' :
                      taskData.verificationStatus === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-slate-50 text-slate-700'
                    }`}>
                      {taskData.verificationStatus === 'verified' ? 'Verified' :
                       taskData.verificationStatus === 'pending' ? 'Pending Review' : 'Not Submitted'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {taskData.status === 'In Progress' && (
                      <button 
                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm"
                        onClick={requestVerification}
                      >
                        Request Verification
                      </button>
                    )}
                    
                    {taskData.status === 'Pending Review' && (
                      <button 
                        className="px-3 py-1.5 rounded-lg text-white text-sm bg-yellow-500"
                        onClick={() => setShowVerification(true)}
                      >
                        Verify Task
                      </button>
                    )}
                    
                    {taskData.status === 'Completed' && (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified & Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Milestones</h3>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    className="rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    placeholder="Add milestone"
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                  />
                  <button 
                    className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
                    onClick={addMilestone}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {taskData.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <button className="p-1">
                      {milestone.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className={`text-sm ${milestone.completed ? 'line-through text-slate-500' : 'font-medium'}`}>
                        {milestone.title}
                      </div>
                      {milestone.dueDate && (
                        <div className="text-xs text-slate-500">Due: {milestone.dueDate}</div>
                      )}
                    </div>
                    <button className="p-1 rounded-lg hover:bg-slate-100">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Subtasks</h3>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    className="rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    placeholder="Add subtask"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                  />
                  <button 
                    className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
                    onClick={addSubtask}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {taskData.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <button className="p-1">
                      {subtask.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div className={`flex-1 text-sm ${subtask.completed ? 'line-through text-slate-500' : ''}`}>
                      {subtask.title}
                    </div>
                    <button className="p-1 rounded-lg hover:bg-slate-100">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Attachments</h3>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm cursor-pointer">
                    <Upload className="w-4 h-4 mr-1 inline-block" />
                    Upload Files
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                  <button 
                    className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
                    onClick={addLink}
                  >
                    <Link className="w-4 h-4 mr-1 inline-block" />
                    Add Link
                  </button>
                </div>
              </div>
              
              {/* Files */}
              <div>
                <h4 className="text-sm font-medium mb-2">Files</h4>
                <div className="space-y-2">
                  {[...taskData.attachments, ...uploadedFiles].map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Paperclip className="w-4 h-4 text-slate-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-xs text-slate-500">{file.size} • {file.uploadedBy}</div>
                      </div>
                      <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Links */}
              <div>
                <h4 className="text-sm font-medium mb-2">Links</h4>
                <div className="space-y-2">
                  {[...taskData.links, ...uploadedLinks].map((link) => (
                    <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Link className="w-4 h-4 text-slate-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{link.title}</div>
                        <div className="text-xs text-slate-500">{link.url} • {link.addedBy}</div>
                      </div>
                      <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Comments</h3>
              </div>
              
              <div className="space-y-3">
                {[...taskData.comments].map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-semibold">
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {comment.message.split(/(\@[A-Za-z0-9_]+)/g).map((part, i) => (
                        part.startsWith('@') ? (
                          <span key={i} className="text-blue-600 font-medium">{part}</span>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      ))}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold">
                    CU
                  </div>
                  <div className="flex-1">
                    <textarea 
                      rows="3" 
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex items-center justify-end mt-2">
                      <button 
                        className="px-3 py-1.5 rounded-lg text-white text-sm bg-yellow-500"
                        onClick={addComment}
                      >
                        <MessageSquare className="w-4 h-4 mr-1 inline-block" />
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Verification Modal */}
        {showVerification && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Verify Task Completion</h3>
                <button 
                  className="p-1 rounded-lg hover:bg-slate-100"
                  onClick={() => setShowVerification(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{taskData.title}</h4>
                  <p className="text-sm text-slate-600">{taskData.description}</p>
                </div>
                
                <div className="rounded-lg border border-border p-3">
                  <h5 className="text-sm font-medium mb-2">Verification Checklist</h5>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-border" />
                      All deliverables meet requirements
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-border" />
                      Code quality standards met
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-border" />
                      Documentation completed
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-border" />
                      Testing completed successfully
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">Verification Notes</label>
                  <textarea 
                    rows="3" 
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    placeholder="Add any notes about the verification..."
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <button 
                  className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm flex-1"
                  onClick={() => setShowVerification(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-3 py-2 rounded-lg text-white text-sm bg-emerald-500 flex-1"
                  onClick={verifyTask}
                >
                  <CheckCircle className="w-4 h-4 mr-1 inline-block" />
                  Verify & Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsModal;
