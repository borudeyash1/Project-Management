import React from 'react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import SEO from './SEO';

const ShippingPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Shipping & Delivery Policy"
        description="Sartthi's shipping and delivery policy - Learn about our shipping process and delivery timelines"
        keywords="shipping policy, delivery policy, shipping process, sartthi shipping"
        url="/shipping-policy"
      />

      <SharedNavbar />

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shipping & Delivery Policy
          </h1>
          <p className="text-gray-600">Last updated on Dec 25, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">International Shipping</h3>
                <p className="text-gray-700 leading-relaxed">
                  For International buyers, orders are shipped and delivered through registered international courier companies and/or International speed post only.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Domestic Shipping</h3>
                <p className="text-gray-700 leading-relaxed">
                  For domestic buyers, orders are shipped through registered domestic courier companies and/or speed post only.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Shipping Timeline</h3>
                <p className="text-gray-700 leading-relaxed">
                  Orders are shipped within the agreed timeline or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Delivery Responsibility</h3>
                <p className="text-gray-700 leading-relaxed">
                  Sartthi is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within the agreed timeline from the date of the order and payment or as per the delivery date agreed at the time of order confirmation.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Delivery Address</h3>
                <p className="text-gray-700 leading-relaxed">
                  Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your mail ID as specified during registration.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Support</h3>
                <p className="text-gray-700 leading-relaxed">
                  For any issues in utilizing our services you may contact our helpdesk on <strong>7083373681</strong> or <strong>connect@sartthi.com</strong>
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

export default ShippingPolicy;
