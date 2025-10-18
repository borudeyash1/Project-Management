import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';

const About: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900' : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50'}`}>
      <SharedNavbar />

      {/* Content */}
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Proxima</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the future of project management, one feature at a time.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              At Proxima, we believe that great projects start with great tools. Our mission is to simplify project management 
              and make it accessible to teams of all sizes. We're committed to providing intuitive, powerful, and reliable 
              solutions that help teams collaborate effectively and achieve their goals.
            </p>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What We Offer</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Comprehensive project tracking and management</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Real-time collaboration tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Advanced analytics and reporting</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Seamless team communication</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Customizable workflows</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Proxima</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>User-friendly interface designed for productivity</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Scalable solutions for teams of any size</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>24/7 customer support</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Regular updates and new features</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Secure and reliable infrastructure</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Team</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Proxima is built by a passionate team of developers, designers, and project management experts 
              who understand the challenges of modern team collaboration. We're constantly working to improve 
              our platform and add new features based on user feedback.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <h4 className="font-semibold text-gray-900">Development Team</h4>
                <p className="text-gray-600 text-sm">Building the future</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <h4 className="font-semibold text-gray-900">Design Team</h4>
                <p className="text-gray-600 text-sm">Creating beautiful experiences</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <h4 className="font-semibold text-gray-900">Support Team</h4>
                <p className="text-gray-600 text-sm">Always here to help</p>
              </div>
            </div>
          </div>

          {/* Office Location Section */}
          <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/20' : 'bg-white/50 backdrop-blur-sm border-white/20'} rounded-xl p-8 border shadow-lg mb-12`}>
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8 text-center`}>
              Visit Our Office
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Office Info */}
              <div>
                <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  The Tech Factory Headquarters
                </h3>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-4`}>
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-1 flex-shrink-0`} />
                    <div>
                      <p className="font-medium">Address:</p>
                      <p>Ahilyanagar, Maharashtra, India</p>
                      <p className="text-sm mt-1">Located in the heart of Maharashtra's tech corridor</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-1 flex-shrink-0`}>
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
                    <div className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-1 flex-shrink-0`}>
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
                      href="https://maps.app.goo.gl/KbUC3YCRSp11KVV36"
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
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.1234567890!2d73.1234567890!3d19.1234567890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA3JzI0LjQiTiA3M8KwMDcnMjQuNCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
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
                    href="https://maps.app.goo.gl/KbUC3YCRSp11KVV36"
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
          <div className={`bg-gradient-to-r ${isDarkMode ? 'from-yellow-600 to-orange-600' : 'from-yellow-500 to-orange-500'} rounded-xl p-8 text-center`}>
            <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-yellow-100 mb-6">
              Have questions or feedback? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-yellow-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
              >
                Start Free Trial
              </Link>
              <a
                href="mailto:contact@thetechfactory.com"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-yellow-600 transition-all duration-200"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
};

export default About;
