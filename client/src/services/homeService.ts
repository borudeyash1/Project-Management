import apiService from './api';

export interface DashboardData {
  quickTasks: Array<{
    _id: string;
    title: string;
    dueDate: string;
    completed: boolean;
  }>;
  recentActivity: Array<{
    _id: string;
    message: string;
    timestamp: string;
  }>;
  projects: Array<{
    _id: string;
    name: string;
    description: string;
    status: string;
    progress: number;
    startDate: string;
    endDate: string;
    team: Array<{
      _id: string;
      name: string;
      avatar?: string;
    }>;
  }>;
  notifications: Array<{
    _id: string;
    message: string;
    read: boolean;
    type: string;
    createdAt: string;
  }>;
  deadlines: Array<{
    _id: string;
    title: string;
    dueDate: string;
    project: {
      _id: string;
      name: string;
    };
  }>;
  teamActivity: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    action: string;
    timestamp: string;
  }>;
  recentFiles: Array<{
    _id: string;
    name: string;
    type: string;
    size: number;
    updatedAt: string;
  }>;
}

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await apiService.get('/home/dashboard');
    return response.data || {
      quickTasks: [],
      recentActivity: [],
      projects: [],
      notifications: [],
      deadlines: [],
      teamActivity: [],
      recentFiles: []
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return empty data structure in case of error to prevent UI from breaking
    return {
      quickTasks: [],
      recentActivity: [],
      projects: [],
      notifications: [],
      deadlines: [],
      teamActivity: [],
      recentFiles: []
    };
  }
};
