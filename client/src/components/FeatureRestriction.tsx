import React from 'react';
import { 
  Lock, Crown, Zap, Star, ArrowRight, 
  CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import PricingModal from './PricingModal';

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
  
  const [showPricingModal, setShowPricingModal] = React.useState(false);
  
  const requiredPlan = getRequiredPlanForFeature(feature);
  const hasAccess = hasFeature(feature as any);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro': return <Zap className="w-5 h-5 text-blue-500" />;
      case 'ultra': return <Crown className="w-5 h-5 text-purple-500" />;
      default: return <Star className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'border-blue-200 bg-blue-50';
      case 'ultra': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (!showUpgradePrompt) {
    return (
      <div className={`opacity-50 pointer-events-none ${className}`}>
        {children}
      </div>
    );
  }
  
  return (
    <>
      <div className={`relative ${className}`}>
        {/* Blurred content */}
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        
        {/* Overlay with upgrade prompt */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`max-w-sm mx-auto p-6 rounded-xl border-2 ${getPlanColor(requiredPlan)}`}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {getPlanIcon(requiredPlan)}
                <Lock className="w-5 h-5 text-gray-500 ml-2" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {requiredPlan === 'pro' ? 'Pro Feature' : 'Ultra Feature'}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {getUpgradeMessage(feature)}
              </p>
              
              <button
                onClick={() => setShowPricingModal(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                  requiredPlan === 'pro' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                Upgrade to {requiredPlan === 'pro' ? 'Pro' : 'Ultra'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showPricingModal && (
        <PricingModal 
          isOpen={showPricingModal} 
          onClose={() => setShowPricingModal(false)} 
        />
      )}
    </>
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
  const [showPricingModal, setShowPricingModal] = React.useState(false);
  
  const planInfo = getPlanComparison();
  
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Star className="w-4 h-4 text-gray-500" />;
      case 'pro': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'ultra': return <Crown className="w-4 h-4 text-purple-500" />;
      default: return <Star className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-gray-600 bg-gray-100';
      case 'pro': return 'text-blue-600 bg-blue-100';
      case 'ultra': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  return (
    <>
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${className}`}>
        <div className={`p-2 rounded-lg ${getPlanColor(userPlan)}`}>
          {getPlanIcon(userPlan)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 capitalize">{userPlan} Plan</h4>
            <button
              onClick={() => setShowPricingModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Upgrade
            </button>
          </div>
          
          <div className="text-xs text-gray-600 mt-1">
            {planInfo.limits.workspaces === -1 ? 'Unlimited' : planInfo.limits.workspaces} workspaces • 
            {planInfo.limits.projects === -1 ? 'Unlimited' : planInfo.limits.projects} projects • 
            {planInfo.limits.teamMembers === -1 ? 'Unlimited' : planInfo.limits.teamMembers} members
          </div>
        </div>
      </div>
      
      {showPricingModal && (
        <PricingModal 
          isOpen={showPricingModal} 
          onClose={() => setShowPricingModal(false)} 
        />
      )}
    </>
  );
};

export default FeatureRestriction;
