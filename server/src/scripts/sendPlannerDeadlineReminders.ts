import mongoose from 'mongoose';
import dotenv from 'dotenv';

import PlannerEvent from '../models/PlannerEvent';
import '../models/User';
import { sendEmail } from '../services/emailService';

dotenv.config();

const logPrefix = '🔔 [PLANNER DEADLINE]';
const log = (...args: unknown[]) => console.log(logPrefix, ...args);

const buildRecipients = (event: any, excludeUserId?: string): string[] => {
  const recipients = new Set<string>();

  (event.participants || []).forEach((participant: any) => {
    const participantId = participant.user?._id?.toString();
    const email = participant.user?.email;
    const isExcluded = excludeUserId && participantId === excludeUserId;
    if (email && !isExcluded) {
      recipients.add(email);
    }
  });

  return Array.from(recipients);
};

const buildEmailBody = (event: any, targetDate?: Date) => {
  const safeDate = targetDate ? new Date(targetDate) : undefined;
  const formattedDate = safeDate ? safeDate.toLocaleString() : 'N/A';

  return `
    <h2>Planner deadline reached</h2>
    <p><strong>${event.title}</strong></p>
    <p>${event.description || 'No description provided.'}</p>
    <p><strong>Scheduled for:</strong> ${formattedDate}</p>
    <p>This is an automated reminder triggered when the deadline was reached.</p>
  `;
};

const run = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Cannot run deadline reminder script.');
  }

  log('Connecting to MongoDB ...');
  await mongoose.connect(mongoUri);
  log('MongoDB connection established.');

  const now = new Date();

  const events = await PlannerEvent.find({
    $or: [
      { deadlineNotifiedAt: { $exists: false } },
      { deadlineNotifiedAt: null },
    ],
  })
    .populate('participants.user', 'fullName email')
    .populate('createdBy', 'fullName email');

  const dueEvents = events.filter((event: any) => {
    const reference = event.end || event.start;
    return reference && new Date(reference) <= now;
  });

  log(`Scanned ${events.length} pending events, ${dueEvents.length} have reached their deadline as of ${now.toISOString()}.`);

  for (const event of dueEvents) {
    const deadlineDate = event.end || event.start;
    const recipients = buildRecipients(event);

    log(`Preparing email for event "${event.title}" (ID: ${event._id})`);
    log('  ➤ Deadline date:', deadlineDate);
    log('  ➤ Recipients:', recipients.length > 0 ? recipients.join(', ') : '(none found)');

    if (recipients.length === 0) {
      log('  ✋ Skipping email because no recipients were resolved.');
      event.deadlineNotifiedAt = now;
      await event.save();
      continue;
    }

    try {
      const priority = (event as any).priority;
      if (priority && ['high', 'urgent'].includes(priority)) {
        await sendEmail({
          to: recipients,
          subject: `Deadline reached: ${event.title}`,
          html: buildEmailBody(event, deadlineDate),
        });

        log(`  ✅ Email dispatched to ${recipients.join(', ')}.`);
      } else {
        log('  ℹ️ Email skipped (priority not high/urgent).');
      }
      event.deadlineNotifiedAt = new Date();
      await event.save();
    } catch (error) {
      console.error(logPrefix, `❌ Failed to send email for event ${event._id}:`, error);
    }
  }

  await mongoose.disconnect();
  log('Disconnected from MongoDB. All done.');
};

run()
  .then(() => {
    log('Deadline reminder script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(logPrefix, 'Unhandled error occurred:', error);
    process.exit(1);
  });
