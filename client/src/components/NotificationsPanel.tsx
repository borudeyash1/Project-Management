import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import apiService from '../services/api';
import { Notification as AppNotification } from '../types';

import { useTranslation } from 'react-i18next';

const NotificationsPanel: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useApp();
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await apiService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };

    loadNotifications();
  }, []);

  const resolveUiType = (notif: AppNotification): 'info' | 'success' | 'warning' | 'error' => {
    // Map domain notification type to UI type
    switch (notif.type) {
      case 'system':
        return 'info';
      case 'workspace':
        return 'info';
      case 'task':
      case 'project':
      default:
        return 'info';
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    // For workspace invites, use explicit Accept/Decline buttons instead of clicking the card
    if (notif.type === 'workspace' && notif.relatedId) {
      return;
    }

    await markAsRead(notif._id);
  };

  const handleAcceptWorkspaceInvite = async (notif: AppNotification) => {
    if (!notif.relatedId) return;
    try {
      // Update UI immediately (optimistic update)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true, actionStatus: 'accepted' } : n))
      );

      await apiService.acceptWorkspaceInvite(notif.relatedId, notif._id);
      await markAsRead(notif._id, 'accepted'); // Mark as read and updated status

      try {
        const workspaces = await apiService.getWorkspaces();
        dispatch({ type: 'SET_WORKSPACES', payload: workspaces });
      } catch (e) {
        console.error('Failed to refresh workspaces after joining', e);
      }
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'You have joined the workspace',
          duration: 3000,
        },
      });
    } catch (error: any) {
      console.error('Failed to accept workspace invite', error);
      // Revert optimism if needed, but for now just toast error
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to join workspace',
          duration: 4000,
        },
      });
    }
  };

  const handleDeclineWorkspaceInvite = async (notif: AppNotification) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, read: true, actionStatus: 'declined' } : n))
    );

    await markAsRead(notif._id, 'declined');

    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'info',
        message: 'Invitation dismissed',
        duration: 2500,
      },
    });
  };

  const markAsRead = async (notificationId: string, actionStatus?: 'accepted' | 'declined') => {
    setNotifications((prev) =>
      prev.map((notif) => (notif._id === notificationId ? { ...notif, read: true, ...(actionStatus ? { actionStatus } : {}) } : notif)),
    );
    try {
      await apiService.markNotificationRead(notificationId, actionStatus);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    const ids = notifications.filter((n) => !n.read).map((n) => n._id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Best-effort: mark each as read in the background
    await Promise.all(ids.map((id) => apiService.markNotificationRead(id).catch(() => undefined)));
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(notifications.filter(notif => notif._id !== notificationId));
    // Mark as read on backend
    try {
      await apiService.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const clearAll = async () => {
    // Mark all as read on backend first
    const ids = notifications.map((n) => n._id);
    await Promise.all(ids.map((id) => apiService.markNotificationRead(id).catch(() => undefined)));
    // Then clear local state
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-accent" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (read) {
      return isDarkMode ? 'bg-gray-800' : 'bg-white';
    }
    switch (type) {
      case 'success':
        return isDarkMode ? 'bg-green-900/20' : 'bg-green-50';
      case 'warning':
        return isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50';
      case 'error':
        return isDarkMode ? 'bg-red-900/20' : 'bg-red-50';
      case 'info':
      default:
        return isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50';
    }
  };

  if (!state.modals.notifications) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Bell className={`w-6 h-6 ${isDarkMode ? 'text-accent-light' : 'text-accent-dark'}`} />
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h2>
              {unreadCount > 0 && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                  {t('notifications.unreadTotal', { count: unreadCount })}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'notifications' })}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className={`flex items-center justify-between px-6 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-300 bg-gray-50'}`}>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className={`text-sm font-medium ${unreadCount === 0
                ? isDarkMode ? 'text-gray-600' : 'text-gray-600'
                : isDarkMode ? 'text-accent-light hover:text-blue-700' : 'text-accent-dark hover:text-blue-700'
                } disabled:cursor-not-allowed`}
            >
              {t('notifications.markAllRead')}
            </button>
            <button
              onClick={clearAll}
              className={`text-sm font-medium ${isDarkMode ? 'text-red-600 hover:text-red-700' : 'text-red-600 hover:text-red-700'}`}
            >
              {t('notifications.clearAll')}
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-700'} mb-4`} />
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-700' : 'text-gray-900'} mb-2`}>
                {t('notifications.empty.title')}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                {t('notifications.empty.message')}
              </p>
            </div>
          ) : (
            <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 ${getNotificationBg(resolveUiType(notif), notif.read)} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors cursor-pointer group`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-accent rounded-full mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'} mt-1`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          {notif.type === 'workspace' && notif.relatedId && (
                            ((notif.actionStatus && ['accepted', 'declined'].includes(notif.actionStatus)) || (notif.metadata?.status && ['accepted', 'declined'].includes(notif.metadata.status))) ? (
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${(notif.actionStatus || notif.metadata?.status) === 'accepted'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {(notif.actionStatus || notif.metadata?.status) === 'accepted' ? 'Accepted' : 'Declined'}
                              </span>
                            ) : !notif.read && (notif.title?.toLowerCase().includes('invite') || notif.message?.toLowerCase().includes('invite')) && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptWorkspaceInvite(notif);
                                  }}
                                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-600 text-white hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeclineWorkspaceInvite(notif);
                                  }}
                                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                  Decline
                                </button>
                              </div>
                            )
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif._id);
                            }}
                            className={`opacity-0 group-hover:opacity-100 p-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
                              } transition-opacity`}
                          >
                            <Trash2 className={`w-3 h-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />
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
    </div>
  );
};

export default NotificationsPanel;
