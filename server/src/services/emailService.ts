import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like 'Outlook', 'SendGrid', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log('🔍 [DEBUG] Email service called with options:', {
      to: options.to,
      subject: options.subject,
      from: process.env.EMAIL_USER
    });
    
    console.log('🔍 [DEBUG] Email configuration:', {
      EMAIL_USER: process.env.EMAIL_USER ? 'set' : 'not set',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'set' : 'not set'
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    console.log('🔍 [DEBUG] Sending email with nodemailer...');
    await transporter.sendMail(mailOptions);
    console.log(`✅ [DEBUG] Email sent successfully to ${options.to}`);
  } catch (error: any) {
    console.error(`❌ [DEBUG] Error sending email to ${options.to}:`, error);
    console.error(`❌ [DEBUG] Email error details:`, {
      message: error?.message || 'Unknown error',
      code: error?.code || 'Unknown code',
      response: error?.response || 'No response'
    });
    throw new Error('Failed to send email');
  }
};

// You'll need to add EMAIL_USER and EMAIL_PASS to your server/.env file.
// For Gmail, you might need to set up an App Password:
// 1. Go to your Google Account.
// 2. Click Security.
// 3. Under "How you sign in to Google," click App passwords. (You might need to sign in).
//    If you don’t have App passwords, you might need to enable 2-Step Verification.
// 4. At the bottom, choose Select app and choose "Mail".
// 5. Choose Select device and choose "Other (Custom name)", then enter a name like "Proxima App".
// 6. Click Generate.
// 7. The App password is the 16-character code in the yellow bar. Copy it to your .env file.
