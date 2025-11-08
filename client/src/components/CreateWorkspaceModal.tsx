import React, { useState } from 'react';
import { X, Building2, Mail, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'team' as 'personal' | 'team' | 'enterprise',
    logo: '',
    contactEmail: '',
    organizationName: '',
    otp: '',
    region: 'North America'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // TODO: Implement actual OTP sending API call
      console.log('Sending OTP to:', formData.contactEmail);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOtpSent(true);
      setStep(2);
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'OTP sent to your email address',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to send OTP. Please try again.',
          duration: 3000
        }
      });
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
      // TODO: Implement actual OTP verification API call
      console.log('Verifying OTP:', formData.otp);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOtpVerified(true);
      setStep(3);
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Email verified successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrors({ otp: 'Invalid OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual payment processing
      console.log('Processing payment for workspace creation');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create the workspace
      const newWorkspace = {
        _id: `workspace_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        region: formData.region,
        owner: 'current_user_id', // Will be set by backend
        memberCount: 1,
        members: [],
        isPublic: false,
        subscription: {
          plan: 'pro' as const,
          status: 'active' as const,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        },
        isActive: true,
        settings: {
          isPublic: false,
          allowMemberInvites: true,
          requireApprovalForJoining: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add workspace to state
      dispatch({
        type: 'ADD_WORKSPACE',
        payload: newWorkspace as any
      });
      
      setShowPayment(true);
      setStep(4);
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Workspace created successfully!',
          duration: 3000
        }
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Payment failed. Please try again.',
          duration: 3000
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setOtpSent(false);
    setOtpVerified(false);
    setShowPayment(false);
    setFormData({
      name: '',
      description: '',
      type: 'team',
      logo: '',
      contactEmail: '',
      organizationName: '',
      otp: '',
      region: 'North America'
    });
    setErrors({});
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="South America">South America</option>
              <option value="Africa">Africa</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-blue-600" />
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
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest ${
            errors.otp ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter 6-digit code"
          maxLength={6}
        />
        {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
      </div>

      <div className="text-center">
        <button
          onClick={() => setOtpSent(false)}
          className="text-blue-600 hover:text-blue-700 text-sm"
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

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Payment Required</h4>
            <p className="text-sm text-yellow-700 mt-1">
              To create your workspace, a one-time payment of $29.99 is required. This includes:
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• Up to 50 team members</li>
              <li>• Unlimited projects</li>
              <li>• Advanced analytics</li>
              <li>• Priority support</li>
            </ul>
          </div>
        </div>
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 && 'Create Workspace'}
            {step === 2 && 'Verify Email'}
            {step === 3 && 'Payment Required'}
            {step === 4 && 'Success!'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification'}
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pay $29.99'}
              </button>
            </>
          )}
          
          {step === 4 && (
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
