/**
 * API Methods to Add to client/src/services/api.ts
 * 
 * Add these methods after the acceptWorkspaceInvite method (around line 471)
 * Insert them BEFORE the "// Project endpoints" comment
 */

// Join request methods
async sendJoinRequest(workspaceId: string, message?: string): Promise<void> {
  await this.post(`/workspaces/${workspaceId}/join-request`, { message });
}

async getJoinRequests(workspaceId: string): Promise<any[]> {
  const response = await this.get(`/workspaces/${workspaceId}/join-requests`);
  return response.data || [];
}

async approveJoinRequest(workspaceId: string, requestId: string): Promise<void> {
  await this.post(`/workspaces/${workspaceId}/join-requests/${requestId}/approve`, {});
}

async rejectJoinRequest(workspaceId: string, requestId: string): Promise<void> {
  await this.post(`/workspaces/${workspaceId}/join-requests/${requestId}/reject`, {});
}

// Workspace settings
async updateWorkspaceSettings(workspaceId: string, settings: any): Promise<Workspace> {
  const response = await this.put<Workspace>(`/workspaces/${workspaceId}/settings`, { settings });
  return response.data!;
}

// Member management with OTP
async removeMember(workspaceId: string, memberId: string, reason: string, otp: string): Promise<void> {
  await this.delete(`/workspaces/${workspaceId}/members/${memberId}?reason=${encodeURIComponent(reason)}&otp=${otp}`);
}

async sendMemberRemovalOtp(workspaceId: string): Promise<void> {
  await this.post(`/workspaces/${workspaceId}/members/removal-otp`, {});
}

// Client management with OTP
async sendClientDeletionOtp(clientId: string): Promise<void> {
  await this.post(`/clients/${clientId}/deletion-otp`, {});
}

async deleteClientWithOtp(clientId: string, otp: string): Promise<void> {
  await this.delete(`/clients/${clientId}?otp=${otp}`);
}

// Member reporting
async reportMember(data: {
  workspaceId: string;
  reportedUserId: string;
  reason: string;
  description: string;
}): Promise<void> {
  await this.post('/reports/member', data);
}

async getReports(workspaceId: string): Promise<any[]> {
  const response = await this.get(`/reports/workspace/${workspaceId}`);
  return response.data || [];
}
