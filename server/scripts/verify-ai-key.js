#!/usr/bin/env node

/**
 * Verification script to check if GEMINI_API_KEY is properly configured
 * Run this script to verify your AI chatbot setup
 */

require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkAPIKey() {
  log('\n🔍 Checking GEMINI_API_KEY configuration...\n', colors.cyan);

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    log('❌ GEMINI_API_KEY is NOT set!', colors.red);
    log('\n📋 To fix this:', colors.yellow);
    log('1. Open server/.env file', colors.yellow);
    log('2. Add this line: GEMINI_API_KEY=your-api-key-here', colors.yellow);
    log('3. Get your API key from: https://makersuite.google.com/app/apikey', colors.yellow);
    log('4. Restart the server\n', colors.yellow);
    return false;
  }

  if (apiKey.trim().length === 0) {
    log('❌ GEMINI_API_KEY is empty!', colors.red);
    log('\n📋 To fix this:', colors.yellow);
    log('1. Get your API key from: https://makersuite.google.com/app/apikey', colors.yellow);
    log('2. Update GEMINI_API_KEY in server/.env', colors.yellow);
    log('3. Restart the server\n', colors.yellow);
    return false;
  }

  if (apiKey.includes('your-api-key') || apiKey.includes('paste-your')) {
    log('❌ GEMINI_API_KEY is still using placeholder value!', colors.red);
    log(`   Current value: ${apiKey.substring(0, 20)}...`, colors.red);
    log('\n📋 To fix this:', colors.yellow);
    log('1. Get a real API key from: https://makersuite.google.com/app/apikey', colors.yellow);
    log('2. Replace the placeholder in server/.env', colors.yellow);
    log('3. Restart the server\n', colors.yellow);
    return false;
  }

  log('✅ GEMINI_API_KEY is configured!', colors.green);
  log(`   Length: ${apiKey.length} characters`, colors.blue);
  log(`   Preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`, colors.blue);

  return true;
}

async function testAPIConnection() {
  log('\n🌐 Testing connection to Gemini API...\n', colors.cyan);

  const apiKey = process.env.GEMINI_API_KEY;
  const axios = require('axios');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: 'Say "Hello" in one word.',
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data.candidates && response.data.candidates.length > 0) {
      log('✅ Successfully connected to Gemini API!', colors.green);
      log('   API is responding correctly', colors.blue);
      return true;
    } else {
      log('⚠️  Received unexpected response from API', colors.yellow);
      return false;
    }
  } catch (error) {
    log('❌ Failed to connect to Gemini API!', colors.red);

    if (error.response) {
      log(`   Status: ${error.response.status}`, colors.red);
      log(`   Error: ${error.response.data?.error?.message || 'Unknown error'}`, colors.red);

      if (error.response.status === 400) {
        log('\n📋 This usually means:', colors.yellow);
        log('   - Your API key is invalid or expired', colors.yellow);
        log('   - You need to enable the Gemini API in Google Cloud Console', colors.yellow);
      }
    } else if (error.request) {
      log('   No response received from API', colors.red);
      log('   Check your internet connection', colors.yellow);
    } else {
      log(`   Error: ${error.message}`, colors.red);
    }

    return false;
  }
}

async function checkServerHealth() {
  log('\n🏥 Checking server health endpoint...\n', colors.cyan);

  const axios = require('axios');
  const serverUrl = 'http://localhost:5000/api/ai/health';

  try {
    const response = await axios.get(serverUrl, { timeout: 5000 });

    if (response.data.success) {
      const { status, aiConfigured } = response.data.data;

      if (aiConfigured) {
        log('✅ Server reports AI is configured!', colors.green);
        log(`   Status: ${status}`, colors.blue);
      } else {
        log('⚠️  Server reports AI is NOT configured', colors.yellow);
        log('   Make sure GEMINI_API_KEY is set in .env and server is restarted', colors.yellow);
      }

      return aiConfigured;
    } else {
      log('❌ Server health check failed', colors.red);
      return false;
    }
  } catch (error) {
    log('❌ Could not connect to server!', colors.red);
    log('   Is the server running on http://localhost:5000?', colors.yellow);
    log('   Start it with: npm start', colors.yellow);
    return false;
  }
}

async function main() {
  log('═══════════════════════════════════════════════════', colors.cyan);
  log('   AI Chatbot Configuration Verification', colors.cyan);
  log('═══════════════════════════════════════════════════', colors.cyan);

  // Step 1: Check if API key exists
  const keyExists = checkAPIKey();

  if (!keyExists) {
    log('\n❌ Setup incomplete. Please configure GEMINI_API_KEY first.\n', colors.red);
    process.exit(1);
  }

  // Step 2: Test API connection
  const apiWorks = await testAPIConnection();

  // Step 3: Check server health
  const serverHealthy = await checkServerHealth();

  // Final summary
  log('\n═══════════════════════════════════════════════════', colors.cyan);
  log('   Summary', colors.cyan);
  log('═══════════════════════════════════════════════════', colors.cyan);

  log(`\n${keyExists ? '✅' : '❌'} API Key Configured`, keyExists ? colors.green : colors.red);
  log(`${apiWorks ? '✅' : '❌'} Gemini API Connection`, apiWorks ? colors.green : colors.red);
  log(`${serverHealthy ? '✅' : '❌'} Server Health Check`, serverHealthy ? colors.green : colors.red);

  if (keyExists && apiWorks && serverHealthy) {
    log('\n🎉 Everything is working! Your AI chatbot is ready to use!\n', colors.green);
    process.exit(0);
  } else {
    log('\n⚠️  There are some issues to fix. See messages above.\n', colors.yellow);
    process.exit(1);
  }
}

// Run the verification
main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}\n`, colors.red);
  process.exit(1);
});
