import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { ReminderTrigger } from '../models/ReminderTrigger';
import { Reminder } from '../models/Reminder';
import User from '../models/User';
import { sendEmail } from '../services/emailService';

dotenv.config();

const logPrefix = '⏰ [REMINDER WORKER]';
const log = (...args: unknown[]) => console.log(logPrefix, ...args);

const toIdString = (value: any): string => {
  if (!value) return '';
  return typeof value === 'string' ? value : value.toString?.() || '';
};

const run = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Cannot run reminder worker.');
  }

  log('Connecting to MongoDB ...');
  await mongoose.connect(mongoUri);
  log('MongoDB connection established.');

  const now = new Date();

  const triggers = await ReminderTrigger.find({
    triggerTime: { $lte: now },
  }).limit(100);

  log(`Processing ${triggers.length} reminder triggers at ${now.toISOString()}.`);

  for (const trigger of triggers) {
    const userIdStrings = (trigger.userIds || []).map((id) => toIdString(id)).filter(Boolean);
    if (userIdStrings.length === 0) {
      log(`Skipping trigger ${trigger._id}: no user IDs.`);
      await trigger.deleteOne();
      continue;
    }

    const users = await User.find({ _id: { $in: userIdStrings } }).select('email fullName');
    if (!users || users.length === 0) {
      log(`Skipping trigger ${trigger._id}: users not found.`);
      await trigger.deleteOne();
      continue;
    }

    const emailRecipients = users.map((u) => u.email).filter(Boolean);
    if (emailRecipients.length === 0) {
      log(`Skipping trigger ${trigger._id}: unable to resolve recipient emails.`);
      await trigger.deleteOne();
      continue;
    }

    const primaryUser = users[0];
    if (!primaryUser?._id) {
      log(`Skipping trigger ${trigger._id}: primary user missing ID.`);
      await trigger.deleteOne();
      continue;
    }

    const reminderTitle = trigger.payload?.message || `${trigger.entityType} reminder`;
    const reminderType = trigger.triggerType === 'deadline_reached' ? 'deadline' : 'task';

    await Reminder.create({
      title: reminderTitle,
      description: trigger.payload?.description || '',
      type: reminderType,
      priority: trigger.payload?.priority || 'medium',
      dueDate: trigger.triggerTime,
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id,
      project: trigger.payload?.project,
      tags: trigger.payload?.tags || [],
      notifications: [],
    });

    try {
      await sendEmail({
        to: emailRecipients,
        subject: reminderTitle,
        html: `
          <h2>${reminderTitle}</h2>
          <p>${trigger.payload?.description || 'Reminder from Sartthi'}</p>
          <p><strong>Entity:</strong> ${trigger.entityType}</p>
          <p><strong>Due:</strong> ${trigger.triggerTime.toLocaleString()}</p>
        `,
      });
    } catch (error) {
      console.error(logPrefix, `Failed to send reminder email for trigger ${trigger._id}:`, error);
    }

    if (trigger.repeatIntervalMinutes) {
      trigger.triggerTime = new Date(now.getTime() + trigger.repeatIntervalMinutes * 60 * 1000);
      trigger.lastNotifiedAt = now;
      await trigger.save();
    } else {
      await trigger.deleteOne();
    }
  }

  await mongoose.disconnect();
  log('Disconnected from MongoDB. Reminder worker finished.');
};

run()
  .then(() => {
    log('Reminder worker completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(logPrefix, 'Unhandled error:', error);
    process.exit(1);
  });
