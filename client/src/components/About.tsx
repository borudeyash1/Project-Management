import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ExternalLink, Award, Users, Zap, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import ContentBanner from './ContentBanner';

const About: React.FC = () => {
  const { t } = useTranslation();
  useTheme();

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-white to-white relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-40 right-20 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-20 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-1000`}></div>
      </div>
      <SharedNavbar />
      <ContentBanner route="/about" />

      {/* Content */}
      <div className="pt-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Back Button */}
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 mb-8 transition-colors duration-200 font-medium`}
          >
            <ArrowLeft size={18} />
            {t('about.backToHome')}
          </Link>

          {/* Header */}
          <div className="text-center mb-20">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-amber-100 text-amber-700`}>
              {t('about.badge')}
            </span>
            <h1 className={`text-4xl md:text-6xl font-bold text-gray-900 mb-6`}>
              {t('about.title')} <span className="text-[accent]">Sartthi</span>
            </h1>
            <p className={`text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed`}>
              {t('about.subtitle')}
            </p>
          </div>

          {/* Mission Section */}
          <div className={`bg-white/70 backdrop-blur-sm border-white/40 rounded-2xl p-10 border shadow-2xl mb-16 hover:shadow-3xl transition-shadow duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[accent] rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-3xl font-bold text-gray-900`}>{t('about.mission.title')}</h2>
            </div>
            <p className={`text-gray-600 text-lg leading-relaxed`}>
              {t('about.mission.description')}
            </p>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className={`group bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/90 rounded-2xl p-8 border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg`}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-2xl font-bold text-gray-900`}>{t('about.offer.title')}</h3>
              </div>
              <ul className={`space-y-4 text-gray-600`}>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 bg-[accent] rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">{t('about.offer.items.tracking')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 bg-[accent] rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">{t('about.offer.items.collaboration')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 bg-[accent] rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">{t('about.offer.items.analytics')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 bg-[accent] rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">{t('about.offer.items.communication')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 bg-[accent] rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">{t('about.offer.items.workflows')}</span>
                </li>
              </ul>
            </div>

            <div className={`group bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/90 rounded-2xl p-8 border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center shadow-lg`}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-2xl font-bold text-gray-900`}>{t('about.choose.title')}</h3>
              </div>
              <ul className={`space-y-4 text-gray-600`}>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 bg-purple-600 rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">{t('about.choose.items.interface')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 bg-purple-600 rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">{t('about.choose.items.scalable')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 bg-purple-600 rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">{t('about.choose.items.support')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 bg-purple-600 rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">{t('about.choose.items.updates')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 bg-purple-600 rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">{t('about.choose.items.security')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Team Section */}
          <div className={`bg-white/70 backdrop-blur-sm border-white/40 rounded-2xl p-10 border shadow-2xl mb-16`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-xl flex items-center justify-center shadow-lg`}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-3xl font-bold text-gray-900`}>{t('about.team.title')}</h2>
            </div>
            <p className={`text-gray-600 text-lg leading-relaxed mb-8`}>
              {t('about.team.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">D</span>
                </div>
                <h4 className={`font-bold text-lg text-gray-900 mb-2`}>{t('about.team.development.title')}</h4>
                <p className={`text-gray-600 text-sm`}>{t('about.team.development.subtitle')}</p>
              </div>
              <div className="text-center group">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">D</span>
                </div>
                <h4 className={`font-bold text-lg text-gray-900 mb-2`}>{t('about.team.design.title')}</h4>
                <p className={`text-gray-600 text-sm`}>{t('about.team.design.subtitle')}</p>
              </div>
              <div className="text-center group">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
                <h4 className={`font-bold text-lg text-gray-900 mb-2`}>{t('about.team.support.title')}</h4>
                <p className={`text-gray-600 text-sm`}>{t('about.team.support.subtitle')}</p>
              </div>
              {/* Map Embed */}
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.8995!2d74.7234!3d19.1234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdcb0f3f3f3f3f3%3A0x3f3f3f3f3f3f3f3f!2sKaushalya%20Nagar%2C%20Ahmednagar%20-%20Aurangabad%20Rd%2C%20near%20Reliance%20Petrol%20pump%2C%20Surya%20Nagar%2C%20Ahilyanagar%2C%20Maharashtra%20414003!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="The Tech Factory Office Location"
                    className="rounded-lg"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <a
                    href="https://maps.app.goo.gl/Tp1gahGcSXTAR1sz9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-white/80 hover:bg-white backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg`}
                  >
                    <ExternalLink size={14} />
                    {t('about.office.openMaps')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className={`relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-12 text-center overflow-hidden shadow-2xl`}>
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('about.contact.title')}</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                {t('about.contact.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="group bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:scale-105 transform inline-flex items-center justify-center gap-2"
                >
                  {t('about.contact.startTrial')}
                  <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="mailto:contact@thetechfactory.com"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-orange-600 transition-all duration-300 shadow-xl hover:scale-105 transform"
                >
                  {t('about.contact.support')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
};

export default About;
