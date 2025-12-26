import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import ContentBanner from './ContentBanner';

const PricingPage: React.FC = () => {
  useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pricing plans matching the new requirements
  const pricingPlans = [
    {
      name: 'Free',
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
      name: 'Pro',
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
      name: 'Premium',
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
      name: 'Enterprise',
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

  const handleGetStarted = (planName: string) => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <SharedNavbar />
      <ContentBanner route="/pricing" />

      {/* Hero + Pricing Section - Combined */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div 
            className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          ></div>
          <div 
            className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Hero Content */}
          <div className={`text-center transition-all duration-1000 mb-16 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-[#006397] font-medium mb-6 animate-bounce-slow border border-blue-200 shadow-lg">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-semibold">Flexible Pricing Plans</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Pricing
            </h1>
            
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Plans that scale with you. Start today, no credit card required
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Billed monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Billed yearly
              </span>
              {isYearly && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  SAVE 10%
                </span>
              )}
            </div>
          </div>

          {/* Pricing Cards - Now inside the same section */}
          <div className="max-w-7xl mx-auto mt-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan, index) => {
              const finalPrice = typeof plan.price === 'number' && isYearly 
                ? Math.round(plan.price * 12 * 0.9) 
                : plan.price;
              
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-6 transition-all duration-300 bg-white ${
                    plan.recommended
                      ? 'border-2 border-[#006397] shadow-xl scale-[1.02]'
                      : 'border border-gray-200 shadow-md hover:shadow-lg'
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms` 
                  }}
                >
                  {/* Recommended Badge */}
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#006397] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6 pt-2">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      {plan.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="mb-2">
                      {typeof finalPrice === 'number' ? (
                        <div>
                          <span className="text-4xl font-bold text-gray-900">₹{finalPrice}</span>
                          {!isYearly && <span className="text-sm text-gray-500 ml-1">/month</span>}
                        </div>
                      ) : (
                        <span className="text-4xl font-bold text-gray-900">
                          {finalPrice}
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-4 min-h-[400px]">
                    {plan.features.map((feature: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex items-start gap-2.5">
                          {feature.included ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-xs leading-relaxed ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                            {feature.text}
                          </span>
                        </div>
                        
                        {/* Inline Integrations */}
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
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleGetStarted(plan.name)}
                    className={`w-full py-2.5 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
                      plan.buttonStyle === 'solid'
                        ? 'bg-[#006397] text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-white text-[#006397] border border-[#006397] hover:bg-blue-50'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                  
                  {/* Contact us link */}
                  {plan.contactLink && (
                    <div className="text-center mt-3">
                      <a href="/contact-us" className="text-xs text-[#006397] hover:underline">
                        or Contact us
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Feature Lists - Continuous Snake Flow */}
          <div className="text-center mb-12">
            <p className="text-sm text-gray-600 mb-8">Recognized and recommended by top industry experts</p>
            
            {/* Row 1 - Scrolling Left (Features 1-10) */}
            <div className="relative overflow-hidden mb-4 py-3">
              {/* Left fade gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-white via-white/90 via-white/50 to-transparent z-10 pointer-events-none"></div>
              {/* Right fade gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-white via-white/90 via-white/50 to-transparent z-10 pointer-events-none"></div>
              
              <div className="flex animate-marquee whitespace-nowrap gap-4">
                  <div className="feature-card"><span>Workspace Management</span></div>
                  <div className="feature-card"><span>Project Planning</span></div>
                  <div className="feature-card"><span>Task Management</span></div>
                  <div className="feature-card"><span>Team Collaboration</span></div>
                  <div className="feature-card"><span>Client Portal</span></div>
                  <div className="feature-card"><span>Time Tracking</span></div>
                  <div className="feature-card"><span>Resource Allocation</span></div>
                  <div className="feature-card"><span>Budget Management</span></div>
                  <div className="feature-card"><span>Invoice Generation</span></div>
                  <div className="feature-card"><span>Expense Tracking</span></div>
                  {/* Duplicate for seamless loop */}
                  <div className="feature-card"><span>Workspace Management</span></div>
                  <div className="feature-card"><span>Project Planning</span></div>
                  <div className="feature-card"><span>Task Management</span></div>
                  <div className="feature-card"><span>Team Collaboration</span></div>
                  <div className="feature-card"><span>Client Portal</span></div>
                  <div className="feature-card"><span>Time Tracking</span></div>
                  <div className="feature-card"><span>Resource Allocation</span></div>
                  <div className="feature-card"><span>Budget Management</span></div>
                  <div className="feature-card"><span>Invoice Generation</span></div>
                  <div className="feature-card"><span>Expense Tracking</span></div>
                  {/* Triple for ultra-smooth loop */}
                  <div className="feature-card"><span>Workspace Management</span></div>
                  <div className="feature-card"><span>Project Planning</span></div>
                  <div className="feature-card"><span>Task Management</span></div>
                  <div className="feature-card"><span>Team Collaboration</span></div>
                  <div className="feature-card"><span>Client Portal</span></div>
                  <div className="feature-card"><span>Time Tracking</span></div>
                  <div className="feature-card"><span>Resource Allocation</span></div>
                  <div className="feature-card"><span>Budget Management</span></div>
                  <div className="feature-card"><span>Invoice Generation</span></div>
                  <div className="feature-card"><span>Expense Tracking</span></div>
                </div>
              </div>

              {/* Row 2 - Scrolling Right (Features 11-20) */}
              <div className="relative overflow-hidden mb-4 py-3">
                {/* Left fade gradient */}
                <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-white via-white/90 via-white/50 to-transparent z-10 pointer-events-none"></div>
                {/* Right fade gradient */}
                <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-white via-white/90 via-white/50 to-transparent z-10 pointer-events-none"></div>
                
                <div className="flex animate-marquee-reverse whitespace-nowrap gap-4">
                  <div className="feature-card"><span>Kanban Boards</span></div>
                  <div className="feature-card"><span>Gantt Charts</span></div>
                  <div className="feature-card"><span>Calendar View</span></div>
                  <div className="feature-card"><span>Timeline View</span></div>
                  <div className="feature-card"><span>File Sharing</span></div>
                  <div className="feature-card"><span>Document Management</span></div>
                  <div className="feature-card"><span>Version Control</span></div>
                  <div className="feature-card"><span>Real-time Chat</span></div>
                  <div className="feature-card"><span>Video Conferencing</span></div>
                  <div className="feature-card"><span>Screen Sharing</span></div>
                  {/* Duplicate for seamless loop */}
                  <div className="feature-card"><span>Kanban Boards</span></div>
                  <div className="feature-card"><span>Gantt Charts</span></div>
                  <div className="feature-card"><span>Calendar View</span></div>
                  <div className="feature-card"><span>Timeline View</span></div>
                  <div className="feature-card"><span>File Sharing</span></div>
                  <div className="feature-card"><span>Document Management</span></div>
                  <div className="feature-card"><span>Version Control</span></div>
                  <div className="feature-card"><span>Real-time Chat</span></div>
                  <div className="feature-card"><span>Video Conferencing</span></div>
                  <div className="feature-card"><span>Screen Sharing</span></div>
                  {/* Triple for ultra-smooth loop */}
                  <div className="feature-card"><span>Kanban Boards</span></div>
                  <div className="feature-card"><span>Gantt Charts</span></div>
                  <div className="feature-card"><span>Calendar View</span></div>
                  <div className="feature-card"><span>Timeline View</span></div>
                  <div className="feature-card"><span>File Sharing</span></div>
                  <div className="feature-card"><span>Document Management</span></div>
                  <div className="feature-card"><span>Version Control</span></div>
                  <div className="feature-card"><span>Real-time Chat</span></div>
                  <div className="feature-card"><span>Video Conferencing</span></div>
                  <div className="feature-card"><span>Screen Sharing</span></div>
                </div>
              </div>

              {/* Row 3 - Scrolling Left (Features 21-30) */}
              <div className="relative overflow-hidden mb-4 py-3">
                {/* Left fade gradient */}
                <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-white via-white/90 via-white/50 to-transparent z-10 pointer-events-none"></div>
                {/* Right fade gradient */}
                <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-white via-white/90 via-white/50 to-transparent z-10 pointer-events-none"></div>
                
                <div className="flex animate-marquee whitespace-nowrap gap-4">
                  <div className="feature-card"><span>Custom Workflows</span></div>
                  <div className="feature-card"><span>Automation Rules</span></div>
                  <div className="feature-card"><span>AI-Powered Insights</span></div>
                  <div className="feature-card"><span>Analytics Dashboard</span></div>
                  <div className="feature-card"><span>Reporting Tools</span></div>
                  <div className="feature-card"><span>Performance Metrics</span></div>
                  <div className="feature-card"><span>Goal Tracking</span></div>
                  <div className="feature-card"><span>Milestone Management</span></div>
                  <div className="feature-card"><span>Risk Assessment</span></div>
                  <div className="feature-card"><span>Dependency Tracking</span></div>
                  {/* Duplicate for seamless loop */}
                  <div className="feature-card"><span>Custom Workflows</span></div>
                  <div className="feature-card"><span>Automation Rules</span></div>
                  <div className="feature-card"><span>AI-Powered Insights</span></div>
                  <div className="feature-card"><span>Analytics Dashboard</span></div>
                  <div className="feature-card"><span>Reporting Tools</span></div>
                  <div className="feature-card"><span>Performance Metrics</span></div>
                  <div className="feature-card"><span>Goal Tracking</span></div>
                  <div className="feature-card"><span>Milestone Management</span></div>
                  <div className="feature-card"><span>Risk Assessment</span></div>
                  <div className="feature-card"><span>Dependency Tracking</span></div>
                  {/* Triple for ultra-smooth loop */}
                  <div className="feature-card"><span>Custom Workflows</span></div>
                  <div className="feature-card"><span>Automation Rules</span></div>
                  <div className="feature-card"><span>AI-Powered Insights</span></div>
                  <div className="feature-card"><span>Analytics Dashboard</span></div>
                  <div className="feature-card"><span>Reporting Tools</span></div>
                  <div className="feature-card"><span>Performance Metrics</span></div>
                  <div className="feature-card"><span>Goal Tracking</span></div>
                  <div className="feature-card"><span>Milestone Management</span></div>
                  <div className="feature-card"><span>Risk Assessment</span></div>
                  <div className="feature-card"><span>Dependency Tracking</span></div>
                </div>
              </div>

              {/* Row 4 - Scrolling Right (Features 31-40) */}
              <div className="relative overflow-hidden py-3">
                {/* Left fade gradient */}
                <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-white via-white/90 via-white/50 to-transparent z-10 pointer-events-none"></div>
                {/* Right fade gradient */}
                <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-white via-white/90 via-white/50 to-transparent z-10 pointer-events-none"></div>
                
                <div className="flex animate-marquee-reverse whitespace-nowrap gap-4">
                  <div className="feature-card"><span>Mobile Apps</span></div>
                  <div className="feature-card"><span>Email Integration</span></div>
                  <div className="feature-card"><span>API Access</span></div>
                  <div className="feature-card"><span>Webhooks</span></div>
                  <div className="feature-card"><span>Third-party Integrations</span></div>
                  <div className="feature-card"><span>Role-based Permissions</span></div>
                  <div className="feature-card"><span>Security & Compliance</span></div>
                  <div className="feature-card"><span>Data Backup</span></div>
                  <div className="feature-card"><span>Export & Import</span></div>
                  <div className="feature-card"><span>24/7 Support</span></div>
                  {/* Duplicate for seamless loop */}
                  <div className="feature-card"><span>Mobile Apps</span></div>
                  <div className="feature-card"><span>Email Integration</span></div>
                  <div className="feature-card"><span>API Access</span></div>
                  <div className="feature-card"><span>Webhooks</span></div>
                  <div className="feature-card"><span>Third-party Integrations</span></div>
                  <div className="feature-card"><span>Role-based Permissions</span></div>
                  <div className="feature-card"><span>Security & Compliance</span></div>
                  <div className="feature-card"><span>Data Backup</span></div>
                  <div className="feature-card"><span>Export & Import</span></div>
                  <div className="feature-card"><span>24/7 Support</span></div>
                  {/* Triple for ultra-smooth loop */}
                  <div className="feature-card"><span>Mobile Apps</span></div>
                  <div className="feature-card"><span>Email Integration</span></div>
                  <div className="feature-card"><span>API Access</span></div>
                  <div className="feature-card"><span>Webhooks</span></div>
                  <div className="feature-card"><span>Third-party Integrations</span></div>
                  <div className="feature-card"><span>Role-based Permissions</span></div>
                  <div className="feature-card"><span>Security & Compliance</span></div>
                  <div className="feature-card"><span>Data Backup</span></div>
                  <div className="feature-card"><span>Export & Import</span></div>
                  <div className="feature-card"><span>24/7 Support</span></div>
                </div>
              </div>
            </div>

          {/* Trust Card */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="flex-1">
                {/* User Reviews */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                      <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
                        alt="User A"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                      <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Beth" 
                        alt="User B"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                      <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" 
                        alt="User D"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-semibold text-gray-700">100+ User Reviews</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">(4.8 out of 5)</span>
                    </div>
                  </div>
                </div>

                {/* Main Heading */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Why trust Sartthi for your project management needs?
                </h2>

                {/* Trust Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">5+ Years expertise</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">1k+ Satisfied customers</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Elite project management platform</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Regular updates provided</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">24/7 support, Guaranteed</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Proven industry leader</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col items-center md:items-end gap-4">
                <div className="text-sm text-[#006397] font-medium flex items-center gap-2">
                  Learn More
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-[#006397] text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Read Our Story
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Endless Possibilities Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Endless possibilities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage projects efficiently and collaborate seamlessly for your team.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                50<span className="text-[#006397]">+</span>
              </div>
              <p className="text-sm text-gray-600">Features</p>
            </div>
            <div className="rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                15<span className="text-[#006397]">+</span>
              </div>
              <p className="text-sm text-gray-600">Integrations</p>
            </div>
            <div className="rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                5<span className="text-[#006397]">+</span>
              </div>
              <p className="text-sm text-gray-600">Project templates</p>
            </div>
            <div className="rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                500<span className="text-[#006397]">+</span>
              </div>
              <p className="text-sm text-gray-600">Hours saved</p>
            </div>
          </div>

          {/* What's Inside */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900">
              What's inside of Sartthi platform
            </h3>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 - Project Management */}
            <div className="backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Project Management</h4>
              <p className="text-gray-600 mb-4">
                Organize and track your projects with powerful tools and intuitive interfaces that scale with your team.
              </p>
            </div>

            {/* Card 2 - Team Collaboration */}
            <div className="backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h4>
              <p className="text-gray-600 mb-4">
                Work together seamlessly with real-time updates, comments, and file sharing capabilities.
              </p>
            </div>

            {/* Card 3 - Advanced Analytics */}
            <div className="backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
              <p className="text-gray-600 mb-4">
                Get deep insights into your team's performance with customizable dashboards and detailed reports.
              </p>
            </div>

            {/* Card 4 - Time Tracking */}
            <div className="backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Time Tracking</h4>
              <p className="text-gray-600 mb-4">
                Monitor time spent on tasks and projects to improve productivity and billing accuracy.
              </p>
            </div>

            {/* Card 5 - Smart Scheduling */}
            <div className="backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Smart Scheduling</h4>
              <p className="text-gray-600 mb-4">
                Automated intelligent scheduling based on comprehensive user profiles, availability, and workload patterns.
              </p>
            </div>

            {/* Card 6 - CTA */}
            <div className="bg-gradient-to-br from-[#006397] to-blue-600 backdrop-blur-md rounded-xl p-6 flex flex-col justify-center items-center text-center border border-blue-400/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <h4 className="text-xl font-semibold text-white mb-2">Check out our pricing plan</h4>
              <p className="text-white/90 mb-4">
                Choose the plan that aligns with your team's requirements.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg backdrop-blur-sm transition-colors text-white font-semibold"
              >
                Pricing Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Large Gradient Text Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-5xl md:text-9xl lg:text-[18rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 dark:from-neutral-950 to-neutral-200 dark:to-neutral-800 inset-x-0">
            SARTTHI
          </p>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
};

export default PricingPage;
