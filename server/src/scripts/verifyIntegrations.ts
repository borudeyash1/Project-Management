
import mongoose from 'mongoose';
import User from '../models/User';
import { sendEmailViaGmail } from '../services/gmailService';
import { listFiles } from '../services/driveService';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const verifyIntegrations = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB.');

        // 1. Find a user with Mail enabled
        const mailUser = await User.findOne({
            'modules.mail.isEnabled': true,
            'modules.mail.refreshToken': { $ne: null }
        });

        if (mailUser) {
            console.log(`\n=== Testing Gmail Integration for user: ${mailUser.email} ===`);
            try {
                // Send a self-test email
                console.log('Attempting to send test email...');
                const result = await sendEmailViaGmail(
                    mailUser._id.toString(),
                    [mailUser.email],
                    'Sartthi Integration Test',
                    '<h1>It Works!</h1><p>This is a test email from the Sartthi Verification Script.</p>'
                );
                console.log('✅ Email Sent Successfully!');
                console.log('Message ID:', result.id);
            } catch (error) {
                console.error('❌ Email Sending Failed:', error);
            }
        } else {
            console.log('\n⚠️ No user found with Sartthi Mail enabled. Skipping Mail test.');
        }

        // 2. Find a user with Vault enabled
        const vaultUser = await User.findOne({
            'modules.vault.isEnabled': true,
            'modules.vault.refreshToken': { $ne: null }
        });

        if (vaultUser) {
            console.log(`\n=== Testing Vault Integration for user: ${vaultUser.email} ===`);
            try {
                console.log('Attempting to list Vault files...');
                // Mocking the "query" arg as empty string for now
                const files = await listFiles(vaultUser._id.toString(), '', undefined);
                console.log(`✅ Successfully fetched ${files.length} files.`);
                if (files.length > 0) {
                    console.log('First file:', files[0].name, `(${files[0].mimeType})`);
                }
            } catch (error) {
                console.error('❌ Vault Listing Failed:', error);
            }
        } else {
            console.log('\n⚠️ No user found with Sartthi Vault enabled. Skipping Vault test.');
        }

    } catch (err) {
        console.error('Global Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
        process.exit();
    }
};

verifyIntegrations();
