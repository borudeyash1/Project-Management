import React from 'react';
import { 
  Lock, Crown, Zap, Star, ArrowRight, 
  CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface FeatureRestrictionProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

const FeatureRestriction: React.FC<FeatureRestrictionProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  className = ''
}) => {
  const { 
    userPlan, 
    hasFeature, 
    getUpgradeMessage, 
    getRequiredPlanForFeature 
  } = useFeatureAccess();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const requiredPlan = getRequiredPlanForFeature(feature);
  const hasAccess = hasFeature(feature as any);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro': return <Zap className="w-5 h-5 text-accent" />;
      case 'ultra': return <Crown className="w-5 h-5 text-purple-500" />;
      default: return <Star className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'border-blue-200 bg-blue-50';
      case 'ultra': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (!showUpgradePrompt) {
    return null; // Don't show anything if feature is restricted
  }
  
  // For button-level restrictions, just disable the button
  return (
    <button
      onClick={() => navigate('/pricing')}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        requiredPlan === 'pro' 
          ? 'bg-accent hover:bg-accent-hover text-gray-900' 
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      } ${className}`}
    >
      {getPlanIcon(requiredPlan)}
      <span>{t('plans.upgradeTo', { plan: requiredPlan === 'pro' ? 'Pro' : 'Ultra' })}</span>
    </button>
  );
};

// Specific restriction components for common use cases
export const WorkspaceCreationRestriction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeatureRestriction feature="workspace-creation">
    {children}
  </FeatureRestriction>
);

export const AdvancedAnalyticsRestriction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeatureRestriction feature="advanced-analytics">
    {children}
  </FeatureRestriction>
);

export const CustomIntegrationsRestriction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeatureRestriction feature="custom-integrations">
    {children}
  </FeatureRestriction>
);

export const APIAccessRestriction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeatureRestriction feature="api-access">
    {children}
  </FeatureRestriction>
);

export const WhiteLabelingRestriction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeatureRestriction feature="white-labeling">
    {children}
  </FeatureRestriction>
);

// Component to show plan status and limits
export const PlanStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { userPlan, getPlanComparison } = useFeatureAccess();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const planInfo = getPlanComparison();
  
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Star className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />;
      case 'pro': return <Zap className="w-4 h-4 text-accent" />;
      case 'ultra': return <Crown className="w-4 h-4 text-purple-500" />;
      default: return <Star className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} />;
    }
  };
  
  const getPlanColor = (plan: string) => {
    if (isDarkMode) {
      switch (plan) {
        case 'free': return 'text-gray-600 bg-gray-700';
        case 'pro': return 'text-accent-light bg-blue-900/50';
        case 'ultra': return 'text-purple-400 bg-purple-900/50';
        default: return 'text-gray-600 bg-gray-700';
      }
    }
    switch (plan) {
      case 'free': return 'text-gray-700 bg-gray-100';
      case 'pro': return 'text-blue-700 bg-blue-100';
      case 'ultra': return 'text-purple-800 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };
  
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } ${className}`}>
      <div className={`p-2 rounded-lg ${getPlanColor(userPlan)}`}>
        {getPlanIcon(userPlan)}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className={`font-medium capitalize ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{t('plans.plan', { plan: userPlan })}</h4>
          {userPlan !== 'ultra' && (
            <button
              onClick={() => navigate('/pricing')}
              className="text-sm text-accent-dark hover:text-blue-700 font-medium"
            >
              {t('plans.upgrade')}
            </button>
          )}
        </div>
        
        <div className={`text-xs mt-1 ${
          isDarkMode ? 'text-gray-600' : 'text-gray-600'
        }`}>
          {planInfo.limits.workspaces === -1 ? t('plans.unlimited') : planInfo.limits.workspaces} {t('plans.workspaces')} • 
          {planInfo.limits.projects === -1 ? t('plans.unlimited') : planInfo.limits.projects} {t('plans.projects')} • 
          {planInfo.limits.teamMembers === -1 ? t('plans.unlimited') : planInfo.limits.teamMembers} {t('plans.members')}
        </div>
      </div>
    </div>
  );
};

export default FeatureRestriction;
