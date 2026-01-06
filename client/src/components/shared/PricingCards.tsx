import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import RazorpayPaymentModal from '../RazorpayPaymentModal';
import PricingCardSkeleton from '../PricingCardSkeleton';

interface PricingCardsProps {
  compact?: boolean;
}

const PricingCards: React.FC<PricingCardsProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pricing-plans');
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          setPricingPlans(data.data);
        }
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingPlans();
  }, []);

  const handleGetStarted = (plan: any) => {
    console.log('🔵 Get Started clicked for plan:', plan);
    console.log('🔵 User profile:', state.userProfile);
    
    // Check if user is logged in
    if (!state.userProfile) {
      console.log('❌ User not logged in, redirecting to /login');
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'warning',
          message: 'Please login to proceed with payment and subscription.',
          duration: 4000
        }
      });
      navigate('/login');
      return;
    }

    // Convert price to number if it's a numeric string
    const numericPrice = typeof plan.price === 'string' && !isNaN(Number(plan.price)) 
      ? Number(plan.price) 
      : plan.price;

    console.log('💰 Converted price:', numericPrice, 'Type:', typeof numericPrice);

    // Free plan - redirect to dashboard
    if (plan.planKey === 'free' || numericPrice === 0) {
      console.log('✅ Free plan selected, redirecting to dashboard');
      navigate('/');
      return;
    }

    // Check if this is a non-numeric price (Contact/Custom)
    const isContactPrice = typeof plan.price === 'string' && isNaN(Number(plan.price));
    
    // Priority 1: If payment is ENABLED and price is numeric, open payment modal
    if (plan.paymentEnabled !== false && !isContactPrice) {
      console.log('💳 Payment enabled, opening payment modal');
      setSelectedPlan({ ...plan, price: numericPrice });
      setShowPaymentModal(true);
      return;
    }

    // Priority 2: If payment is DISABLED, show message
    if (plan.paymentEnabled === false && !isContactPrice) {
      console.log('⚠️ Payment disabled for this plan');
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'info',
          message: 'Payment processing is currently disabled for this plan. Please contact support.',
          duration: 5000
        }
      });
      return;
    }

    // Priority 3: Contact plans (non-numeric price OR contactLink)
    if (isContactPrice || plan.contactLink) {
      console.log('📞 Contact plan selected, redirecting to /contact-us');
      navigate('/contact-us');
      return;
    }

    // Fallback: open payment modal
    console.log('💳 Fallback: opening payment modal');
    setSelectedPlan({ ...plan, price: numericPrice });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    console.log('✅ Payment successful!');
    setShowPaymentModal(false);
    navigate('/');
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: `Successfully upgraded to ${selectedPlan?.displayName} plan!`,
        duration: 3500
      }
    });
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <PricingCardSkeleton />
        <PricingCardSkeleton />
        <PricingCardSkeleton />
        <PricingCardSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {pricingPlans.map((plan) => (
          <div 
            key={plan.planKey}
            className={`rounded-2xl p-6 border ${
              plan.recommended 
                ? 'border-2 border-[#006397] shadow-xl scale-[1.02] bg-white relative' 
                : 'border-gray-200 hover:shadow-lg transition-all bg-white'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#006397] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Recommended
                </span>
              </div>
            )}

            <div className="text-center mb-6 pt-2">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{plan.displayName}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {typeof plan.price === 'number' ? `₹${plan.price}` : plan.price}
                </span>
                {typeof plan.price === 'number' && plan.price > 0 && (
                  <span className="text-sm text-gray-500 ml-1">/month</span>
                )}
              </div>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>
            
            <ul className="space-y-3 mb-6 min-h-[400px]">
              {plan.features && plan.features.map((feature: any, idx: number) => (
                <li key={idx}>
                  <div className="flex items-start gap-2.5">
                    {feature.included ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`text-xs leading-relaxed ${
                      feature.included ? 'text-gray-700' : 'text-gray-400 line-through'
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                  {feature.integrations && feature.integrations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 ml-6 mt-1.5">
                      {feature.integrations.map((integration: any, intIdx: number) => (
                        <div 
                          key={intIdx}
                          className="flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded p-0.5" 
                          title={integration.name}
                        >
                          <img 
                            src={integration.icon} 
                            alt={integration.name} 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            
            <div className={plan.contactLink ? 'space-y-3' : ''}>
              <button
                onClick={() => handleGetStarted(plan)}
                className={`block w-full py-2.5 px-6 rounded-lg font-medium text-sm text-center transition-all ${
                  plan.buttonStyle === 'solid'
                    ? 'bg-[#006397] text-white hover:bg-[#005080]'
                    : 'border border-[#006397] text-[#006397] hover:bg-blue-50'
                }`}
              >
                {plan.buttonText || 'Get Started'}
              </button>
              {plan.contactLink && (
                <p className="text-xs text-gray-600 text-center">
                  or <button onClick={() => navigate('/contact-us')} className="text-[#006397] hover:underline">Contact us</button>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Razorpay Payment Modal */}
      {showPaymentModal && selectedPlan && selectedPlan.planKey !== 'free' && (
        <RazorpayPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          planKey={selectedPlan.planKey}
          planName={selectedPlan.displayName}
          amount={selectedPlan.price}
          billingCycle="monthly"
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default PricingCards;
