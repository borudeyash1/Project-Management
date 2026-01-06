import React, { useState } from 'react';
import { CreditCard, Shield, CheckCircle, X, Loader, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import BillingInfoForm from './BillingInfoForm';

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planKey: string;
  planName: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  planKey,
  planName,
  amount,
  billingCycle,
  onSuccess
}) => {
  const { state, dispatch } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBillingForm, setShowBillingForm] = useState(false);
  
  // Coupon code state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [discountedAmount, setDiscountedAmount] = useState(amount);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setValidatingCoupon(true);
      setCouponError('');

      const response = await api.get(`/coupons/validate/${couponCode.trim().toUpperCase()}`);

      if (response.success) {
        const couponData = response.data;

        // Check if coupon is applicable to this plan
        if (couponData.applicablePlans && couponData.applicablePlans.length > 0) {
          if (!couponData.applicablePlans.includes(planKey)) {
            setCouponError('This coupon is not applicable to the selected plan');
            setValidatingCoupon(false);
            return;
          }
        }

        // Check minimum purchase requirement
        if (couponData.minPurchase && amount < couponData.minPurchase) {
          setCouponError(`Minimum purchase of ₹${couponData.minPurchase} required`);
          setValidatingCoupon(false);
          return;
        }

        // Calculate discount
        let discount = 0;
        if (couponData.discountType === 'percentage') {
          discount = (amount * couponData.discountValue) / 100;
          // Apply max discount if specified
          if (couponData.maxDiscount && discount > couponData.maxDiscount) {
            discount = couponData.maxDiscount;
          }
        } else {
          // Fixed amount discount
          discount = couponData.discountValue;
        }

        const finalAmount = Math.max(0, amount - discount);

        setAppliedCoupon({
          ...couponData,
          discount: discount
        });
        setDiscountedAmount(finalAmount);
        setCouponError('');
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || error.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      setDiscountedAmount(amount);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
    setDiscountedAmount(amount);
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Fetch fresh user profile to check billing info
      let billingInfo = state.userProfile?.billingInfo;
      
      console.log('🔍 Checking billing info from state:', billingInfo);
      
      // If billing info is not in state, fetch from API
      if (!billingInfo || !billingInfo.isComplete) {
        try {
          console.log('📡 Fetching fresh profile data from API...');
          const profileResponse = await api.get('/users/profile');
          console.log('📥 Profile response:', profileResponse);
          console.log('📋 Profile data:', profileResponse.data);
          console.log('🏠 Billing info from API:', profileResponse.data?.billingInfo);
          console.log('✔️ isComplete value:', profileResponse.data?.billingInfo?.isComplete);
          
          if (profileResponse.success && profileResponse.data?.billingInfo?.isComplete) {
            billingInfo = profileResponse.data.billingInfo;
            console.log('✅ Found complete billing info:', billingInfo);
          } else {
            console.log('❌ Billing info not complete, showing form');
            // Show billing form if still not complete
            setShowBillingForm(true);
            setIsProcessing(false);
            return;
          }
        } catch (error) {
          console.error('❌ Error fetching profile:', error);
          // If fetch fails, show billing form
          setShowBillingForm(true);
          setIsProcessing(false);
          return;
        }
      } else {
        console.log('✅ Using billing info from state');
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // Create order
      console.log('📤 Creating payment order...', { planKey, billingCycle, couponCode: appliedCoupon?.code });
      const orderResponse = await api.post('/payment/create-order', {
        planKey,
        billingCycle,
        couponCode: appliedCoupon?.code || null,
        discountedAmount: appliedCoupon ? discountedAmount : null
      });

      console.log('📥 Order response:', orderResponse);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const orderData = orderResponse.data;
      console.log('💳 Order data:', orderData);

      // Razorpay options with prefilled billing info
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency,
        name: 'Sartthi Project Management',
        description: `${planName} - ${billingCycle} subscription`,
        image: '/logo.png',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planKey,
              billingCycle,
              couponCode: appliedCoupon?.code || null,
              discountAmount: appliedCoupon?.discount || 0,
              originalAmount: amount
            });

            if (verifyResponse.success) {
              // Payment successful
              if (onSuccess) {
                onSuccess();
              }
              onClose();
            } else {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            setError(error.message || 'Payment verification failed');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: state.userProfile?.fullName || '',
          email: billingInfo?.billingEmail || state.userProfile?.email || '',
          contact: billingInfo?.phone || state.userProfile?.contactNumber || ''
        },
        notes: {
          planKey,
          planName,
          billingCycle,
          address: billingInfo?.address ? `${billingInfo.address.street}, ${billingInfo.address.city}, ${billingInfo.address.state} ${billingInfo.address.postalCode}` : '',
          gstNumber: billingInfo?.gstNumber || ''
        },
        theme: {
          color: '#006397'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment failed');
        setIsProcessing(false);
      });

      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment initiation failed');
      setIsProcessing(false);
    }
  };

  const handleBillingSuccess = async (billingData: any) => {
    setShowBillingForm(false);
    
    // Refresh user profile in app state
    try {
      const profileResponse = await api.get('/users/profile');
      if (profileResponse.success) {
        // Update user profile in app state
        dispatch({
          type: 'SET_USER',
          payload: profileResponse.data
        });
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
    
    // Automatically proceed to payment after billing info is saved
    setTimeout(() => {
      handlePayment();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isProcessing}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Purchase
          </h2>
          <p className="text-gray-600">
            Secure payment powered by Razorpay
          </p>
        </div>

        {/* Plan details */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Plan:</span>
            <span className="text-gray-900 font-semibold">{planName}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Billing:</span>
            <span className="text-gray-900 font-semibold capitalize">{billingCycle}</span>
          </div>
          
          {/* Coupon Code Section */}
          <div className="border-t border-gray-200 pt-3 mt-3 mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have a coupon code?
            </label>
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError('');
                  }}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  disabled={validatingCoupon || isProcessing}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || isProcessing || !couponCode.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {validatingCoupon ? 'Validating...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Coupon "{appliedCoupon.code}" applied!
                      </p>
                      <p className="text-xs text-green-700">
                        {appliedCoupon.discountType === 'percentage' 
                          ? `${appliedCoupon.discountValue}% discount` 
                          : `₹${appliedCoupon.discountValue} off`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-green-700 hover:text-green-900"
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            {couponError && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{couponError}</span>
              </div>
            )}
          </div>

          {/* Amount Breakdown */}
          <div className="border-t border-gray-200 pt-2 mt-2">
            {appliedCoupon && (
              <>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="text-gray-600">Original Amount:</span>
                  <span className="text-gray-600 line-through">₹{amount}</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-green-600">Discount:</span>
                  <span className="text-green-600">-₹{appliedCoupon.discount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-bold text-lg">Total Amount:</span>
              <span className="text-blue-600 font-bold text-2xl">₹{discountedAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Secured by 256-bit SSL encryption</span>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Features */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Instant activation</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>24/7 customer support</span>
          </div>
        </div>

        {/* Payment button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ₹{amount}
            </>
          )}
        </button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By proceeding, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>
      </div>

      {/* Billing Info Form Modal */}
      <BillingInfoForm
        isOpen={showBillingForm}
        onClose={() => {
          setShowBillingForm(false);
          setIsProcessing(false);
        }}
        onSuccess={handleBillingSuccess}
      />
    </div>
  );
};

export default RazorpayPaymentModal;
