import React, { useState, useEffect } from 'react';
import { 
  Bell, Filter, Check, Trash2, RefreshCw, 
  Inbox, CheckCircle, AlertCircle, Info,
  Briefcase, Users, FileText, Calendar, MessageSquare,
  UserPlus, UserCheck, X as XIcon, Eye, ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
  metadata?: {
    workspaceId?: string;
    invitationId?: string;
    joinRequestId?: string;
    taskId?: string;
    projectId?: string;
    status?: string;
  };
}

const NotificationsPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, filter, typeFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/notifications');
      const notifs = (response as any)?.data || [];
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (id: string) => {
    try {
      await apiService.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      await Promise.all(unreadIds.map(id => apiService.put(`/notifications/${id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiService.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(
        Array.from(selectedNotifications).map(id => apiService.delete(`/notifications/${id}`))
      );
      setNotifications(prev => prev.filter(n => !selectedNotifications.has(n._id)));
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedNotifications(newSelection);
  };

  const selectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n._id)));
    }
  };

  // Action handlers
  const handleAcceptInvitation = async (notification: Notification) => {
    const workspaceId = notification.relatedId || notification.metadata?.workspaceId;
    if (!workspaceId) return;

    setActionLoading(prev => new Set(prev).add(notification._id));
    try {
      await apiService.post(`/workspaces/${workspaceId}/accept-invite`);
      await deleteNotification(notification._id);
      alert('Workspace invitation accepted!');
      loadNotifications();
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      alert(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification._id);
        return newSet;
      });
    }
  };

  const handleDeclineInvitation = async (notification: Notification) => {
    const workspaceId = notification.relatedId || notification.metadata?.workspaceId;
    if (!workspaceId) return;

    setActionLoading(prev => new Set(prev).add(notification._id));
    try {
      await apiService.post(`/workspaces/${workspaceId}/decline-invite`);
      await deleteNotification(notification._id);
      alert('Workspace invitation declined');
      loadNotifications();
    } catch (error: any) {
      console.error('Failed to decline invitation:', error);
      alert(error.response?.data?.message || 'Failed to decline invitation');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification._id);
        return newSet;
      });
    }
  };

  const handleApproveJoinRequest = async (notification: Notification) => {
    const joinRequestId = notification.metadata?.joinRequestId;
    const workspaceId = notification.relatedId || notification.metadata?.workspaceId;
    
    console.log('[APPROVE] Notification:', notification);
    console.log('[APPROVE] joinRequestId:', joinRequestId);
    console.log('[APPROVE] workspaceId:', workspaceId);
    
    if (!joinRequestId || !workspaceId) {
      console.error('[APPROVE] Missing required IDs');
      alert('Cannot approve: Missing required information. Please refresh the page.');
      return;
    }

    setActionLoading(prev => new Set(prev).add(notification._id));
    try {
      console.log('[APPROVE] Calling API:', `/workspaces/${workspaceId}/join-requests/${joinRequestId}/approve`);
      await apiService.post(`/workspaces/${workspaceId}/join-requests/${joinRequestId}/approve`);
      await deleteNotification(notification._id);
      alert('Join request approved!');
      loadNotifications();
    } catch (error: any) {
      console.error('Failed to approve join request:', error);
      alert(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification._id);
        return newSet;
      });
    }
  };

  const handleRejectJoinRequest = async (notification: Notification) => {
    const joinRequestId = notification.metadata?.joinRequestId;
    const workspaceId = notification.relatedId || notification.metadata?.workspaceId;
    
    console.log('[REJECT] Notification:', notification);
    console.log('[REJECT] joinRequestId:', joinRequestId);
    console.log('[REJECT] workspaceId:', workspaceId);
    
    if (!joinRequestId || !workspaceId) {
      console.error('[REJECT] Missing required IDs');
      alert('Cannot reject: Missing required information. Please refresh the page.');
      return;
    }

    setActionLoading(prev => new Set(prev).add(notification._id));
    try {
      console.log('[REJECT] Calling API:', `/workspaces/${workspaceId}/join-requests/${joinRequestId}/reject`);
      await apiService.post(`/workspaces/${workspaceId}/join-requests/${joinRequestId}/reject`);
      await deleteNotification(notification._id);
      alert('Join request rejected');
      loadNotifications();
    } catch (error: any) {
      console.error('Failed to reject join request:', error);
      alert(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification._id);
        return newSet;
      });
    }
  };

  const handleViewWorkspace = (notification: Notification) => {
    const workspaceId = notification.relatedId || notification.metadata?.workspaceId;
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}`);
    }
  };

  const handleViewTask = (notification: Notification) => {
    const taskId = notification.metadata?.taskId;
    if (taskId) {
      navigate(`/tasks?taskId=${taskId}`);
    }
  };

  const handleViewProject = (notification: Notification) => {
    const projectId = notification.metadata?.projectId;
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  // Render action buttons based on notification type and context
  const renderActionButtons = (notification: Notification) => {
    const isLoading = actionLoading.has(notification._id);
    const title = notification.title.toLowerCase();
    const message = notification.message.toLowerCase();

    // Workspace invitation
    if (title.includes('invitation') || message.includes('invited you')) {
      if (message.includes('accepted') || message.includes('joined')) {
        return (
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm flex items-center gap-1">
              <UserCheck className="w-4 h-4" />
              Joined
            </span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleAcceptInvitation(notification)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={() => handleDeclineInvitation(notification)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <XIcon className="w-4 h-4" />
            Decline
          </button>
        </div>
      );
    }

    // Join request (for workspace owner)
    if (title.includes('join request') && !title.includes('approved') && !title.includes('rejected')) {
      // Check if we have the necessary metadata
      if (!notification.metadata?.joinRequestId) {
        return (
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg text-sm">
              ⚠️ This notification will be auto-fixed on next refresh
            </span>
          </div>
        );
      }
      
      return (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleApproveJoinRequest(notification)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => handleRejectJoinRequest(notification)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <XIcon className="w-4 h-4" />
            Reject
          </button>
        </div>
      );
    }

    // Join request approved/rejected status
    if (title.includes('approved')) {
      return (
        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
          <button
            onClick={() => handleViewWorkspace(notification)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            View Workspace
          </button>
        </div>
      );
    }

    if (title.includes('rejected')) {
      return (
        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm flex items-center gap-1">
            <XIcon className="w-4 h-4" />
            Rejected
          </span>
        </div>
      );
    }

    // Task notification
    if (notification.type === 'task' || title.includes('task')) {
      return (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleViewTask(notification)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View Task
          </button>
        </div>
      );
    }

    // Project notification
    if (notification.type === 'project' || title.includes('project')) {
      return (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleViewProject(notification)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View Project
          </button>
        </div>
      );
    }

    // Workspace-related (general)
    if (notification.type === 'workspace' && notification.relatedId) {
      return (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleViewWorkspace(notification)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View Workspace
          </button>
        </div>
      );
    }

    return null;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'workspace':
        return <Briefcase className="w-5 h-5" />;
      case 'team':
        return <Users className="w-5 h-5" />;
      case 'task':
        return <FileText className="w-5 h-5" />;
      case 'reminder':
        return <Calendar className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'workspace':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'team':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'task':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'reminder':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'message':
        return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
      case 'success':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const uniqueTypes = Array.from(new Set(notifications.map(n => n.type)));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Bell className="w-6 h-6" />
              {t('navigation.notifications') || 'Notifications'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount} unread • {notifications.length} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadNotifications}
              disabled={loading}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              } transition-colors`}
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className={`px-3 py-1.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {selectedNotifications.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedNotifications.size} selected
              </span>
              <button
                onClick={deleteSelected}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Inbox className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={selectAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Select all</span>
            </div>

            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border transition-all ${
                  notification.read
                    ? isDarkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                    : isDarkMode
                    ? 'bg-blue-900/20 border-blue-700'
                    : 'bg-blue-50 border-blue-200'
                } ${
                  selectedNotifications.has(notification._id)
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification._id)}
                    onChange={() => toggleSelection(notification._id)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          isDarkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getNotificationColor(notification.type)}`}>
                            {notification.type}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        {renderActionButtons(notification)}
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className={`p-2 rounded-lg ${
                              isDarkMode
                                ? 'hover:bg-gray-700 text-gray-400'
                                : 'hover:bg-gray-100 text-gray-600'
                            } transition-colors`}
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className={`p-2 rounded-lg ${
                            isDarkMode
                              ? 'hover:bg-red-900/30 text-red-400'
                              : 'hover:bg-red-50 text-red-600'
                          } transition-colors`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
