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
<<<<<<< HEAD
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
=======
      console.log(`🔍 [DEBUG] Making API request to: ${url}`);
      const response = await fetch(url, config);
      console.log(`🔍 [DEBUG] Response status: ${response.status}`);
      console.log(`🔍 [DEBUG] Response ok: ${response.ok}`);
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
<<<<<<< HEAD
=======
          // If a specific error code like "requiresOtpVerification" is returned, include it
          if (errorData.data?.requiresOtpVerification) {
            const error = new Error(errorMessage);
            (error as any).data = errorData.data; // Attach custom data
            throw error;
          }
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
<<<<<<< HEAD
=======
      console.log(`🔍 [DEBUG] Response data received:`, data);
      console.log(`🔍 [DEBUG] Response data type:`, typeof data);
      console.log(`🔍 [DEBUG] Response data keys:`, Object.keys(data));
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the server is running on ' + this.baseURL);
      }
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

<<<<<<< HEAD
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
    }

    return response.data!;
=======
  async register(userData: RegisterRequest): Promise<{ requiresOtpVerification: boolean; email: string; userId: string }> {
    console.log('🔍 [DEBUG] API Service - register method called with:', userData);
    
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    console.log('🔍 [DEBUG] API Service - request completed, response:', response);

    // For manual registration, we don't set token immediately, as OTP verification is pending
    // if (response.data && !response.data.requiresOtpVerification) {
    //   this.setToken(response.data.accessToken);
    // }

    // Extract the data from the response
    console.log('🔍 [DEBUG] API Service - Full response:', response);
    console.log('🔍 [DEBUG] API Service - response.data:', response.data);
    console.log('🔍 [DEBUG] API Service - response.data.data:', response.data?.data);
    console.log('🔍 [DEBUG] API Service - response.data exists:', !!response.data);
    console.log('🔍 [DEBUG] API Service - response.data.data exists:', !!response.data?.data);

    // Check if response has the expected structure
    if (response.data && response.data.data) {
      console.log('🔍 [DEBUG] API Service - Extracting data from response.data.data');
      return {
        requiresOtpVerification: response.data.data.requiresOtpVerification,
        email: response.data.data.email,
        userId: response.data.data.userId
      };
    } else if (response.data && response.data.requiresOtpVerification !== undefined) {
      console.log('🔍 [DEBUG] API Service - Extracting data from response.data directly');
      return {
        requiresOtpVerification: response.data.requiresOtpVerification,
        email: response.data.email,
        userId: response.data.userId
      };
    }

    console.log('❌ [DEBUG] API Service - Invalid response structure');
    console.log('❌ [DEBUG] API Service - Available keys:', Object.keys(response));
    console.log('❌ [DEBUG] API Service - response.data keys:', response.data ? Object.keys(response.data) : 'response.data is null/undefined');
    throw new Error('Invalid response from server');
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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

  async googleAuth(googleUserData: any): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleUserData),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
    }

    return response.data!;
  }

<<<<<<< HEAD
=======
  // New OTP endpoints
  async verifyEmailOTP(email: string, otp: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    if (response.data) {
      this.setToken(response.data.accessToken);
    }
    return response.data!;
  }

  async resendEmailOTP(email: string): Promise<{ userId: string; email: string }> {
    const response = await this.request<{ userId: string; email: string }>('/auth/resend-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response.data!;
  }


>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
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

  async getProfile(): Promise<any> {
    const response = await this.request<any>('/users/profile');
    return response.data!;
  }

  async getSettings(): Promise<any> {
    const response = await this.request<any>('/users/settings');
    return response.data!;
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    await this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async addAddress(addressData: any): Promise<void> {
    await this.request('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async addPaymentMethod(paymentData: any): Promise<void> {
    await this.request('/users/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async deleteAccount(data: { reason: string }): Promise<void> {
    await this.request('/users/delete-account', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async exportData(data: { format: string }): Promise<any> {
    const response = await this.request<any>('/users/export-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

<<<<<<< HEAD
=======
  // Token management methods
  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  private clearToken(): void {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
  // Workspace endpoints
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await this.request<Workspace[]>('/workspaces');
    return response.data!;
  }

<<<<<<< HEAD
  async getWorkspace(id: string): Promise<Workspace> {
    const response = await this.request<Workspace>(`/workspaces/${id}`);
    return response.data!;
  }

=======
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
  async createWorkspace(workspaceData: Partial<Workspace>): Promise<Workspace> {
    const response = await this.request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(workspaceData),
    });
    return response.data!;
  }

<<<<<<< HEAD
  async updateWorkspace(id: string, workspaceData: Partial<Workspace>): Promise<Workspace> {
    const response = await this.request<Workspace>(`/workspaces/${id}`, {
=======
  async updateWorkspace(workspaceId: string, workspaceData: Partial<Workspace>): Promise<Workspace> {
    const response = await this.request<Workspace>(`/workspaces/${workspaceId}`, {
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      method: 'PUT',
      body: JSON.stringify(workspaceData),
    });
    return response.data!;
  }

<<<<<<< HEAD
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
=======
  async deleteWorkspace(workspaceId: string): Promise<void> {
    await this.request(`/workspaces/${workspaceId}`, {
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      method: 'DELETE',
    });
  }

  // Project endpoints
  async getProjects(workspaceId?: string): Promise<Project[]> {
<<<<<<< HEAD
    const endpoint = workspaceId ? `/projects?workspace=${workspaceId}` : '/projects';
=======
    const endpoint = workspaceId ? `/projects?workspaceId=${workspaceId}` : '/projects';
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    const response = await this.request<Project[]>(endpoint);
    return response.data!;
  }

<<<<<<< HEAD
  async getProject(id: string): Promise<Project> {
    const response = await this.request<Project>(`/projects/${id}`);
    return response.data!;
  }

=======
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
  async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.data!;
  }

<<<<<<< HEAD
  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const response = await this.request<Project>(`/projects/${id}`, {
=======
  async updateProject(projectId: string, projectData: Partial<Project>): Promise<Project> {
    const response = await this.request<Project>(`/projects/${projectId}`, {
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    return response.data!;
  }

<<<<<<< HEAD
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
=======
  async deleteProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}`, {
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      method: 'DELETE',
    });
  }

  // Task endpoints
  async getTasks(projectId?: string): Promise<Task[]> {
<<<<<<< HEAD
    const endpoint = projectId ? `/tasks?project=${projectId}` : '/tasks';
=======
    const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    const response = await this.request<Task[]>(endpoint);
    return response.data!;
  }

<<<<<<< HEAD
  async getTask(id: string): Promise<Task> {
    const response = await this.request<Task>(`/tasks/${id}`);
    return response.data!;
  }

=======
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return response.data!;
  }

<<<<<<< HEAD
  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const response = await this.request<Task>(`/tasks/${id}`, {
=======
  async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
    const response = await this.request<Task>(`/tasks/${taskId}`, {
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
    return response.data!;
  }

<<<<<<< HEAD
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
=======
  async deleteTask(taskId: string): Promise<void> {
    await this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService(API_BASE_URL);
export default apiService;
export { apiService };  
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
