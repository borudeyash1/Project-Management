import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';

const LandingPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900' : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50'}`}>
      <SharedNavbar />

      {/* Hero Section */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className={`text-4xl md:text-6xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              Project Management
              <span className={`block bg-gradient-to-r ${isDarkMode ? 'from-yellow-400 to-orange-500' : 'from-yellow-600 to-orange-600'} bg-clip-text text-transparent`}>
                Made Simple
              </span>
            </h1>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 max-w-3xl mx-auto`}>
              Streamline your projects, collaborate with your team, and achieve your goals with our intuitive project management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className={`bg-gradient-to-r ${isDarkMode ? 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'} text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg`}
              >
                Get Started
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/user-guide"
                className={`border-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:border-yellow-400 hover:text-yellow-400' : 'border-gray-300 text-gray-700 hover:border-yellow-600 hover:text-yellow-600'} px-8 py-3 rounded-lg text-lg font-medium transition-all duration-200`}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Everything you need to manage projects
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Powerful features designed to help you and your team succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/20' : 'bg-white/50 backdrop-blur-sm border-white/20'} rounded-xl p-8 border shadow-lg`}>
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'} rounded-lg flex items-center justify-center mb-6`}>
                <svg className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Task Management</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Create, assign, and track tasks with ease. Keep your team organized and on track.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/20' : 'bg-white/50 backdrop-blur-sm border-white/20'} rounded-xl p-8 border shadow-lg`}>
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-orange-900/50' : 'bg-orange-100'} rounded-lg flex items-center justify-center mb-6`}>
                <svg className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Team Collaboration</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Work together seamlessly with real-time updates and communication tools.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/20' : 'bg-white/50 backdrop-blur-sm border-white/20'} rounded-xl p-8 border shadow-lg`}>
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-amber-900/50' : 'bg-amber-100'} rounded-lg flex items-center justify-center mb-6`}>
                <svg className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Analytics & Reports</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Get insights into your project performance with detailed analytics and reports.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`bg-gradient-to-r ${isDarkMode ? 'from-yellow-600 to-orange-600' : 'from-yellow-500 to-orange-500'} py-20`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-yellow-100' : 'text-yellow-100'} mb-8`}>
              Join thousands of teams already using Proxima to manage their projects.
            </p>
            <Link
              to="/register"
              className="bg-white text-yellow-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all duration-200 inline-flex items-center gap-2 shadow-lg"
            >
              Start Your Free Trial
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
};

export default LandingPage;
