import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, UserPlus, Calendar, Flag, Building2, Users, Clock } from 'lucide-react';

const CreateProjectModal = () => {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Internal',
    category: 'Development',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    status: 'Draft',
    client: '',
    teamMembers: []
  });

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const closeModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'createProject' });
    setStep(1);
    setFormData({
      name: '',
      description: '',
      type: 'Internal',
      category: 'Development',
      startDate: '',
      endDate: '',
      priority: 'Medium',
      status: 'Draft',
      client: '',
      teamMembers: []
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.startDate) {
        showToast('Please fill in required fields', 'error');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    const newProject = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      progress: 0
    };
    
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    showToast('Project created successfully', 'success');
    closeModal();
  };

  const addTeamMember = (member) => {
    if (!formData.teamMembers.find(m => m.id === member.id)) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, { ...member, role: 'Member' }]
      }));
    }
  };

  const removeTeamMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== memberId)
    }));
  };

  const updateMemberRole = (memberId, role) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(m => 
        m.id === memberId ? { ...m, role } : m
      )
    }));
  };

  // Mock employees data
  const availableEmployees = [
    { id: 1, name: 'Alex Johnson', email: 'alex@proxima.app', role: 'Owner', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop' },
    { id: 2, name: 'Priya Patel', email: 'priya@proxima.app', role: 'Project Manager', avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop' },
    { id: 3, name: 'Sam Wilson', email: 'sam@proxima.app', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop' },
    { id: 4, name: 'Maria Garcia', email: 'maria@proxima.app', role: 'Designer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop' },
    { id: 5, name: 'David Chen', email: 'david@proxima.app', role: 'QA Engineer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop' }
  ];

  const projectTypes = ['Internal', 'Client', 'Personal', 'Departmental'];
  const categories = ['Development', 'Design', 'Marketing', 'HR', 'Sales', 'Operations'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Draft', 'Active', 'On Hold', 'Completed', 'Archived'];
  const roles = ['Project Manager', 'Developer', 'Designer', 'QA Engineer', 'Member'];

  if (!state.modals.createProject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Create New Project</h2>
            <p className="text-sm text-slate-500">Step {step} of 2</p>
          </div>
          <button 
            className="p-2 rounded-lg hover:bg-slate-100"
            onClick={closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 border-b border-border">
          <div className="h-2 bg-slate-100 rounded-full">
            <div 
              className="h-2 bg-yellow-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Project Name *</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea 
                  rows="3" 
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
                  placeholder="Project description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Project Type</label>
                  <select 
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    {projectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select 
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Start Date *</label>
                  <input 
                    type="date" 
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">End Date</label>
                  <input 
                    type="date" 
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Priority</label>
                  <select 
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select 
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Client</label>
                <select 
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                >
                  <option value="">Select a client</option>
                  <option value="NovaTech">NovaTech</option>
                  <option value="Alpha Corp">Alpha Corp</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Team Allocation */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Allocate Team Members</h3>
                <p className="text-sm text-slate-600 mb-4">Select team members and assign their roles for this project.</p>
              </div>

              {/* Selected Team Members */}
              {formData.teamMembers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Selected Team Members</h4>
                  <div className="space-y-2">
                    {formData.teamMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <img className="h-8 w-8 rounded-full" src={member.avatar} alt={member.name} />
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-slate-500">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            className="rounded-lg border border-border px-2 py-1 text-sm"
                            value={member.role}
                            onChange={(e) => updateMemberRole(member.id, e.target.value)}
                          >
                            {roles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                          <button 
                            className="px-2 py-1 rounded-md border border-border hover:bg-slate-50 text-sm text-red-600"
                            onClick={() => removeTeamMember(member.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Employees */}
              <div>
                <h4 className="text-sm font-medium mb-2">Available Employees</h4>
                <div className="space-y-2">
                  {availableEmployees
                    .filter(emp => !formData.teamMembers.find(m => m.id === emp.id))
                    .map(employee => (
                      <div key={employee.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <img className="h-8 w-8 rounded-full" src={employee.avatar} alt={employee.name} />
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-xs text-slate-500">{employee.email}</div>
                            <div className="text-xs text-slate-400">{employee.role}</div>
                          </div>
                        </div>
                        <button 
                          className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm"
                          onClick={() => addTeamMember(employee)}
                        >
                          <UserPlus className="w-4 h-4 mr-1 inline-block" />
                          Add
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <button 
            className="px-4 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
            onClick={closeModal}
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button 
                className="px-4 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </button>
            )}
            {step < 2 ? (
              <button 
                className="px-4 py-2 rounded-lg text-white text-sm bg-yellow-500"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button 
                className="px-4 py-2 rounded-lg text-white text-sm bg-yellow-500"
                onClick={handleSubmit}
              >
                Create Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
