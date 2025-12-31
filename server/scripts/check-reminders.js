const mongoose = require('mongoose');
require('dotenv').config();

async function checkReminders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Reminder = require('./src/models/Reminder').Reminder;
    const count = await Reminder.countDocuments();
    console.log(`\n✅ Total reminders in database: ${count}\n`);
    
    const remindersByType = await Reminder.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('📊 Reminders by type:');
    remindersByType.forEach(r => console.log(`   ${r._id}: ${r.count}`));
    
    const remindersByPriority = await Reminder.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Reminders by priority:');
    remindersByPriority.forEach(r => console.log(`   ${r._id}: ${r.count}`));
    
    const completedCount = await Reminder.countDocuments({ completed: true });
    const pendingCount = await Reminder.countDocuments({ completed: false });
    
    console.log('\n📊 Reminders by status:');
    console.log(`   Completed: ${completedCount}`);
    console.log(`   Pending: ${pendingCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkReminders();
