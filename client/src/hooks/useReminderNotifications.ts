import { useEffect, useRef, useState, useCallback } from 'react';

interface Reminder {
  _id: string;
  title: string;
  description?: string;
  type: 'task' | 'meeting' | 'deadline' | 'milestone' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  completed: boolean;
  snoozedUntil?: Date;
  notifications: Array<{
    type: 'email' | 'push' | 'sms';
    minutesBefore: number;
    sent?: boolean;
  }>;
}

interface NotificationOptions {
  sound?: boolean;
  volume?: number;
  vibrate?: boolean;
}

export const useReminderNotifications = (
  reminders: Reminder[],
  options: NotificationOptions = {}
) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifiedReminders, setNotifiedReminders] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound files for different priorities
  const sounds = {
    low: '/sounds/chime.mp3',
    medium: '/sounds/bell.mp3',
    high: '/sounds/alert.mp3',
    urgent: '/sounds/alarm.mp3'
  };

  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        return perm === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  };

  // Play notification sound
  const playSound = useCallback((priority: string = 'medium') => {
    if (!options.sound) return;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = sounds[priority as keyof typeof sounds] || sounds.medium;
      audioRef.current.volume = options.volume || 0.5;
      audioRef.current.play().catch(err => {
        console.log('Sound play failed:', err);
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [options.sound, options.volume, sounds]);

  // Vibrate device (mobile)
  const vibrate = useCallback(() => {
    if (options.vibrate && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [options.vibrate]);

  // Show browser notification
  const showNotification = useCallback((reminder: Reminder, minutesBefore: number) => {
    if (permission !== 'granted') return;

    const title = minutesBefore > 0
      ? `Reminder in ${minutesBefore} minutes`
      : `Reminder: ${reminder.title}`;

    const body = reminder.description ||
      `${reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)} due now`;

    const notification = new Notification(title, {
      body,
      icon: '/logo192.png',
      badge: '/badge.png',
      tag: reminder._id,
      requireInteraction: reminder.priority === 'urgent' || reminder.priority === 'high',
      data: {
        reminderId: reminder._id,
        minutesBefore
      }
      // Note: 'actions' property is not supported in standard Notification API
      // Use Service Worker notifications for action buttons
    });

    notification.onclick = () => {
      window.focus();
      // Navigate to reminder detail
      window.location.hash = `#/reminders/${reminder._id}`;
      notification.close();
    };

    // Play sound and vibrate
    playSound(reminder.priority);
    vibrate();

    // Mark as notified
    setNotifiedReminders(prev => new Set(prev).add(`${reminder._id}-${minutesBefore}`));
  }, [permission, playSound, vibrate]);

  // Check if reminder should trigger notification
  const shouldNotify = useCallback((reminder: Reminder, minutesBefore: number): boolean => {
    // Don't notify if completed
    if (reminder.completed) return false;

    // Don't notify if snoozed
    if (reminder.snoozedUntil && new Date(reminder.snoozedUntil) > new Date()) {
      return false;
    }

    // Don't notify if already notified
    const notificationKey = `${reminder._id}-${minutesBefore}`;
    if (notifiedReminders.has(notificationKey)) return false;

    // Check if it's time to notify
    const now = new Date();
    const dueDate = new Date(reminder.dueDate);
    const notifyTime = new Date(dueDate.getTime() - minutesBefore * 60 * 1000);

    // Notify if current time is within 1 minute of notify time
    const timeDiff = Math.abs(now.getTime() - notifyTime.getTime());
    return timeDiff < 60 * 1000; // Within 1 minute
  }, [notifiedReminders]);

  // Check all reminders for notifications
  const checkReminders = useCallback(() => {
    reminders.forEach(reminder => {
      // Check each notification setting
      reminder.notifications?.forEach(notif => {
        if (notif.type === 'push' && shouldNotify(reminder, notif.minutesBefore)) {
          showNotification(reminder, notif.minutesBefore);
        }
      });

      // Also check for exact due time
      if (shouldNotify(reminder, 0)) {
        showNotification(reminder, 0);
      }
    });
  }, [reminders, shouldNotify, showNotification]);

  // Initialize
  useEffect(() => {
    // Request permission on mount
    if (permission === 'default') {
      requestPermission();
    }

    // Set up periodic check (every 30 seconds)
    checkIntervalRef.current = setInterval(() => {
      checkReminders();
    }, 30000);

    // Initial check
    checkReminders();

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkReminders, permission]);

  // Handle service worker notifications (for actions)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'notification-action') {
          const { action, reminderId } = event.data;

          if (action === 'snooze') {
            // Trigger snooze callback
            console.log('Snooze reminder:', reminderId);
          } else if (action === 'dismiss') {
            // Trigger dismiss callback
            console.log('Dismiss reminder:', reminderId);
          }
        }
      });
    }
  }, []);

  return {
    permission,
    requestPermission,
    showNotification,
    playSound,
    checkReminders
  };
};

