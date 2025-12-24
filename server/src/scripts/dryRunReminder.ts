import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Reminder } from '../models/Reminder';
import { scheduleReminderTrigger } from '../services/reminderScheduler';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dryRun = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected.');

        const userId = new mongoose.Types.ObjectId(); // Mock user ID

        // Mock Payload mimicking req.body
        const reminderDataMock = {
            title: "Dry Run Test",
            dueDate: new Date(Date.now() + 600000), // 10 mins from now
            type: "task",
            priority: "medium",
            notifications: [
                { type: "slack", minutesBefore: 15 },
                { type: "email", minutesBefore: 10 }
            ],
            createdBy: userId
        };

        // 1. Create Reminder Document
        const reminder = new Reminder(reminderDataMock);

        // Validate but don't save to DB to avoid pollution (or save and delete)
        // Actually we need ._id so we might as well save.
        console.log('Validating...');
        await reminder.validate();
        console.log('Validation passed.');

        console.log('Reminder Notifications (from DOC):', JSON.stringify(reminder.notifications, null, 2));

        // 2. Controller Logic simulation
        console.log('--- Simulating Controller Loop ---');
        if (reminder.notifications && reminder.notifications.length > 0) {
            for (const notif of reminderDataMock.notifications) {
                console.log('Checking notif:', notif);
                if (notif.minutesBefore !== undefined) {
                    const triggerTime = new Date(new Date(reminderDataMock.dueDate).getTime() - (notif.minutesBefore * 60000));
                    console.log('Scheduling for:', triggerTime, 'Type:', notif.type);

                    // DRY RUN: Don't actually schedule to DB
                } else {
                    console.log('Skipping, no minutesBefore');
                }
            }
        } else {
            console.log('No notifications in reminder doc.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dryRun();
