import mongoose from 'mongoose';
import dotenv from 'dotenv';

import PlannerEvent from '../models/PlannerEvent';
import User from '../models/User';

dotenv.config();

const logPrefix = '🗓️ [PLANNER SEED]';
const log = (...args: unknown[]) => console.log(logPrefix, ...args);

const run = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Cannot seed planner event.');
  }

  await mongoose.connect(mongoUri);
  log('Connected to MongoDB.');

  const preferredEmails = [
    'botudeyash12@gmail.com',
    'borudeyash12@gmail.com',
    process.env.EMAIL_USER,
  ].filter(Boolean) as string[];

  let owner = null;
  for (const email of preferredEmails) {
    owner = await User.findOne({ email });
    if (owner) break;
  }

  if (!owner) {
    owner = await User.findOne();
  }

  if (!owner) {
    throw new Error('No user found to associate with the planner event.');
  }

  const now = new Date();
  const start = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
  const end = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

  const event = new PlannerEvent({
    title: 'Deadline Test Event',
    description: 'Automatically created to trigger planner deadline reminder.',
    start,
    end,
    allDay: false,
    color: '#f97316',
    createdBy: owner._id,
    participants: [
      {
        user: owner._id,
        status: 'accepted',
      },
    ],
    reminders: [],
  });

  await event.save();
  const eventId = typeof event._id === 'string' ? event._id : event._id?.toString?.() || 'unknown-id';
  log('Created past planner event:', eventId);

  await mongoose.disconnect();
  log('Disconnected from MongoDB.');
};

run()
  .then(() => {
    log('Planner event seed completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(logPrefix, 'Error seeding planner event:', error);
    process.exit(1);
  });
