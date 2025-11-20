import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import DesktopRelease from '../models/DesktopRelease';
import { uploadToR2 } from '../services/r2Service';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function migrateReleasesToR2() {
    try {
        console.log('🚀 [MIGRATION] Starting R2 migration...');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ [MIGRATION] Connected to MongoDB');

        // Find all releases
        const releases = await DesktopRelease.find({});
        console.log(`📊 [MIGRATION] Found ${releases.length} releases to migrate`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const release of releases) {
            try {
                console.log(`\n🔍 [MIGRATION] Processing: ${release.fileName}`);

                // Check if already migrated (downloadUrl starts with https://pub-)
                if (release.downloadUrl && release.downloadUrl.startsWith('https://pub-')) {
                    console.log('⏭️  [MIGRATION] Already migrated, skipping');
                    skipCount++;
                    continue;
                }

                // Check if file exists in local storage
                const localPath = path.join(__dirname, '../../uploads/releases', path.basename(release.filePath));

                if (!fs.existsSync(localPath)) {
                    console.log(`⚠️  [MIGRATION] File not found at ${localPath}, skipping`);
                    skipCount++;
                    continue;
                }

                // Read file
                const fileBuffer = await fs.promises.readFile(localPath);
                console.log(`📁 [MIGRATION] File size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);

                // Generate R2 key
                const filename = path.basename(release.filePath);
                const r2Key = `releases/${filename}`;

                // Upload to R2
                console.log('📤 [MIGRATION] Uploading to R2...');
                const r2Url = await uploadToR2(fileBuffer, r2Key, release.fileContentType || 'application/octet-stream');

                // Update database record
                release.downloadUrl = r2Url;
                release.filePath = r2Key;

                // Remove fileData and isCompressed fields (no longer needed)
                if (release.fileData) {
                    release.fileData = undefined;
                }
                if (release.isCompressed !== undefined) {
                    release.isCompressed = undefined;
                }

                await release.save();

                console.log('✅ [MIGRATION] Successfully migrated to R2');
                console.log(`   New URL: ${r2Url}`);
                successCount++;

            } catch (error: any) {
                console.error(`❌ [MIGRATION] Error migrating ${release.fileName}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 [MIGRATION] Summary:');
        console.log(`   ✅ Successfully migrated: ${successCount}`);
        console.log(`   ⏭️  Skipped (already migrated): ${skipCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log('='.repeat(60));

        await mongoose.disconnect();
        console.log('\n✅ [MIGRATION] Migration complete!');
        process.exit(0);

    } catch (error: any) {
        console.error('❌ [MIGRATION] Fatal error:', error);
        process.exit(1);
    }
}

// Run migration
migrateReleasesToR2();
