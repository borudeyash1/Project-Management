import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, BookOpen, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SharedFooter: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/20' : 'bg-white/50 backdrop-blur-sm border-t border-white/20'} mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className={`text-2xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-yellow-400 to-orange-500' : 'from-yellow-600 to-orange-600'} bg-clip-text text-transparent`}>
                The Tech Factory
              </div>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 max-w-md`}>
              Empowering teams with innovative project management solutions. We build tools that help organizations 
              streamline their workflows and achieve their goals efficiently.
            </p>
            <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
              <div className="flex items-center gap-2">
                <MapPin size={16} className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span>Ahilyanagar, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span>contact@thetechfactory.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span>+91 12345 67890</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Quick Links
            </h3>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>
                <Link 
                  to="/" 
                  className={`hover:${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} transition-colors duration-200 flex items-center gap-2`}
                >
                  <Home size={14} />
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`hover:${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} transition-colors duration-200 flex items-center gap-2`}
                >
                  <Info size={14} />
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/user-guide" 
                  className={`hover:${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} transition-colors duration-200 flex items-center gap-2`}
                >
                  <BookOpen size={14} />
                  User Guide
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={`hover:${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} transition-colors duration-200 flex items-center gap-2`}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className={`hover:${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} transition-colors duration-200 flex items-center gap-2`}
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Our Services
            </h3>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Project Management</li>
              <li>Team Collaboration</li>
              <li>Task Tracking</li>
              <li>Payroll Management</li>
              <li>Analytics & Reports</li>
              <li>Custom Solutions</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`border-t ${isDarkMode ? 'border-gray-700/20' : 'border-white/20'} mt-8 pt-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-4 md:mb-0`}>
              © 2024 The Tech Factory. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a 
                href="#" 
                className={`${isDarkMode ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'} transition-colors duration-200`}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className={`${isDarkMode ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'} transition-colors duration-200`}
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className={`${isDarkMode ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-500 hover:text-yellow-600'} transition-colors duration-200`}
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
