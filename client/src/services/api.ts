import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User, Workspace, Project, Task, Notification as AppNotification, Client } from '../types';
import { buildDesktopDeviceInfo } from '../constants/desktop';

export interface SubscriptionPlanData {
  planKey: 'free' | 'pro' | 'ultra';
  displayName: string;
  summary: string;
  monthlyPrice: number;
  yearlyPrice: number;
  order: number;
  perHeadPrice: number;
  workspaceFees: { personal: number; team: number; enterprise: number };
  limits: { maxWorkspaces: number; maxProjects: number; maxTeamMembers: number; storageInGB: number };

  features: {
    aiAccess: boolean;
    adsEnabled: boolean;
    collaboratorAccess: boolean;
    customStorageIntegration: boolean;
    desktopAppAccess: boolean;
    automaticScheduling: boolean;
    realtimeAISuggestions: boolean;
  };
}

export interface CustomBillingResponse {
  requiresCustomBilling: boolean;
  billing: {
    baseFee: number;
    perHeadPrice: number;
    estimatedMembers: number;
    total: number;
  };
}

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

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

    if (response.data && response.data.accessToken) {
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
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
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

  async createDesktopSessionToken(): Promise<{ token: string; expiresAt: string }> {
    const deviceInfo = buildDesktopDeviceInfo();
    const response = await this.request<{ token: string; expiresAt: string }>('/auth/desktop-session', {
      method: 'POST',
      body: JSON.stringify({
        ...(deviceInfo ? { deviceInfo } : {})
      })
    });

    if (!response.data) {
      throw new Error('Failed to create desktop session token');
    }

    return response.data;
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

  async getSubscriptionPlans(): Promise<SubscriptionPlanData[]> {
    const response = await fetch(`${this.baseURL}/subscriptions`, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to load subscription plans');
    }
    const data = await response.json();
    return data.data || [];
  }

  async upgradeSubscription(planKey: 'free' | 'pro' | 'ultra', billingCycle: 'monthly' | 'yearly' = 'monthly'): Promise<User> {
    const response = await this.request<User>('/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planKey, billingCycle })
    });
    return response.data!;
  }

  async sendWorkspaceOtp(): Promise<void> {
    const url = `${this.baseURL}/workspaces/otp`; // endpoint to add
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to send workspace OTP');
    }
  }

  async verifyWorkspaceOtp(code: string): Promise<void> {
    const url = `${this.baseURL}/workspaces/otp/verify`; // endpoint to add
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify({ otp: code })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Invalid OTP');
    }
  }

  async createWorkspaceWithBilling(workspaceData: Partial<Workspace>): Promise<{ data?: Workspace; requiresCustomBilling?: boolean; billing?: CustomBillingResponse['billing'] }> {
    const url = `${this.baseURL}/workspaces`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify(workspaceData)
    });
    const body = await response.json().catch(() => ({}));
    if (response.ok) {
      return { data: body.data };
    }
    if (response.status === 402 && body.requiresCustomBilling) {
      return { requiresCustomBilling: true, billing: body.billing };
    }
    throw new Error(body.message || 'Failed to create workspace');
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

  async searchUsers(query: string): Promise<Array<{ _id: string; fullName: string; email: string; username: string; avatarUrl?: string }>> {
    const encoded = encodeURIComponent(query.trim());
    const response = await this.get<any>(`/users/search?q=${encoded}`);
    return (response.data as any[]) || [];
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

  // Notification endpoints
  async getNotifications(): Promise<AppNotification[]> {
    const response = await this.get<AppNotification[]>('/notifications');
    return response.data || [];
  }

  async markNotificationRead(id: string): Promise<AppNotification | undefined> {
    const response = await this.patch<AppNotification>(`/notifications/${id}/read`);
    return response.data;
  }

  // Client endpoints (workspace-scoped)
  async getClients(workspaceId: string): Promise<Client[]> {
    const response = await this.get<Client[]>(`/clients/workspace/${workspaceId}`);
    return response.data || [];
  }

  async createClient(clientData: Partial<Client> & { workspaceId: string }): Promise<Client> {
    const response = await this.post<Client>('/clients', clientData);
    return response.data!;
  }

  async updateClient(clientId: string, clientData: Partial<Client>): Promise<Client> {
    const response = await this.put<Client>(`/clients/${clientId}`, clientData);
    return response.data!;
  }

  async deleteClient(clientId: string): Promise<void> {
    await this.delete(`/clients/${clientId}`);
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

  // Workspace discovery
  async getDiscoverWorkspaces(): Promise<any[]> {
    const response = await this.get<any>('/workspaces/discover');
    return (response.data as any[]) || [];
  }

  // Workspace invitations
  async sendWorkspaceInvite(
    workspaceId: string,
    payload: { targetUserId?: string; identifier?: string; message?: string },
  ): Promise<void> {
    await this.post(`/workspaces/${workspaceId}/invite`, payload);
  }

  async acceptWorkspaceInvite(workspaceId: string, notificationId?: string): Promise<Workspace> {
    const response = await this.post<Workspace>(`/workspaces/${workspaceId}/accept-invite`, {
      notificationId,
    });
    return response.data!;
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

  // Admin helpers
  async getAdminDevices() {
    return this.request<any>('/admin/devices');
  }

  async getAdminRecentSessions() {
    return this.request<any>('/admin/sessions/recent');
  }

  async uploadRelease(formData: FormData) {
    const response = await fetch(`${this.baseURL}/releases`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || 'Failed to create release');
    }

    return data;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
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

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService(API_BASE_URL);
export default apiService;
export { apiService };