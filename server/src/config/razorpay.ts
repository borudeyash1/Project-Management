import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay instance with live credentials
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_RvlEltzGQKSzF1',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'M8pDGHicbzPEZG1ESYmI5FRu',
});

// Razorpay configuration constants
export const RAZORPAY_CONFIG = {
  currency: 'INR',
  receipt_prefix: 'SARTTHI_',
  payment_capture: 1, // Auto capture payment
  notes: {
    company: 'Sartthi Project Management',
  },
};

export default razorpayInstance;
