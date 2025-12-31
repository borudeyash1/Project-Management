/**
 * Simple test script to create one project in SARTTHI workspace
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function testProjectCreation() {
  try {
    console.log('🧪 Testing project creation...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = require('../src/models/User').default;
    const Workspace = require('../src/models/Workspace').default;
    const Project = require('../src/models/Project').default;

    // Find SARTTHI workspace
    const workspace = await Workspace.findById('6943e2443f0342ebf25edf61');
    console.log(`✅ Found workspace: ${workspace.name}\n`);

    // Get first member
    const member = await User.findById(workspace.members[0].user);
    console.log(`✅ Found member: ${member.fullName}\n`);

    // Create test project
    const project = new Project({
      name: 'Test Project',
      description: 'This is a test project',
      workspace: workspace._id.toString(),
      tier: 'pro',
      createdBy: member._id.toString(),
      teamMembers: [{
        user: member._id,
        role: 'project-manager',
        permissions: {
          canEdit: true,
          canDelete: true,
          canManageMembers: true,
          canViewReports: true
        }
      }],
      status: 'active',
      priority: 'medium',
      category: 'Test',
      tags: ['test'],
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 0,
      isActive: true
    });

    await project.save();
    console.log(`✅ Created project: ${project.name} (${project._id})\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

testProjectCreation();
