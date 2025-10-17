import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Send,
  X
} from 'lucide-react';

const WorkloadDeadlineModal = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('workload');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestType, setRequestType] = useState('workload');
  const [requestData, setRequestData] = useState({
    taskId: '',
    reason: '',
    newDeadline: '',
    newWorkload: '',
    priority: 'Medium'
  });

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const closeModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'workloadDeadline' });
    setShowRequestForm(false);
    setRequestData({
      taskId: '',
      reason: '',
      newDeadline: '',
      newWorkload: '',
      priority: 'Medium'
    });
  };

  const handleRequestSubmit = () => {
    if (!requestData.reason) {
      showToast('Please provide a reason for the request', 'error');
      return;
    }
    
    showToast(`${requestType === 'workload' ? 'Workload' : 'Deadline'} request submitted`, 'success');
    setShowRequestForm(false);
    setRequestData({
      taskId: '',
      reason: '',
      newDeadline: '',
      newWorkload: '',
      priority: 'Medium'
    });
  };

  // Mock data for workload and deadline management
  const workloadRequests = [
    {
      id: 1,
      employee: 'Priya Patel',
      task: 'UI Review for NovaTech Website',
      currentWorkload: 8,
      requestedWorkload: 6,
      reason: 'QA environment delays affecting testing',
      status: 'pending',
      submittedAt: '2024-10-24T10:30:00Z',
      priority: 'High'
    },
    {
      id: 2,
      employee: 'Sam Wilson',
      task: 'API Integration',
      currentWorkload: 12,
      requestedWorkload: 10,
      reason: 'PTO scheduled for Friday',
      status: 'approved',
      submittedAt: '2024-10-23T14:15:00Z',
      priority: 'Medium'
    }
  ];

  const deadlineRequests = [
    {
      id: 1,
      employee: 'Alex Johnson',
      task: 'Final QA pass',
      currentDeadline: '2024-10-27',
      requestedDeadline: '2024-10-30',
      reason: 'Additional testing requirements discovered',
      status: 'pending',
      submittedAt: '2024-10-24T09:45:00Z',
      priority: 'High'
    },
    {
      id: 2,
      employee: 'Maria Garcia',
      task: 'Design mockups',
      currentDeadline: '2024-10-25',
      requestedDeadline: '2024-10-26',
      reason: 'Client feedback requires minor adjustments',
      status: 'approved',
      submittedAt: '2024-10-23T16:20:00Z',
      priority: 'Low'
    }
  ];

  const teamWorkload = [
    { name: 'Alex Johnson', role: 'Project Manager', currentTasks: 8, maxCapacity: 10, utilization: 80 },
    { name: 'Priya Patel', role: 'Frontend Developer', currentTasks: 6, maxCapacity: 8, utilization: 75 },
    { name: 'Sam Wilson', role: 'Backend Developer', currentTasks: 7, maxCapacity: 8, utilization: 87.5 },
    { name: 'Maria Garcia', role: 'UI Designer', currentTasks: 4, maxCapacity: 6, utilization: 66.7 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
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

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-yellow-600';
    return 'text-emerald-600';
  };

  if (!state.modals.workloadDeadline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Workload & Deadline Management</h2>
            <p className="text-sm text-slate-500">Manage team capacity and project deadlines</p>
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
                activeTab === 'workload' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('workload')}
            >
              Workload Management
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'deadline' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('deadline')}
            >
              Deadline Management
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'team' 
                  ? 'bg-yellow-100' 
                  : 'hover:bg-slate-50 border border-border'
              }`}
              onClick={() => setActiveTab('team')}
            >
              Team Overview
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Workload Management Tab */}
          {activeTab === 'workload' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Workload Requests</h3>
                <button 
                  className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
                  onClick={() => {
                    setRequestType('workload');
                    setShowRequestForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1 inline-block" />
                  New Request
                </button>
              </div>

              <div className="space-y-3">
                {workloadRequests.map((request) => (
                  <div key={request.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-slate-500" />
                          <span className="font-medium">{request.employee}</span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">{request.task}</div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span>From {request.currentWorkload} to {request.requestedWorkload} tasks</span>
                          </div>
                          <div className="text-slate-500">{request.reason}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">
                          Approve
                        </button>
                        <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm text-red-600">
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deadline Management Tab */}
          {activeTab === 'deadline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Deadline Requests</h3>
                <button 
                  className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
                  onClick={() => {
                    setRequestType('deadline');
                    setShowRequestForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1 inline-block" />
                  New Request
                </button>
              </div>

              <div className="space-y-3">
                {deadlineRequests.map((request) => (
                  <div key={request.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-slate-500" />
                          <span className="font-medium">{request.employee}</span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">{request.task}</div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>{request.currentDeadline} → {request.requestedDeadline}</span>
                          </div>
                          <div className="text-slate-500">{request.reason}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">
                          Approve
                        </button>
                        <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm text-red-600">
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Overview Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Team Workload Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamWorkload.map((member, index) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-slate-500">{member.role}</div>
                      </div>
                      <span className={`text-sm font-medium ${getUtilizationColor(member.utilization)}`}>
                        {member.utilization}%
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Current Tasks</span>
                        <span>{member.currentTasks}/{member.maxCapacity}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            member.utilization >= 90 ? 'bg-red-500' :
                            member.utilization >= 75 ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`}
                          style={{width: `${member.utilization}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">
                        Rebalance
                      </button>
                      <button className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm">
                        View Tasks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Form */}
          {showRequestForm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    New {requestType === 'workload' ? 'Workload' : 'Deadline'} Request
                  </h3>
                  <button 
                    className="p-1 rounded-lg hover:bg-slate-100"
                    onClick={() => setShowRequestForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">Task</label>
                    <select 
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                      value={requestData.taskId}
                      onChange={(e) => setRequestData(prev => ({ ...prev, taskId: e.target.value }))}
                    >
                      <option value="">Select a task</option>
                      <option value="1">UI Review for NovaTech Website</option>
                      <option value="2">API Integration</option>
                      <option value="3">Design mockups</option>
                    </select>
                  </div>
                  
                  {requestType === 'workload' && (
                    <div>
                      <label className="text-sm font-medium block mb-1">New Workload</label>
                      <input 
                        type="number" 
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                        placeholder="Number of tasks"
                        value={requestData.newWorkload}
                        onChange={(e) => setRequestData(prev => ({ ...prev, newWorkload: e.target.value }))}
                      />
                    </div>
                  )}
                  
                  {requestType === 'deadline' && (
                    <div>
                      <label className="text-sm font-medium block mb-1">New Deadline</label>
                      <input 
                        type="date" 
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                        value={requestData.newDeadline}
                        onChange={(e) => setRequestData(prev => ({ ...prev, newDeadline: e.target.value }))}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Priority</label>
                    <select 
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                      value={requestData.priority}
                      onChange={(e) => setRequestData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Reason</label>
                    <textarea 
                      rows="3" 
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                      placeholder="Explain why this change is needed"
                      value={requestData.reason}
                      onChange={(e) => setRequestData(prev => ({ ...prev, reason: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <button 
                    className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm flex-1"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500 flex-1"
                    onClick={handleRequestSubmit}
                  >
                    <Send className="w-4 h-4 mr-1 inline-block" />
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkloadDeadlineModal;
