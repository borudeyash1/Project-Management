import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Linkedin, Facebook, Youtube, Github, ArrowUp, Instagram
} from 'lucide-react';

const SharedFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show scroll-to-top button when user scrolls down
  useEffect(() => {
    const toggleVisibility = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    resources: [
      { label: 'Documentation', path: '/docs' },
      { label: 'Blog', path: '/login' },
      { label: 'API Reference', path: '/login' },
      { label: 'Tutorials', path: '/login' }
    ],
    support: [
      { label: 'Pricing', path: '/login' },
      { label: 'FAQs', path: '/#faq' },
      { label: 'Support', path: '/login' },
      { label: 'Contact Us', path: '/login' }
    ],
    company: [
      { label: 'About Sartthi', path: '/login' },
      { label: 'Features', path: '/#features' },
      { label: 'Contact', path: '/login' }
    ]
  };

  const socialLinks = [
    { 
      icon: <Instagram className="w-5 h-5" />, 
      url: 'https://www.instagram.com/sartthi_online/', 
      label: 'Instagram',
      color: 'text-pink-600'
    },
    { 
      icon: <Linkedin className="w-5 h-5" />, 
      url: 'https://www.linkedin.com/company/sartthi', 
      label: 'LinkedIn',
      color: 'text-blue-600'
    },
    { 
      icon: <Facebook className="w-5 h-5" />, 
      url: 'https://www.facebook.com/sartthi', 
      label: 'Facebook',
      color: 'text-blue-700'
    },
    { 
      icon: <Youtube className="w-5 h-5" />, 
      url: 'https://www.youtube.com/@sartthi', 
      label: 'YouTube',
      color: 'text-red-600'
    },
    { 
      icon: <Github className="w-5 h-5" />, 
      url: 'https://github.com/sartthi', 
      label: 'GitHub',
      color: 'text-gray-800'
    }
  ];

  return (
    <>
      <footer className="bg-white border-t border-gray-200">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <img src="/2.png" alt="Sartthi Logo" className="h-8 w-auto" />
              </Link>
              
              <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-sm">
                Sartthi is a comprehensive project management platform designed to help teams collaborate, track progress, and deliver projects efficiently.
              </p>
              
              <div className="flex flex-col gap-2">
                <Link 
                  to="/docs" 
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#006397] transition-colors w-fit"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span>Documentation</span>
                </Link>
              </div>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4 text-base">Resources</h3>
              <ul className="space-y-2.5">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.path} 
                      className="text-sm text-gray-600 hover:text-[#006397] transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4 text-base">Support</h3>
              <ul className="space-y-2.5">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.path} 
                      className="text-sm text-gray-600 hover:text-[#006397] transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4 text-base">Company</h3>
              <ul className="space-y-2.5">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.path} 
                      className="text-sm text-gray-600 hover:text-[#006397] transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <div className="text-sm text-gray-600">
                Copyright © {currentYear} Sartthi
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 ${social.color} hover:border-current transition-all transform hover:scale-110`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Fixed Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-8 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-[#006397] text-white shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 animate-fade-in"
          style={{
            animation: 'fadeIn 0.4s ease-in-out'
          }}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default SharedFooter;
