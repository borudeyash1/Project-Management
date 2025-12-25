import React from 'react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import SEO from './SEO';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Privacy Policy"
        description="Sartthi's privacy policy - Learn how we protect and use your personal information"
        keywords="privacy policy, data protection, personal information, sartthi privacy"
        url="/privacy-policy"
      />

      <SharedNavbar />

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated on Dec 25, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              This privacy policy sets out how Sartthi uses and protects any information that you give Sartthi when you visit their website and/or agree to purchase from them.
            </p>

            <p className="text-gray-700 leading-relaxed mb-8">
              Sartthi is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, then you can be assured that it will only be used in accordance with this privacy statement.
            </p>

            <p className="text-gray-700 leading-relaxed mb-8">
              Sartthi may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you adhere to these changes.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h3>
                <p className="text-gray-700 leading-relaxed mb-3">We may collect the following information:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Name</li>
                  <li>Contact information including email address</li>
                  <li>Demographic information such as postcode, preferences and interests, if required</li>
                  <li>Other information relevant to customer surveys and/or offers</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What We Do With the Information We Gather</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Internal record keeping</li>
                  <li>We may use the information to improve our products and services</li>
                  <li>We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided</li>
                  <li>From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail</li>
                  <li>We may use the information to customise the website according to your interests</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Security</h3>
                <p className="text-gray-700 leading-relaxed">
                  We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure we have put in suitable measures.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How We Use Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
                </p>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Controlling Your Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You may choose to restrict the collection or use of your personal information in the following ways:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes</li>
                  <li>If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at connect@sartthi.com</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Information Sharing</h3>
                <p className="text-gray-700 leading-relaxed">
                  We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Corrections and Updates</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you believe that any information we are holding on you is incorrect or incomplete, please write to 1, Burhan Nagar Road, ZP SCHOOL, Burhan Nagar, Ahmednagar, Ahilyanagar, Maharashtra, 414002 Watephal MAHARASHTRA 414002 or contact us at 7083373681 or connect@sartthi.com as soon as possible. We will promptly correct any information found to be incorrect.
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

export default PrivacyPolicy;
