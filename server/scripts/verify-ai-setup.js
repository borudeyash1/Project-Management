#!/usr/bin/env node

/**
 * AI Chatbot Setup Verification Script
 *
 * This script verifies that all components for the AI chatbot are properly configured.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logHeader(message) {
  console.log('');
  log(`${'='.repeat(60)}`, 'bright');
  log(message, 'bright');
  log(`${'='.repeat(60)}`, 'bright');
  console.log('');
}

// Check if .env file exists and has required variables
function checkEnvFile() {
  logHeader('Step 1: Checking Environment Configuration');

  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    logError('.env file not found');
    logInfo('Create a .env file in the server directory');
    return false;
  }

  logSuccess('.env file exists');

  // Read .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  const envVars = {};

  envLines.forEach(line => {
    const match = line.match(/^([^=#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  });

  // Check required variables
  const requiredVars = {
    'MONGODB_URI': 'MongoDB connection string',
    'JWT_SECRET': 'JWT secret key',
    'PORT': 'Server port',
    'FRONTEND_URL': 'Frontend URL',
    'GEMINI_API_KEY': 'Google Gemini API key (for AI chatbot)',
  };

  let allPresent = true;

  for (const [key, description] of Object.entries(requiredVars)) {
    if (envVars[key]) {
      if (envVars[key] === 'your-api-key-here' ||
          envVars[key] === 'your-super-secret-jwt-key-change-this-in-production' ||
          envVars[key].includes('your-') ||
          envVars[key].includes('change-this')) {
        logWarning(`${key} is set but appears to be a placeholder value`);
        if (key === 'GEMINI_API_KEY') {
          allPresent = false;
        }
      } else {
        logSuccess(`${key} is configured`);
      }
    } else {
      logError(`${key} is missing (${description})`);
      allPresent = false;
    }
  }

  return allPresent;
}

// Check if required files exist
function checkRequiredFiles() {
  logHeader('Step 2: Checking Required Files');

  const requiredFiles = [
    { path: 'src/services/llmService.ts', description: 'LLM Service' },
    { path: 'src/services/aiService.ts', description: 'AI Service' },
    { path: 'src/controllers/aiController.ts', description: 'AI Controller' },
    { path: 'src/routes/ai.ts', description: 'AI Routes' },
  ];

  let allPresent = true;

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file.path);
    if (fs.existsSync(filePath)) {
      logSuccess(`${file.description} exists`);
    } else {
      logError(`${file.description} not found at ${file.path}`);
      allPresent = false;
    }
  });

  return allPresent;
}

// Check if axios is installed
function checkDependencies() {
  logHeader('Step 3: Checking Dependencies');

  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json not found');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredPackages = ['axios', 'express', 'dotenv', 'mongoose'];

  let allPresent = true;

  requiredPackages.forEach(pkg => {
    if (dependencies[pkg]) {
      logSuccess(`${pkg} is installed (${dependencies[pkg]})`);
    } else {
      logError(`${pkg} is not installed`);
      logInfo(`Run: npm install ${pkg}`);
      allPresent = false;
    }
  });

  // Check if node_modules/axios exists
  const axiosPath = path.join(__dirname, '..', 'node_modules', 'axios');
  if (!fs.existsSync(axiosPath)) {
    logWarning('axios not found in node_modules');
    logInfo('Run: npm install');
    allPresent = false;
  }

  return allPresent;
}

// Test Gemini API connection
async function testGeminiAPI() {
  logHeader('Step 4: Testing Gemini API Connection');

  // Load environment variables
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-api-key-here' || apiKey.includes('your-')) {
    logError('GEMINI_API_KEY is not configured properly');
    logInfo('Get your API key from: https://makersuite.google.com/app/apikey');
    return false;
  }

  logSuccess('GEMINI_API_KEY is configured');
  logInfo('Testing API connection...');

  return new Promise((resolve) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const postData = JSON.stringify({
      contents: [{
        parts: [{ text: 'Hello, this is a test. Respond with "OK" if you receive this.' }]
      }]
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            if (response.candidates && response.candidates.length > 0) {
              logSuccess('Gemini API connection successful!');
              logInfo(`Response: ${response.candidates[0].content.parts[0].text.substring(0, 50)}...`);
              resolve(true);
            } else {
              logWarning('API responded but with unexpected format');
              resolve(false);
            }
          } catch (e) {
            logError('Failed to parse API response');
            resolve(false);
          }
        } else {
          logError(`API request failed with status ${res.statusCode}`);
          if (res.statusCode === 400) {
            logInfo('This might indicate an invalid API key format');
          } else if (res.statusCode === 403) {
            logInfo('API key might not have proper permissions');
          } else if (res.statusCode === 429) {
            logInfo('Rate limit exceeded');
          }
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      logError(`API connection failed: ${e.message}`);
      logInfo('Check your internet connection');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Check if server routes are configured
function checkServerConfiguration() {
  logHeader('Step 5: Checking Server Configuration');

  const serverPath = path.join(__dirname, '..', 'src', 'server.ts');

  if (!fs.existsSync(serverPath)) {
    logError('server.ts not found');
    return false;
  }

  const serverContent = fs.readFileSync(serverPath, 'utf8');

  if (serverContent.includes("import aiRoutes from './routes/ai'") ||
      serverContent.includes('import aiRoutes from "./routes/ai"')) {
    logSuccess('AI routes are imported in server.ts');
  } else {
    logError('AI routes are not imported in server.ts');
    logInfo('Add: import aiRoutes from "./routes/ai";');
    return false;
  }

  if (serverContent.includes("app.use('/api/ai', aiRoutes)") ||
      serverContent.includes('app.use("/api/ai", aiRoutes)')) {
    logSuccess('AI routes are registered');
  } else {
    logError('AI routes are not registered');
    logInfo('Add: app.use("/api/ai", aiRoutes);');
    return false;
  }

  return true;
}

// Main function
async function main() {
  console.log('');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║        AI Chatbot Setup Verification Script               ║', 'cyan');
  log('║                                                            ║', 'cyan');
  log('║  This script will verify your AI chatbot configuration    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('');

  const checks = [
    { name: 'Environment Configuration', fn: checkEnvFile },
    { name: 'Required Files', fn: checkRequiredFiles },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Server Configuration', fn: checkServerConfiguration },
  ];

  let allPassed = true;

  for (const check of checks) {
    const result = check.fn();
    if (!result) {
      allPassed = false;
    }
  }

  // Test API connection (async)
  const apiResult = await testGeminiAPI();
  if (!apiResult) {
    allPassed = false;
  }

  // Final summary
  logHeader('Setup Verification Summary');

  if (allPassed) {
    log('╔════════════════════════════════════════════════════════════╗', 'green');
    log('║                  ✓ ALL CHECKS PASSED!                      ║', 'green');
    log('║                                                            ║', 'green');
    log('║  Your AI chatbot is properly configured and ready to use! ║', 'green');
    log('╚════════════════════════════════════════════════════════════╝', 'green');
    console.log('');
    logInfo('Next steps:');
    logInfo('1. Start the backend: npm run dev');
    logInfo('2. Start the frontend: cd ../client && npm run dev');
    logInfo('3. Open http://localhost:3000 and test the chatbot!');
  } else {
    log('╔════════════════════════════════════════════════════════════╗', 'red');
    log('║                  ✗ SOME CHECKS FAILED                      ║', 'red');
    log('║                                                            ║', 'red');
    log('║  Please fix the issues above and run this script again.   ║', 'red');
    log('╚════════════════════════════════════════════════════════════╝', 'red');
    console.log('');
    logInfo('For help, refer to: AI_CHATBOT_QUICKSTART.md');
    process.exit(1);
  }

  console.log('');
}

// Run the script
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
