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
  onCreateRequest: (request: Partial<Request>) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
}

const ProjectRequestsTab: React.FC<ProjectRequestsTabProps> = ({
  projectId,
  currentUserId,
  isProjectManager,
  requests,
  tasks,
  onCreateRequest,
  onApproveRequest,
  onRejectRequest
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [requestType, setRequestType] = useState<'workload-redistribution' | 'deadline-extension'>('workload-redistribution');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [reason, setReason] = useState('');
  const [requestedDeadline, setRequestedDeadline] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);

  // Filter tasks assigned to current user
  const myTasks = tasks.filter(t => t.assignedTo === currentUserId);

  // Filter requests
  const myRequests = requests.filter(r => r.requestedBy === currentUserId);
  const pendingApprovals = requests.filter(r => r.status === 'pending');

  const handleCreateRequest = () => {
    if (!selectedTaskId || !reason.trim()) {
      alert('Please select a task and provide a reason');
      return;
    }

    const selectedTask = myTasks.find(t => t._id === selectedTaskId);
    if (!selectedTask) return;

    const newRequest: Partial<Request> = {
      _id: `request_${Date.now()}`,
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

                  {rejectingRequestId === request._id ? (
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
                        onClick={() => onApproveRequest(request._id)}
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
