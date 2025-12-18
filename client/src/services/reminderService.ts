import apiService from './api';

export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  type: 'task' | 'meeting' | 'deadline' | 'milestone' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  project?: {
    _id: string;
    name: string;
    color: string;
  };
  assignee?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  notifications: Array<{
    type: 'email' | 'push' | 'sms';
    minutesBefore: number;
    sent?: boolean;
  }>;
  snoozedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class ReminderService {
  async getReminders(workspaceId?: string): Promise<Reminder[]> {
    const endpoint = workspaceId ? `/reminders?workspaceId=${workspaceId}` : '/reminders';
    const response = await apiService.get<Reminder[]>(endpoint);
    return response.data || [];
  }

  async createReminder(reminderData: Partial<Reminder>): Promise<Reminder> {
    const response = await apiService.post<Reminder>('/reminders', reminderData);
    return response.data!;
  }

  async updateReminder(reminderId: string, reminderData: Partial<Reminder>): Promise<Reminder> {
    const response = await apiService.put<Reminder>(`/reminders/${reminderId}`, reminderData);
    return response.data!;
  }

  async deleteReminder(reminderId: string): Promise<void> {
    await apiService.delete(`/reminders/${reminderId}`);
  }

  async toggleCompletion(reminderId: string): Promise<Reminder> {
    const response = await apiService.patch<Reminder>(`/reminders/${reminderId}/toggle`);
    return response.data!;
  }

  async snoozeReminder(reminderId: string, snoozedUntil: Date): Promise<Reminder> {
    const response = await apiService.patch<Reminder>(`/reminders/${reminderId}/snooze`, { snoozedUntil });
    return response.data!;
  }
}

export default new ReminderService();
