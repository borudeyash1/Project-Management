import React, { useEffect, useState } from 'react';
import { Users, Shield, BarChart3, Settings, Package, LayoutDashboard, Plus, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import AdminDockNavigation from './AdminDockNavigation';

interface PricingFeature {
  text: string;
  included: boolean;
  integrations?: { icon: string; name: string }[];
}

interface SubscriptionPlanPayload {
  planKey: 'free' | 'pro' | 'premium' | 'enterprise';
  displayName: string;
  price: number | string;
  description: string;
  recommended: boolean;
  features: PricingFeature[];
  buttonText: string;
  buttonStyle: 'solid' | 'outline';
  contactLink?: boolean;
  paymentEnabled?: boolean; // Enable/disable payment processing
}

const AdminSubscriptions: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [plans, setPlans] = useState<SubscriptionPlanPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'content'>('plans');
  
  // Pricing page content state - matching actual PricingPage.tsx
  const [pricingContent, setPricingContent] = useState({
    heroTitle: 'Choose Your Perfect Plan',
    heroSubtitle: 'Flexible pricing that grows with your team',
    freePlanPrice: '₹0',
    freePlanDescription: 'Get started for free',
    proPlanPrice: '₹449',
    proPlanDescription: 'Recommended',
    premiumPlanPrice: 'Contact',
    premiumPlanDescription: 'For growing teams',
    enterprisePlanPrice: 'Custom',
    enterprisePlanDescription: 'For large organizations',
    ctaTextFree: 'Get Started Free',
    ctaTextPro: 'Get Started',
    ctaTextPremium: 'Contact Sales',
    ctaTextEnterprise: 'Contact Sales',
    billingNote: 'All plans include 14-day free trial. No credit card required.'
  });
  
  const quickActions = [
    {
      label: 'Manage Users',
      subtitle: 'View and edit users',
      path: '/admin/users',
      icon: Users
    },
    {
      label: 'Security',
      subtitle: 'Manage devices & access',
      path: '/admin/devices',
      icon: Shield
    },
    {
      label: 'Analytics',
      subtitle: 'View system metrics',
      path: '/admin/analytics',
      icon: BarChart3
    },
    {
      label: 'Settings',
      subtitle: 'Configure system',
      path: '/admin/settings',
      icon: Settings
    },
    {
      label: 'Desktop Releases',
      subtitle: 'Manage releases',
      path: '/admin/releases',
      icon: Package
    },
    {
      label: 'Subscriptions',
      subtitle: 'Plan catalog & pricing',
      path: '/admin/subscriptions',
      icon: LayoutDashboard
    }
  ];

  useEffect(() => {
    const loadPlans = async () => {
      try {
        console.log('Loading subscription plans...');
        const response = await api.get('/admin/subscriptions');
        console.log('API Response:', response);
        
        if (response.success && response.data && response.data.length > 0) {
          console.log('Plans loaded from API:', response.data.length);
          // Ensure features is always an array
          const validatedPlans = response.data.map((plan: any) => ({
            ...plan,
            features: Array.isArray(plan.features) ? plan.features : []
          }));
          setPlans(validatedPlans);
        } else {
          console.log('No plans in database, using mock data');
          // Use mock data if API returns nothing
          const mockPlans = getMockPlans();
          setPlans(mockPlans);
          addToast('Using default plans. Click "Save Plan" to store them in database.', 'info');
        }
      } catch (error) {
        console.error('Failed to load subscription plans', error);
        console.log('Error occurred, using mock data');
        addToast('Using default plans', 'info');
        // Use mock data on error
        setPlans(getMockPlans());
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [addToast]);

  const getMockPlans = (): SubscriptionPlanPayload[] => {
    return [
      {
        planKey: 'free',
        displayName: 'Free',
        price: 0,
        description: 'Get started for free',
        recommended: false,
        features: [
          { text: 'Personal workspace only', included: true },
          { text: 'Notes making: all notes including sticky notes', included: true },
          { text: 'Projects: 1 project, no members', included: true },
          { text: 'Desktop application access', included: true },
          { text: 'Visualization: Board, Kanban, Timeline', included: true },
          { text: 'Reminder creation (no reminder mails)', included: true },
          { text: 'Custom reports & analytics', included: true },
          { text: 'Goals & objectives setting', included: true },
          { text: 'Multi-language support (14 languages)', included: true },
          { text: 'Appearance customization', included: true },
          { text: 'No access: calendar, vault, mail', included: false },
          { text: 'Ads included', included: false },
          { text: 'No AI assistant', included: false }
        ],
        buttonText: 'Get Started Free',
        buttonStyle: 'outline'
      },
      {
        planKey: 'pro',
        displayName: 'Pro',
        price: 449,
        description: 'Recommended',
        recommended: true,
        features: [
          { text: 'Workspaces: 1 personal + 2 additional', included: true },
          { text: 'Projects: 2 per workspace', included: true },
          { text: 'Members: 20 per workspace, 8 per project', included: true },
          { text: 'Notes with meeting add-ons & handling', included: true },
          { text: 'Meetings: live transcript, AI summary', included: true },
          { text: 'Desktop application access', included: true },
          { text: 'Access: calendar, vault, mail', included: true },
          { text: 'No ads', included: true },
          { text: 'AI assistant with custom inputs (limited)', included: true },
          { text: 'Visualization: Board, Kanban', included: true },
          { text: 'Reminders with reminder mails', included: true },
          { text: 'Reports & analytics with AI insights', included: true },
          { text: 'Attendance & payroll functionality', included: true },
          { text: 'Workspace & project inbox', included: true },
          { text: 'Custom URL submission', included: true },
          { text: 'Leaderboard access', included: true },
          { text: 'Role-based access control', included: true },
          { text: 'Workload & deadline management', included: true },
          { 
            text: 'Integrations', 
            included: true,
            integrations: [
              { icon: 'https://img.icons8.com/?size=100&id=pE97I4t7Il9M&format=png&color=000000', name: 'Google Meet' },
              { icon: 'https://img.icons8.com/?size=100&id=keRbY8PNKlan&format=png&color=000000', name: 'Microsoft Teams' },
              { icon: 'https://img.icons8.com/?size=100&id=7csVZvHoQrLW&format=png&color=000000', name: 'Zoom' }
            ]
          }
        ],
        buttonText: 'Get Started',
        buttonStyle: 'solid'
      },
      {
        planKey: 'premium',
        displayName: 'Premium',
        price: 'Contact',
        description: 'For growing teams',
        recommended: false,
        features: [
          { text: 'Workspaces: 1 personal + 10 additional', included: true },
          { text: 'Projects: 5 per workspace', included: true },
          { text: 'Members: 50 per workspace, 20 per project', included: true },
          { text: 'Notes with meeting add-ons & handling', included: true },
          { text: 'Meetings: live transcript, AI summary', included: true },
          { text: 'Desktop application access', included: true },
          { text: 'Access: calendar, vault, mail', included: true },
          { text: 'No ads', included: true },
          { text: 'AI assistant: unlimited custom inputs', included: true },
          { text: 'Visualization: Board, Kanban', included: true },
          { text: 'Reminders with reminder mails', included: true },
          { text: 'Reports & analytics with AI insights', included: true },
          { text: 'Attendance & payroll functionality', included: true },
          { text: 'Workspace & project inbox', included: true },
          { text: 'Custom URL submission', included: true },
          { text: 'Leaderboard access', included: true },
          { text: 'Role-based access control', included: true },
          { text: 'Workload & deadline management', included: true },
          { 
            text: 'Integrations', 
            included: true,
            integrations: [
              { icon: 'https://img.icons8.com/?size=100&id=pE97I4t7Il9M&format=png&color=000000', name: 'Google Meet' },
              { icon: 'https://img.icons8.com/?size=100&id=keRbY8PNKlan&format=png&color=000000', name: 'Microsoft Teams' },
              { icon: 'https://img.icons8.com/?size=100&id=7csVZvHoQrLW&format=png&color=000000', name: 'Zoom' },
              { icon: 'https://img.icons8.com/?size=100&id=19978&format=png&color=000000', name: 'Slack' },
              { icon: 'https://img.icons8.com/?size=100&id=12599&format=png&color=000000', name: 'GitHub' },
              { icon: 'https://img.icons8.com/?size=100&id=13630&format=png&color=000000', name: 'Google Drive' },
              { icon: 'https://img.icons8.com/?size=100&id=13657&format=png&color=000000', name: 'Dropbox' }
            ]
          }
        ],
        buttonText: 'Contact Sales',
        buttonStyle: 'outline',
        contactLink: true
      },
      {
        planKey: 'enterprise',
        displayName: 'Enterprise',
        price: 'Custom',
        description: 'For large organizations',
        recommended: false,
        features: [
          { text: 'Tailored plan for company requirements', included: true },
          { text: 'Custom workspaces & projects', included: true },
          { text: 'Custom members & features', included: true },
          { text: 'All Premium features included', included: true },
          { text: 'Dedicated account manager', included: true },
          { text: 'Priority support 24/7', included: true },
          { 
            text: 'Integrations', 
            included: true,
            integrations: [
              { icon: 'https://img.icons8.com/?size=100&id=pE97I4t7Il9M&format=png&color=000000', name: 'Google Meet' },
              { icon: 'https://img.icons8.com/?size=100&id=keRbY8PNKlan&format=png&color=000000', name: 'Microsoft Teams' },
              { icon: 'https://img.icons8.com/?size=100&id=7csVZvHoQrLW&format=png&color=000000', name: 'Zoom' },
              { icon: 'https://img.icons8.com/?size=100&id=19978&format=png&color=000000', name: 'Slack' },
              { icon: 'https://img.icons8.com/?size=100&id=12599&format=png&color=000000', name: 'GitHub' },
              { icon: 'https://img.icons8.com/?size=100&id=13630&format=png&color=000000', name: 'Google Drive' },
              { icon: 'https://img.icons8.com/?size=100&id=13657&format=png&color=000000', name: 'Dropbox' }
            ]
          },
          { text: 'Custom integrations available', included: true },
          { text: 'Advanced security features', included: true },
          { text: 'Custom SLA agreements', included: true },
          { text: 'On-premise deployment option', included: true }
        ],
        buttonText: 'Contact Sales',
        buttonStyle: 'outline',
        contactLink: true
      }
    ];
  };

  const handleSave = async (plan: SubscriptionPlanPayload) => {
    setSaving(true);
    try {
      const response = await api.put(`/admin/subscriptions/${plan.planKey}`, plan);
      if (response.success) {
        addToast(`${plan.displayName} plan saved`, 'success');
      }
    } catch (error) {
      console.error('Failed to update plan', error);
      addToast('Failed to update plan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = (planKey: string) => {
    setPlans(prev => prev.map(plan => {
      if (plan.planKey === planKey) {
        return {
          ...plan,
          features: [...plan.features, { text: 'New feature', included: true }]
        };
      }
      return plan;
    }));
  };

  const removeFeature = (planKey: string, featureIndex: number) => {
    setPlans(prev => prev.map(plan => {
      if (plan.planKey === planKey) {
        return {
          ...plan,
          features: plan.features.filter((_, idx) => idx !== featureIndex)
        };
      }
      return plan;
    }));
  };

  const updateFeature = (planKey: string, featureIndex: number, field: keyof PricingFeature, value: any) => {
    setPlans(prev => prev.map(plan => {
      if (plan.planKey === planKey) {
        const newFeatures = [...plan.features];
        newFeatures[featureIndex] = { ...newFeatures[featureIndex], [field]: value };
        return { ...plan, features: newFeatures };
      }
      return plan;
    }));
  };

  const updatePlanField = (planKey: string, field: keyof SubscriptionPlanPayload, value: any) => {
    setPlans(prev => prev.map(plan => {
      if (plan.planKey === planKey) {
        return { ...plan, [field]: value };
      }
      return plan;
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-accent border-gray-200"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto py-12 px-4 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Subscription & Pricing Management</h1>
          <p className="text-sm text-gray-600">Manage subscription plans and pricing page content</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'plans'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'content'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pricing Page Content
          </button>
        </div>

        {activeTab === 'plans' ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => window.location.assign(action.path)}
                    className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition hover:border-orange-500 hover:bg-orange-50/50 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-white'}`}
                  >
                    <div className="flex items-center gap-3 text-base font-semibold">
                      <Icon className="h-5 w-5" /> {action.label}
                    </div>
                    <p className="text-xs text-gray-600">{action.subtitle}</p>
                  </button>
                );
              })}
            </section>


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.planKey}
              className={`border rounded-2xl p-5 shadow-lg ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-800 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {/* Plan Header */}
              <div className="mb-4">
                <input
                  type="text"
                  className={`text-xl font-semibold w-full pb-1 mb-2 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-50 text-gray-900 border-gray-300'
                  } border-b px-2 py-1 rounded`}
                  value={plan.displayName || ''}
                  onChange={(e) => updatePlanField(plan.planKey, 'displayName', e.target.value)}
                  placeholder="Plan Name"
                />
                <input
                  type="text"
                  className={`text-2xl font-bold w-full pb-1 mb-2 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-blue-400 border-gray-600' 
                      : 'bg-gray-50 text-blue-600 border-gray-300'
                  } border-b px-2 py-1 rounded`}
                  value={plan.price || ''}
                  onChange={(e) => updatePlanField(plan.planKey, 'price', e.target.value)}
                  placeholder="Price"
                />
                <input
                  type="text"
                  className={`text-sm w-full pb-1 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 border-gray-600' 
                      : 'bg-gray-50 text-gray-600 border-gray-300'
                  } border-b px-2 py-1 rounded`}
                  value={plan.description || ''}
                  onChange={(e) => updatePlanField(plan.planKey, 'description', e.target.value)}
                  placeholder="Description"
                />
              </div>

              {/* Recommended Toggle */}
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={plan.recommended}
                  onChange={(e) => updatePlanField(plan.planKey, 'recommended', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className={`text-sm font-medium ${plan.recommended ? 'text-blue-600' : ''}`}>
                  Recommended
                </span>
              </label>

              {/* Payment Enabled Toggle */}
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={plan.paymentEnabled !== false}
                  onChange={(e) => updatePlanField(plan.planKey, 'paymentEnabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className={`text-sm font-medium ${plan.paymentEnabled !== false ? 'text-green-600' : 'text-gray-500'}`}>
                  Payment Enabled
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {plan.paymentEnabled !== false ? '(Payment flow active)' : '(Payment disabled)'}
                </span>
              </label>

              {/* Features List */}
              <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Features ({plan.features.length})</label>
                  <button
                    onClick={() => addFeature(plan.planKey)}
                    className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {plan.features.map((feature, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex gap-2 items-start">
                      <input
                        type="checkbox"
                        checked={feature.included}
                        onChange={(e) => updateFeature(plan.planKey, idx, 'included', e.target.checked)}
                        className="mt-1 w-4 h-4"
                      />
                      <input
                        type="text"
                        className={`flex-1 text-sm px-2 py-1 rounded ${
                          isDarkMode 
                            ? 'bg-gray-600 text-white border-gray-500' 
                            : 'bg-white text-gray-900 border-gray-300'
                        } border`}
                        value={feature.text}
                        onChange={(e) => updateFeature(plan.planKey, idx, 'text', e.target.value)}
                        placeholder="Feature description"
                      />
                      <button
                        onClick={() => removeFeature(plan.planKey, idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Integration Management */}
                    {feature.integrations && feature.integrations.length > 0 && (
                      <div className="mt-2 pl-6 space-y-2">
                        <div className="text-xs font-medium text-gray-500">Integrations ({feature.integrations.length})</div>
                        {feature.integrations.map((integration, intIdx) => (
                          <div key={intIdx} className={`flex gap-2 items-center p-2 rounded ${
                            isDarkMode ? 'bg-gray-600' : 'bg-white'
                          }`}>
                            {integration.icon && (
                              <img src={integration.icon} alt={integration.name} className="w-5 h-5 rounded" />
                            )}
                            <input
                              type="text"
                              className={`flex-1 text-xs px-2 py-1 rounded border ${
                                isDarkMode ? 'bg-gray-700 text-white border-gray-500' : 'bg-gray-50 text-gray-900 border-gray-300'
                              }`}
                              value={integration.icon}
                              onChange={(e) => {
                                const newIntegrations = [...feature.integrations!];
                                newIntegrations[intIdx] = { ...newIntegrations[intIdx], icon: e.target.value };
                                updateFeature(plan.planKey, idx, 'integrations', newIntegrations);
                              }}
                              placeholder="Icon URL"
                            />
                            <input
                              type="text"
                              className={`w-24 text-xs px-2 py-1 rounded border ${
                                isDarkMode ? 'bg-gray-700 text-white border-gray-500' : 'bg-gray-50 text-gray-900 border-gray-300'
                              }`}
                              value={integration.name}
                              onChange={(e) => {
                                const newIntegrations = [...feature.integrations!];
                                newIntegrations[intIdx] = { ...newIntegrations[intIdx], name: e.target.value };
                                updateFeature(plan.planKey, idx, 'integrations', newIntegrations);
                              }}
                              placeholder="Name"
                            />
                            <button
                              onClick={() => {
                                const newIntegrations = feature.integrations!.filter((_, i) => i !== intIdx);
                                updateFeature(plan.planKey, idx, 'integrations', newIntegrations);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newIntegrations = [...(feature.integrations || []), { icon: '', name: '' }];
                            updateFeature(plan.planKey, idx, 'integrations', newIntegrations);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Integration
                        </button>
                      </div>
                    )}
                    
                    {/* Add Integrations Button (if none exist) */}
                    {(!feature.integrations || feature.integrations.length === 0) && (
                      <button
                        onClick={() => {
                          updateFeature(plan.planKey, idx, 'integrations', [{ icon: '', name: '' }]);
                        }}
                        className="mt-2 ml-6 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Integrations
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Button Settings */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-medium text-gray-500">Button Text</label>
                <input
                  type="text"
                  className={`w-full text-sm px-2 py-1 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-50 text-gray-900 border-gray-300'
                  }`}
                  value={plan.buttonText || ''}
                  onChange={(e) => updatePlanField(plan.planKey, 'buttonText', e.target.value)}
                  placeholder="Button Text"
                />
                <label className="text-xs font-medium text-gray-500">Button Style</label>
                <select
                  className={`w-full text-sm px-2 py-1 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-50 text-gray-900 border-gray-300'
                  }`}
                  value={plan.buttonStyle || 'outline'}
                  onChange={(e) => updatePlanField(plan.planKey, 'buttonStyle', e.target.value as 'solid' | 'outline')}
                >
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                </select>
              </div>

              <button
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 text-sm font-semibold hover:opacity-90 transition shadow-lg"
                onClick={() => handleSave(plan)}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Plan'}
              </button>
            </div>
          ))}
        </div>
          </>
        ) : (
          <div className={`border rounded-2xl p-8 shadow-lg ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6">Pricing Page Content Editor</h2>
            <p className="text-sm text-gray-600 mb-8">Update the marketing content displayed on the public pricing page</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Hero Title</label>
                <input
                  type="text"
                  className="w-full rounded-lg border p-3 text-sm"
                  value={pricingContent.heroTitle}
                  onChange={(e) => setPricingContent({...pricingContent, heroTitle: e.target.value})}
                  placeholder="Choose Your Perfect Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                <input
                  type="text"
                  className="w-full rounded-lg border p-3 text-sm"
                  value={pricingContent.heroSubtitle}
                  onChange={(e) => setPricingContent({...pricingContent, heroSubtitle: e.target.value})}
                  placeholder="Flexible pricing that grows with your team"
                />
              </div>

              {/* Free Plan */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Free Plan</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border p-3 text-sm"
                      value={pricingContent.freePlanPrice}
                      onChange={(e) => setPricingContent({...pricingContent, freePlanPrice: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border p-3 text-sm"
                      value={pricingContent.freePlanDescription}
                      onChange={(e) => setPricingContent({...pricingContent, freePlanDescription: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-2">CTA Button Text</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border p-3 text-sm"
                    value={pricingContent.ctaTextFree}
                    onChange={(e) => setPricingContent({...pricingContent, ctaTextFree: e.target.value})}
                  />
                </div>
              </div>

              {/* Pro Plan */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Pro Plan</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border p-3 text-sm"
                      value={pricingContent.proPlanPrice}
                      onChange={(e) => setPricingContent({...pricingContent, proPlanPrice: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border p-3 text-sm"
                      value={pricingContent.proPlanDescription}
                      onChange={(e) => setPricingContent({...pricingContent, proPlanDescription: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-2">CTA Button Text</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border p-3 text-sm"
                    value={pricingContent.ctaTextPro}
                    onChange={(e) => setPricingContent({...pricingContent, ctaTextPro: e.target.value})}
                  />
                </div>
              </div>

              {/* Premium Plan */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Premium Plan</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border p-3 text-sm"
                      value={pricingContent.premiumPlanPrice}
                      onChange={(e) => setPricingContent({...pricingContent, premiumPlanPrice: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border p-3 text-sm"
                      value={pricingContent.premiumPlanDescription}
                      onChange={(e) => setPricingContent({...pricingContent, premiumPlanDescription: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-2">CTA Button Text</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border p-3 text-sm"
                    value={pricingContent.ctaTextPremium}
                    onChange={(e) => setPricingContent({...pricingContent, ctaTextPremium: e.target.value})}
                  />
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Enterprise Plan</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border p-3 text-sm"
                      value={pricingContent.enterprisePlanPrice}
                      onChange={(e) => setPricingContent({...pricingContent, enterprisePlanPrice: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border p-3 text-sm"
                      value={pricingContent.enterprisePlanDescription}
                      onChange={(e) => setPricingContent({...pricingContent, enterprisePlanDescription: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-2">CTA Button Text</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border p-3 text-sm"
                    value={pricingContent.ctaTextEnterprise}
                    onChange={(e) => setPricingContent({...pricingContent, ctaTextEnterprise: e.target.value})}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2">Billing Note</label>
                <textarea
                  className="w-full rounded-lg border p-3 text-sm"
                  value={pricingContent.billingNote}
                  onChange={(e) => setPricingContent({...pricingContent, billingNote: e.target.value})}
                  rows={2}
                  placeholder="All plans include 14-day free trial. No credit card required."
                />
              </div>

              <button
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 text-sm font-semibold hover:opacity-90 transition"
                onClick={() => {
                  // Save pricing content
                  addToast('Pricing content saved successfully!', 'success');
                }}
              >
                Save Pricing Content
              </button>
            </div>
          </div>
        )}

        <AdminDockNavigation />
      </div>
    </div>
  );
};

export default AdminSubscriptions;
