import SubscriptionPlan from '../models/SubscriptionPlan';

export type SubscriptionPlanSeed = {
  planKey: 'free' | 'pro' | 'ultra';
  displayName: string;
  summary: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: {
    maxWorkspaces: number;
    maxProjects: number;
    maxTeamMembers: number;
  };
  features: {
    aiAccess: boolean;
    adsEnabled: boolean;
    collaboratorAccess: boolean;
    customStorageIntegration: boolean;
    desktopAppAccess: boolean;
    automaticScheduling: boolean;
    realtimeAISuggestions: boolean;
  };
  workspaceFees: {
    personal: number;
    team: number;
    enterprise: number;
  };
  perHeadPrice: number;
  collaboratorsLimit: number;
  order: number;
};

export const defaultSubscriptionPlans: SubscriptionPlanSeed[] = [
  {
    planKey: 'free',
    displayName: 'Free User',
    summary:
      'Access essential task management features. Create a single workspace/project and experience SaaS task flow with ads.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: {
      maxWorkspaces: 1,
      maxProjects: 1,
      maxTeamMembers: 5
    },
    features: {
      aiAccess: false,
      adsEnabled: true,
      collaboratorAccess: false,
      customStorageIntegration: false,
      desktopAppAccess: false,
      automaticScheduling: false,
      realtimeAISuggestions: false
    },
    workspaceFees: {
      personal: 29.99,
      team: 39.99,
      enterprise: 59.99
    },
    perHeadPrice: 8,
    collaboratorsLimit: 0,
    order: 0
  },
  {
    planKey: 'pro',
    displayName: 'Pro User',
    summary:
      'Unlock workspace freedom—manage up to five workspaces with 5 projects each, 20 employees per project, no ads, and limited AI signals.',
    monthlyPrice: 12,
    yearlyPrice: 120,
    limits: {
      maxWorkspaces: 5,
      maxProjects: 5,
      maxTeamMembers: 100
    },
    features: {
      aiAccess: true,
      adsEnabled: false,
      collaboratorAccess: true,
      customStorageIntegration: false,
      desktopAppAccess: true,
      automaticScheduling: false,
      realtimeAISuggestions: false
    },
    workspaceFees: {
      personal: 39.99,
      team: 79.99,
      enterprise: 99.99
    },
    perHeadPrice: 5,
    collaboratorsLimit: 5,
    order: 1
  },
  {
    planKey: 'ultra',
    displayName: 'Ultra User',
    summary:
      'Enterprise-grade automation: 10 workspaces, 20 projects each, 30 members, automatic scheduling, AI-driven guidance, and private cloud storage.',
    monthlyPrice: 25,
    yearlyPrice: 250,
    limits: {
      maxWorkspaces: 10,
      maxProjects: 20,
      maxTeamMembers: 30
    },
    features: {
      aiAccess: true,
      adsEnabled: false,
      collaboratorAccess: true,
      customStorageIntegration: true,
      desktopAppAccess: true,
      automaticScheduling: true,
      realtimeAISuggestions: true
    },
    workspaceFees: {
      personal: 59.99,
      team: 129.99,
      enterprise: 199.99
    },
    perHeadPrice: 3,
    collaboratorsLimit: 10,
    order: 2
  }
];

export const ensureDefaultSubscriptionPlans = async (): Promise<void> => {
  for (const plan of defaultSubscriptionPlans) {
    await SubscriptionPlan.updateOne(
      { planKey: plan.planKey },
      { $setOnInsert: plan },
      { upsert: true }
    );
  }
};
