import apiService from './api';

export interface PlannerEvent {
  _id: string;
  title: string;
  description?: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  color?: string;
  projectId?: string;
  createdBy: string;
  participants?: Array<{
    userId: string;
    status: 'accepted' | 'declined' | 'tentative' | 'none';
  }>;
  reminders?: Array<{
    method: 'email' | 'notification' | 'both';
    minutesBefore: number;
  }>;
  slackChannelId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerFilters {
  start?: Date | string;
  end?: Date | string;
  projectId?: string;
  userId?: string;
}

export const getPlannerEvents = async (filters?: PlannerFilters): Promise<PlannerEvent[]> => {
  try {
    // Convert dates to ISO strings if they are Date objects
    const queryParams: Record<string, string> = {};

    if (filters) {
      if (filters.start) {
        queryParams.start = filters.start instanceof Date ? filters.start.toISOString() : filters.start;
      }
      if (filters.end) {
        queryParams.end = filters.end instanceof Date ? filters.end.toISOString() : filters.end;
      }
      if (filters.projectId) {
        queryParams.projectId = filters.projectId;
      }
      if (filters.userId) {
        queryParams.userId = filters.userId;
      }
    }

    const queryString = Object.keys(queryParams).length > 0
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';

    const response = await apiService.get(`/planner/events${queryString}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching planner events:', error);
    throw error;
  }
};

export const createPlannerEvent = async (eventData: Omit<PlannerEvent, '_id' | 'createdAt' | 'updatedAt'>): Promise<PlannerEvent> => {
  try {
    const response = await apiService.post('/planner/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating planner event:', error);
    throw error;
  }
};

export const updatePlannerEvent = async (id: string, eventData: Partial<PlannerEvent>): Promise<PlannerEvent> => {
  try {
    const response = await apiService.put(`/planner/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating planner event:', error);
    throw error;
  }
};

export const deletePlannerEvent = async (id: string): Promise<void> => {
  try {
    await apiService.delete(`/planner/events/${id}`);
  } catch (error) {
    console.error('Error deleting planner event:', error);
    throw error;
  }
};

export const updateEventParticipation = async (
  eventId: string,
  status: 'accepted' | 'declined' | 'tentative'
): Promise<PlannerEvent> => {
  try {
    const response = await apiService.post(`/planner/events/${eventId}/participate`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating event participation:', error);
    throw error;
  }
};
export const getPlannerData = async (filters?: {
  workspaceId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}): Promise<{
  tasks: any[];
  reminders: any[];
  milestones: any[];
  events: PlannerEvent[];
}> => {
  try {
    const queryParams: Record<string, string> = {};

    if (filters) {
      if (filters.workspaceId) queryParams.workspaceId = filters.workspaceId;
      if (filters.startDate) queryParams.startDate = filters.startDate instanceof Date ? filters.startDate.toISOString() : filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate instanceof Date ? filters.endDate.toISOString() : filters.endDate;
    }

    const queryString = Object.keys(queryParams).length > 0
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';

    const response = await apiService.get(`/planner/data${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all planner data:', error);
    throw error;
  }
};
