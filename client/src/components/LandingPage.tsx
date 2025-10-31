import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, BarChart3, Zap, Play, TrendingUp, Clock, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';

const LandingPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900' : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50'} relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-200/30'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-200/30'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
      </div>
      <SharedNavbar />

      {/* Hero Section */}
      <div className="pt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg animate-fade-in">
              <Zap className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} size={16} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Trusted by 10,000+ teams worldwide</span>
            </div>
            <h1 className={`text-5xl md:text-7xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 animate-fade-in-up`}>
              Project Management
              <span className={`block bg-gradient-to-r ${isDarkMode ? 'from-yellow-400 via-orange-500 to-red-500' : 'from-yellow-600 via-orange-600 to-red-600'} bg-clip-text text-transparent mt-2`}>
                Made Simple
              </span>
            </h1>
            <p className={`text-xl md:text-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200`}>
              Streamline your projects, collaborate with your team, and achieve your goals with our intuitive project management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
              <Link
                to="/register"
                className={`group bg-gradient-to-r ${isDarkMode ? 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'} text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transform`}
              >
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/user-guide"
                className={`border-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 hover:bg-yellow-400/10' : 'border-gray-300 text-gray-700 hover:border-yellow-600 hover:text-yellow-600 hover:bg-yellow-50'} px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 transform shadow-lg`}
              >
                Learn More
              </Link>
            </div>
            
            {/* Hero Mockup/Screenshot */}
            <div className="mt-16 mb-8 animate-fade-in-up animation-delay-600">
              <div className="relative max-w-5xl mx-auto">
                {/* Floating Dashboard Mockup */}
                <div 
                  className={`relative rounded-2xl overflow-hidden shadow-2xl border-4 ${isDarkMode ? 'border-gray-700' : 'border-white'} animate-float`}
                  style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                >
                  {/* Mockup Header */}
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2`}>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className={`flex-1 text-center text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sartthi Dashboard
                    </div>
                  </div>
                  
                  {/* Mockup Content - Gradient Placeholder */}
                  <div className={`relative h-96 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} p-8`}>
                    {/* Simulated Dashboard Elements */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-lg p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} animate-pulse-slow`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Projects</div>
                            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24</div>
                          </div>
                        </div>
                      </div>
                      <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-lg p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} animate-pulse-slow animation-delay-200`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</div>
                            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>156</div>
                          </div>
                        </div>
                      </div>
                      <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-lg p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} animate-pulse-slow animation-delay-400`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</div>
                            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>12</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Simulated Chart/Graph */}
                    <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Project Progress</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last 7 days</div>
                      </div>
                      <div className="flex items-end gap-2 h-32">
                        {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-yellow-500 to-orange-500 rounded-t animate-slide-in-up" style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Floating Play Button */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <button className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-bounce-subtle">
                        <Play className="w-8 h-8 text-yellow-600 ml-1" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements Around Mockup */}
                <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-xl animate-float animation-delay-300 opacity-80"></div>
                <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl animate-float animation-delay-500 opacity-80"></div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-70 animate-fade-in-up animation-delay-800">
              <div className="flex items-center gap-2">
                <CheckCircle className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`} size={20} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`} size={20} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`} size={20} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className={`text-center mb-16 ${featuresVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <span className={`inline-block px-4 py-2 rounded-full ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'} text-sm font-semibold mb-4`}>
              FEATURES
            </span>
            <h2 className={`text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              Everything you need to manage projects
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Powerful features designed to help you and your team succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`group ${isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/20 hover:bg-gray-800/70' : 'bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/90'} rounded-2xl p-8 border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${featuresVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className={`w-16 h-16 ${isDarkMode ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-yellow-400 to-orange-400'} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 group-hover:text-yellow-500 transition-colors`}>Task Management</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Create, assign, and track tasks with ease. Keep your team organized and on track with powerful task management tools.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`group ${isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/20 hover:bg-gray-800/70' : 'bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/90'} rounded-2xl p-8 border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${featuresVisible ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
              <div className={`w-16 h-16 ${isDarkMode ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-orange-400 to-red-400'} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 group-hover:text-orange-500 transition-colors`}>Team Collaboration</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Work together seamlessly with real-time updates and communication tools that keep everyone in sync.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`group ${isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/20 hover:bg-gray-800/70' : 'bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/90'} rounded-2xl p-8 border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${featuresVisible ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
              <div className={`w-16 h-16 ${isDarkMode ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-purple-400 to-pink-400'} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 group-hover:text-purple-500 transition-colors`}>Analytics & Reports</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Get insights into your project performance with detailed analytics and comprehensive reports.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`relative bg-gradient-to-r ${isDarkMode ? 'from-yellow-600 via-orange-600 to-red-600' : 'from-yellow-500 via-orange-500 to-red-500'} py-24 overflow-hidden`}>
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of teams already using Sartthi to manage their projects efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group bg-white text-orange-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-2xl hover:scale-105 transform"
              >
                Start Your Free Trial
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white hover:text-orange-600 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-xl hover:scale-105 transform"
              >
                Learn More About Us
              </Link>
            </div>
            <p className="text-white/80 text-sm mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
};

export default LandingPage;
