import { apiService } from './api';

export interface Goal {
    _id: string;
    title: string;
    description: string;
    type: 'personal' | 'team' | 'project' | 'company';
    category: 'productivity' | 'learning' | 'health' | 'financial' | 'career' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
    progress: number; // 0-100
    startDate: Date;
    targetDate: Date;
    completedDate?: Date;
    createdBy: {
        _id: string;
        fullName: string;
        avatarUrl?: string;
    };
    assignedTo?: {
        _id: string;
        fullName: string;
        avatarUrl?: string;
    };
    project?: {
        _id: string;
        name: string;
        color: string;
    };
    milestones: Array<{
        _id: string;
        title: string;
        description?: string;
        completed: boolean;
        completedDate?: Date;
        dueDate: Date;
    }>;
    tags: string[];
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface GoalStats {
    totalGoals: number;
    completedGoals: number;
    inProgressGoals: number;
    overdueGoals: number;
    averageProgress: number;
    completionRate: number;
    topCategories: Array<{
        category: string;
        count: number;
        completed: number;
    }>;
    recentActivity: Array<{
        _id: string;
        type: 'created' | 'updated' | 'completed' | 'milestone_achieved';
        goal: string;
        user: string;
        timestamp: Date;
    }>;
}

export const goalService = {
    getGoals: async (filters?: any) => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] && filters[key] !== 'all') {
                    queryParams.append(key, filters[key]);
                }
            });
        }
        const response = await apiService.get<{ data: Goal[], count: number }>(`/goals?${queryParams.toString()}`);
        return response.data; // The API returns { success: true, data: [...], count: ... }
    },

    getGoalStats: async () => {
        const response = await apiService.get<{ data: GoalStats }>(`/goals/stats`);
        return response.data?.data;
    },

    createGoal: async (goalData: Partial<Goal>) => {
        const response = await apiService.post<{ data: Goal }>(`/goals`, goalData);
        return response.data?.data;
    },

    updateGoal: async (id: string, goalData: Partial<Goal>) => {
        const response = await apiService.put<{ data: Goal }>(`/goals/${id}`, goalData);
        return response.data?.data;
    },

    deleteGoal: async (id: string) => {
        await apiService.delete(`/goals/${id}`);
    },

    createMilestone: async (goalId: string, milestoneData: any) => {
        const response = await apiService.post<{ data: any }>(`/goals/${goalId}/milestones`, milestoneData);
        return response.data?.data;
    },

    updateMilestone: async (goalId: string, milestoneId: string, milestoneData: any) => {
        const response = await apiService.put<{ data: any }>(`/goals/${goalId}/milestones/${milestoneId}`, milestoneData);
        return response.data?.data;
    },

    deleteMilestone: async (goalId: string, milestoneId: string) => {
        await apiService.delete(`/goals/${goalId}/milestones/${milestoneId}`);
    },

    toggleMilestone: async (goalId: string, milestoneId: string) => {
        const response = await apiService.patch<{ data: any }>(`/goals/${goalId}/milestones/${milestoneId}/toggle`);
        return response.data?.data;
    }
};
