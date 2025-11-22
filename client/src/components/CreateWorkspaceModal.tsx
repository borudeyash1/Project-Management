import React, { useEffect, useState } from 'react';
import { X, Building2, Mail, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { SubscriptionPlanData, CustomBillingResponse } from '../services/api';
import { WorkspaceSettings } from '../types';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [customBilling, setCustomBilling] = useState<CustomBillingResponse['billing'] | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'team' as 'personal' | 'team' | 'enterprise',
    logo: '',
    organizationName: '',
    contactEmail: '',
    otp: '',
    region: 'North America',
    isPublic: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    const loadPlans = async () => {
      try {
        const data = await api.getSubscriptionPlans();
        setPlans(data);
      } catch (error) {
        console.error('Failed to load subscription plans', error);
      }
    };
    loadPlans();
  }, [isOpen]);

  if (!isOpen) return null;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    }
    
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    try {
      await api.sendWorkspaceOtp();
      setStep(2);
      dispatch({
        type: 'ADD_TOAST',
        payload: { id: Date.now().toString(), type: 'success', message: 'OTP sent to your workspace email', duration: 3000 }
      });
    } catch (error: any) {
      console.error('Error sending workspace OTP:', error);
      dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), type: 'error', message: error.message || 'Failed to send OTP', duration: 4000 } });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp.trim()) {
      setErrors({ otp: 'Please enter the OTP' });
      return;
    }
    setLoading(true);
    try {
      await api.verifyWorkspaceOtp(formData.otp.trim());
      setOtpVerified(true);
      setStep(3);
      dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), type: 'success', message: 'OTP verified, ready to create the workspace', duration: 3000 } });
    } catch (error: any) {
      console.error('Error verifying workspace OTP:', error);
      setErrors({ otp: error.message || 'Invalid OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await api.sendWorkspaceOtp();
      dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), type: 'info', message: 'OTP resent to your inbox', duration: 3000 } });
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), type: 'error', message: error.message || 'Unable to resend OTP', duration: 3000 } });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    setLoading(true);
    try {
      const response = await api.createWorkspaceWithBilling({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        region: formData.region,
        settings: {
          isPublic: formData.isPublic
        } as Partial<WorkspaceSettings>
      } as any);
      if (response.requiresCustomBilling && response.billing) {
        setCustomBilling(response.billing);
        dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), type: 'warning', message: 'Custom billing required for this workspace', duration: 4000 } });
        return;
      }
      if (response.data) {
        dispatch({ type: 'ADD_WORKSPACE', payload: response.data });
        dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), type: 'success', message: 'Workspace created', duration: 3000 } });
        handleClose();
      }
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), type: 'error', message: error.message || 'Workspace creation failed', duration: 4000 } });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setOtpVerified(false);
    setCustomBilling(null);
    setFormData({
      name: '',
      description: '',
      type: 'team',
      logo: '',
      contactEmail: '',
      organizationName: '',
      otp: '',
      region: 'North America',
      isPublic: false
    });
    setErrors({});
    onClose();
  };

  const renderPlans = () => (
    <div className="mb-6">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.planKey} className="border rounded-xl p-4 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold capitalize">{plan.displayName}</h3>
              <span className="text-xs uppercase tracking-wide text-gray-600">{plan.planKey}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{plan.summary}</p>
            <div className="mt-3 text-sm">
              <div className="flex justify-between">
                <span>Workspaces</span>
                <span>{plan.limits.maxWorkspaces === -1 ? 'Unlimited' : plan.limits.maxWorkspaces}</span>
              </div>
              <div className="flex justify-between">
                <span>Team Members</span>
                <span>{plan.limits.maxTeamMembers}</span>
              </div>
              <div className="flex justify-between">
                <span>Projects</span>
                <span>{plan.limits.maxProjects}</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              ${plan.monthlyPrice.toFixed(2)}/mo or ${plan.yearlyPrice.toFixed(2)}/yr
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {plans.length > 0 && renderPlans()}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workspace Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workspace Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter workspace name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Describe your workspace"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workspace Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="personal">Personal</option>
              <option value="team">Team</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                errors.organizationName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter organization name"
            />
            {errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                errors.contactEmail ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter contact email"
            />
            {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="South America">South America</option>
              <option value="Africa">Africa</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workspace Visibility
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                />
                <span className="text-sm text-gray-700">Make this workspace publicly discoverable</span>
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Public workspaces can be found and joined by other users. Private workspaces are invite-only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-accent-dark" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Email</h3>
        <p className="text-gray-600">
          We've sent a verification code to <strong>{formData.contactEmail}</strong>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Verification Code
        </label>
        <input
          type="text"
          value={formData.otp}
          onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-center text-lg tracking-widest ${
            errors.otp ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter 6-digit code"
          maxLength={6}
        />
        {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
      </div>

      <div className="text-center">
        <button
          onClick={handleResendOTP}
          className="text-accent-dark hover:text-blue-700 text-sm"
        >
          Didn't receive the code? Resend
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Verified!</h3>
        <p className="text-gray-600">
          Your email has been verified. Now let's complete the workspace setup.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900">Billing overview</h4>
            <p className="text-sm text-gray-700 mt-1">
              Our billing system is pending a gateway, so once a plan limit triggers a custom fee we show the shortcut below.
            </p>
          </div>
        </div>
        {customBilling ? (
          <div className="rounded-lg border border-yellow-200 bg-white p-3 text-sm text-gray-800 space-y-1">
            <div className="flex items-center justify-between">
              <span>Base fee</span>
              <strong>${customBilling.baseFee.toFixed(2)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Per head</span>
              <strong>${customBilling.perHeadPrice.toFixed(2)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Employees</span>
              <strong>{customBilling.estimatedMembers}</strong>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <strong>${customBilling.total.toFixed(2)}</strong>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-800">
            <span>Default template pricing applies: modify the plan in admin if you need custom limits.</span>
          </div>
        )}
        {customBilling && (
          <button
            onClick={handleCreateWorkspace}
            className="w-full px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold"
          >
            Bypass gateway & accept charge
          </button>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Workspace Created!</h3>
        <p className="text-gray-600">
          Your workspace "{formData.name}" has been created successfully.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="font-medium text-green-800">Next Steps</h4>
            <p className="text-sm text-green-700 mt-1">
              You can now invite team members, create projects, and start collaborating!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  const stepMeta = {
    title:
      step === 1
        ? 'Workspace details'
        : step === 2
        ? 'Verify ownership'
        : step === 3
        ? 'Billing confirmation'
        : 'Workspace created',
    subtitle:
      step === 1
        ? 'Provide workspace information so we can prepare the upgrade options.'
        : step === 2
        ? 'Enter the verification code sent to your contact email.'
        : step === 3
        ? 'Review billing details and create your workspace.'
        : 'You can now start inviting your team.',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-600">
              {step < 4 ? `Step ${step} of 3` : 'Completed'}
            </p>
            <h2 className="text-xl font-semibold text-gray-900 mt-1">{stepMeta.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{stepMeta.subtitle}</p>
          </div>
          <button onClick={handleClose} className="text-gray-600 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          {step === 1 && (
            <>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Verify user'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </>
          )}
          
          {step === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateWorkspace}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Create Workspace'}
              </button>
            </>
          )}
          
          {step === 4 && (
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Get Started
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
