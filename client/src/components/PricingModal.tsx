import React, { useState } from 'react';
import { 
  X, Check, Star, Zap, Crown, Users, FolderOpen, 
  BarChart3, Bot, Shield, Headphones, Palette, 
  Code, Database, Globe, Clock, Calendar, FileText,
  TrendingUp, Target, MessageSquare, Settings,
  CreditCard, DollarSign, Gift, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  originalPrice?: {
    monthly: number;
    yearly: number;
  };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  features: Array<{
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    included: boolean;
    highlight?: boolean;
  }>;
  limits: {
    workspaces: number | 'unlimited';
    projects: number | 'unlimited';
    teamMembers: number | 'unlimited';
    storage: number | 'unlimited';
  };
  popular?: boolean;
  comingSoon?: boolean;
}

const PricingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for individuals and small teams getting started',
      price: { monthly: 0, yearly: 0 },
      icon: Users,
      color: 'text-gray-600',
      gradient: 'from-gray-400 to-gray-600',
      features: [
        {
          name: 'Basic Task Management',
          description: 'Create, assign, and track tasks with basic views',
          icon: Check,
          included: true
        },
        {
          name: 'Up to 3 Projects',
          description: 'Manage up to 3 active projects',
          icon: FolderOpen,
          included: true
        },
        {
          name: 'Up to 5 Team Members',
          description: 'Collaborate with up to 5 team members',
          icon: Users,
          included: true
        },
        {
          name: '1GB Storage',
          description: 'Store files and documents',
          icon: Database,
          included: true
        },
        {
          name: 'Basic AI Assistant',
          description: 'Limited AI suggestions and help',
          icon: Bot,
          included: true
        },
        {
          name: 'Basic Analytics',
          description: 'Simple project progress tracking',
          icon: BarChart3,
          included: true
        },
        {
          name: 'Email Support',
          description: 'Community support via email',
          icon: MessageSquare,
          included: true
        },
        {
          name: 'Mobile App Access',
          description: 'Access via mobile applications',
          icon: Globe,
          included: true
        }
      ],
      limits: {
        workspaces: 1,
        projects: 3,
        teamMembers: 5,
        storage: 1
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Advanced features for growing teams and businesses',
      price: { monthly: 12, yearly: 120 },
      originalPrice: { monthly: 15, yearly: 150 },
      icon: Zap,
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-purple-600',
      popular: true,
      features: [
        {
          name: 'Everything in Free',
          description: 'All free features included',
          icon: Check,
          included: true,
          highlight: true
        },
        {
          name: 'Unlimited Projects',
          description: 'Create and manage unlimited projects',
          icon: FolderOpen,
          included: true,
          highlight: true
        },
        {
          name: 'Up to 50 Team Members',
          description: 'Scale your team up to 50 members',
          icon: Users,
          included: true,
          highlight: true
        },
        {
          name: '100GB Storage',
          description: 'Ample storage for all your files',
          icon: Database,
          included: true,
          highlight: true
        },
        {
          name: 'Advanced AI Assistant',
          description: 'Smart project creation, task suggestions, and insights',
          icon: Bot,
          included: true,
          highlight: true
        },
        {
          name: 'Advanced Analytics',
          description: 'Detailed reports, charts, and performance metrics',
          icon: BarChart3,
          included: true,
          highlight: true
        },
        {
          name: 'Custom Integrations',
          description: 'Connect with 100+ third-party tools',
          icon: Code,
          included: true,
          highlight: true
        },
        {
          name: 'Time Tracking',
          description: 'Built-in time tracking and timesheets',
          icon: Clock,
          included: true
        },
        {
          name: 'Advanced Views',
          description: 'Gantt charts, calendar, and timeline views',
          icon: Calendar,
          included: true
        },
        {
          name: 'Priority Support',
          description: 'Faster response times and priority support',
          icon: Headphones,
          included: true
        },
        {
          name: 'Custom Fields',
          description: 'Create custom fields for tasks and projects',
          icon: Settings,
          included: true
        },
        {
          name: 'Advanced Permissions',
          description: 'Granular role-based access control',
          icon: Shield,
          included: true
        }
      ],
      limits: {
        workspaces: 5,
        projects: 'unlimited',
        teamMembers: 50,
        storage: 100
      }
    },
    {
      id: 'ultra',
      name: 'Ultra',
      description: 'Enterprise-grade features for large organizations',
      price: { monthly: 25, yearly: 250 },
      originalPrice: { monthly: 30, yearly: 300 },
      icon: Crown,
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-pink-600',
      features: [
        {
          name: 'Everything in Pro',
          description: 'All Pro features included',
          icon: Check,
          included: true,
          highlight: true
        },
        {
          name: 'Unlimited Everything',
          description: 'No limits on workspaces, projects, or team members',
          icon: Star,
          included: true,
          highlight: true
        },
        {
          name: '1TB Storage',
          description: 'Massive storage capacity for enterprise needs',
          icon: Database,
          included: true,
          highlight: true
        },
        {
          name: 'AI-Powered Insights',
          description: 'Predictive analytics and intelligent recommendations',
          icon: Bot,
          included: true,
          highlight: true
        },
        {
          name: 'White Labeling',
          description: 'Custom branding and domain options',
          icon: Palette,
          included: true,
          highlight: true
        },
        {
          name: 'API Access',
          description: 'Full API access for custom integrations',
          icon: Code,
          included: true,
          highlight: true
        },
        {
          name: 'Advanced Security',
          description: 'SSO, SAML, and enterprise security features',
          icon: Shield,
          included: true,
          highlight: true
        },
        {
          name: 'Dedicated Support',
          description: 'Dedicated account manager and 24/7 support',
          icon: Headphones,
          included: true,
          highlight: true
        },
        {
          name: 'Custom Workflows',
          description: 'Create custom automation and workflows',
          icon: Settings,
          included: true
        },
        {
          name: 'Advanced Reporting',
          description: 'Custom reports and data export options',
          icon: FileText,
          included: true
        },
        {
          name: 'Multi-Region Deployment',
          description: 'Deploy across multiple regions for compliance',
          icon: Globe,
          included: true
        },
        {
          name: 'SLA Guarantee',
          description: '99.9% uptime SLA with financial guarantees',
          icon: Target,
          included: true
        }
      ],
      limits: {
        workspaces: 'unlimited',
        projects: 'unlimited',
        teamMembers: 'unlimited',
        storage: 1000
      }
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Here you would typically integrate with payment processing
    console.log(`Selected plan: ${planId}, Billing: ${billingCycle}`);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const calculateSavings = (plan: PricingPlan) => {
    if (!plan.originalPrice) return 0;
    const monthlySavings = plan.originalPrice.monthly - plan.price.monthly;
    const yearlySavings = plan.originalPrice.yearly - plan.price.yearly;
    return billingCycle === 'monthly' ? monthlySavings : yearlySavings;
  };

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
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              const savings = calculateSavings(plan);
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border-2 transition-all duration-200 ${
                    plan.popular
                      ? 'border-blue-500 shadow-lg scale-105'
                      : isSelected
                      ? 'border-purple-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 mt-2">{plan.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(plan.price[billingCycle])}
                        </span>
                        {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                          <span className="text-gray-600">/year</span>
                        )}
                        {billingCycle === 'monthly' && plan.price.monthly > 0 && (
                          <span className="text-gray-600">/month</span>
                        )}
                      </div>
                      {plan.originalPrice && savings > 0 && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(plan.originalPrice[billingCycle])}
                          </span>
                          <span className="text-green-600 font-medium">
                            Save {formatPrice(savings)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Limits */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Plan Limits</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Workspaces:</span>
                          <span className="font-medium">{plan.limits.workspaces}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Projects:</span>
                          <span className="font-medium">{plan.limits.projects}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Team Members:</span>
                          <span className="font-medium">{plan.limits.teamMembers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage:</span>
                          <span className="font-medium">{plan.limits.storage}GB</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => {
                          const FeatureIcon = feature.icon;
  return (
                            <div
                              key={index}
                              className={`flex items-start gap-3 p-2 rounded-lg ${
                                feature.highlight ? 'bg-blue-50 border border-blue-200' : ''
                              }`}
                            >
                              <FeatureIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                feature.included ? 'text-green-500' : 'text-gray-300'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${
                                    feature.included ? 'text-gray-900' : 'text-gray-500'
                                  }`}>
                                    {feature.name}
                                  </span>
                                  {feature.highlight && (
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                      Pro
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : plan.id === 'free'
                          ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {plan.id === 'free' ? 'Get Started Free' : `Choose ${plan.name}`}
                      {plan.id !== 'free' && (
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
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              All plans include a 14-day free trial. Cancel anytime.
            </p>
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
                <span>14-day free trial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
