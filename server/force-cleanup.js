// Force delete ALL join requests for the user/workspace combination
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

async function forceCleanup() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const workspaceId = '691c95ceeb4c268848d0ea39';
    const userId = '69242efa4080597dfbe288d0';

    console.log(`\n🔍 Looking for ALL join requests (any status):`);
    console.log(`   Workspace: ${workspaceId}`);
    console.log(`   User: ${userId}\n`);
    
    // Find all requests regardless of status
    const allRequests = await JoinRequest.find({
      workspace: workspaceId,
      user: userId
    });

    console.log(`Found ${allRequests.length} request(s):`);
    allRequests.forEach((req, index) => {
      console.log(`${index + 1}. ID: ${req._id}, Status: ${req.status}, Created: ${req.createdAt}`);
    });

    if (allRequests.length > 0) {
      console.log(`\n🗑️ Deleting ALL ${allRequests.length} request(s)...`);
      
      const result = await JoinRequest.deleteMany({
        workspace: workspaceId,
        user: userId
      });

      console.log(`✅ Deleted ${result.deletedCount} request(s)`);
    } else {
      console.log('✅ No requests found - database is already clean');
    }

    // Double-check
    const remaining = await JoinRequest.find({
      workspace: workspaceId,
      user: userId
    });

    if (remaining.length === 0) {
      console.log('\n✅ VERIFIED: No requests remaining in database');
      console.log('✅ User can now send a fresh join request!');
    } else {
      console.log(`\n⚠️ WARNING: Still found ${remaining.length} request(s)!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

forceCleanup();
