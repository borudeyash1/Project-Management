import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, BarChart3, Shield, Brain, Zap, ClipboardCheck, Activity, Briefcase, MapPin, DollarSign, Eye, Sparkles, Play } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import ContentBanner from './ContentBanner';
import Orb from './animations/Orb';
import GradualBlur from './animations/GradualBlur';
import StarBorder from './animations/StarBorder';
import SpotlightCard from './animations/SpotlightCard';
import CardSwap, { Card } from './animations/CardSwap';
import ScrollStack, { ScrollStackItem } from './animations/ScrollStack';
import CenterCarousel from './animations/CenterCarousel';
import { ExpandingCardsDemo } from './animations/ExpandingCardsDemo';
import { TasksTabsDemo } from './animations/TasksTabsDemo';
import { ProjectsMarquee } from './animations/ProjectsMarquee';
import { AuroraBackground } from './ui/aurora-background';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  useTheme();

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* Main Content Wrapper */}
      <div className="relative z-10">
        <SharedNavbar />
        <ContentBanner route="/" />

      {/* HERO SECTION with Aurora Background */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Aurora Background Animation - Only for Hero Section */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <AuroraBackground showRadialGradient={false}>
            <div></div>
          </AuroraBackground>
        </div>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative">
            
            {/* Main Headline with Gradual Blur */}
            <div className="relative z-10 mb-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-tight">
                
                <span className="block text-[#44a0d1]">
                  All in One Office Suite
                </span>
                <span className="block text-[#44a0d1]">
                  for Modern Work
                </span>
              </h1>
            </div>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-6 max-w-4xl mx-auto leading-relaxed font-medium">
              Streamline operations, synchronize teams, and automate the mundane.
            </p>
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              The all-in-one suite designed to move your business forward.
            </p>

            {/* CTA Buttons with Star Border */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <StarBorder color="#FFD700">
                <Link
                  to="/register"
                  className="group bg-[#44a0d1] hover:bg-[#3688b5] text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transform"
                >
                  {t('landing.hero.getStarted')}
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </StarBorder>
              
              <Link
                to="/user-guide"
                className="group bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 transform shadow-xl flex items-center gap-3 border-2 border-[#E6C200]"
              >
                <Play size={20} className="group-hover:scale-110 transition-transform" />
                {t('landing.hero.learnMore')}
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                <span className="font-medium">14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Hero Dashboard Image */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFD700] transform hover:scale-[1.02] transition-transform duration-500">
              <img 
                src="/hero_dashboard_mockup_1764317223182.png"
                alt="Sartthi Dashboard Interface"
                className="w-full h-auto"
                onError={(e) => {
                  // Fallback to gradient if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="aspect-video bg-gradient-to-br from-blue-100 via-white to-cyan-100 flex items-center justify-center">
                      <div class="text-center">
                        <div class="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl">
                          <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <p class="text-2xl font-bold text-gray-700">Sartthi Dashboard</p>
                        <p class="text-gray-500 mt-2">Your Command Center</p>
                      </div>
                    </div>
                  `;
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ONE SUITE. INFINITE CAPABILITIES */}
      <div className="py-32 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-200 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              One Suite. <span className="bg-gradient-to-r from-[#44a0d1] to-[#3380a1] bg-clip-text text-transparent">Infinite Capabilities.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage, collaborate, and succeed—all in one powerful platform.
            </p>
          </div>

          {/* Core Features Grid with SpotlightCards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: Task Management */}
            <SpotlightCard 
              backgroundColor="#44a0d1"
              spotlightColor="rgba(255, 215, 0, 0.3)"
              className="p-8 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <ClipboardCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">{t('landing.coreEngine.taskManagement.title')}</h3>
                <p className="text-white/90 text-lg leading-relaxed mb-6">
                  {t('landing.coreEngine.taskManagement.description')}
                </p>
              </div>
              
              {/* Feature Image */}
              <div className="rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <img 
                  src="/task_management_ui_1764317282097.png"
                  alt="Task Management Interface"
                  className="w-full h-auto"
                />
              </div>
            </SpotlightCard>

            {/* Card 2: Real-Time Collaboration */}
            <SpotlightCard 
              backgroundColor="#44a0d1"
              spotlightColor="rgba(255, 215, 0, 0.3)"
              className="p-8 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">{t('landing.coreEngine.collaboration.title')}</h3>
                <p className="text-white/90 text-lg leading-relaxed mb-6">
                  {t('landing.coreEngine.collaboration.description')}
                </p>
              </div>
              
              {/* Feature Image */}
              <div className="rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <img 
                  src="/collaboration_ui_1764317298899.png"
                  alt="Collaboration Interface"
                  className="w-full h-auto"
                />
              </div>
            </SpotlightCard>

            {/* Card 3: Intelligence & Analytics */}
            <SpotlightCard 
              backgroundColor="#44a0d1"
              spotlightColor="rgba(255, 215, 0, 0.3)"
              className="p-8 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">{t('landing.coreEngine.analytics.title')}</h3>
                <p className="text-white/90 text-lg leading-relaxed mb-6">
                  {t('landing.coreEngine.analytics.description')}
                </p>
              </div>
              
              {/* Feature Image */}
              <div className="rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <img 
                  src="/analytics_ui_1764317315064.png"
                  alt="Analytics Dashboard"
                  className="w-full h-auto"
                />
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>

      {/* FEATURE DEEP DIVE: Full-Width Sections with ScrollStack */}
      <div className="py-20 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Explore <span className="bg-gradient-to-r from-[#44a0d1] to-[#3380a1] bg-clip-text text-transparent">Every Feature.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools for every aspect of your work. Scroll to explore.
            </p>
          </div>
        </div>

        {/* PROJECTS - Marquee Animation */}
        <div className="w-full bg-white py-20 mb-20">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="flex items-center gap-6 justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#44a0d1] to-[#3380a1] rounded-3xl flex items-center justify-center shadow-2xl">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-black text-gray-900">Projects</h3>
                <p className="text-xl text-gray-700">Organize & Execute with Ease</p>
              </div>
            </div>
          </div>
          
          {/* Projects Marquee */}
          <ProjectsMarquee />
        </div>


        {/* TASKS - TabsSwitcher */}
        <div className="w-full bg-white py-20 mb-20">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#44a0d1] to-[#3380a1] rounded-3xl flex items-center justify-center shadow-2xl">
                <ClipboardCheck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-4xl font-black text-gray-900">Tasks</h3>
                <p className="text-xl text-gray-600">Get Things Done</p>
              </div>
            </div>
            
            {/* TabsSwitcher Component */}
            <div className="w-full">
              <TasksTabsDemo />
            </div>
          </div>
        </div>

        {/* TRACKER - Grid with Fade-in */}
        <div className="w-full bg-white py-20 mb-20">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-3xl flex items-center justify-center shadow-2xl">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-4xl font-black text-gray-900">Tracker</h3>
                <p className="text-xl text-gray-600">Time & Performance</p>
              </div>
            </div>
            
            {/* Grid layout with stagger */}
            <div className="w-full overflow-hidden">
              <div className="max-w-6xl mx-auto">
                <ExpandingCardsDemo />
              </div>
            </div>
          </div>
        </div>

        {/* GOALS - Diagonal Layout */}
        <div className="w-full bg-gradient-to-b from-blue-50/30 to-white py-20 mb-20">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#44a0d1] to-[#3380a1] rounded-3xl flex items-center justify-center shadow-2xl">
                <Eye className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-4xl font-black text-gray-900">Goals</h3>
                <p className="text-xl text-gray-600">Track Progress & Achieve More</p>
              </div>
            </div>
            
            {/* Diagonal grid */}
            <div className="w-full">
              <CenterCarousel autoplay={true}>
                {[
                  { title: 'Goal Overview', url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop' },
                  { title: 'Progress Tracking', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop' },
                  { title: 'Milestones', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop' },
                  { title: 'Team Goals', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop' },
                  { title: 'Analytics', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop' }
                ].map((view, index) => (
                  <div key={index} className="transform transition-all duration-500 hover:-translate-y-2 hover:rotate-1 h-full p-4">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#44a0d1]/30 hover:border-[#FFD700] h-full">
                      <img src={view.url} alt={view.title} className="w-full h-48 object-cover" />
                      <div className="p-6">
                        <h4 className="text-xl font-bold text-gray-900">{view.title}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </CenterCarousel>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-lg mb-6">And there's more: Reports, Team Management, Reminders, Workspace Settings, Planner, and beyond.</p>
          <Link to="/register" className="inline-flex items-center gap-3 bg-gradient-to-r from-[#44a0d1] to-[#3380a1] hover:from-[#3688b5] hover:to-[#2b6d8a] text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:scale-105">
            Explore All Features
            <ArrowRight size={24} />
          </Link>
        </div>
      </div>

      {/* SECTION 3: BUILT FOR EVERY TEAM */}
      <div className="py-32 bg-gradient-to-b from-blue-50/30 via-white to-blue-50/30 relative overflow-hidden">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Built for <span className="bg-gradient-to-r from-[#44a0d1] to-[#3380a1] bg-clip-text text-transparent">Every Team.</span>
            </h2>
            <p className="text-2xl font-semibold text-gray-700 mb-4">
              Optimized for Every Workflow.
            </p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From HR to field operations, Sartthi adapts to your team's unique needs.
            </p>
          </div>

          {/* Use Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                key: 'hr', 
                icon: Users, 
                gradient: 'from-[#44a0d1] to-[#3380a1]',
                bgGradient: 'from-blue-50 to-blue-100',
                iconBg: 'bg-[#44a0d1]'
              },
              { 
                key: 'operations', 
                icon: Activity, 
                gradient: 'from-[#FFD700] to-[#E6C200]',
                bgGradient: 'from-yellow-50 to-yellow-100',
                iconBg: 'bg-[#FFD700]'
              },
              { 
                key: 'managers', 
                icon: Briefcase, 
                gradient: 'from-[#44a0d1] to-[#3380a1]',
                bgGradient: 'from-cyan-50 to-cyan-100',
                iconBg: 'bg-[#44a0d1]'
              },
              { 
                key: 'fieldTeams', 
                icon: MapPin, 
                gradient: 'from-[#FFD700] to-[#E6C200]',
                bgGradient: 'from-orange-50 to-orange-100',
                iconBg: 'bg-[#FFD700]'
              },
              { 
                key: 'finance', 
                icon: DollarSign, 
                gradient: 'from-[#44a0d1] to-[#3380a1]',
                bgGradient: 'from-blue-50 to-blue-100',
                iconBg: 'bg-[#44a0d1]'
              },
              { 
                key: 'founders', 
                icon: Eye, 
                gradient: 'from-[#FFD700] to-[#E6C200]',
                bgGradient: 'from-yellow-50 to-yellow-100',
                iconBg: 'bg-[#FFD700]'
              }
            ].map((item, index) => (
              <div 
                key={item.key} 
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-gray-100 hover:border-[#FFD700] overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 ${item.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-black transition-colors duration-300">
                    {t(`landing.useCases.${item.key}.title`)}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-lg leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                    {t(`landing.useCases.${item.key}.description`)}
                  </p>

                  {/* Decorative element */}
                  <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${item.gradient} rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#44a0d1] to-[#3380a1] hover:from-[#3688b5] hover:to-[#2b6d8a] text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Start Your Free Trial
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 4: AI THAT ACTS */}
      <div className="py-32 bg-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-[#FFD700] mb-8">
              <Sparkles className="w-6 h-6 text-[#44a0d1]" />
              <span className="text-lg font-bold text-blue-900">Sartthi AI</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              AI That <span className="bg-gradient-to-r from-[#44a0d1] to-[#3380a1] bg-clip-text text-transparent">Acts.</span>
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
              Not Just Thinks.
            </h3>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {t('landing.ai.subtitle')}
            </p>
          </div>

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Permission Aware Card */}
            <div className="group relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-[#44a0d1]/30 hover:border-[#FFD700] overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('landing.ai.permission.title')}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('landing.ai.permission.description')}
                </p>

                {/* Feature list */}
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Role-based access control</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Data privacy guaranteed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Audit logs for compliance</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Context Driven Card */}
            <div className="group relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-[#44a0d1]/30 hover:border-[#FFD700] overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-[#44a0d1] to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('landing.ai.context.title')}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('landing.ai.context.description')}
                </p>

                {/* Feature list */}
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Learns from your patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Proactive suggestions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Automated workflows</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* AI CTA */}
          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#44a0d1] to-[#3380a1] hover:from-[#3688b5] hover:to-[#2b6d8a] text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transform"
            >
              <Sparkles size={28} />
              Experience AI-Powered Work
              <ArrowRight size={28} />
            </Link>
          </div>
        </div>
      </div>

      {/* FINAL CTA SECTION */}
      <div className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/30 to-white">
        <div className="max-w-[1920px] mx-auto relative">
          <div className="relative bg-gradient-to-r from-[#44a0d1] to-[#3380a1] rounded-3xl overflow-hidden py-20 px-8 md:px-16 text-center shadow-2xl border-4 border-[#FFD700]">
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Floating elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-2xl shadow-xl animate-float opacity-80"></div>
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-white rounded-2xl shadow-xl animate-float animation-delay-500 opacity-80"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl md:text-2xl text-white/95 mb-4 max-w-3xl mx-auto font-semibold">
                Join thousands of teams already using Sartthi
              </p>
              <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                to manage their projects efficiently.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
                <Link
                  to="/register"
                  className="group bg-white text-[#44a0d1] px-12 py-5 rounded-2xl text-xl font-black hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center gap-3 shadow-2xl hover:scale-105 transform border-4 border-[#FFD700]"
                >
                  Start Your Free Trial
                  <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="border-4 border-white text-white px-12 py-5 rounded-2xl text-xl font-black hover:bg-white hover:text-[#44a0d1] transition-all duration-300 inline-flex items-center justify-center gap-3 shadow-xl hover:scale-105 transform"
                >
                  Learn More About Us
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#FFD700]" />
                  <span className="font-semibold">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#FFD700]" />
                  <span className="font-semibold">14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#FFD700]" />
                  <span className="font-semibold">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className="relative z-10">
        <SharedFooter />
      </div>
    </div>
  );
};

export default LandingPage;
