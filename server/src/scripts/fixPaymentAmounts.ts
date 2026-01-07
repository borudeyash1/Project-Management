import mongoose from 'mongoose';
import PaymentTransaction from '../models/PaymentTransaction';
import dotenv from 'dotenv';

dotenv.config();

/**
 * This script fixes payment amounts that were incorrectly stored.
 * It multiplies all payment amounts by 100 to convert from rupees to paise.
 * 
 * WARNING: This should only be run ONCE to fix existing data!
 */

async function fixPaymentAmounts() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all payment transactions
    const payments = await PaymentTransaction.find({});
    console.log(`Found ${payments.length} payment transactions`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const payment of payments) {
      // Check if amount seems to be in rupees (less than 1000 suggests it's in rupees, not paise)
      // For example: 349 rupees vs 34900 paise
      if (payment.amount < 10000) {
        const oldAmount = payment.amount;
        const newAmount = payment.amount * 100;
        
        await PaymentTransaction.findByIdAndUpdate(payment._id, {
          amount: newAmount
        });
        
        console.log(`Updated payment ${payment.razorpayOrderId}: ₹${oldAmount} → ${newAmount} paise (₹${newAmount/100})`);
        updatedCount++;
      } else {
        console.log(`Skipped payment ${payment.razorpayOrderId}: ${payment.amount} paise (already correct)`);
        skippedCount++;
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Total payments: ${payments.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error fixing payment amounts:', error);
    process.exit(1);
  }
}

// Run the script
fixPaymentAmounts();
