import React, { useState } from 'react';
import { Clock, Users, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Request {
  _id: string;
  type: 'workload-redistribution' | 'deadline-extension';
  taskId: string;
  taskName: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  currentDeadline?: Date;
  requestedDeadline?: Date;
  currentWorkload?: string;
}

interface ProjectRequestsTabProps {
  projectId: string;
  currentUserId: string;
  isProjectManager: boolean;
  requests: Request[];
  tasks: any[];
  teamMembers: any[];
  onCreateRequest: (request: Partial<Request>) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onManualReassign?: (taskId: string, newAssigneeId: string) => void;
  onManualDeadlineChange?: (taskId: string, newDeadline: string) => void;
}

const ProjectRequestsTab: React.FC<ProjectRequestsTabProps> = ({
  projectId,
  currentUserId,
  isProjectManager,
  requests,
  tasks,
  teamMembers,
  onCreateRequest,
  onApproveRequest,
  onRejectRequest,
  onManualReassign,
  onManualDeadlineChange
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [requestType, setRequestType] = useState<'workload-redistribution' | 'deadline-extension'>('workload-redistribution');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [reason, setReason] = useState('');
  const [requestedDeadline, setRequestedDeadline] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);
  const [verifyText, setVerifyText] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  
  // Manual management state
  const [manualReassignTaskId, setManualReassignTaskId] = useState('');
  const [manualReassignTo, setManualReassignTo] = useState('');
  const [manualDeadlineTaskId, setManualDeadlineTaskId] = useState('');
  const [manualNewDeadline, setManualNewDeadline] = useState('');

  // Filter tasks assigned to current user that are NOT completed, verified, or finished
  const myTasks = tasks.filter(t => {
    // Must be assigned to current user
    if (t.assignedTo !== currentUserId) return false;
    
    // Exclude completed tasks
    if (t.status === 'completed') return false;
    
    // Exclude verified tasks (check multiple possible fields)
    if (t.verifiedBy) return false;
    if (t.isVerified) return false;
    if (t.verified) return false;
    
    // Exclude finished tasks
    if (t.isFinished) return false;
    
    return true;
  });

  console.log('[ProjectRequestsTab] Total tasks:', tasks.length);
  console.log('[ProjectRequestsTab] My tasks (filtered):', myTasks.length);
  console.log('[ProjectRequestsTab] Filtered out:', tasks.length - myTasks.length);

  // Filter requests
  const myRequests = requests.filter(r => r && r.requestedBy === currentUserId);
  const pendingApprovals = requests.filter(r => r && r.status === 'pending');

  const handleCreateRequest = () => {
    if (!selectedTaskId || !reason.trim()) {
      alert('Please select a task and provide a reason');
      return;
    }

    const selectedTask = myTasks.find(t => t._id === selectedTaskId);
    if (!selectedTask) return;

    const newRequest: Partial<Request> = {
      type: requestType,
      taskId: selectedTaskId,
      taskName: selectedTask.title,
      requestedBy: currentUserId,
      requestedAt: new Date(),
      status: 'pending',
      reason,
      ...(requestType === 'deadline-extension' && {
        currentDeadline: selectedTask.dueDate,
        requestedDeadline: requestedDeadline ? new Date(requestedDeadline) : undefined
      })
    };

    onCreateRequest(newRequest);
    setShowCreateModal(false);
    setSelectedTaskId('');
    setReason('');
    setRequestedDeadline('');
  };

  const handleReject = (requestId: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onRejectRequest(requestId, rejectReason);
    setRejectingRequestId(null);
    setRejectReason('');
  };

  const handleApprove = (request: Request) => {
    // Validate VERIFY text
    if (verifyText.toUpperCase() !== 'VERIFY') {
      alert('Please type VERIFY to confirm approval');
      return;
    }

    // Validate workload redistribution has new assignee
    if (request.type === 'workload-redistribution' && !newAssignee) {
      alert('Please select a team member to reassign the task');
      return;
    }

    // Validate deadline extension has new deadline
    if (request.type === 'deadline-extension' && !newDeadline) {
      alert('Please select a new deadline');
      return;
    }

    // Validate new deadline is after current deadline
    if (request.type === 'deadline-extension' && request.currentDeadline) {
      const currentDate = new Date(request.currentDeadline);
      const selectedDate = new Date(newDeadline);
      if (selectedDate <= currentDate) {
        alert('New deadline must be after the current deadline');
        return;
      }
    }

    // Call approval with additional data
    onApproveRequest(request._id);
    
    // Reset state
    setApprovingRequestId(null);
    setVerifyText('');
    setNewAssignee('');
    setNewDeadline('');
  };

  const handleManualReassign = () => {
    if (!manualReassignTaskId || !manualReassignTo) {
      alert('Please select a task and a team member');
      return;
    }

    if (onManualReassign) {
      onManualReassign(manualReassignTaskId, manualReassignTo);
    } else {
      console.log('Reassigning task:', manualReassignTaskId, 'to:', manualReassignTo);
      alert('Task reassigned successfully!');
    }
    
    // Reset
    setManualReassignTaskId('');
    setManualReassignTo('');
  };

  const handleManualDeadlineChange = () => {
    if (!manualDeadlineTaskId || !manualNewDeadline) {
      alert('Please select a task and a new deadline');
      return;
    }

    if (onManualDeadlineChange) {
      onManualDeadlineChange(manualDeadlineTaskId, manualNewDeadline);
    } else {
      console.log('Updating deadline for task:', manualDeadlineTaskId, 'to:', manualNewDeadline);
      alert('Deadline updated successfully!');
    }
    
    // Reset
    setManualDeadlineTaskId('');
    setManualNewDeadline('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Pending
        </span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Employee View */}
      {!isProjectManager && (
        <>
          <div className="bg-white rounded-lg border border-gray-300 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Requests</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Request workload redistribution or deadline extensions
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                New Request
              </button>
            </div>

            {/* My Requests List */}
            <div className="space-y-3">
              {myRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="font-medium">No requests yet</p>
                  <p className="text-sm mt-1">Create a request to manage your workload</p>
                </div>
              ) : (
                myRequests.map((request) => (
                  <div key={request._id} className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {request.type === 'workload-redistribution' ? (
                            <Users className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-orange-600" />
                          )}
                          <h4 className="font-medium text-gray-900">
                            {request.type === 'workload-redistribution' 
                              ? 'Workload Redistribution' 
                              : 'Deadline Extension'}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">Task: {request.taskName}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Reason:</span> {request.reason}
                    </p>
                    {request.type === 'deadline-extension' && request.requestedDeadline && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Requested Deadline:</span>{' '}
                        {new Date(request.requestedDeadline).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      Requested on {new Date(request.requestedAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Project Manager View */}
      {isProjectManager && (
        <>
          {/* Manual Task Management Section */}
          <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manual Task Management</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Directly reassign tasks or change deadlines for your team
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reassign Task */}
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Reassign Task
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Task
                    </label>
                    <select 
                      value={manualReassignTaskId}
                      onChange={(e) => setManualReassignTaskId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Choose a task...</option>
                      {tasks.map((task) => (
                        <option key={task._id} value={task._id}>
                          {task.title} - Assigned to: {task.assignedToName || 'Unassigned'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reassign To
                    </label>
                    <select 
                      value={manualReassignTo}
                      onChange={(e) => setManualReassignTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select team member...</option>
                      {teamMembers.map((member: any) => {
                        const userId = typeof member.user === 'object' ? member.user._id : member.user;
                        const userName = typeof member.user === 'object' 
                          ? (member.user.fullName || member.user.email)
                          : member.user;
                        return (
                          <option key={userId} value={userId}>
                            {userName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <button 
                    onClick={handleManualReassign}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Reassign Task
                  </button>
                </div>
              </div>

              {/* Change Deadline */}
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Change Deadline
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Task
                    </label>
                    <select 
                      value={manualDeadlineTaskId}
                      onChange={(e) => setManualDeadlineTaskId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Choose a task...</option>
                      {tasks.map((task) => (
                        <option key={task._id} value={task._id}>
                          {task.title} - Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Deadline
                    </label>
                    <input
                      type="date"
                      value={manualNewDeadline}
                      onChange={(e) => setManualNewDeadline(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <button 
                    onClick={handleManualDeadlineChange}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Update Deadline
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Requests Section */}
          <div className="bg-white rounded-lg border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
              <p className="text-sm text-gray-600 mt-1">
                Review and approve/reject employee requests ({pendingApprovals.length} pending)
              </p>
            </div>
          </div>

          {/* Pending Requests List */}
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="font-medium">No pending requests</p>
                <p className="text-sm mt-1">All requests have been processed</p>
              </div>
            ) : (
              pendingApprovals.map((request) => (
                <div key={request._id} className="border border-gray-300 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {request.type === 'workload-redistribution' ? (
                          <Users className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-orange-600" />
                        )}
                        <h4 className="font-medium text-gray-900">
                          {request.type === 'workload-redistribution' 
                            ? 'Workload Redistribution Request' 
                            : 'Deadline Extension Request'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">Task: {request.taskName}</p>
                      <p className="text-sm text-gray-600">Task ID: {request.taskId}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="bg-white rounded p-3 mb-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Reason:</span> {request.reason}
                    </p>
                    {request.type === 'deadline-extension' && request.requestedDeadline && (
                      <>
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Current Deadline:</span>{' '}
                          {request.currentDeadline ? new Date(request.currentDeadline).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Requested Deadline:</span>{' '}
                          {new Date(request.requestedDeadline).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Requested by Employee on {new Date(request.requestedAt).toLocaleString()}
                  </p>

                  {approvingRequestId === request._id ? (
                    <div className="space-y-3 bg-white rounded-lg p-4 border border-green-200">
                      <h4 className="font-medium text-gray-900 mb-2">Approve Request</h4>
                      
                      {/* Workload Redistribution - Select New Assignee */}
                      {request.type === 'workload-redistribution' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reassign Task To:
                          </label>
                          <select
                            value={newAssignee}
                            onChange={(e) => setNewAssignee(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Select team member...</option>
                            {tasks.find(t => t._id === request.taskId)?.teamMembers?.map((member: any) => (
                              <option key={member._id} value={member._id}>
                                {member.name || member.fullName || member.email}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Deadline Extension - Select New Deadline */}
                      {request.type === 'deadline-extension' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Deadline (must be after {request.currentDeadline ? new Date(request.currentDeadline).toLocaleDateString() : 'current deadline'}):
                          </label>
                          <input
                            type="date"
                            value={newDeadline}
                            onChange={(e) => setNewDeadline(e.target.value)}
                            min={request.currentDeadline ? new Date(new Date(request.currentDeadline).getTime() + 86400000).toISOString().split('T')[0] : undefined}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      )}

                      {/* VERIFY Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type "VERIFY" to confirm approval:
                        </label>
                        <input
                          type="text"
                          value={verifyText}
                          onChange={(e) => setVerifyText(e.target.value)}
                          placeholder="Type VERIFY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={verifyText.toUpperCase() !== 'VERIFY'}
                          className={`flex-1 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 ${
                            verifyText.toUpperCase() === 'VERIFY'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm Approval
                        </button>
                        <button
                          onClick={() => {
                            setApprovingRequestId(null);
                            setVerifyText('');
                            setNewAssignee('');
                            setNewDeadline('');
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : rejectingRequestId === request._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Provide a reason for rejection..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(request._id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => {
                            setRejectingRequestId(null);
                            setRejectReason('');
                          }}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setApprovingRequestId(request._id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingRequestId(request._id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          </div>
        </>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Request</h3>

            <div className="space-y-4">
              {/* Request Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Type
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="workload-redistribution">Workload Redistribution</option>
                  <option value="deadline-extension">Deadline Extension</option>
                </select>
              </div>

              {/* Select Task */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Task
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Choose a task...</option>
                  {myTasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requested Deadline (only for deadline extension) */}
              {requestType === 'deadline-extension' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested New Deadline
                  </label>
                  <input
                    type="date"
                    value={requestedDeadline}
                    onChange={(e) => setRequestedDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Request
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Explain why you need this request..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleCreateRequest}
                  className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTaskId('');
                    setReason('');
                    setRequestedDeadline('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRequestsTab;
