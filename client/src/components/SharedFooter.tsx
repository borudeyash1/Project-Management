import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, BookOpen, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SharedFooter: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer className={`${isDarkMode ? 'bg-gray-900/80 backdrop-blur-md border-t border-gray-700/30' : 'bg-white/80 backdrop-blur-md border-t border-gray-200/50'} mt-auto shadow-2xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <div className={`text-3xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-yellow-400 to-orange-500' : 'from-yellow-600 to-orange-600'} bg-clip-text text-transparent`}>
                The Tech Factory
              </div>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 max-w-md text-base leading-relaxed`}>
              Empowering teams with innovative project management solutions. We build tools that help organizations 
              streamline their workflows and achieve their goals efficiently.
            </p>
            <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-3`}>
              <div className="flex items-center gap-3 hover:text-yellow-500 transition-colors duration-200">
                <div className={`w-8 h-8 ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                  <MapPin size={16} className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
                <span className="text-sm">Ahilyanagar, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-3 hover:text-yellow-500 transition-colors duration-200">
                <div className={`w-8 h-8 ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                  <Mail size={16} className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
                <a href="mailto:contact@thetechfactory.com" className="text-sm">contact@thetechfactory.com</a>
              </div>
              <div className="flex items-center gap-3 hover:text-yellow-500 transition-colors duration-200">
                <div className={`w-8 h-8 ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                  <Phone size={16} className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
                <span className="text-sm">+91 12345 67890</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              Quick Links
            </h3>
            <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>
                <Link 
                  to="/" 
                  className={`${isDarkMode ? 'hover:text-yellow-400' : 'hover:text-yellow-600'} transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  <Home size={16} />
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`${isDarkMode ? 'hover:text-yellow-400' : 'hover:text-yellow-600'} transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  <Info size={16} />
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/user-guide" 
                  className={`${isDarkMode ? 'hover:text-yellow-400' : 'hover:text-yellow-600'} transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  <BookOpen size={16} />
                  User Guide
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={`${isDarkMode ? 'hover:text-yellow-400' : 'hover:text-yellow-600'} transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className={`${isDarkMode ? 'hover:text-yellow-400' : 'hover:text-yellow-600'} transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              Our Services
            </h3>
            <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                Project Management
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                Team Collaboration
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                Task Tracking
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                Payroll Management
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                Analytics & Reports
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'} rounded-full`}></div>
                Custom Solutions
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className={`border-t ${isDarkMode ? 'border-gray-700/30' : 'border-gray-200/50'} mt-12 pt-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>
              © {new Date().getFullYear()} The Tech Factory. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a 
                href="#" 
                className={`${isDarkMode ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'} transition-colors duration-200 font-medium`}
              >
                Privacy Policy
              </a>
              <span className={`${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
              <a 
                href="#" 
                className={`${isDarkMode ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'} transition-colors duration-200 font-medium`}
              >
                Terms of Service
              </a>
              <span className={`${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
              <a 
                href="#" 
                className={`${isDarkMode ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'} transition-colors duration-200 font-medium`}
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SharedFooter;
