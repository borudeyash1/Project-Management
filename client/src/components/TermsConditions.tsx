import React from 'react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import SEO from './SEO';

const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Terms & Conditions"
        description="Sartthi's terms and conditions - Read our terms of service and usage policies"
        keywords="terms and conditions, terms of service, usage policy, sartthi terms"
        url="/terms-conditions"
      />

      <SharedNavbar />

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-gray-600">Last updated on Dec 25, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              For the purpose of these Terms and Conditions, The term "we", "us", "our" used anywhere on this page shall mean <strong>Sartthi</strong>, whose registered/operational office is 1, Burhan Nagar Road, ZP SCHOOL, Burhan Nagar, Ahmednagar, Ahilyanagar, Maharashtra, 414002 Watephal MAHARASHTRA 414002. "you", "your", "user", "visitor" shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
            </p>

            <p className="text-gray-700 leading-relaxed mb-8">
              Your use of the website and/or purchase from us are governed by following Terms and Conditions:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Content Changes</h3>
                <p className="text-gray-700 leading-relaxed">
                  The content of the pages of this website is subject to change without notice.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Warranty Disclaimer</h3>
                <p className="text-gray-700 leading-relaxed">
                  Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Use at Your Own Risk</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Intellectual Property</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our website contains material which is owned by or licensed to us. This material includes, but are not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Trademarks</h3>
                <p className="text-gray-700 leading-relaxed">
                  All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Unauthorized Use</h3>
                <p className="text-gray-700 leading-relaxed">
                  Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">External Links</h3>
                <p className="text-gray-700 leading-relaxed">
                  From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Linking Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may not create a link to our website from another website or document without Sartthi's prior written consent.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Governing Law</h3>
                <p className="text-gray-700 leading-relaxed">
                  Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Transactions</h3>
                <p className="text-gray-700 leading-relaxed">
                  We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
                </p>
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

export default TermsConditions;
