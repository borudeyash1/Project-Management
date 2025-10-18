import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User, Workspace, Project, Task } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
    }

    return response.data!;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
    }

    return response.data!;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
    }

    return response.data!;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/auth/me');
    return response.data!;
  }

  // User endpoints
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data!;
  }

  async updateSettings(settings: any): Promise<User> {
    const response = await this.request<User>('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return response.data!;
  }

  // Workspace endpoints
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await this.request<Workspace[]>('/workspaces');
    return response.data!;
  }

  async getWorkspace(id: string): Promise<Workspace> {
    const response = await this.request<Workspace>(`/workspaces/${id}`);
    return response.data!;
  }

  async createWorkspace(workspaceData: Partial<Workspace>): Promise<Workspace> {
    const response = await this.request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(workspaceData),
    });
    return response.data!;
  }

  async updateWorkspace(id: string, workspaceData: Partial<Workspace>): Promise<Workspace> {
    const response = await this.request<Workspace>(`/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workspaceData),
    });
    return response.data!;
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.request(`/workspaces/${id}`, {
      method: 'DELETE',
    });
  }

  async inviteMember(workspaceId: string, email: string, role: string): Promise<void> {
    await this.request(`/workspaces/${workspaceId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await this.request(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Project endpoints
  async getProjects(workspaceId?: string): Promise<Project[]> {
    const endpoint = workspaceId ? `/projects?workspace=${workspaceId}` : '/projects';
    const response = await this.request<Project[]>(endpoint);
    return response.data!;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.request<Project>(`/projects/${id}`);
    return response.data!;
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.data!;
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const response = await this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    return response.data!;
  }

  async deleteProject(id: string): Promise<void> {
    await this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async addTeamMember(projectId: string, userId: string, role: string): Promise<void> {
    await this.request(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  }

  async removeTeamMember(projectId: string, userId: string): Promise<void> {
    await this.request(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Task endpoints
  async getTasks(projectId?: string): Promise<Task[]> {
    const endpoint = projectId ? `/tasks?project=${projectId}` : '/tasks';
    const response = await this.request<Task[]>(endpoint);
    return response.data!;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.request<Task>(`/tasks/${id}`);
    return response.data!;
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return response.data!;
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const response = await this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
    return response.data!;
  }

  async deleteTask(id: string): Promise<void> {
    await this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async addComment(taskId: string, content: string): Promise<void> {
    await this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async addTimeEntry(taskId: string, timeEntryData: any): Promise<void> {
    await this.request(`/tasks/${taskId}/time-entries`, {
      method: 'POST',
      body: JSON.stringify(timeEntryData),
    });
  }

  // Utility methods
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
