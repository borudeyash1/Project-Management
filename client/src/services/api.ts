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
      console.log(`🔍 [DEBUG] Making API request to: ${url}`);
      const response = await fetch(url, config);
      console.log(`🔍 [DEBUG] Response status: ${response.status}`);
      console.log(`🔍 [DEBUG] Response ok: ${response.ok}`);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          // If a specific error code like "requiresOtpVerification" is returned, include it
          if (errorData.data?.requiresOtpVerification) {
            const error = new Error(errorMessage);
            (error as any).data = errorData.data; // Attach custom data
            throw error;
          }
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`🔍 [DEBUG] Response data received:`, data);
      console.log(`🔍 [DEBUG] Response data type:`, typeof data);
      console.log(`🔍 [DEBUG] Response data keys:`, Object.keys(data));
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

  // Workspace endpoints
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await this.request<Workspace[]>('/workspaces');
    return response.data!;
  }

  async createWorkspace(workspaceData: Partial<Workspace>): Promise<Workspace> {
    const response = await this.request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(workspaceData),
    });
    return response.data!;
  }

  async updateWorkspace(workspaceId: string, workspaceData: Partial<Workspace>): Promise<Workspace> {
    const response = await this.request<Workspace>(`/workspaces/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify(workspaceData),
    });
    return response.data!;
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await this.request(`/workspaces/${workspaceId}`, {
      method: 'DELETE',
    });
  }

  // Project endpoints
  async getProjects(workspaceId?: string): Promise<Project[]> {
    const endpoint = workspaceId ? `/projects?workspaceId=${workspaceId}` : '/projects';
    const response = await this.request<Project[]>(endpoint);
    return response.data!;
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.data!;
  }

  async updateProject(projectId: string, projectData: Partial<Project>): Promise<Project> {
    const response = await this.request<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    return response.data!;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Task endpoints
  async getTasks(projectId?: string): Promise<Task[]> {
    const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    const response = await this.request<Task[]>(endpoint);
    return response.data!;
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return response.data!;
  }

  async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
    const response = await this.request<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
    return response.data!;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Generic HTTP methods
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService(API_BASE_URL);
export default apiService;
export { apiService };