import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Crown, Users, Shield, ArrowRight, CheckCircle2, Sparkles, Award } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import PricingModal from './PricingModal';
import api, { SubscriptionPlanData } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import ContentBanner from './ContentBanner';

const planIconMap: Record<'free' | 'pro' | 'ultra', React.ReactNode> = {
  free: <Users className="w-8 h-8 text-emerald-500" />,
  pro: <Zap className="w-8 h-8 text-accent" />,
  ultra: <Crown className="w-8 h-8 text-purple-500" />
};



const PricingPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
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

  const { state } = useApp();
  
  const handleChoosePlan = (plan: SubscriptionPlanData) => {
    const isAuthenticated = !!state.userProfile._id;
    if (!isAuthenticated) {
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
      <ContentBanner route="/pricing" />

      <main className="flex-1 pt-24 pb-16">
        <section className={`px-4 ${isDarkMode ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'bg-gradient-to-b from-amber-50 via-white to-white'}`}>
          <div className="max-w-6xl mx-auto text-center py-16">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isDarkMode ? 'bg-gray-800 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
              <Sparkles className="w-4 h-4" /> {t('pricing.badge')}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-6 tracking-tight">
              {t('pricing.title')}
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-700 max-w-3xl mx-auto">
              {t('pricing.subtitle')}
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white shadow-sm'}`}>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-base font-medium">{t('pricing.highlights.aiCollaboration')}</span>
              </div>
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white shadow-sm'}`}>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-base font-medium">{t('pricing.highlights.coupons')}</span>
              </div>
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white shadow-sm'}`}>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-base font-medium">{t('pricing.highlights.analytics')}</span>
              </div>
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white shadow-sm'}`}>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-base font-medium">{t('pricing.highlights.security')}</span>
              </div>
            </div>

            {authPrompt && (
              <div className={`mt-8 max-w-3xl mx-auto rounded-3xl border px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white shadow-lg'}`}>
                <div>
                  <p className="text-sm uppercase tracking-wider text-amber-500 font-semibold">{t('pricing.authPrompt.title')}</p>
                  <h2 className="text-xl font-bold mt-1">{t('pricing.authPrompt.message', { planName: authPrompt.planName })}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-700 mt-1">
                    {t('pricing.authPrompt.description')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleLoginRedirect('/login')}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold border border-accent text-accent-dark hover:bg-blue-50"
                  >
                    {t('pricing.authPrompt.login')}
                  </button>
                  <button
                    onClick={() => handleLoginRedirect('/register')}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold bg-accent text-gray-900 hover:bg-accent-hover"
                  >
                    {t('pricing.authPrompt.signup')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="px-4">
          <div className="max-w-6xl mx-auto">
            {loading && (
              <div className="text-center py-16 text-gray-600">{t('pricing.loading')}</div>
            )}
            {!loading && (
              <div className="grid gap-8 md:grid-cols-3">
                {sortedPlans.map((plan) => (
                  <div
                    key={plan.planKey}
                    className={`relative rounded-3xl border-2 p-8 shadow-lg transition-all ${plan.planKey === 'pro'
                      ? 'border-accent shadow-blue-100'
                      : plan.planKey === 'ultra'
                        ? 'border-purple-500 shadow-purple-100'
                        : 'border-gray-200'
                      } ${isDarkMode ? 'bg-gray-800 border-opacity-50' : 'bg-white'}`}
                  >
                    {plan.planKey === 'pro' && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-gray-900 text-xs font-semibold shadow-md">
                        {t('pricing.mostPopular')}
                      </span>
                    )}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-white shadow flex items-center justify-center mb-4">
                        {planIconMap[plan.planKey]}
                      </div>
                      <h2 className="text-2xl font-bold">{plan.displayName}</h2>
                      <p className="text-gray-600 dark:text-gray-700 mt-2">{plan.summary}</p>
                      <div className="mt-6">
                        <div className="text-4xl font-extrabold">
                          {plan.monthlyPrice === 0 ? t('pricing.free') : `$${plan.monthlyPrice}`}
                        </div>
                        <p className="text-sm text-gray-600">{t('pricing.perMonth')}</p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2 border-gray-300 dark:border-gray-600">
                        <span className="text-gray-600">{t('pricing.limits.workspaces')}</span>
                        <span className="font-semibold">{plan.limits.maxWorkspaces === -1 ? t('pricing.limits.unlimited') : plan.limits.maxWorkspaces}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2 border-gray-300 dark:border-gray-600">
                        <span className="text-gray-600">{t('pricing.limits.projects')}</span>
                        <span className="font-semibold">{plan.limits.maxProjects === -1 ? t('pricing.limits.unlimited') : plan.limits.maxProjects}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2 border-gray-300 dark:border-gray-600">
                        <span className="text-gray-600">{t('pricing.limits.teamMembers')}</span>
                        <span className="font-semibold">{plan.limits.maxTeamMembers === -1 ? t('pricing.limits.unlimited') : plan.limits.maxTeamMembers}</span>
                      </div>

                    </div>

                    <button
                      onClick={() => handleChoosePlan(plan)}
                      className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold transition-all ${plan.planKey === 'pro'
                        ? 'bg-accent text-gray-900 hover:bg-accent-hover'
                        : plan.planKey === 'ultra'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-300'
                        } ${isDarkMode && plan.planKey === 'free' ? 'bg-gray-700 text-white hover:bg-gray-600' : ''}`}
                    >
                      {plan.planKey === 'free'
                        ? t('pricing.buttons.getStartedFree')
                        : plan.planKey === 'pro'
                          ? t('pricing.buttons.choosePro')
                          : t('pricing.buttons.chooseUltra')}
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
            <div className={`rounded-3xl p-8 border ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-300 bg-white shadow-lg'}`}>
              <div className="flex items-center gap-3">
                <Shield className="w-10 h-10 text-emerald-500" />
                <div>
                  <h3 className="text-xl font-semibold">{t('pricing.features.security.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-700 text-sm">{t('pricing.features.security.description')}</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t('pricing.features.security.items.planLimits')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t('pricing.features.security.items.otpGated')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t('pricing.features.security.items.customBilling')}</li>
              </ul>
            </div>
            <div className={`rounded-3xl p-8 border ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-300 bg-white shadow-lg'}`}>
              <div className="flex items-center gap-3">
                <Award className="w-10 h-10 text-amber-500" />
                <div>
                  <h3 className="text-xl font-semibold">{t('pricing.features.affiliate.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-700 text-sm">{t('pricing.features.affiliate.description')}</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t('pricing.features.affiliate.items.couponCatalog')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t('pricing.features.affiliate.items.affiliateCodes')}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t('pricing.features.affiliate.items.instantValidation')}</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <SharedFooter />

      {
        modalOpen && (
          <PricingModal
            isOpen={modalOpen}
            presetPlanKey={presetPlan ?? undefined}
            onClose={() => setModalOpen(false)}
          />
        )
      }
    </div >
  );
};

export default PricingPage;
