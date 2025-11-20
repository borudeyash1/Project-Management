import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ExternalLink, Award, Users, Zap, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';

const About: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900' : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50'} relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-40 right-20 w-96 h-96 ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-200/20'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-20 w-96 h-96 ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-200/20'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
      </div>
      <SharedNavbar />

      {/* Content */}
      <div className="pt-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Back Button */}
          <Link
            to="/"
            className={`inline-flex items-center gap-2 ${isDarkMode ? 'text-yellow-600 hover:text-yellow-700' : 'text-yellow-600 hover:text-yellow-700'} mb-8 transition-colors duration-200 font-medium`}
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-20">
            <span className={`inline-block px-4 py-2 rounded-full ${isDarkMode ? 'bg-yellow-500/20 text-yellow-600' : 'bg-yellow-100 text-yellow-700'} text-sm font-semibold mb-6`}>
              ABOUT US
            </span>
            <h1 className={`text-5xl md:text-6xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              About <span className={`bg-gradient-to-r ${isDarkMode ? 'from-yellow-400 to-orange-500' : 'from-yellow-600 to-orange-600'} bg-clip-text text-transparent`}>Sartthi</span>
            </h1>
            <p className={`text-xl md:text-2xl ${isDarkMode ? 'text-gray-700' : 'text-gray-600'} max-w-3xl mx-auto leading-relaxed`}>
              We're building the future of project management, one feature at a time.
            </p>
          </div>

          {/* Mission Section */}
          <div className={`${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm border-gray-700/30' : 'bg-white/70 backdrop-blur-sm border-white/40'} rounded-2xl p-10 border shadow-2xl mb-16 hover:shadow-3xl transition-shadow duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-yellow-400 to-orange-400'} rounded-xl flex items-center justify-center shadow-lg`}>
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Our Mission</h2>
            </div>
            <p className={`${isDarkMode ? 'text-gray-700' : 'text-gray-600'} text-lg leading-relaxed`}>
              At Sartthi, we believe that great projects start with great tools. Our mission is to simplify project management 
              and make it accessible to teams of all sizes. We're committed to providing intuitive, powerful, and reliable 
              solutions that help teams collaborate effectively and achieve their goals.
            </p>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className={`group ${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm border-gray-700/30 hover:bg-gray-800/80' : 'bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/90'} rounded-2xl p-8 border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-blue-400 to-purple-400'} rounded-lg flex items-center justify-center shadow-lg`}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>What We Offer</h3>
              </div>
              <ul className={`space-y-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-600'}`}>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-accent/20' : 'bg-blue-100'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${isDarkMode ? 'bg-accent-light' : 'bg-accent'} rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">Comprehensive project tracking and management</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-accent/20' : 'bg-blue-100'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${isDarkMode ? 'bg-accent-light' : 'bg-accent'} rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">Real-time collaboration tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-accent/20' : 'bg-blue-100'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${isDarkMode ? 'bg-accent-light' : 'bg-accent'} rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">Advanced analytics and reporting</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-accent/20' : 'bg-blue-100'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${isDarkMode ? 'bg-accent-light' : 'bg-accent'} rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">Seamless team communication</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-accent/20' : 'bg-blue-100'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${isDarkMode ? 'bg-accent-light' : 'bg-accent'} rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">Customizable workflows</span>
                </li>
              </ul>
            </div>

            <div className={`group ${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm border-gray-700/30 hover:bg-gray-800/80' : 'bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/90'} rounded-2xl p-8 border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-purple-400 to-pink-400'} rounded-lg flex items-center justify-center shadow-lg`}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Why Choose Sartthi</h3>
              </div>
              <ul className={`space-y-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-600'}`}>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'} rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">User-friendly interface designed for productivity</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'} rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">Scalable solutions for teams of any size</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'} rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">24/7 customer support</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'} rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">Regular updates and new features</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'} rounded-full`}></div>
                  </div>
                  <span className="leading-relaxed">Secure and reliable infrastructure</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Team Section */}
          <div className={`${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm border-gray-700/30' : 'bg-white/70 backdrop-blur-sm border-white/40'} rounded-2xl p-10 border shadow-2xl mb-16`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-gradient-to-br from-green-500 to-blue-500' : 'bg-gradient-to-br from-green-400 to-blue-400'} rounded-xl flex items-center justify-center shadow-lg`}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Our Team</h2>
            </div>
            <p className={`${isDarkMode ? 'text-gray-700' : 'text-gray-600'} text-lg leading-relaxed mb-8`}>
              Sartthi is built by a passionate team of developers, designers, and project management experts 
              who understand the challenges of modern team collaboration. We're constantly working to improve 
              our platform and add new features based on user feedback.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">D</span>
                </div>
                <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Development Team</h4>
                <p className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-sm`}>Building the future</p>
              </div>
              <div className="text-center group">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">D</span>
                </div>
                <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Design Team</h4>
                <p className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-sm`}>Creating beautiful experiences</p>
              </div>
              <div className="text-center group">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
                <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Support Team</h4>
                <p className={`${isDarkMode ? 'text-gray-600' : 'text-gray-600'} text-sm`}>Always here to help</p>
              </div>
            </div>
          </div>

          {/* Office Location Section */}
          <div className={`${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm border-gray-700/30' : 'bg-white/70 backdrop-blur-sm border-white/40'} rounded-2xl p-10 border shadow-2xl mb-16`}>
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8 text-center`}>
              Visit Our Office
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Office Info */}
              <div>
                <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  The Tech Factory Headquarters
                </h3>
                <div className={`${isDarkMode ? 'text-gray-700' : 'text-gray-600'} space-y-4`}>
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className={`${isDarkMode ? 'text-yellow-600' : 'text-yellow-600'} mt-1 flex-shrink-0`} />
                    <div>
                      <p className="font-medium">Address:</p>
                      <p>Kaushalya Nagar, Ahmednagar - Aurangabad Rd</p>
                      <p>Near Reliance Petrol Pump, Surya Nagar</p>
                      <p>Ahilyanagar, Maharashtra 414003</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 ${isDarkMode ? 'text-yellow-600' : 'text-yellow-600'} mt-1 flex-shrink-0`}>
                      🕒
                    </div>
                    <div>
                      <p className="font-medium">Business Hours:</p>
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 ${isDarkMode ? 'text-yellow-600' : 'text-yellow-600'} mt-1 flex-shrink-0`}>
                      📞
                    </div>
                    <div>
                      <p className="font-medium">Contact:</p>
                      <p>Phone: +91 12345 67890</p>
                      <p>Email: contact@thetechfactory.com</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <a
                      href="https://maps.app.goo.gl/Tp1gahGcSXTAR1sz9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg`}
                    >
                      <MapPin size={18} />
                      View on Google Maps
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
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
                    className={`${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white/80 hover:bg-white'} backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-lg`}
                  >
                    <ExternalLink size={14} />
                    Open in Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className={`relative bg-gradient-to-r ${isDarkMode ? 'from-yellow-600 via-orange-600 to-red-600' : 'from-yellow-500 via-orange-500 to-red-500'} rounded-2xl p-12 text-center overflow-hidden shadow-2xl`}>
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get in Touch</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Have questions or feedback? We'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="group bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:scale-105 transform inline-flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="mailto:contact@thetechfactory.com"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-orange-600 transition-all duration-300 shadow-xl hover:scale-105 transform"
                >
                  Contact Support
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
