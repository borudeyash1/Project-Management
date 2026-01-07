/**
 * Browser Notification Service
 * Handles browser push notifications with permission management
 */

class BrowserNotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Request permission from the user to show notifications
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are supported and permitted
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Check if permission is granted
   */
  isPermissionGranted(): boolean {
    return this.permission === 'granted';
  }

  /**
   * Show a browser notification
   */
  async showNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: any;
      requireInteraction?: boolean;
      silent?: boolean;
      onClick?: () => void;
    }
  ): Promise<void> {
    // Check if notifications are supported
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return;
    }

    // Request permission if not granted
    if (!this.isPermissionGranted()) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return;
      }
    }

    try {
      const notification = new Notification(title, {
        body: options?.body,
        icon: options?.icon || '/logo192.png', // Default app icon
        badge: options?.badge || '/logo192.png',
        tag: options?.tag,
        data: options?.data,
        requireInteraction: options?.requireInteraction || false,
        silent: options?.silent || false,
      });

      // Handle click event
      if (options?.onClick) {
        notification.onclick = () => {
          window.focus();
          options.onClick?.();
          notification.close();
        };
      } else {
        // Default: focus window on click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      // Auto-close after 5 seconds if not requireInteraction
      if (!options?.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Show a notification for a new task assignment
   */
  async showTaskNotification(taskTitle: string, taskId: string): Promise<void> {
    await this.showNotification('New Task Assigned', {
      body: `You have been assigned: ${taskTitle}`,
      icon: '/logo192.png',
      tag: `task-${taskId}`,
      data: { type: 'task', taskId },
      onClick: () => {
        // Navigate to tasks page
        window.location.href = `/planner?taskId=${taskId}`;
      },
    });
  }

  /**
   * Show a notification for a workspace invitation
   */
  async showWorkspaceInviteNotification(
    workspaceName: string,
    inviterId: string
  ): Promise<void> {
    await this.showNotification('Workspace Invitation', {
      body: `You've been invited to join ${workspaceName}`,
      icon: '/logo192.png',
      tag: `workspace-invite-${inviterId}`,
      data: { type: 'workspace_invite', workspaceName },
      onClick: () => {
        // Navigate to notifications page
        window.location.href = '/notifications';
      },
    });
  }

  /**
   * Show a notification for a comment/mention
   */
  async showMentionNotification(
    content: string,
    entityType: string,
    entityId: string
  ): Promise<void> {
    await this.showNotification('You were mentioned', {
      body: content,
      icon: '/logo192.png',
      tag: `mention-${entityId}`,
      data: { type: 'mention', entityType, entityId },
      onClick: () => {
        // Navigate to the relevant page
        window.location.href = '/notifications';
      },
    });
  }

  /**
   * Show a generic notification
   */
  async showGenericNotification(
    title: string,
    message: string,
    notificationId?: string
  ): Promise<void> {
    await this.showNotification(title, {
      body: message,
      icon: '/logo192.png',
      tag: notificationId,
      onClick: () => {
        window.location.href = '/notifications';
      },
    });
  }
}

// Export singleton instance
export const browserNotificationService = new BrowserNotificationService();
export default browserNotificationService;
