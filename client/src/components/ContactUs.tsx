import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import SEO from './SEO';

const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Contact Us"
        description="Get in touch with Sartthi - Contact information and business details"
        keywords="contact us, sartthi contact, customer support, business address"
        url="/contact-us"
      />

      <SharedNavbar />

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-gray-600">Last updated on Dec 25, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-700 leading-relaxed mb-12 text-center text-lg">
            You may contact us using the information below:
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Business Information Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Merchant Legal Entity Name</p>
                  <p className="text-gray-900 font-medium">Sartthi</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Registered Address</p>
                  <p className="text-gray-900">
                    1, Burhan Nagar Road, ZP SCHOOL, Burhan Nagar,<br />
                    Ahmednagar, Ahilyanagar, Maharashtra, 414002<br />
                    Watephal MAHARASHTRA 414002
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Operational Address</p>
                  <p className="text-gray-900">
                    1, Burhan Nagar Road, ZP SCHOOL, Burhan Nagar,<br />
                    Ahmednagar, Ahilyanagar, Maharashtra, 414002<br />
                    Watephal MAHARASHTRA 414002
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#006397' }}>
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Telephone</p>
                    <a href="tel:7083373681" className="text-lg font-medium hover:underline" style={{ color: '#006397' }}>
                      7083373681
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#006397' }}>
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
                    <a href="mailto:connect@sartthi.com" className="text-lg font-medium hover:underline" style={{ color: '#006397' }}>
                      connect@sartthi.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#006397' }}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Location</p>
                    <p className="text-gray-900">
                      Ahmednagar, Maharashtra<br />
                      India - 414002
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large Gradient Text Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-5xl md:text-9xl lg:text-[18rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200 inset-x-0">
            SARTTHI
          </p>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
};

export default ContactUs;
