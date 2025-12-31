/**
 * Verify tasks created for SARTTHI workspace projects
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function verifyTasks() {
  try {
    console.log('🔍 Verifying tasks for SARTTHI workspace projects...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Workspace = require('../src/models/Workspace').default;
    const Project = require('../src/models/Project').default;
    const Task = require('../src/models/Task').default;

    // Find SARTTHI workspace
    const workspace = await Workspace.findById('6943e2443f0342ebf25edf61');
    console.log(`📊 Workspace: ${workspace.name}\n`);

    // Find all projects in workspace
    const projects = await Project.find({ workspace: workspace._id.toString() });
    console.log(`📁 Found ${projects.length} projects in workspace:\n`);

    let totalTasks = 0;

    // For each project, count and display tasks
    for (const project of projects) {
      const tasks = await Task.find({ project: project._id });
      totalTasks += tasks.length;
      
      console.log(`\n📁 ${project.name}`);
      console.log(`   Status: ${project.status} | Priority: ${project.priority}`);
      console.log(`   Tasks: ${tasks.length}`);
      
      if (tasks.length > 0) {
        console.log(`   Task breakdown:`);
        
        // Group by status
        const byStatus = {};
        const byPriority = {};
        const byType = {};
        
        tasks.forEach(task => {
          byStatus[task.status] = (byStatus[task.status] || 0) + 1;
          byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
          byType[task.type] = (byType[task.type] || 0) + 1;
        });
        
        console.log(`     Status: ${JSON.stringify(byStatus)}`);
        console.log(`     Priority: ${JSON.stringify(byPriority)}`);
        console.log(`     Type: ${JSON.stringify(byType)}`);
        
        // Show first 3 tasks
        console.log(`   Sample tasks:`);
        tasks.slice(0, 3).forEach(task => {
          console.log(`     - ${task.title} (${task.status}, ${task.priority})`);
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✨ Summary:`);
    console.log(`   Workspace: ${workspace.name}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Total Tasks: ${totalTasks}`);
    console.log(`   Average Tasks per Project: ${(totalTasks / projects.length).toFixed(1)}`);
    console.log('\n' + '='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

verifyTasks();
