import apiService from './api';
import { Project as ApiProject } from '../types';

export interface TeamMember {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface Project extends Omit<ApiProject, 'createdBy' | 'team'> {
  team: TeamMember[];
  createdBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export interface ProjectFilters {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getProjects = async (workspaceId: string, filters?: ProjectFilters): Promise<Project[]> => {
  try {
    // Convert filters to query string if needed
    const queryString = filters ? '?' + new URLSearchParams(filters as Record<string, string>).toString() : '';
    const response = await apiService.get(`/projects/workspace/${workspaceId}${queryString}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const getProjectById = async (id: string): Promise<Project> => {
  try {
    const response = await apiService.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

export const createProject = async (projectData: Partial<Project>): Promise<Project> => {
  try {
    const response = await apiService.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (id: string, projectData: Partial<Project>): Promise<Project> => {
  try {
    const response = await apiService.put(`/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await apiService.delete(`/projects/${id}`);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const addTeamMember = async (projectId: string, userId: string, role = 'member'): Promise<Project> => {
  try {
    const response = await apiService.post(`/projects/${projectId}/team`, { userId, role });
    return response.data;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
};

export const removeTeamMember = async (projectId: string, userId: string): Promise<Project> => {
  try {
    const response = await apiService.delete(`/projects/${projectId}/team/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing team member:', error);
    throw error;
  }
};
