import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageSquare, FileText, Zap, Shield, CheckCircle } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import ContentBanner from './ContentBanner';

const AIInformationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* Navbar */}
      <div className="relative z-10">
        <SharedNavbar />
        <ContentBanner route="/ai" />
      </div>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6">
            The AI workspace that <span className="bg-gradient-to-r from-[#FFD700] to-[#E6C200] bg-clip-text text-transparent">works for you</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            One tool that does it all. Search, generate, analyze, and chat—right inside Sartthi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Sartthi free
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>

      {/* All-in-one AI Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              All‑in‑one AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your Sartthi AI can build, edit, and take action across your entire workspace.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Q&A */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="text-gray-900" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Ask questions, get answers</h3>
              <p className="text-gray-600 mb-4">
                No more waiting for replies. Just ask Sartthi AI anything about your projects, tasks, or documents.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle size={20} className="text-[#FFD700] mt-0.5 flex-shrink-0" />
                  <span>Instant answers from your workspace</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle size={20} className="text-[#FFD700] mt-0.5 flex-shrink-0" />
                  <span>Context-aware responses</span>
                </li>
              </ul>
            </div>

            {/* Writing Assistant */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-xl flex items-center justify-center mb-6">
                <FileText className="text-gray-900" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Write faster, think bigger</h3>
              <p className="text-gray-600 mb-4">
                Your doc editor, translator, and note-taker. Generate content, refine ideas, and polish your writing.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle size={20} className="text-[#FFD700] mt-0.5 flex-shrink-0" />
                  <span>Generate notes and documents</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle size={20} className="text-[#FFD700] mt-0.5 flex-shrink-0" />
                  <span>Summarize and refine content</span>
                </li>
              </ul>
            </div>

            {/* Automation */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#E6C200] rounded-xl flex items-center justify-center mb-6">
                <Zap className="text-gray-900" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Automate tasks, save time</h3>
              <p className="text-gray-600 mb-4">
                Let AI handle repetitive work. Create project plans, generate task lists, and organize your workflow.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle size={20} className="text-[#FFD700] mt-0.5 flex-shrink-0" />
                  <span>Auto-generate project milestones</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle size={20} className="text-[#FFD700] mt-0.5 flex-shrink-0" />
                  <span>Smart task suggestions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Context-Driven Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FFD700]/20 px-4 py-2 rounded-full mb-6">
                <Sparkles size={20} className="text-[#E6C200]" />
                <span className="text-sm font-semibold text-gray-900">Context-Driven</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                AI that understands your workflow
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Sartthi AI learns from your patterns to provide proactive solutions and intelligent suggestions tailored to your work.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle size={24} className="text-[#FFD700] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Learns from your patterns</h4>
                    <p className="text-gray-600">Adapts to your unique working style over time</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={24} className="text-[#FFD700] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Proactive suggestions</h4>
                    <p className="text-gray-600">Anticipates your needs before you ask</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={24} className="text-[#FFD700] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Automated workflows</h4>
                    <p className="text-gray-600">Streamlines repetitive tasks automatically</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <Sparkles size={64} className="text-[#FFD700] mx-auto mb-4" />
                  <p className="text-gray-500">AI Context Demo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl order-2 md:order-1">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <Shield size={64} className="text-[#FFD700] mx-auto mb-4" />
                  <p className="text-gray-500">Security Demo</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-[#FFD700]/20 px-4 py-2 rounded-full mb-6">
                <Shield size={20} className="text-[#E6C200]" />
                <span className="text-sm font-semibold text-gray-900">Permission-Aware</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                Handles your data with discretion
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Secure by design. Sartthi AI knows who can see what and respects your privacy settings.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle size={24} className="text-[#FFD700] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Role-based access control</h4>
                    <p className="text-gray-600">AI respects your permission settings</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={24} className="text-[#FFD700] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Data privacy guaranteed</h4>
                    <p className="text-gray-600">Your data stays private and secure</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={24} className="text-[#FFD700] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Audit logs for compliance</h4>
                    <p className="text-gray-600">Track all AI interactions and actions</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#FFD700] to-[#FFC700]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Ready to supercharge your workflow?
          </h2>
          <p className="text-xl text-gray-800 mb-8">
            Join thousands of teams using Sartthi AI to work smarter, not harder.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            Get started for free
            <ArrowRight size={24} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <SharedFooter />
      </div>
    </div>
  );
};

export default AIInformationPage;
