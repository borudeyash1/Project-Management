const mongoose = require('mongoose');
require('dotenv').config();

async function checkTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Task = require('./src/models/Task').default;
    const count = await Task.countDocuments();
    console.log(`\n✅ Total tasks in database: ${count}\n`);
    
    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('📊 Tasks by status:');
    tasksByStatus.forEach(s => console.log(`   ${s._id}: ${s.count}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTasks();
