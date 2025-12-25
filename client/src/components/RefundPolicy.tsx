import React from 'react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import SEO from './SEO';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Cancellation & Refund Policy"
        description="Sartthi's cancellation and refund policy - Learn about our liberal cancellation policy and refund process"
        keywords="refund policy, cancellation policy, returns, sartthi refund"
        url="/refund-policy"
      />

      <SharedNavbar />

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cancellation & Refund Policy
          </h1>
          <p className="text-gray-600">Last updated on Dec 25, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              Sartthi believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Cancellation Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  Cancellations will be considered only if the request is made within <strong>2 days of placing the order</strong>. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Non-Cancellable Items</h3>
                <p className="text-gray-700 leading-relaxed">
                  Sartthi does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Damaged or Defective Items</h3>
                <p className="text-gray-700 leading-relaxed">
                  In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within <strong>2 days of receipt of the products</strong>.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Product Not as Expected</h3>
                <p className="text-gray-700 leading-relaxed">
                  In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within <strong>2 days of receiving the product</strong>. The Customer Service Team after looking into your complaint will take an appropriate decision.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Warranty Products</h3>
                <p className="text-gray-700 leading-relaxed">
                  In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Refund Processing</h3>
                <p className="text-gray-700 leading-relaxed">
                  In case of any Refunds approved by Sartthi, it'll take <strong>1-2 days</strong> for the refund to be processed to the end customer.
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

export default RefundPolicy;
