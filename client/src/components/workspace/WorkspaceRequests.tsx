import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, X, Clock, User, Mail, Calendar, MessageSquare } from 'lucide-react';

interface JoinRequest {
  _id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  message: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

const WorkspaceRequests: React.FC = () => {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Mock requests data
  const requests: JoinRequest[] = [
    {
      _id: '1',
      user: {
        name: 'Michael Johnson',
        email: 'michael@example.com'
      },
      message: 'I would like to join your workspace to collaborate on projects.',
      requestedAt: new Date('2024-03-20'),
      status: 'pending'
    },
    {
      _id: '2',
      user: {
        name: 'Emily Davis',
        email: 'emily@example.com'
      },
      message: 'Interested in contributing to your team projects.',
      requestedAt: new Date('2024-03-19'),
      status: 'pending'
    },
    {
      _id: '3',
      user: {
        name: 'David Wilson',
        email: 'david@example.com'
      },
      message: 'Looking forward to working with your team.',
      requestedAt: new Date('2024-03-18'),
      status: 'approved'
    }
  ];

  const filteredRequests = requests.filter(req => 
    filter === 'all' || req.status === filter
  );

  const handleApprove = (requestId: string) => {
    dispatch({
      type: 'ADD_TOAST',
      payload: { message: 'Request approved successfully', type: 'success' }
    });
  };

  const handleReject = (requestId: string) => {
    dispatch({
      type: 'ADD_TOAST',
      payload: { message: 'Request rejected', type: 'info' }
    });
  };

  const stats = [
    { label: 'Total Requests', value: requests.length, color: 'text-accent-dark' },
    { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: 'text-green-600' },
    { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: 'text-red-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Join Requests</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Manage workspace join requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-300 dark:border-gray-600">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab
                ? 'border-accent-dark text-accent-dark'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request._id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-accent-dark" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {request.user.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      request.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{request.user.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{request.requestedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.message && (
                    <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-gray-600" />
                      <p>{request.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(request._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request._id)}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">
            <Clock className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No {filter !== 'all' && filter} requests
          </h3>
          <p className="text-gray-600 dark:text-gray-200">
            {filter === 'pending' ? 'No pending requests at the moment' : `No ${filter} requests to show`}
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkspaceRequests;
