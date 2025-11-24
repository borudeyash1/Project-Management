import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, BookOpen, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const SharedFooter: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <footer className={`${isDarkMode ? 'bg-gray-900/80 backdrop-blur-md border-t border-gray-700/30' : 'bg-white/80 backdrop-blur-md border-t border-gray-200/50'} mt-auto shadow-2xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="text-3xl font-bold text-accent">
                {t('footer.companyName')}
              </div>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 max-w-md text-base leading-relaxed`}>
              {t('footer.description')}
            </p>
            <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-3`}>
              <div className="flex items-center gap-3 hover:text-yellow-500 transition-colors duration-200">
                <div className={`w-8 h-8 ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                  <MapPin size={16} className={`${isDarkMode ? 'text-yellow-600' : 'text-yellow-600'}`} />
                </div>
                <span className="text-sm">{t('footer.location')}</span>
              </div>
              <div className="flex items-center gap-3 hover:text-yellow-500 transition-colors duration-200">
                <div className={`w-8 h-8 ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                  <Mail size={16} className={`${isDarkMode ? 'text-yellow-600' : 'text-yellow-600'}`} />
                </div>
                <a href={`mailto:${t('footer.email')}`} className="text-sm">{t('footer.email')}</a>
              </div>
              <div className="flex items-center gap-3 hover:text-yellow-500 transition-colors duration-200">
                <div className={`w-8 h-8 ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                  <Phone size={16} className={`${isDarkMode ? 'text-yellow-600' : 'text-yellow-600'}`} />
                </div>
                <span className="text-sm">{t('footer.phone')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              {t('footer.quickLinks')}
            </h3>
            <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>
                <Link 
                  to="/" 
                  className={`${isDarkMode ? 'hover:text-yellow-400' : 'hover:text-yellow-600'} transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  <Home size={16} />
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`${isDarkMode ? 'hover:text-yellow-400' : 'hover:text-yellow-600'} transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  <Info size={16} />
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/user-guide" 
                  className={`${isDarkMode ? 'hover:text-yellow-400' : 'hover:text-yellow-600'} transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  <BookOpen size={16} />
                  {t('footer.userGuide')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={`${isDarkMode ? 'hover:text-yellow-400' : 'hover:text-yellow-600'} transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  {t('footer.login')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className={`${isDarkMode ? 'hover:text-yellow-400' : 'hover:text-yellow-600'} transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  {t('footer.register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              {t('footer.services')}
            </h3>
            <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.projectManagement')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.teamCollaboration')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.taskTracking')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.payrollManagement')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.analyticsReports')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                {t('footer.customSolutions')}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className={`border-t ${isDarkMode ? 'border-gray-700/30' : 'border-gray-200/50'} mt-12 pt-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a 
                href="#" 
                className={`${isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-600 hover:text-yellow-600'} transition-colors duration-200 font-medium`}
              >
                {t('footer.privacyPolicy')}
              </a>
              <span className={`${isDarkMode ? 'text-gray-600' : 'text-gray-700'}`}>•</span>
              <a 
                href="#" 
                className={`${isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-600 hover:text-yellow-600'} transition-colors duration-200 font-medium`}
              >
                {t('footer.termsOfService')}
              </a>
              <span className={`${isDarkMode ? 'text-gray-600' : 'text-gray-700'}`}>•</span>
              <a 
                href="#" 
                className={`${isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-600 hover:text-yellow-600'} transition-colors duration-200 font-medium`}
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
