// Cleanup script to remove duplicate join requests
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Project_management';

const joinRequestSchema = new mongoose.Schema({
  workspace: String,
  user: String,
  message: String,
  status: String,
  createdAt: Date
});

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

async function cleanup() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all join requests for the specific workspace and user
    const workspaceId = '691c95ceeb4c268848d0ea39';
    const userId = '69242efa4080597dfbe288d0';

    console.log(`🗑️ Deleting join requests for workspace: ${workspaceId}, user: ${userId}`);
    
    const result = await JoinRequest.deleteMany({
      workspace: workspaceId,
      user: userId
    });

    console.log(`✅ Deleted ${result.deletedCount} join request(s)`);

    // Optionally, delete ALL duplicate join requests (cleanup entire collection)
    console.log('\n🔍 Checking for other duplicate join requests...');
    
    const allRequests = await JoinRequest.find({});
    const seen = new Set();
    const duplicates = [];

    for (const req of allRequests) {
      const key = `${req.workspace}_${req.user}`;
      if (seen.has(key)) {
        duplicates.push(req._id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      console.log(`🗑️ Found ${duplicates.length} duplicate join requests, deleting...`);
      await JoinRequest.deleteMany({ _id: { $in: duplicates } });
      console.log(`✅ Deleted ${duplicates.length} duplicate(s)`);
    } else {
      console.log('✅ No other duplicates found');
    }

    console.log('\n✅ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

cleanup();
