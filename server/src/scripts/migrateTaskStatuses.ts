import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const migrateTaskStatuses = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const tasksCollection = db.collection('tasks');

    // Status mapping
    const statusMapping: { [key: string]: string } = {
      'todo': 'pending',
      'in-review': 'in-progress',
      'done': 'completed',
      'cancelled': 'blocked'
    };

    // Priority mapping
    const priorityMapping: { [key: string]: string } = {
      'urgent': 'critical'
    };

    let statusUpdated = 0;
    let priorityUpdated = 0;

    // Update statuses
    for (const [oldStatus, newStatus] of Object.entries(statusMapping)) {
      const result = await tasksCollection.updateMany(
        { status: oldStatus },
        { $set: { status: newStatus } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✓ Updated ${result.modifiedCount} tasks from '${oldStatus}' to '${newStatus}'`);
        statusUpdated += result.modifiedCount;
      }
    }

    // Update priorities
    for (const [oldPriority, newPriority] of Object.entries(priorityMapping)) {
      const result = await tasksCollection.updateMany(
        { priority: oldPriority },
        { $set: { priority: newPriority } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✓ Updated ${result.modifiedCount} tasks from priority '${oldPriority}' to '${newPriority}'`);
        priorityUpdated += result.modifiedCount;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Status updated: ${statusUpdated} tasks`);
    console.log(`   ✅ Priority updated: ${priorityUpdated} tasks`);

    await mongoose.disconnect();
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateTaskStatuses();
