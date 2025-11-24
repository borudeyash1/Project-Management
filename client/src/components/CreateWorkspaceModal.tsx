import React, { useEffect, useState } from 'react';
import { X, Building2, Mail, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { SubscriptionPlanData, CustomBillingResponse } from '../services/api';
import { WorkspaceSettings } from '../types';
import { useTranslation } from 'react-i18next';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { dispatch } = useApp();
  const { t } = useTranslation();
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
      newErrors.name = t('forms.required');
    }
    
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = t('forms.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = t('forms.invalidEmail');
    }
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = t('forms.required');
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
      setErrors({ otp: t('forms.required') });
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
                <span>{t('workspace.title')}</span>
                <span>{plan.limits.maxWorkspaces === -1 ? t('projects.unlimited') : plan.limits.maxWorkspaces}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('team.members')}</span>
                <span>{plan.limits.maxTeamMembers}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('workspace.projectsLabel')}</span>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('workspace.details')}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('workspace.name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('workspace.enterName')}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('workspace.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder={t('workspace.describe')}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('workspace.type')}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="personal">{t('workspace.personal')}</option>
              <option value="team">{t('workspace.team')}</option>
              <option value="enterprise">{t('workspace.enterprise')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('workspace.organizationName')} *
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                errors.organizationName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('workspace.enterOrgName')}
            />
            {errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('workspace.contactEmail')} *
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                errors.contactEmail ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('workspace.enterEmail')}
            />
            {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('workspace.region')}
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
              {t('workspace.visibility')}
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                />
                <span className="text-sm text-gray-700">{t('workspace.makePublic')}</span>
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {t('workspace.publicDesc')}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('workspace.verifyEmail')}</h3>
        <p className="text-gray-600">
          {t('workspace.sentCode')} <strong>{formData.contactEmail}</strong>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('workspace.enterCode')}
        </label>
        <input
          type="text"
          value={formData.otp}
          onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-center text-lg tracking-widest ${
            errors.otp ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={t('workspace.enter6Digit')}
          maxLength={6}
        />
        {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
      </div>

      <div className="text-center">
        <button
          onClick={handleResendOTP}
          className="text-accent-dark hover:text-blue-700 text-sm"
        >
          {t('workspace.resend')}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('workspace.emailVerified')}</h3>
        <p className="text-gray-600">
          {t('workspace.verifiedDesc')}
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900">{t('workspace.billingOverview')}</h4>
            <p className="text-sm text-gray-700 mt-1">
              {t('workspace.billingDesc')}
            </p>
          </div>
        </div>
        {customBilling ? (
          <div className="rounded-lg border border-yellow-200 bg-white p-3 text-sm text-gray-800 space-y-1">
            <div className="flex items-center justify-between">
              <span>{t('workspace.baseFee')}</span>
              <strong>${customBilling.baseFee.toFixed(2)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('workspace.perHead')}</span>
              <strong>${customBilling.perHeadPrice.toFixed(2)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('workspace.employees')}</span>
              <strong>{customBilling.estimatedMembers}</strong>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>{t('workspace.total')}</span>
              <strong>${customBilling.total.toFixed(2)}</strong>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-800">
            <span>{t('workspace.defaultPricing')}</span>
          </div>
        )}
        {customBilling && (
          <button
            onClick={handleCreateWorkspace}
            className="w-full px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold"
          >
            {t('workspace.bypassGateway')}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('workspace.createdTitle')}</h3>
        <p className="text-gray-600">
          {t('workspace.createdDesc', { name: formData.name })}
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="font-medium text-green-800">{t('workspace.nextSteps')}</h4>
            <p className="text-sm text-green-700 mt-1">
              {t('workspace.nextStepsDesc')}
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
        ? t('workspace.details')
        : step === 2
        ? t('workspace.verifyOwnership')
        : step === 3
        ? t('workspace.billingConfirmation')
        : t('workspace.createdTitle'),
    subtitle:
      step === 1
        ? t('workspace.detailsDesc')
        : step === 2
        ? t('workspace.verifyOwnershipDesc')
        : step === 3
        ? t('workspace.billingConfirmationDesc')
        : t('workspace.createdStepDesc'),
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-600">
              {step < 4 ? t('workspace.step', { current: step, total: 3 }) : t('workspace.completed')}
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
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {loading ? t('workspace.sending') : t('workspace.verifyUser')}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('common.back')}
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {loading ? t('workspace.verifying') : t('workspace.verifyCode')}
              </button>
            </>
          )}
          
          {step === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('common.back')}
              </button>
              <button
                onClick={handleCreateWorkspace}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? t('workspace.processing') : t('workspace.create')}
              </button>
            </>
          )}
          
          {step === 4 && (
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
            >
              {t('workspace.getStarted')}
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
