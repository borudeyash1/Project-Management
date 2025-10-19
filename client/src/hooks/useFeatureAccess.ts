import { useApp } from '../context/AppContext';

export interface FeatureLimits {
  maxWorkspaces: number;
  maxProjects: number;
  maxTeamMembers: number;
  maxStorage: number; // GB
  aiAssistance: boolean;
  advancedAnalytics: boolean;
  customIntegrations: boolean;
  prioritySupport: boolean;
  whiteLabeling: boolean;
  apiAccess: boolean;
}

export interface PlanFeatures {
  free: FeatureLimits;
  pro: FeatureLimits;
  ultra: FeatureLimits;
}

export const PLAN_FEATURES: PlanFeatures = {
  free: {
    maxWorkspaces: 1,
    maxProjects: 3,
    maxTeamMembers: 5,
    maxStorage: 1,
    aiAssistance: true, // Limited
    advancedAnalytics: false,
    customIntegrations: false,
    prioritySupport: false,
    whiteLabeling: false,
    apiAccess: false
  },
  pro: {
    maxWorkspaces: 5,
    maxProjects: -1, // Unlimited
    maxTeamMembers: 50,
    maxStorage: 100,
    aiAssistance: true, // Advanced
    advancedAnalytics: true,
    customIntegrations: true,
    prioritySupport: true,
    whiteLabeling: false,
    apiAccess: false
  },
  ultra: {
    maxWorkspaces: -1, // Unlimited
    maxProjects: -1, // Unlimited
    maxTeamMembers: -1, // Unlimited
    maxStorage: 1000,
    aiAssistance: true, // AI-Powered
    advancedAnalytics: true,
    customIntegrations: true,
    prioritySupport: true,
    whiteLabeling: true,
    apiAccess: true
  }
};

export const useFeatureAccess = () => {
  const { state } = useApp();
  
  const userPlan = state.userProfile?.subscription?.plan || 'free';
  const currentFeatures = PLAN_FEATURES[userPlan as keyof PlanFeatures];
  
  const hasFeature = (feature: keyof FeatureLimits): boolean => {
    const featureValue = currentFeatures[feature];
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    return featureValue > 0;
  };
  
  const getFeatureLimit = (feature: keyof FeatureLimits): number => {
    const limit = currentFeatures[feature];
    return typeof limit === 'boolean' ? (limit ? 1 : 0) : limit;
  };
  
  const canCreateWorkspace = (): boolean => {
    if (!state.userProfile) return false;
    
    // Free users cannot create workspaces (employee mode only)
    if (userPlan === 'free') return false;
    
    // Check if user has reached workspace limit
    const currentWorkspaces = state.workspaces?.length || 0;
    const maxWorkspaces = getFeatureLimit('maxWorkspaces');
    
    return maxWorkspaces === -1 || currentWorkspaces < maxWorkspaces;
  };
  
  const canCreateProject = (): boolean => {
    if (!state.userProfile) return false;
    
    // Check if user has reached project limit
    const currentProjects = state.projects?.length || 0;
    const maxProjects = getFeatureLimit('maxProjects');
    
    return maxProjects === -1 || currentProjects < maxProjects;
  };
  
  const canAddTeamMember = (): boolean => {
    if (!state.userProfile) return false;
    
    // Check if user has reached team member limit
    // For now, we'll use a mock value since currentWorkspaceMembers might not exist
    const currentMembers = 0; // This should be replaced with actual team member count
    const maxMembers = getFeatureLimit('maxTeamMembers');
    
    return maxMembers === -1 || currentMembers < maxMembers;
  };
  
  const canUseAI = (): boolean => {
    return hasFeature('aiAssistance');
  };
  
  const canUseAdvancedAnalytics = (): boolean => {
    return hasFeature('advancedAnalytics');
  };
  
  const canUseCustomIntegrations = (): boolean => {
    return hasFeature('customIntegrations');
  };
  
  const canUseAPI = (): boolean => {
    return hasFeature('apiAccess');
  };
  
  const canUseWhiteLabeling = (): boolean => {
    return hasFeature('whiteLabeling');
  };

  const canCreateGoals = (): boolean => {
    // All users can create goals, but with different limits
    return true;
  };

  const canManageGoals = (): boolean => {
    // Pro and Ultra users can manage team goals
    return userPlan === 'pro' || userPlan === 'ultra';
  };

  const canExportReports = (): boolean => {
    // Pro and Ultra users can export reports
    return userPlan === 'pro' || userPlan === 'ultra';
  };

  const canManageTeam = (): boolean => {
    // Pro and Ultra users can manage team
    return userPlan === 'pro' || userPlan === 'ultra';
  };
  
  const getUpgradeMessage = (feature: string): string => {
    const planNames: Record<string, string> = {
      free: 'Free',
      pro: 'Pro',
      ultra: 'Ultra'
    };
    
    const requiredPlan = getRequiredPlanForFeature(feature);
    const currentPlanName = planNames[userPlan as string] || 'Free';
    const requiredPlanName = planNames[requiredPlan];
    
    return `This feature is available in ${requiredPlanName} plan. Upgrade from ${currentPlanName} to unlock this feature.`;
  };
  
  const getRequiredPlanForFeature = (feature: string): 'free' | 'pro' | 'ultra' => {
    // Define which plan is required for each feature
    const featureRequirements: Record<string, 'free' | 'pro' | 'ultra'> = {
      'workspace-creation': 'pro',
      'advanced-analytics': 'pro',
      'custom-integrations': 'pro',
      'priority-support': 'pro',
      'white-labeling': 'ultra',
      'api-access': 'ultra',
      'unlimited-projects': 'pro',
      'unlimited-workspaces': 'ultra',
      'unlimited-team-members': 'ultra'
    };
    
    return featureRequirements[feature] || 'free';
  };
  
  const getPlanComparison = () => {
    return {
      current: userPlan,
      features: currentFeatures,
      limits: {
        workspaces: getFeatureLimit('maxWorkspaces'),
        projects: getFeatureLimit('maxProjects'),
        teamMembers: getFeatureLimit('maxTeamMembers'),
        storage: getFeatureLimit('maxStorage')
      }
    };
  };
  
  return {
    userPlan,
    currentFeatures,
    hasFeature,
    getFeatureLimit,
    canCreateWorkspace,
    canCreateProject,
    canAddTeamMember,
    canUseAI,
    canUseAdvancedAnalytics,
    canUseCustomIntegrations,
    canUseAPI,
    canUseWhiteLabeling,
    canCreateGoals,
    canManageGoals,
    canExportReports,
    canManageTeam,
    getUpgradeMessage,
    getRequiredPlanForFeature,
    getPlanComparison
  };
};

export default useFeatureAccess;
