// Check if join requests still exist
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Project_management';

const joinRequestSchema = new mongoose.Schema({
  workspace: String,
  user: String,
  message: String,
  status: String,
  createdAt: Date
}, { collection: 'joinrequests' });

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

async function checkRequests() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const workspaceId = '691c95ceeb4c268848d0ea39';
    const userId = '69242efa4080597dfbe288d0';

    console.log(`\n🔍 Checking join requests for:`);
    console.log(`   Workspace: ${workspaceId}`);
    console.log(`   User: ${userId}\n`);
    
    const requests = await JoinRequest.find({
      workspace: workspaceId,
      user: userId
    });

    if (requests.length === 0) {
      console.log('✅ No join requests found (database is clean)');
    } else {
      console.log(`⚠️ Found ${requests.length} join request(s):`);
      requests.forEach((req, index) => {
        console.log(`\n${index + 1}. Request ID: ${req._id}`);
        console.log(`   Status: ${req.status}`);
        console.log(`   Created: ${req.createdAt}`);
        console.log(`   Message: ${req.message || 'None'}`);
      });
    }

    // Check all join requests in collection
    console.log('\n📊 Total join requests in database:');
    const allRequests = await JoinRequest.find({});
    console.log(`   Total: ${allRequests.length} request(s)`);
    
    if (allRequests.length > 0) {
      console.log('\n📋 All join requests:');
      allRequests.forEach((req, index) => {
        console.log(`${index + 1}. Workspace: ${req.workspace}, User: ${req.user}, Status: ${req.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkRequests();
