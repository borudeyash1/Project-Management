import apiService from './api';

export interface TeamMemberResponse {
  user: {
    _id: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    username?: string;
    department?: string;
    profile?: {
      jobTitle?: string;
      location?: string;
      timezone?: string;
      bio?: string;
      skills?: string[];
      contactNumber?: string;
      lastActive?: string;
    };
  };
  role: string;
  status: 'active' | 'inactive' | 'on-leave' | 'pending';
  joinedAt?: string;
}

export interface TeamResponse {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  leader: {
    _id: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  };
  members: TeamMemberResponse[];
  skills: string[];
}

export interface TeamStatsResponse {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  roles: Record<string, number>;
}

const endpoint = (workspaceId?: string) => (workspaceId ? `/teams?workspaceId=${workspaceId}` : '/teams');

const teamService = {
  async getTeams(workspaceId?: string): Promise<TeamResponse[]> {
    const response = await apiService.get<TeamResponse[]>(endpoint(workspaceId));
    return response.data || [];
  },
  async getTeam(teamId: string): Promise<TeamResponse> {
    const response = await apiService.get<TeamResponse>(`/teams/${teamId}`);
    if (!response.data) {
      throw new Error('Failed to load team data');
    }
    return response.data;
  },
  async createTeam(payload: Partial<TeamResponse>): Promise<TeamResponse> {
    const response = await apiService.post<TeamResponse>('/teams', payload);
    if (!response.data) {
      throw new Error('Failed to create team');
    }
    return response.data;
  },
  async updateTeam(teamId: string, payload: Partial<TeamResponse>): Promise<TeamResponse> {
    const response = await apiService.put<TeamResponse>(`/teams/${teamId}`, payload);
    if (!response.data) {
      throw new Error('Failed to update team');
    }
    return response.data;
  },
  async deleteTeam(teamId: string): Promise<void> {
    await apiService.delete(`/teams/${teamId}`);
  },
  async addTeamMember(teamId: string, payload: { memberId: string; role?: string; status?: string }) {
    const response = await apiService.post<TeamResponse>(`/teams/${teamId}/members`, payload);
    return response.data;
  },
  async updateTeamMember(teamId: string, memberId: string, payload: { role?: string; status?: string }) {
    const response = await apiService.put<TeamResponse>(`/teams/${teamId}/members/${memberId}`, payload);
    return response.data;
  },
  async removeTeamMember(teamId: string, memberId: string) {
    const response = await apiService.delete<TeamResponse>(`/teams/${teamId}/members/${memberId}`);
    return response.data;
  },
  async getTeamStats(teamId: string): Promise<TeamStatsResponse> {
    const response = await apiService.get<TeamStatsResponse>(`/teams/${teamId}/stats`);
    if (!response.data) {
      throw new Error('Failed to load team stats');
    }
    return response.data;
  },
};

export default teamService;
