const fetch = require('node-fetch');

async function checkServer() {
  const serverUrl = process.env.API_URL || 'http://localhost:5000';
  
  try {
    console.log('🔍 Checking if server is running...');
    const response = await fetch(`${serverUrl}/api/health`);
    
    if (response.ok) {
      console.log('✅ Server is running and healthy!');
      return true;
    } else {
      console.log('⚠️  Server responded but may have issues');
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log(`   Expected URL: ${serverUrl}`);
    console.log('\n🚀 To start the server:');
    console.log('   1. Open terminal in server directory');
    console.log('   2. Run: npm run dev');
    console.log('   3. Or run: npm start');
    return false;
  }
}

// Run the check
if (require.main === module) {
  checkServer();
}

module.exports = { checkServer };
