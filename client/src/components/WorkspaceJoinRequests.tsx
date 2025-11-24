import React, { useState, useEffect, useCallback } from 'react';
import { Users, Check, X, Mail } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';

interface JoinRequest {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  message?: string;
  createdAt: string;
}

interface Props {
  workspaceId: string;
}

export default function WorkspaceJoinRequests({ workspaceId }: Props) {
  const { dispatch } = useApp();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 [FRONTEND] Fetching join requests for workspace:', workspaceId);
      const data = await api.getJoinRequests(workspaceId);
      console.log('✅ [FRONTEND] Received join requests:', data);
      setRequests(data);
    } catch (error) {
      console.error('❌ [FRONTEND] Failed to load join requests:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to load join requests'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [workspaceId, dispatch]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (requestId: string) => {
    try {
      await api.approveJoinRequest(workspaceId, requestId);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Join request approved'
        }
      });
      loadRequests();
    } catch (error) {
      console.error('Failed to approve request:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to approve request'
        }
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.rejectJoinRequest(workspaceId, requestId);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Join request rejected'
        }
      });
      loadRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to reject request'
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
        <p className="mt-1 text-sm text-gray-500">
          No one has requested to join this workspace yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Pending Join Requests</h3>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {requests.map((request) => (
            <li key={request._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {request.user.avatarUrl ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={request.user.avatarUrl}
                        alt={request.user.fullName}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {request.user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.user.fullName}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-1" />
                      {request.user.email}
                    </div>
                    {request.message && (
                      <p className="mt-1 text-sm text-gray-600 italic">
                        "{request.message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Requested {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(request._id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request._id)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
