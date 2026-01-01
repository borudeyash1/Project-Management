import React, { useState } from 'react';
import { CreditCard, Shield, CheckCircle, X, Loader } from 'lucide-react';
import api from '../services/api';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // Create order
      console.log('📤 Creating payment order...', { planKey, billingCycle });
      const orderResponse = await api.post('/payment/create-order', {
        planKey,
        billingCycle
      });

      console.log('📥 Order response:', orderResponse);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const orderData = orderResponse.data;
      console.log('💳 Order data:', orderData);

      // Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency,
        name: 'Sartthi Project Management',
        description: `${planName} - ${billingCycle} subscription`,
        image: '/logo.png', // Add your logo path
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planKey,
              billingCycle
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
          name: '', // Will be filled from user data
          email: '',
          contact: ''
        },
        notes: {
          planKey,
          planName,
          billingCycle
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
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-bold text-lg">Total Amount:</span>
              <span className="text-blue-600 font-bold text-2xl">₹{amount}</span>
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
    </div>
  );
};

export default RazorpayPaymentModal;
