import { apiService } from './api';

export interface Report {
  _id: string;
  name: string;
  type: 'productivity' | 'time' | 'team' | 'financial' | 'project' | 'custom';
  description: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  filters?: {
    projects?: string[];
    users?: string[];
    tags?: string[];
  };
  data: any;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportData {
  name: string;
  description?: string;
  type: 'productivity' | 'time' | 'team' | 'financial' | 'project' | 'custom';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  filters?: {
    projects?: string[];
    users?: string[];
    tags?: string[];
  };
  tags?: string[];
  isPublic?: boolean;
}

class ReportService {
  // Get all reports
  async getReports(type?: string, isPublic?: boolean): Promise<Report[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (isPublic !== undefined) params.append('isPublic', String(isPublic));

    const queryString = params.toString();
    const url = `/reports${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<Report[]>(url);
    return response.data || [];
  }

  // Create a new report
  async createReport(reportData: CreateReportData): Promise<Report> {
    const response = await apiService.post<Report>('/reports', reportData);
    return response.data!;
  }

  // Delete a report
  async deleteReport(reportId: string): Promise<void> {
    await apiService.delete(`/reports/${reportId}`);
  }

  // Get project analytics
  async getProjectAnalytics(): Promise<any[]> {
    const response = await apiService.get<any[]>('/reports/analytics/projects');
    return response.data || [];
  }

  // Get team analytics
  async getTeamAnalytics(): Promise<any[]> {
    const response = await apiService.get<any[]>('/reports/analytics/team');
    return response.data || [];
  }

  // Get time analytics
  async getTimeAnalytics(days: number = 30): Promise<any> {
    const response = await apiService.get<any>(`/reports/analytics/time?days=${days}`);
    return response.data || {};
  }
}

export const reportService = new ReportService();
