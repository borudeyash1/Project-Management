export type PlanName = 'free' | 'pro' | 'ultra';

export interface PlanLimits {
  maxProjects: number;
  maxWorkspaces: number;
  maxMembers: number;
  features: {
    aiAssistance: boolean;
    advancedAnalytics: boolean;
    collaborators: boolean;
    ads: boolean;
  };
}

export const SUBSCRIPTION_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    maxProjects: 1,
    maxWorkspaces: 1,
    maxMembers: 5,
    features: {
      aiAssistance: false,
      advancedAnalytics: false,
      collaborators: false,
      ads: true,
    },
  },
  pro: {
    maxProjects: 20,
    maxWorkspaces: 5,
    maxMembers: 25,
    features: {
      aiAssistance: true,
      advancedAnalytics: true,
      collaborators: true,
      ads: false,
    },
  },
  ultra: {
    maxProjects: -1,
    maxWorkspaces: -1,
    maxMembers: -1,
    features: {
      aiAssistance: true,
      advancedAnalytics: true,
      collaborators: true,
      ads: false,
    },
  },
};

export const requiresWorkspaceForProjects = (plan: PlanName): boolean => plan !== 'free';
