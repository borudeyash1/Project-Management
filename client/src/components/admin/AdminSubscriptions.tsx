import React, { useEffect, useState } from 'react';
import { Users, Shield, BarChart3, Settings, Package, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import AdminDockNavigation from './AdminDockNavigation';

interface SubscriptionPlanPayload {
  planKey: 'free' | 'pro' | 'ultra';
  displayName: string;
  summary: string;
  monthlyPrice: number;
  yearlyPrice: number;
  perHeadPrice: number;
  workspaceFees: {
    personal: number;
    team: number;
    enterprise: number;
  };
  limits: {
    maxWorkspaces: number;
    maxProjects: number;
    maxTeamMembers: number;
  };
  features: {
    aiAccess: boolean;
    adsEnabled: boolean;
    collaboratorAccess: boolean;
    customStorageIntegration: boolean;
    desktopAppAccess: boolean;
    automaticScheduling: boolean;
    realtimeAISuggestions: boolean;
  };
}

const AdminSubscriptions: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addToast } = useApp();
  const [plans, setPlans] = useState<SubscriptionPlanPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const response = await api.get('/admin/subscriptions');
        if (response.success && response.data) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error('Failed to load subscription plans', error);
        addToast('Unable to load subscription plans', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [addToast]);

  const handleFieldChange = (planKey: string, path: string[], value: any) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.planKey !== planKey) return plan;
        const copy = JSON.parse(JSON.stringify(plan));
        let cursor: any = copy;
        for (let i = 0; i < path.length - 1; i++) {
          cursor[path[i]] = { ...cursor[path[i]] };
          cursor = cursor[path[i]];
        }
        cursor[path[path.length - 1]] = value;
        return copy;
      })
    );
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-accent border-gray-200"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-sm text-gray-600">Update feature descriptions, limits, and pricing that drive the workspace experience.</p>
        </header>

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

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.planKey}
              className={`border rounded-2xl p-5 shadow-lg ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold capitalize">{plan.displayName}</h2>
                  <p className="text-xs uppercase tracking-wide text-gray-600">{plan.planKey}</p>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold">${plan.monthlyPrice.toFixed(2)} / mo</div>
                  <div className="text-gray-600 text-xs">${plan.yearlyPrice.toFixed(2)} / year</div>
                </div>
              </div>

              <label className="block text-sm font-medium mb-1">Summary</label>
              <textarea
                className="w-full rounded-lg border p-2 text-sm"
                value={plan.summary}
                onChange={(e) => handleFieldChange(plan.planKey, ['summary'], e.target.value)}
                rows={3}
              />

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="w-24">Projects</span>
                  <input
                    type="number"
                    className="flex-1 rounded-lg border p-2"
                    value={plan.limits.maxProjects}
                    onChange={(e) => handleFieldChange(plan.planKey, ['limits', 'maxProjects'], Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <span className="w-24">Workspaces</span>
                  <input
                    type="number"
                    className="flex-1 rounded-lg border p-2"
                    value={plan.limits.maxWorkspaces}
                    onChange={(e) => handleFieldChange(plan.planKey, ['limits', 'maxWorkspaces'], Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <span className="w-24">Members</span>
                  <input
                    type="number"
                    onChange={(e) => handleFieldChange(plan.planKey, ['perHeadPrice'], Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-4 text-sm space-y-2">
                {(['personal', 'team', 'enterprise'] as const).map((tier) => (
                  <div key={tier} className="flex justify-between">
                    <span className="capitalize text-xs text-gray-600">{tier} fee</span>
                    <input
                      type="number"
                      className="w-28 rounded-lg border p-2 text-right"
                      value={plan.workspaceFees[tier]}
                      onChange={(e) => handleFieldChange(plan.planKey, ['workspaceFees', tier], Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-1 text-xs">
                {Object.entries(plan.features).map(([feature, enabled]) => (
                  <label key={feature} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-600">{feature.replace(/([A-Z])/g, ' $1')}</span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleFieldChange(plan.planKey, ['features', feature], e.target.checked)}
                    />
                  </label>
                ))}
              </div>

              <button
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 text-sm font-semibold"
                onClick={() => handleSave(plan)}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save plan'}
              </button>
            </div>
          ))}
        </div>

        <AdminDockNavigation />
      </div>
    </div>
  );
};

export default AdminSubscriptions;