// Snooze hook
export const useReminderSnooze = () => {
  const snoozeOptions = [
    { label: '5 minutes', minutes: 5 },
    { label: '10 minutes', minutes: 10 },
    { label: '15 minutes', minutes: 15 },
    { label: '30 minutes', minutes: 30 },
    { label: '1 hour', minutes: 60 },
    { label: '2 hours', minutes: 120 },
    { label: '4 hours', minutes: 240 },
    { label: 'Tomorrow 9 AM', minutes: -1 }, // Special case
    { label: 'Next Monday 9 AM', minutes: -2 }, // Special case
  ];

  const calculateSnoozeTime = (minutes: number): Date => {
    const now = new Date();

    if (minutes === -1) {
      // Tomorrow 9 AM
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow;
    } else if (minutes === -2) {
      // Next Monday 9 AM
      const nextMonday = new Date(now);
      const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
      nextMonday.setHours(9, 0, 0, 0);
      return nextMonday;
    } else {
      // Add minutes
      return new Date(now.getTime() + minutes * 60 * 1000);
    }
  };

  const snoozeReminder = (reminderId: string, minutes: number, updateCallback: (id: string, snoozedUntil: Date) => void) => {
    const snoozedUntil = calculateSnoozeTime(minutes);
    updateCallback(reminderId, snoozedUntil);
  };

  return {
    snoozeOptions,
    snoozeReminder,
    calculateSnoozeTime
  };
};

// Export calendar (iCal format)
export const exportToICalendar = (reminders: Reminder[]): string => {
  let ical = 'BEGIN:VCALENDAR\n';
  ical += 'VERSION:2.0\n';
  ical += 'PRODID:-//Project Management System//Reminders//EN\n';
  ical += 'CALSCALE:GREGORIAN\n';
  ical += 'METHOD:PUBLISH\n';

  reminders.forEach(reminder => {
    ical += 'BEGIN:VEVENT\n';
    ical += `UID:${reminder._id}@pms.com\n`;
    ical += `DTSTAMP:${formatICalDate(new Date())}\n`;
    ical += `DTSTART:${formatICalDate(reminder.dueDate)}\n`;
    ical += `SUMMARY:${escapeICalText(reminder.title)}\n`;

    if (reminder.description) {
      ical += `DESCRIPTION:${escapeICalText(reminder.description)}\n`;
    }

    // Priority (1=high, 5=medium, 9=low)
    const priorityMap = { urgent: 1, high: 3, medium: 5, low: 9 };
    ical += `PRIORITY:${priorityMap[reminder.priority]}\n`;

    ical += `STATUS:${reminder.completed ? 'COMPLETED' : 'CONFIRMED'}\n`;

    // Alarms
    reminder.notifications?.forEach(notif => {
      if (notif.type === 'push' || notif.type === 'email') {
        ical += 'BEGIN:VALARM\n';
        ical += 'ACTION:DISPLAY\n';
        ical += `TRIGGER:-PT${notif.minutesBefore}M\n`;
        ical += `DESCRIPTION:${escapeICalText(reminder.title)}\n`;
        ical += 'END:VALARM\n';
      }
    });

    ical += 'END:VEVENT\n';
  });

  ical += 'END:VCALENDAR';

  return ical;
};

const formatICalDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const escapeICalText = (text: string): string => {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
};

export const downloadICalendar = (reminders: Reminder[], filename: string = 'reminders.ics') => {
  const icalContent = exportToICalendar(reminders);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
