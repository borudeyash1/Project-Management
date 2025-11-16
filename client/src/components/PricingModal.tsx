import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Check,
  Star,
  Zap,
  Crown,
  Users,
  Bot,
  Shield,
  Headphones,
  Gift,
  ArrowRight,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api, { SubscriptionPlanData } from '../services/api';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planKey: 'free' | 'pro' | 'ultra') => void;
  presetPlanKey?: 'free' | 'pro' | 'ultra';
}

const planIcons: Record<'free' | 'pro' | 'ultra', React.ComponentType<{ className?: string }>> = {
  free: Users,
  pro: Zap,
  ultra: Crown
};

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan, presetPlanKey }) => {
  const { state, dispatch } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'ultra'>('pro');
  const [detailPlan, setDetailPlan] = useState<SubscriptionPlanData | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState<'idle' | 'code-sent' | 'verified'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setOtpStep('idle');
      setOtpCode('');
      setOtpError(null);
      return;
    }
    const loadPlans = async () => {
      try {
        setLoading(true);
        const response = await api.getSubscriptionPlans();
        setPlans(response);
      } catch (error) {
        console.error('Failed to load subscription plans', error);
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'error',
            message: 'Unable to load subscription plans. Please try again.',
            duration: 4000
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen || !presetPlanKey) return;
    setSelectedPlan(presetPlanKey);
  }, [isOpen, presetPlanKey]);

  useEffect(() => {
    if (!isOpen || !presetPlanKey || !plans.length) return;
    if (detailPlan && detailPlan.planKey === presetPlanKey) return;
    openPlanDetail(presetPlanKey);
  }, [isOpen, presetPlanKey, plans]);

  const openPlanDetail = (planKey: 'free' | 'pro' | 'ultra') => {
    if (planKey === state.userProfile.subscription?.plan) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'info',
          message: 'You are already on this plan.',
          duration: 3000
        }
      });
      return;
    }

    const planMeta = plans.find((plan) => plan.planKey === planKey) || null;
    setSelectedPlan(planKey);
    setDetailPlan(planMeta);
    setOtpStep('idle');
    setOtpCode('');
    setOtpError(null);
  };

  const handleSendVerification = async () => {
    if (!detailPlan) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      await api.sendWorkspaceOtp();
      setOtpStep('code-sent');
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Verification code sent to your account email.',
          duration: 3000
        }
      });
    } catch (error: any) {
      console.error('Failed to send OTP for plan upgrade', error);
      setOtpError(error?.message || 'Failed to send verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!detailPlan) return;
    if (!otpCode.trim()) {
      setOtpError('Please enter the 6-digit code.');
      return;
    }
    setOtpLoading(true);
    try {
      await api.verifyWorkspaceOtp(otpCode.trim());
      setOtpStep('verified');
      setOtpError(null);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'OTP verified. You can now confirm the upgrade.',
          duration: 3000
        }
      });
    } catch (error: any) {
      setOtpError(error?.message || 'Invalid verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!detailPlan) return;
    if (otpStep !== 'verified') {
      setOtpError('Please verify the code before upgrading.');
      return;
    }

    setUpgradeLoading(true);
    try {
      const updatedUser = await api.upgradeSubscription(detailPlan.planKey, billingCycle);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: `Upgraded to ${detailPlan.displayName} plan`,
          duration: 3500
        }
      });

      onSelectPlan?.(detailPlan.planKey);
      setDetailPlan(null);
      setOtpStep('idle');
      setOtpCode('');
      setOtpError(null);
      onClose();
    } catch (error: any) {
      console.error('Failed to upgrade subscription', error);
      setOtpError(error?.message || 'Failed to upgrade subscription.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const sortedPlans = useMemo(() => {
    return plans.sort((a, b) => a.order - b.order);
  }, [plans]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
              <p className="text-gray-600 mt-2">Unlock the full potential of your project management</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-6">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-center text-gray-500 py-8">Loading subscription plans...</div>
            )}
            {!loading && sortedPlans.map((plan) => {
              const planKey = plan.planKey;
              const Icon = planIcons[planKey];
              const isSelected = selectedPlan === planKey;
              const buttonLabel =
                planKey === 'free'
                  ? 'Get Started Free'
                  : planKey === 'pro'
                  ? 'Choose Pro User'
                  : 'Choose Ultra User';

              return (
                <div
                  key={plan.planKey}
                  onClick={() => setSelectedPlan(planKey)}
                  className={`relative rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 shadow-lg scale-[1.01]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {planKey === 'pro' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.displayName}</h3>
                      <p className="text-gray-600 mt-2">{plan.summary}</p>
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                        </span>
                        {billingCycle === 'yearly' && plan.yearlyPrice > 0 && (
                          <span className="text-gray-600">/year</span>
                        )}
                        {billingCycle === 'monthly' && plan.monthlyPrice > 0 && (
                          <span className="text-gray-600">/month</span>
                        )}
                      </div>
                    </div>

                    {/* Limits */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Plan Limits</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Workspaces:</span>
                          <span className="font-medium">{plan.limits.maxWorkspaces === -1 ? 'Unlimited' : plan.limits.maxWorkspaces}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Projects:</span>
                          <span className="font-medium">{plan.limits.maxProjects === -1 ? 'Unlimited' : plan.limits.maxProjects}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Team Members:</span>
                          <span className="font-medium">{plan.limits.maxTeamMembers === -1 ? 'Unlimited' : plan.limits.maxTeamMembers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage:</span>
                          <span className="font-medium">{plan.limits.storageInGB}GB</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                      <div className="space-y-3">
                        {Object.entries(plan.features).map(([featureKey, enabled]) => (
                          <div key={featureKey} className="flex items-start gap-3 p-2 rounded-lg">
                            <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${enabled ? 'text-green-500' : 'text-gray-300'}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {featureKey.replace(/([A-Z])/g, ' $1')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {enabled ? 'Included' : 'Not included'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        openPlanDetail(planKey);
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        planKey === 'pro'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : planKey === 'free'
                          ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500'
                      } shadow-md`}
                    >
                      {buttonLabel}
                      {planKey !== 'free' && (
                        <ArrowRight className="w-4 h-4 inline ml-2" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              <span>24/7 support</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span>Admin-configurable perks</span>
            </div>
          </div>
        </div>
      </div>

      {detailPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] px-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">Selected plan</p>
                <h3 className="text-2xl font-semibold text-gray-900">{detailPlan.displayName}</h3>
                <p className="text-sm text-gray-600 mt-1">{detailPlan.summary}</p>
              </div>
              <button onClick={() => setDetailPlan(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-3">What you’ll get</h4>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                  <p className="text-gray-500">Workspaces</p>
                  <p className="font-semibold">{detailPlan.limits.maxWorkspaces === -1 ? 'Unlimited' : detailPlan.limits.maxWorkspaces}</p>
                </div>
                <div>
                  <p className="text-gray-500">Projects</p>
                  <p className="font-semibold">{detailPlan.limits.maxProjects === -1 ? 'Unlimited' : detailPlan.limits.maxProjects}</p>
                </div>
                <div>
                  <p className="text-gray-500">Team members</p>
                  <p className="font-semibold">{detailPlan.limits.maxTeamMembers === -1 ? 'Unlimited' : detailPlan.limits.maxTeamMembers}</p>
                </div>
                <div>
                  <p className="text-gray-500">Storage</p>
                  <p className="font-semibold">{detailPlan.limits.storageInGB} GB</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">Verification is required before we upgrade your workspace billing.</p>
              {otpStep === 'idle' && (
                <button
                  onClick={handleSendVerification}
                  disabled={otpLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {otpLoading ? 'Sending...' : 'Send verification code'}
                </button>
              )}

              {otpStep === 'code-sent' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enter verification code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="mt-1 w-full px-3 py-2 border rounded-lg text-center tracking-widest text-lg"
                      placeholder="123456"
                    />
                    {otpError && <p className="text-xs text-red-500 mt-1">{otpError}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleVerifyOtp}
                      disabled={otpLoading}
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {otpLoading ? 'Verifying...' : 'Verify code'}
                    </button>
                    <button
                      onClick={() => {
                        setOtpStep('idle');
                        setOtpCode('');
                        setOtpError(null);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {otpStep === 'verified' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Verification complete. You can now bypass billing and upgrade.</span>
                  </div>
                  <button
                    onClick={handleConfirmUpgrade}
                    disabled={upgradeLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-60"
                  >
                    <KeyRound className="w-4 h-4" />
                    {upgradeLoading ? 'Upgrading...' : `Bypass & upgrade to ${detailPlan.displayName}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingModal;
