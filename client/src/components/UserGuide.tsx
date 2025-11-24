import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, BookOpen, Rocket, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import ContentBanner from './ContentBanner';

const UserGuide: React.FC = () => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { isDarkMode } = useTheme();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'getting-started',
      title: t('userGuide.sections.gettingStarted.title'),
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.gettingStarted.createAccount.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.gettingStarted.createAccount.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.gettingStarted.setupWorkspace.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.gettingStarted.setupWorkspace.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.gettingStarted.createProject.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.gettingStarted.createProject.description')}</p>
        </div>
      )
    },
    {
      id: 'projects',
      title: t('userGuide.sections.managingProjects.title'),
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.managingProjects.creating.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.managingProjects.creating.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.managingProjects.settings.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.managingProjects.settings.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.managingProjects.analytics.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.managingProjects.analytics.description')}</p>
        </div>
      )
    },
    {
      id: 'tasks',
      title: t('userGuide.sections.taskManagement.title'),
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.taskManagement.creating.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.taskManagement.creating.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.taskManagement.status.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.taskManagement.status.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.taskManagement.dependencies.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.taskManagement.dependencies.description')}</p>
        </div>
      )
    },
    {
      id: 'team-collaboration',
      title: t('userGuide.sections.collaboration.title'),
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.collaboration.inviting.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.collaboration.inviting.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.collaboration.roles.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.collaboration.roles.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.collaboration.communication.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.collaboration.communication.description')}</p>
        </div>
      )
    },
    {
      id: 'analytics',
      title: t('userGuide.sections.analytics.title'),
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.analytics.projectAnalytics.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.analytics.projectAnalytics.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.analytics.customReports.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.analytics.customReports.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.analytics.exportData.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.analytics.exportData.description')}</p>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: t('userGuide.sections.troubleshooting.title'),
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.troubleshooting.commonIssues.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.troubleshooting.commonIssues.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.troubleshooting.performance.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.troubleshooting.performance.description')}</p>

          <h4 className="font-semibold text-gray-900">{t('userGuide.sections.troubleshooting.contact.title')}</h4>
          <p className="text-gray-600">{t('userGuide.sections.troubleshooting.contact.description')}</p>
        </div>
      )
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'bg-gradient-to-b from-amber-50 via-white to-white'} relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-32 left-16 w-80 h-80 ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-200/20'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-32 right-16 w-80 h-80 ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-200/20'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
      </div>
      <SharedNavbar />
      <ContentBanner route="/user-guide" />

      {/* Content */}
      <div className="pt-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Back Button */}
          <Link
            to="/"
            className={`inline-flex items-center gap-2 ${isDarkMode ? 'text-yellow-600 hover:text-yellow-700' : 'text-yellow-600 hover:text-yellow-700'} mb-8 transition-colors duration-200 font-medium`}
          >
            <ArrowLeft size={18} />
            {t('userGuide.backToHome')}
          </Link>

          {/* Header */}
          <div className="text-center mb-20">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-lg ${isDarkMode ? 'bg-gray-800 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">{t('userGuide.badge')}</span>
            </div>
            <h1 className={`text-4xl md:text-6xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              {t('userGuide.title')}
            </h1>
            <p className={`text-xl md:text-2xl ${isDarkMode ? 'text-gray-700' : 'text-gray-600'} max-w-3xl mx-auto leading-relaxed`}>
              {t('userGuide.subtitle')}
            </p>
          </div>

          {/* Quick Start */}
          <div className={`${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm border-gray-700/30' : 'bg-white/70 backdrop-blur-sm border-white/40'} rounded-2xl p-10 border shadow-2xl mb-16`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('userGuide.quickStart.title')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{t('userGuide.quickStart.steps.signUp.title')}</h3>
                <p className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-sm leading-relaxed`}>{t('userGuide.quickStart.steps.signUp.description')}</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{t('userGuide.quickStart.steps.createWorkspace.title')}</h3>
                <p className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-sm leading-relaxed`}>{t('userGuide.quickStart.steps.createWorkspace.description')}</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{t('userGuide.quickStart.steps.startManaging.title')}</h3>
                <p className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-sm leading-relaxed`}>{t('userGuide.quickStart.steps.startManaging.description')}</p>
              </div>
            </div>
          </div>

          {/* Guide Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={section.id} className={`group ${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm border-gray-700/30' : 'bg-white/70 backdrop-blur-sm border-white/40'} rounded-2xl border shadow-xl hover:shadow-2xl transition-all duration-300`}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full px-8 py-6 text-left flex items-center justify-between ${isDarkMode ? 'hover:bg-gray-800/80' : 'hover:bg-white/90'} transition-colors duration-200 rounded-2xl`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{section.title}</h3>
                  </div>
                  <div className={`${expandedSection === section.id ? 'rotate-180' : ''} transition-transform duration-300`}>
                    <ChevronDown size={24} className={`${isDarkMode ? 'text-yellow-600' : 'text-yellow-600'}`} />
                  </div>
                </button>
                {expandedSection === section.id && (
                  <div className="px-8 pb-6 animate-fade-in">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Support Section */}
          <div className={`relative bg-gradient-to-r ${isDarkMode ? 'from-yellow-600 via-orange-600 to-red-600' : 'from-yellow-500 via-orange-500 to-red-500'} rounded-2xl p-12 text-center mt-16 overflow-hidden shadow-2xl`}>
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <CheckCircle2 className="text-white" size={18} />
                <span className="text-white text-sm font-semibold">{t('userGuide.support.badge')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('userGuide.support.title')}</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                {t('userGuide.support.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@sartthi.com"
                  className="group bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:scale-105 transform inline-flex items-center justify-center gap-2"
                >
                  {t('userGuide.support.contact')}
                  <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  to="/register"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-orange-600 transition-all duration-300 shadow-xl hover:scale-105 transform"
                >
                  {t('userGuide.support.getStarted')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
};

export default UserGuide;
