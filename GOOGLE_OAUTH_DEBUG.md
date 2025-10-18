// 🔍 Google OAuth Debug Helper
// Add this to your browser console to debug the issue

console.log('🔍 Google OAuth Debug Information:');
console.log('================================');

// Check if environment variables are loaded
console.log('📋 Environment Variables:');
console.log('REACT_APP_GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Check if Google services are loaded
console.log('🌐 Google Services:');
console.log('window.google:', window.google);
console.log('window.google?.accounts:', window.google?.accounts);

// Test the configuration
if (window.google && window.google.accounts) {
  console.log('✅ Google Identity Services is loaded');
} else {
  console.log('❌ Google Identity Services is NOT loaded');
}

// Expected Client ID from your Google Console
const expectedClientId = '58699586249-un5rigsrp66rk5vi24egkockgrq5gg85.apps.googleusercontent.com';
const actualClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

console.log('🔑 Client ID Verification:');
console.log('Expected:', expectedClientId);
console.log('Actual:', actualClientId);
console.log('Match:', expectedClientId === actualClientId ? '✅' : '❌');

if (expectedClientId !== actualClientId) {
  console.log('🚨 MISMATCH DETECTED!');
  console.log('Please check your client/.env file');
  console.log('Make sure REACT_APP_GOOGLE_CLIENT_ID is set correctly');
}
