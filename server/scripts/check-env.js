const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Try to load .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    console.log('✅ .env file found at:', envPath);
    dotenv.config({ path: envPath });
} else {
    console.error('❌ .env file NOT found at:', envPath);
}

console.log('\n--- Environment Variable Check ---');
const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'CLIENT_URL'
];

const missing = [];
requiredVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`✅ ${varName}: Present (Length: ${process.env[varName].length})`);
    } else {
        console.log(`❌ ${varName}: MISSING`);
        missing.push(varName);
    }
});

if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
} else {
    console.log('\n✅ All required environment variables are present.');
}
