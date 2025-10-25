import React from "react";
import {
  Lock,
  Crown,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import PricingModal from "./PricingModal";

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
  className = "",
}) => {
  const { userPlan, hasFeature, getUpgradeMessage, getRequiredPlanForFeature } =
    useFeatureAccess();

  const [showPricingModal, setShowPricingModal] = React.useState(false);

  const requiredPlan = getRequiredPlanForFeature(feature);
  const hasAccess = hasFeature(feature as any);

  if (hasAccess) {
    return <>{children}</>;
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "pro":
        return <Zap className="w-5 h-5 text-blue-500" />;
      case "ultra":
        return <Crown className="w-5 h-5 text-purple-500" />;
      default:
        return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "pro":
        return "border-blue-300 bg-blue-100 dark:border-blue-600 dark:bg-blue-900";
      case "ultra":
        return "border-purple-300 bg-purple-100 dark:border-purple-600 dark:bg-purple-900";
      default:
        return "border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800";
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
      <div className={`opacity-50 pointer-events-none ${className}`} onClick={() => setShowPricingModal(true)}>
        {children}
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
export const WorkspaceCreationRestriction: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <FeatureRestriction feature="workspace-creation">
    {children}
  </FeatureRestriction>
);

export const AdvancedAnalyticsRestriction: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <FeatureRestriction feature="advanced-analytics">
    {children}
  </FeatureRestriction>
);

export const CustomIntegrationsRestriction: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <FeatureRestriction feature="custom-integrations">
    {children}
  </FeatureRestriction>
);

export const APIAccessRestriction: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <FeatureRestriction feature="api-access">{children}</FeatureRestriction>;

export const WhiteLabelingRestriction: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <FeatureRestriction feature="white-labeling">{children}</FeatureRestriction>
);

// Component to show plan status and limits
export const PlanStatus: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { userPlan, getPlanComparison } = useFeatureAccess();
  const [showPricingModal, setShowPricingModal] = React.useState(false);

  const planInfo = getPlanComparison();

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "free":
        return <Star className="w-4 h-4 text-gray-500" />;
      case "pro":
        return <Zap className="w-4 h-4 text-blue-500" />;
      case "ultra":
        return <Crown className="w-4 h-4 text-purple-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "plan-free";
      case "pro":
        return "plan-pro";
      case "ultra":
        return "plan-ultra";
      default:
        return "plan-free";
    }
  };

  return (
    <>
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}
      >
        <div className={`p-2 rounded-lg ${getPlanColor(userPlan)}`}>
          {getPlanIcon(userPlan)}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-contrast-high capitalize">
              {userPlan} Plan
            </h4>
            <button
              onClick={() => setShowPricingModal(true)}
              className="text-sm font-medium link-primary px-2 py-1 rounded hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
            >
              Upgrade
            </button>
          </div>

          <div className="text-xs text-contrast-medium mt-1">
            {planInfo.limits.workspaces === -1
              ? "Unlimited"
              : planInfo.limits.workspaces}{" "}
            workspaces •
            {planInfo.limits.projects === -1
              ? "Unlimited"
              : planInfo.limits.projects}{" "}
            projects •
            {planInfo.limits.teamMembers === -1
              ? "Unlimited"
              : planInfo.limits.teamMembers}{" "}
            members
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
