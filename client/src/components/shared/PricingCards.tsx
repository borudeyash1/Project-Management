import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

interface PricingCardsProps {
  compact?: boolean;
}

const PricingCards: React.FC<PricingCardsProps> = ({ compact = false }) => {
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading pricing plans...</p>
      </div>
    );
  }

  return (
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
            <Link
              to={plan.contactLink ? "/pricing" : "/register"}
              className={`block w-full py-2.5 px-6 rounded-lg font-medium text-sm text-center transition-all ${
                plan.buttonStyle === 'solid'
                  ? 'bg-[#006397] text-white hover:bg-[#005080]'
                  : 'border border-[#006397] text-[#006397] hover:bg-blue-50'
              }`}
            >
              {plan.buttonText || 'Get Started'}
            </Link>
            {plan.contactLink && (
              <p className="text-xs text-gray-600 text-center">
                or <Link to="/contact-us" className="text-[#006397] hover:underline">Contact us</Link>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PricingCards;
