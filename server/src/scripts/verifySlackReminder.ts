import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Reminder } from '../models/Reminder';
import { ReminderTrigger } from '../models/ReminderTrigger';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const verifyReminder = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to DB');

        // Get latest reminder
        const latestReminder = await Reminder.findOne({}).sort({ createdAt: -1 });

        if (!latestReminder) {
            console.log('No reminders found.');
            return;
        }

        console.log('Latest Reminder:', {
            title: latestReminder.title,
            id: latestReminder._id,
            notifications: JSON.stringify(latestReminder.notifications, null, 2),
            createdAt: latestReminder.createdAt
        });

        // Get triggers for this reminder
        const triggers = await ReminderTrigger.find({
            entityId: latestReminder._id,
            entityType: 'custom'
        });

        console.log('Found Triggers:', triggers.length);
        triggers.forEach(t => {
            console.log('- Trigger:', {
                time: t.triggerTime,
                type: t.triggerType,
                payload: t.payload
            });
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyReminder();
