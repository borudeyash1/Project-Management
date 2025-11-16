import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Crown, Users, Shield, ArrowRight, CheckCircle2, Sparkles, Award } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import PricingModal from './PricingModal';
import api, { SubscriptionPlanData } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const planIconMap: Record<'free' | 'pro' | 'ultra', React.ReactNode> = {
  free: <Users className="w-8 h-8 text-emerald-500" />,
  pro: <Zap className="w-8 h-8 text-blue-500" />,
  ultra: <Crown className="w-8 h-8 text-purple-500" />
};

const highlightBullets = [
  'Unlimited collaboration with AI copilots',
  'Admin-defined coupons & affiliate earnings',
  'Advanced analytics, payroll, and automation',
  'Enterprise-grade security & compliance'
];

const PricingPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [presetPlan, setPresetPlan] = useState<'free' | 'pro' | 'ultra' | null>(null);
  const [authPrompt, setAuthPrompt] = useState<{ planKey: 'free' | 'pro' | 'ultra'; planName: string } | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await api.getSubscriptionPlans();
        setPlans(data);
      } catch (error) {
        console.error('Failed to fetch subscription plans', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.order - b.order);
  }, [plans]);

  const handleChoosePlan = (plan: SubscriptionPlanData) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAuthPrompt({ planKey: plan.planKey, planName: plan.displayName });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setAuthPrompt(null);
    setPresetPlan(plan.planKey);
    setModalOpen(true);
  };

  const handleLoginRedirect = (route: '/login' | '/register') => {
    navigate(route);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <SharedNavbar />

      <main className="flex-1 pt-24 pb-16">
        <section className={`px-4 ${isDarkMode ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'bg-gradient-to-b from-amber-50 via-white to-white'}`}>
          <div className="max-w-6xl mx-auto text-center py-16">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isDarkMode ? 'bg-gray-800 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
              <Sparkles className="w-4 h-4" /> Flexible pricing for every workspace
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-6 tracking-tight">
              Unlock Sartthi&apos;s full Project & Payroll suite
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose a plan configured by your admins. Apply coupons or affiliate links at checkout, and upgrade instantly without a payment gateway.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              {highlightBullets.map((bullet) => (
                <div key={bullet} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white shadow-sm'}`}>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-base font-medium">{bullet}</span>
                </div>
              ))}
            </div>

            {authPrompt && (
              <div className={`mt-8 max-w-3xl mx-auto rounded-3xl border px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white shadow-lg'}`}>
                <div>
                  <p className="text-sm uppercase tracking-wider text-amber-500 font-semibold">Authentication required</p>
                  <h2 className="text-xl font-bold mt-1">Login or create an account to select the {authPrompt.planName} plan.</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    Already have an account? Continue to login. New to Sartthi? Sign up first, then complete the upgrade.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleLoginRedirect('/login')}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold border border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleLoginRedirect('/register')}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="px-4">
          <div className="max-w-6xl mx-auto">
            {loading && (
              <div className="text-center py-16 text-gray-500">Loading plans...</div>
            )}
            {!loading && (
              <div className="grid gap-8 md:grid-cols-3">
                {sortedPlans.map((plan) => (
                  <div
                    key={plan.planKey}
                    className={`relative rounded-3xl border-2 p-8 shadow-lg transition-all ${
                      plan.planKey === 'pro'
                        ? 'border-blue-500 shadow-blue-100'
                        : plan.planKey === 'ultra'
                        ? 'border-purple-500 shadow-purple-100'
                        : 'border-gray-200'
                    } ${isDarkMode ? 'bg-gray-800 border-opacity-50' : 'bg-white'}`}
                  >
                    {plan.planKey === 'pro' && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-md">
                        Most popular
                      </span>
                    )}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-white shadow flex items-center justify-center mb-4">
                        {planIconMap[plan.planKey]}
                      </div>
                      <h2 className="text-2xl font-bold">{plan.displayName}</h2>
                      <p className="text-gray-500 dark:text-gray-300 mt-2">{plan.summary}</p>
                      <div className="mt-6">
                        <div className="text-4xl font-extrabold">
                          {plan.monthlyPrice === 0 ? 'Free' : `$${plan.monthlyPrice}`}
                        </div>
                        <p className="text-sm text-gray-500">per month</p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2 border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500">Workspaces</span>
                        <span className="font-semibold">{plan.limits.maxWorkspaces === -1 ? 'Unlimited' : plan.limits.maxWorkspaces}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2 border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500">Projects</span>
                        <span className="font-semibold">{plan.limits.maxProjects === -1 ? 'Unlimited' : plan.limits.maxProjects}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2 border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500">Team members</span>
                        <span className="font-semibold">{plan.limits.maxTeamMembers === -1 ? 'Unlimited' : plan.limits.maxTeamMembers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Storage</span>
                        <span className="font-semibold">{plan.limits.storageInGB} GB</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleChoosePlan(plan)}
                      className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold transition-all ${
                        plan.planKey === 'pro'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : plan.planKey === 'ultra'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      } ${isDarkMode && plan.planKey === 'free' ? 'bg-gray-700 text-white hover:bg-gray-600' : ''}`}
                    >
                      {plan.planKey === 'free'
                        ? 'Get Started Free'
                        : plan.planKey === 'pro'
                        ? 'Choose Pro User'
                        : 'Choose Ultra'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="px-4 mt-20">
          <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-2">
            <div className={`rounded-3xl p-8 border ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-white shadow-lg'}`}>
              <div className="flex items-center gap-3">
                <Shield className="w-10 h-10 text-emerald-500" />
                <div>
                  <h3 className="text-xl font-semibold">Security-first architecture</h3>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">Role-based access, audit logs, SSO-ready.</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Admin-configurable plan limits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> OTP-gated workspace creation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Custom billing bypass with approvals</li>
              </ul>
            </div>
            <div className={`rounded-3xl p-8 border ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-white shadow-lg'}`}>
              <div className="flex items-center gap-3">
                <Award className="w-10 h-10 text-amber-500" />
                <div>
                  <h3 className="text-xl font-semibold">Affiliate & coupon engine</h3>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">Reward evangelists, delight teams with instant savings.</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Admin-managed coupon catalog</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Affiliate codes with commission tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Instant validation during checkout</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <SharedFooter />

      {modalOpen && (
        <PricingModal
          isOpen={modalOpen}
          presetPlanKey={presetPlan ?? undefined}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PricingPage;
