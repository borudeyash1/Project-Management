import React from 'react';
import { StripeEmailData } from '../../services/emailParsers/stripeParser';
import './StripePreview.css';

interface StripePreviewProps {
  data: StripeEmailData;
  emailSubject: string;
  emailDate: string;
}

const StripePreview: React.FC<StripePreviewProps> = ({ data, emailSubject, emailDate }) => {
  const handleAction = () => {
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getStatusBadge = () => {
    switch (data.status) {
      case 'succeeded':
        return <span className="status-badge succeeded">✓ Succeeded</span>;
      case 'failed':
        return <span className="status-badge failed">✗ Failed</span>;
      case 'refunded':
        return <span className="status-badge refunded">↺ Refunded</span>;
      default:
        return <span className="status-badge pending">⏱ Pending</span>;
    }
  };

  const renderPaymentReceived = () => (
    <div className="stripe-payment">
      <div className="payment-header">
        <div className="payment-icon success">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="payment-status">
          <h3>Payment Received</h3>
          {getStatusBadge()}
        </div>
      </div>

      <div className="payment-amount">
        <span className="currency">{data.currency || 'USD'}</span>
        <span className="amount">${data.amount || '0.00'}</span>
      </div>

      <div className="payment-details">
        {data.customerName && (
          <div className="detail-row">
            <span className="detail-label">Customer:</span>
            <span className="detail-value">{data.customerName}</span>
          </div>
        )}
        {data.customerEmail && (
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{data.customerEmail}</span>
          </div>
        )}
        {data.invoiceNumber && (
          <div className="detail-row">
            <span className="detail-label">Invoice:</span>
            <span className="detail-value">#{data.invoiceNumber}</span>
          </div>
        )}
        {data.description && (
          <div className="detail-row">
            <span className="detail-label">Description:</span>
            <span className="detail-value">{data.description}</span>
          </div>
        )}
      </div>

      <button className="btn-view-payment" onClick={handleAction}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        View in Stripe Dashboard
      </button>
    </div>
  );

  const renderPaymentFailed = () => (
    <div className="stripe-payment-failed">
      <div className="payment-header">
        <div className="payment-icon failed">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div className="payment-status">
          <h3>Payment Failed</h3>
          {getStatusBadge()}
        </div>
      </div>

      <div className="payment-amount failed-amount">
        <span className="currency">{data.currency || 'USD'}</span>
        <span className="amount">${data.amount || '0.00'}</span>
      </div>

      <div className="failure-notice">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p>Action required: Please update payment method or retry</p>
      </div>

      <div className="payment-details">
        {data.customerName && (
          <div className="detail-row">
            <span className="detail-label">Customer:</span>
            <span className="detail-value">{data.customerName}</span>
          </div>
        )}
        {data.description && (
          <div className="detail-row">
            <span className="detail-label">Reason:</span>
            <span className="detail-value">{data.description}</span>
          </div>
        )}
      </div>

      <button className="btn-retry" onClick={handleAction}>
        Retry Payment
      </button>
    </div>
  );

  const renderInvoice = () => (
    <div className="stripe-invoice">
      <div className="invoice-header">
        <div className="invoice-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div className="invoice-info">
          <h3>Invoice</h3>
          {data.invoiceNumber && (
            <span className="invoice-number">#{data.invoiceNumber}</span>
          )}
        </div>
      </div>

      <div className="invoice-amount">
        <span className="amount-label">Total Amount</span>
        <div className="amount-display">
          <span className="currency">{data.currency || 'USD'}</span>
          <span className="amount">${data.amount || '0.00'}</span>
        </div>
      </div>

      <div className="payment-details">
        {data.customerName && (
          <div className="detail-row">
            <span className="detail-label">Bill To:</span>
            <span className="detail-value">{data.customerName}</span>
          </div>
        )}
        {data.customerEmail && (
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{data.customerEmail}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          {getStatusBadge()}
        </div>
      </div>

      <button className="btn-view-invoice" onClick={handleAction}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        View Invoice
      </button>
    </div>
  );

  const renderGeneric = () => (
    <div className="stripe-generic">
      <div className="generic-header">
        <h3>{emailSubject}</h3>
        {getStatusBadge()}
      </div>

      {data.amount && (
        <div className="payment-amount">
          <span className="currency">{data.currency || 'USD'}</span>
          <span className="amount">${data.amount}</span>
        </div>
      )}

      {data.description && (
        <div className="generic-description">
          <p>{data.description}</p>
        </div>
      )}

      <button className="btn-view-stripe" onClick={handleAction}>
        View in Stripe
      </button>
    </div>
  );

  return (
    <div className="stripe-preview">
      {/* Stripe Header */}
      <div className="stripe-header">
        <div className="stripe-logo">
          <svg width="60" height="26" viewBox="0 0 60 25" fill="white">
            <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z"/>
          </svg>
        </div>
        <div className="stripe-title">
          <span className="email-date">{new Date(emailDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Content based on type */}
      <div className="stripe-content">
        {data.type === 'payment_received' && renderPaymentReceived()}
        {data.type === 'payment_failed' && renderPaymentFailed()}
        {data.type === 'invoice' && renderInvoice()}
        {(data.type === 'payout' || data.type === 'dispute' || data.type === 'subscription' || data.type === 'generic') && renderGeneric()}
      </div>

      {/* Footer */}
      <div className="stripe-footer">
        <p className="footer-text">
          This notification was sent by Stripe.
          <span 
            className="footer-link" 
            onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
          >
            Open Dashboard
          </span>
        </p>
      </div>
    </div>
  );
};

export default StripePreview;
