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

      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative">
            
            {/* Main Headline - More Impactful */}
            <div className="relative z-10 mb-10">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-tight tracking-tight">
                <span className="block mb-2">
                  Your work,
                </span>
                <span className="block bg-gradient-to-r from-[#FFD700] to-[#E6C200] bg-clip-text text-transparent">
                  supercharged
                </span>
              </h1>
            </div>
            
            {/* Subheadline - More Concise */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Streamline operations, synchronize teams, and automate the mundane.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link
                to="/register"
                className="group bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center gap-3"
              >
                Get Started Free
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/user-guide"
                className="group bg-white hover:bg-gray-50 text-gray-900 px-10 py-5 rounded-2xl text-lg font-bold border-2 border-gray-900 hover:border-[#FFD700] transition-all duration-300 hover:scale-105 transform shadow-md flex items-center gap-3"
              >
                <Play size={20} className="group-hover:scale-110 transition-transform" />
                Learn More
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

          {/* Hero Dashboard Image - Smaller and Better Proportioned */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-[#FFD700] transform hover:scale-[1.02] transition-transform duration-500">
              {/* This will be replaced with an animated GIF/video */}
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100">
                <img 
                  src="/hero_dashboard_mockup_1764317223182.png"
                  alt="Sartthi Dashboard Interface"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="aspect-video bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex items-center justify-center">
                        <div class="text-center">
                          <div class="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-3xl flex items-center justify-center shadow-2xl">
                            <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <p class="text-2xl font-bold text-gray-900">Sartthi Dashboard</p>
                          <p class="text-gray-600 mt-2">Your Command Center</p>
                        </div>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SARTTHI AI - AI THAT ACTS */}
      <div className="py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-[#FFD700]/10 rounded-full mb-6">
              <span className="text-[#FFD700] font-bold text-sm uppercase tracking-wide">Sartthi AI</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6">
              AI That Acts.
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-600 mb-8">
              Not Just Thinks.
            </h3>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Most AI gives you ideas. Sartthi AI does the work—creating schedules, drafting reports, and automating operations while you sleep.
            </p>
          </div>

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Permission Aware */}
            <div className="bg-white rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Permission Aware</h3>
              <p className="text-xl text-gray-600 mb-8">
                Secure by design. It knows who can see what.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">Role-based access control</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">Data privacy guaranteed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">Audit logs for compliance</span>
                </li>
              </ul>
            </div>

            {/* Context Driven */}
            <div className="bg-white rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Context Driven</h3>
              <p className="text-xl text-gray-600 mb-8">
                It learns your workflow to provide proactive solutions.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">Learns from your patterns</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">Proactive suggestions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">Automated workflows</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/ai"
              className="inline-flex items-center gap-3 bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Experience AI-Powered Work
              <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: ONE SUITE. INFINITE CAPABILITIES */}
      <div className="py-32 bg-white relative overflow-hidden">
        {/* Clean background - no decorations */}

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

          {/* Core Features Grid - Clean Design */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: Task Management */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <ClipboardCheck className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Task Management</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Create, assign, and track tasks with ease. Set priorities, deadlines, and dependencies.
                </p>
              </div>
              
              {/* Video Placeholder */}
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center border-2 border-yellow-200">
                <div className="text-center p-6">
                  <ClipboardCheck className="mx-auto mb-3 text-yellow-600" size={48} />
                  <p className="text-sm font-semibold text-gray-700">Task Management Demo</p>
                  <p className="text-xs text-gray-500 mt-1">Video placeholder</p>
                </div>
              </div>
            </div>

            {/* Card 2: Real-Time Collaboration */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Real-Time Collaboration</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Work together seamlessly with live updates, comments, and instant notifications.
                </p>
              </div>
              
              {/* Video Placeholder */}
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-2 border-blue-200">
                <div className="text-center p-6">
                  <Users className="mx-auto mb-3 text-blue-600" size={48} />
                  <p className="text-sm font-semibold text-gray-700">Collaboration Demo</p>
                  <p className="text-xs text-gray-500 mt-1">Video placeholder</p>
                </div>
              </div>
            </div>

            {/* Card 3: Intelligence & Analytics */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Intelligence & Analytics</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Gain insights with powerful analytics and AI-driven recommendations.
                </p>
              </div>
              
              {/* Video Placeholder */}
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center border-2 border-purple-200">
                <div className="text-center p-6">
                  <BarChart3 className="mx-auto mb-3 text-purple-600" size={48} />
                  <p className="text-sm font-semibold text-gray-700">Analytics Demo</p>
                  <p className="text-xs text-gray-500 mt-1">Video placeholder</p>
                </div>
              </div>
            </div>
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


        {/* TASKS - TabsSwitcher */}
        <div className="w-full bg-white py-20 mb-20">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-4 justify-center text-center mb-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-3xl flex items-center justify-center shadow-2xl">
                <ClipboardCheck className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-5xl md:text-6xl font-black text-gray-900 mb-2">Tasks</h3>
                <p className="text-2xl text-gray-600">Get Things Done</p>
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
            <div className="flex flex-col items-center gap-4 justify-center text-center mb-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-3xl flex items-center justify-center shadow-2xl">
                <Activity className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-5xl md:text-6xl font-black text-gray-900 mb-2">Tracker</h3>
                <p className="text-2xl text-gray-600">Monitor Time & Productivity</p>
              </div>
            </div>
            
            {/* Grid layout with stagger */}
            <div className="w-full overflow-hidden">
              <ExpandingCardsDemo />
            </div>
          </div>
        </div>

        {/* GOALS - Diagonal Layout */}
        <div className="w-full bg-gradient-to-b from-yellow-50/30 to-white py-20 mb-20">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-4 justify-center text-center mb-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-3xl flex items-center justify-center shadow-2xl">
                <Eye className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-5xl md:text-6xl font-black text-gray-900 mb-2">Goals</h3>
                <p className="text-2xl text-gray-600">Set & Achieve Your Objectives</p>
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
                gradient: 'from-[#FFD700] to-[#E6C200]',
                bgGradient: 'from-yellow-50 to-white',
                iconBg: 'bg-gradient-to-br from-[#FFD700] to-[#E6C200]'
              },
              { 
                key: 'operations', 
                icon: Activity, 
                gradient: 'from-[#FFD700] to-[#E6C200]',
                bgGradient: 'from-yellow-50 to-white',
                iconBg: 'bg-gradient-to-br from-[#FFD700] to-[#E6C200]'
              },
              { 
                key: 'managers', 
                icon: Briefcase, 
                gradient: 'from-[#FFD700] to-[#E6C200]',
                bgGradient: 'from-yellow-50 to-white',
                iconBg: 'bg-gradient-to-br from-[#FFD700] to-[#E6C200]'
              },
              { 
                key: 'fieldTeams', 
                icon: MapPin, 
                gradient: 'from-[#FFD700] to-[#E6C200]',
                bgGradient: 'from-yellow-50 to-white',
                iconBg: 'bg-gradient-to-br from-[#FFD700] to-[#E6C200]'
              },
              { 
                key: 'finance', 
                icon: DollarSign, 
                gradient: 'from-[#FFD700] to-[#E6C200]',
                bgGradient: 'from-yellow-50 to-white',
                iconBg: 'bg-gradient-to-br from-[#FFD700] to-[#E6C200]'
              },
              { 
                key: 'founders', 
                icon: Eye, 
                gradient: 'from-[#FFD700] to-[#E6C200]',
                bgGradient: 'from-yellow-50 to-white',
                iconBg: 'bg-gradient-to-br from-[#FFD700] to-[#E6C200]'
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

      {/* SARTTHI AI TEASER */}
      <div className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FFD700]/20 px-6 py-3 rounded-full mb-8">
            <Sparkles size={24} className="text-[#E6C200]" />
            <span className="text-lg font-bold text-gray-900">Introducing Sartthi AI</span>
          </div>

          {/* Headline */}
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
            AI That <span className="bg-gradient-to-r from-[#FFD700] to-[#E6C200] bg-clip-text text-transparent">Acts.</span>
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-gray-600 mb-8">
            Not Just Thinks.
          </h3>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Most AI gives you ideas. Sartthi AI does the work—creating schedules, drafting reports, and automating operations while you sleep.
          </p>

          {/* Key Features - Simple List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Permission Aware</h4>
                <p className="text-gray-600">Secure by design. It knows who can see what.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Context Driven</h4>
                <p className="text-gray-600">Learns your workflow to provide proactive solutions.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/ai"
            className="inline-flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Explore Sartthi AI
            <ArrowRight size={24} />
          </Link>
        </div>
      </div>

      {/* SARTTHI APPS SHOWCASE - At Bottom */}
      <div className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              One platform. <span className="bg-gradient-to-r from-[#FFD700] to-[#E6C200] bg-clip-text text-transparent">Four powerful apps.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to run your business, all in one place.
            </p>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sartthi Mail */}
            <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#FFD700]/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">📧</div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Sartthi Mail</h3>
                  <p className="text-gray-600">Professional email with AI-powered features</p>
                </div>
              </div>
              
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📧</div>
                    <p className="text-sm">Mail Demo Video</p>
                  </div>
                </div>
              </div>
              
              <Link to="/mail" className="mt-6 inline-flex items-center text-[#FFD700] hover:text-[#E6C200] font-semibold transition-colors">
                Learn more →
              </Link>
            </div>

            {/* Calendar */}
            <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#FFD700]/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">📅</div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Calendar</h3>
                  <p className="text-gray-600">Smart scheduling and time management</p>
                </div>
              </div>
              
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-sm">Calendar Demo Video</p>
                  </div>
                </div>
              </div>
              
              <Link to="/calendar" className="mt-6 inline-flex items-center text-[#FFD700] hover:text-[#E6C200] font-semibold transition-colors">
                Learn more →
              </Link>
            </div>

            {/* Vault */}
            <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#FFD700]/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">🔒</div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Vault</h3>
                  <p className="text-gray-600">Secure document storage and sharing</p>
                </div>
              </div>
              
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-sm">Vault Demo Video</p>
                  </div>
                </div>
              </div>
              
              <Link to="/vault" className="mt-6 inline-flex items-center text-[#FFD700] hover:text-[#E6C200] font-semibold transition-colors">
                Learn more →
              </Link>
            </div>

            {/* Desktop */}
            <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#FFD700]/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">💻</div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Desktop App</h3>
                  <p className="text-gray-600">Native performance, offline access</p>
                </div>
              </div>
              
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💻</div>
                    <p className="text-sm">Desktop Demo Video</p>
                  </div>
                </div>
              </div>
              
              <Link to="/desktop" className="mt-6 inline-flex items-center text-[#FFD700] hover:text-[#E6C200] font-semibold transition-colors">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL CALL TO ACTION */}
      <div className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/30 to-white">
        <div className="max-w-[1920px] mx-auto relative">
          <div className="relative bg-gradient-to-r from-[#FFD700] to-[#FFC700] rounded-3xl overflow-hidden py-20 px-8 md:px-16 text-center shadow-2xl border-4 border-[#E6C200]">
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Floating elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-2xl shadow-xl animate-float opacity-80"></div>
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-white rounded-2xl shadow-xl animate-float animation-delay-500 opacity-80"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl md:text-2xl text-gray-800 mb-4 max-w-3xl mx-auto font-semibold">
                Join thousands of teams already using Sartthi
              </p>
              <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
                to manage their projects efficiently.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
                <Link
                  to="/register"
                  className="group bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 px-12 py-5 rounded-2xl text-xl font-black transition-all duration-300 inline-flex items-center justify-center gap-3 shadow-2xl hover:scale-105 transform"
                >
                  Start Your Free Trial
                  <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="bg-white text-gray-900 border-2 border-gray-900 px-12 py-5 rounded-2xl text-xl font-black hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center gap-3 shadow-xl hover:scale-105 transform"
                >
                  Learn More About Us
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-gray-800 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-gray-900" />
                  <span className="font-semibold">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-gray-900" />
                  <span className="font-semibold">14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-gray-900" />
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
