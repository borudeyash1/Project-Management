import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, BookOpen, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const SharedFooter: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();

  // Check if we are on a public page
  const isPublicPage = ['/', '/about', '/apps', '/docs', '/pricing', '/login', '/register', '/user-guide'].some(path => location.pathname === path || location.pathname.startsWith('/docs'));
  
  // Force light theme logic for public pages
  const effectiveDarkMode = isPublicPage ? false : isDarkMode;

  return (
    <footer className={`bg-white mt-auto shadow-2xl border-t border-gray-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="text-3xl font-bold text-[#44a0d1]">
                {t('footer.companyName')}
              </div>
            </div>
            <p className={`text-gray-600 mb-6 max-w-md text-base leading-relaxed`}>
              {t('footer.description')}
            </p>
            <div className={`text-gray-600 space-y-3`}>
              <div className="flex items-center gap-3 hover:text-[#44a0d1] transition-colors duration-200">
                <div className={`w-8 h-8 bg-[#44a0d1]/10 rounded-lg flex items-center justify-center`}>
                  <MapPin size={16} className={`text-[#44a0d1]`} />
                </div>
                <span className="text-sm">{t('footer.location')}</span>
              </div>
              <div className="flex items-center gap-3 hover:text-[#44a0d1] transition-colors duration-200">
                <div className={`w-8 h-8 bg-[#44a0d1]/10 rounded-lg flex items-center justify-center`}>
                  <Mail size={16} className={`text-[#44a0d1]`} />
                </div>
                <a href={`mailto:${t('footer.email')}`} className="text-sm">{t('footer.email')}</a>
              </div>
              <div className="flex items-center gap-3 hover:text-[#44a0d1] transition-colors duration-200">
                <div className={`w-8 h-8 bg-[#44a0d1]/10 rounded-lg flex items-center justify-center`}>
                  <Phone size={16} className={`text-[#44a0d1]`} />
                </div>
                <span className="text-sm">{t('footer.phone')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-xl font-bold text-gray-900 mb-6`}>
              {t('footer.quickLinks')}
            </h3>
            <ul className={`space-y-3 text-gray-600`}>
              <li>
                <Link 
                  to="/" 
                  className={`hover:text-[#44a0d1] transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  <Home size={16} />
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`hover:text-[#44a0d1] transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  <Info size={16} />
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/user-guide" 
                  className={`hover:text-[#44a0d1] transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  <BookOpen size={16} />
                  {t('footer.userGuide')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={`hover:text-[#44a0d1] transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  {t('footer.login')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className={`hover:text-[#44a0d1] transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  {t('footer.register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className={`text-xl font-bold text-gray-900 mb-6`}>
              {t('footer.services')}
            </h3>
            <ul className={`space-y-3 text-gray-600 text-sm`}>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 bg-[#44a0d1] rounded-full`}></div>
                {t('footer.projectManagement')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${effectiveDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.teamCollaboration')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${effectiveDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.taskTracking')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${effectiveDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.payrollManagement')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${effectiveDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.analyticsReports')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${effectiveDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.customSolutions')}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className={`border-t border-gray-200 mt-12 pt-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`text-gray-600 text-sm font-medium`}>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a 
                href="#" 
                className={`text-gray-600 hover:text-[#44a0d1] transition-colors duration-200 font-medium`}
              >
                {t('footer.privacyPolicy')}
              </a>
              <span className={`text-gray-400`}>•</span>
              <a 
                href="#" 
                className={`text-gray-600 hover:text-[#44a0d1] transition-colors duration-200 font-medium`}
              >
                {t('footer.termsOfService')}
              </a>
              <span className={`text-gray-400`}>•</span>
              <a 
                href="#" 
                className={`text-gray-600 hover:text-[#44a0d1] transition-colors duration-200 font-medium`}
              >
                {t('footer.cookiePolicy')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SharedFooter;
