import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

const NotificationsPanel: React.FC = () => {
  const { state, dispatch } = useApp();
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        _id: '1',
        title: 'New task assigned',
        message: 'You have been assigned to "Homepage Redesign" task',
        type: 'info',
        timestamp: new Date('2024-03-23T10:30:00'),
        read: false
      },
      {
        _id: '2',
        title: 'Project deadline approaching',
        message: 'E-commerce Platform project is due in 2 days',
        type: 'warning',
        timestamp: new Date('2024-03-23T09:15:00'),
        read: false
      },
      {
        _id: '3',
        title: 'Task completed',
        message: 'Sarah Johnson completed "API Integration" task',
        type: 'success',
        timestamp: new Date('2024-03-22T16:45:00'),
        read: true
      },
      {
        _id: '4',
        title: 'Meeting reminder',
        message: 'Team standup meeting starts in 15 minutes',
        type: 'info',
        timestamp: new Date('2024-03-23T08:45:00'),
        read: false
      },
      {
        _id: '5',
        title: 'Comment on your task',
        message: 'Mike Chen commented on "Database optimization"',
        type: 'info',
        timestamp: new Date('2024-03-22T14:20:00'),
        read: true
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif =>
      notif._id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notif => notif._id !== notificationId));
  };

  const clearAll = () => {
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
        return <Info className="w-5 h-5 text-blue-500" />;
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
            <Bell className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h2>
              {unreadCount > 0 && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'notifications' })}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className={`flex items-center justify-between px-6 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className={`text-sm font-medium ${
                unreadCount === 0
                  ? isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  : isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              } disabled:cursor-not-allowed`}
            >
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className={`text-sm font-medium ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} />
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
                No notifications
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 ${getNotificationBg(notif.type, notif.read)} ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  } transition-colors cursor-pointer group`}
                  onClick={() => markAsRead(notif._id)}
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
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {new Date(notif.timestamp).toLocaleString()}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif._id);
                          }}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded ${
                            isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                          } transition-opacity`}
                        >
                          <Trash2 className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
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
