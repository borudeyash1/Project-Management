import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';
import { ConnectedAccount } from '../models/ConnectedAccount';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || '');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugAccounts = async () => {
    await connectDB();

    try {
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            console.log(`User: ${user.fullName} (${user.email}) ID: ${user._id}`);

            // Connected Accounts from User model
            console.log('  User.connectedAccounts structure:', JSON.stringify(user.connectedAccounts, null, 2));

            // Connected Accounts from Collection
            const accounts = await ConnectedAccount.find({ userId: user._id });
            console.log(`  Found ${accounts.length} ConnectedAccount documents.`);

            accounts.forEach(acc => {
                console.log(`    - Service: ${acc.service}, Provider: ${acc.provider}, Email: ${acc.providerEmail}, Active: ${acc.isActive}`);
            });
            console.log('---');
        }

    } catch (error) {
        console.error('Debug error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

debugAccounts();
