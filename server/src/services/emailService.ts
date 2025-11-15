import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { EmailUsage } from '../models/EmailUsage';

dotenv.config(); // Load environment variables

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || smtpUser;
const emailFromName = process.env.EMAIL_FROM_NAME || 'TaskFlowHQ';
const emailDailyLimit = Number(process.env.EMAIL_DAILY_LIMIT || 300);

// Check if email credentials are configured
const isEmailConfigured = Boolean(smtpHost && smtpPort && smtpUser && smtpPassword);

// Only create transporter if email is configured
const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    })
  : null;

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

const getDateKey = () => new Date().toISOString().split('T')[0];

const reserveEmailQuota = async (units: number) => {
  if (!emailDailyLimit || Number.isNaN(emailDailyLimit)) {
    return;
  }

  const dateKey = getDateKey();
  const usage = await EmailUsage.findOneAndUpdate(
    { dateKey },
    {
      $setOnInsert: { limit: emailDailyLimit },
      $inc: { count: units },
    },
    { new: true, upsert: true }
  );

  if (usage.count > usage.limit) {
    await EmailUsage.updateOne({ _id: usage._id }, { $inc: { count: -units } });
    throw new Error('Daily email quota exceeded');
  }
};

export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log('🔍 [DEBUG] Email service called with options:', {
      to: options.to,
      subject: options.subject,
      from: emailFrom
    });
    
    console.log('🔍 [DEBUG] Email configuration:', {
      SMTP_HOST: smtpHost || 'not set',
      SMTP_PORT: smtpPort || 'not set',
      SMTP_USER: smtpUser ? 'set' : 'not set',
      SMTP_SECURE: smtpSecure,
      isConfigured: isEmailConfigured
    });
    
    // If email is not configured, log warning and skip sending
    if (!isEmailConfigured || !transporter) {
      console.warn('⚠️ [DEBUG] Email service not configured. Skipping email send.');
      console.warn('⚠️ [DEBUG] To enable email, set EMAIL_USER and EMAIL_PASS in your .env file');
      return; // Return without error to allow registration to continue
    }

    const toList = Array.isArray(options.to) ? options.to : [options.to];
    await reserveEmailQuota(toList.length);
    
    const mailOptions = {
      from: emailFromName ? `${emailFromName} <${emailFrom}>` : emailFrom,
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

// Export function to check if email is configured
export const isEmailServiceConfigured = (): boolean => {
  return isEmailConfigured;
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
