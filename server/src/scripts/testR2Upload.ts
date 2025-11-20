import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { uploadToR2 } from '../services/r2Service';

// Load environment variables
dotenv.config();

async function testR2Upload() {
    try {
        console.log('🧪 [TEST] Testing R2 upload...');
        console.log('📍 [TEST] R2 Endpoint:', process.env.R2_ENDPOINT);
        console.log('📍 [TEST] R2 Bucket:', process.env.R2_BUCKET_NAME);
        console.log('📍 [TEST] R2 Public URL:', process.env.R2_PUBLIC_URL);

        // Path to the existing release file
        const filePath = path.join(__dirname, '../../uploads/releases/release-1763583782895-249177728.exe');

        console.log('\n📁 [TEST] Reading file:', filePath);

        if (!fs.existsSync(filePath)) {
            console.error('❌ [TEST] File not found!');
            process.exit(1);
        }

        const fileBuffer = await fs.promises.readFile(filePath);
        const fileSizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2);
        console.log(`✅ [TEST] File read successfully: ${fileSizeMB} MB`);

        // Upload to R2
        const r2Key = 'releases/release-1763583782895-249177728.exe';
        console.log('\n📤 [TEST] Uploading to R2...');
        console.log('   Key:', r2Key);

        const publicUrl = await uploadToR2(fileBuffer, r2Key, 'application/x-msdownload');

        console.log('\n✅ [TEST] Upload successful!');
        console.log('   Public URL:', publicUrl);
        console.log('\n🎉 [TEST] R2 integration is working correctly!');
        console.log('\n📝 [TEST] Next steps:');
        console.log('   1. Update the database record with this URL');
        console.log('   2. Test downloading from the public URL');
        console.log('   3. Test downloading from sartthi.com');

    } catch (error: any) {
        console.error('\n❌ [TEST] Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testR2Upload();
