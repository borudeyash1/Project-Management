import apiService from './api';

export interface TimeEntry {
  _id: string;
  description: string;
  projectId?: string;
  taskId?: string;
  startTime: Date | string;
  endTime?: Date | string;
  duration?: number; // in seconds
  billable: boolean;
  tags?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntryFilters {
  startDate?: Date | string;
  endDate?: Date | string;
  projectId?: string;
  taskId?: string;
  userId?: string;
  billable?: boolean;
  tags?: string[];
}

export interface TimeSummary {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  byProject: Array<{
    projectId: string;
    projectName: string;
    totalHours: number;
    billableHours: number;
  }>;
  byDate: Array<{
    date: string;
    totalHours: number;
  }>;
}

export const getTimeEntries = async (filters?: TimeEntryFilters): Promise<TimeEntry[]> => {
  try {
    const queryParams: Record<string, string> = {};
    
    if (filters) {
      if (filters.startDate) {
        queryParams.startDate = filters.startDate instanceof Date 
          ? filters.startDate.toISOString() 
          : filters.startDate;
      }
      if (filters.endDate) {
        queryParams.endDate = filters.endDate instanceof Date 
          ? filters.endDate.toISOString() 
          : filters.endDate;
      }
      if (filters.projectId) queryParams.projectId = filters.projectId;
      if (filters.taskId) queryParams.taskId = filters.taskId;
      if (filters.userId) queryParams.userId = filters.userId;
      if (filters.billable !== undefined) queryParams.billable = String(filters.billable);
      if (filters.tags && filters.tags.length > 0) queryParams.tags = filters.tags.join(',');
    }
    
    const queryString = Object.keys(queryParams).length > 0 
      ? '?' + new URLSearchParams(queryParams).toString() 
      : '';
      
    const response = await apiService.get(`/tracker/entries${queryString}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching time entries:', error);
    throw error;
  }
};

export const getTimeSummary = async (filters?: Omit<TimeEntryFilters, 'taskId'>): Promise<TimeSummary> => {
  try {
    const queryParams: Record<string, string> = {};
    
    if (filters) {
      if (filters.startDate) {
        queryParams.startDate = filters.startDate instanceof Date 
          ? filters.startDate.toISOString() 
          : filters.startDate;
      }
      if (filters.endDate) {
        queryParams.endDate = filters.endDate instanceof Date 
          ? filters.endDate.toISOString() 
          : filters.endDate;
      }
      if (filters.projectId) queryParams.projectId = filters.projectId;
      if (filters.userId) queryParams.userId = filters.userId;
      if (filters.billable !== undefined) queryParams.billable = String(filters.billable);
      if (filters.tags && filters.tags.length > 0) queryParams.tags = filters.tags.join(',');
    }
    
    const queryString = Object.keys(queryParams).length > 0 
      ? '?' + new URLSearchParams(queryParams).toString() 
      : '';
      
    const response = await apiService.get(`/tracker/summary${queryString}`);
    return response.data || {
      totalHours: 0,
      billableHours: 0,
      nonBillableHours: 0,
      byProject: [],
      byDate: []
    };
  } catch (error) {
    console.error('Error fetching time summary:', error);
    return {
      totalHours: 0,
      billableHours: 0,
      nonBillableHours: 0,
      byProject: [],
      byDate: []
    };
  }
};

export const startTimeEntry = async (entryData: Omit<TimeEntry, '_id' | 'startTime' | 'endTime' | 'duration' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> => {
  try {
    const response = await apiService.post('/tracker/entries/start', entryData);
    return response.data;
  } catch (error) {
    console.error('Error starting time entry:', error);
    throw error;
  }
};

export const stopTimeEntry = async (entryId: string, endTime?: Date | string): Promise<TimeEntry> => {
  try {
    const response = await apiService.post(`/tracker/entries/${entryId}/stop`, { endTime });
    return response.data;
  } catch (error) {
    console.error('Error stopping time entry:', error);
    throw error;
  }
};

export const createTimeEntry = async (entryData: Omit<TimeEntry, '_id' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> => {
  try {
    const response = await apiService.post('/tracker/entries', entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating time entry:', error);
    throw error;
  }
};

export const updateTimeEntry = async (id: string, entryData: Partial<TimeEntry>): Promise<TimeEntry> => {
  try {
    const response = await apiService.put(`/tracker/entries/${id}`, entryData);
    return response.data;
  } catch (error) {
    console.error('Error updating time entry:', error);
    throw error;
  }
};

export const deleteTimeEntry = async (id: string): Promise<void> => {
  try {
    await apiService.delete(`/tracker/entries/${id}`);
  } catch (error) {
    console.error('Error deleting time entry:', error);
    throw error;
  }
};
