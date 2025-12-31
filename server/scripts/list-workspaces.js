const mongoose = require('mongoose');
require('dotenv').config();

async function listWorkspaces() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Workspace = require('./src/models/Workspace').default;
    const workspaces = await Workspace.find({}).select('_id name owner members');
    
    console.log(`\n📊 Found ${workspaces.length} workspaces:\n`);
    workspaces.forEach((ws, idx) => {
      console.log(`${idx + 1}. ${ws.name} (ID: ${ws._id})`);
      console.log(`   Members: ${ws.members.length}`);
      console.log(`   Owner: ${ws.owner}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listWorkspaces();
