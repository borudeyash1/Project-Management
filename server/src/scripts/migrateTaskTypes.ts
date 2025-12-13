import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from '../models/Task';

dotenv.config();

const migrateTaskTypes = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all tasks
    const tasks = await Task.find({});
    console.log(`📊 Found ${tasks.length} tasks to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const task of tasks) {
      let needsUpdate = false;
      const updates: any = {};

      // Set taskType if not present
      if (!task.taskType) {
        updates.taskType = 'general';
        needsUpdate = true;
      }

      // Initialize requiresFile if not present
      if (task.requiresFile === undefined) {
        updates.requiresFile = false;
        needsUpdate = true;
      }

      // Initialize requiresLink if not present
      if (task.requiresLink === undefined) {
        updates.requiresLink = false;
        needsUpdate = true;
      }

      // Initialize links array if not present
      if (!task.links) {
        updates.links = [];
        needsUpdate = true;
      }

      // Initialize files array if not present
      if (!task.files) {
        updates.files = [];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Task.findByIdAndUpdate(task._id, updates);
        updated++;
        console.log(`✓ Updated task: ${task.title}`);
      } else {
        skipped++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Updated: ${updated} tasks`);
    console.log(`   ⏭️  Skipped: ${skipped} tasks (already migrated)`);
    console.log(`   📊 Total: ${tasks.length} tasks`);

    await mongoose.disconnect();
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateTaskTypes();
