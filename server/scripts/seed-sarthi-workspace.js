/**
 * Comprehensive Seed Script for SARTTHI Workspace - Fixed Version
 * Creates projects and tasks with all enum values matching frontend exactly
 */

const mongoose = require('mongoose');
require('dotenv').config();

let User, Workspace, Project, Task, Reminder;

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function seedSarthiWorkspace() {
  try {
    console.log('🚀 Starting SARTTHI workspace comprehensive seeding...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Load models
    User = require('../src/models/User').default;
    Workspace = require('../src/models/Workspace').default;
    Project = require('../src/models/Project').default;
    Task = require('../src/models/Task').default;
    Reminder = require('../src/models/Reminder').Reminder;

    // Find SARTTHI workspace
    const workspace = await Workspace.findById('6943e2443f0342ebf25edf61');
    console.log(`✅ Found workspace: ${workspace.name}\n`);

    // Get members
    const memberIds = workspace.members.map(m => m.user);
    const members = await User.find({ _id: { $in: memberIds } }).select('_id fullName email');
    console.log(`📊 Found ${members.length} members\n`);

    const owner = members[0];
    let stats = { projects: 0, tasks: 0, reminders: 0 };

    // ==================== CREATE PROJECTS ====================
    console.log('\n📁 Creating projects...');
    console.log('   Schema validation:');
    console.log('   - status: ["planning", "active", "on-hold", "completed", "cancelled"]');
    console.log('   - priority: ["low", "medium", "high", "urgent"]');
    console.log('   - tier: ["free", "pro", "ultra", "enterprise"]\n');

    const projectTemplates = [
      { name: 'E-Commerce Platform', status: 'active', priority: 'high', category: 'Web Development', tags: ['ecommerce', 'web'] },
      { name: 'Mobile App Development', status: 'active', priority: 'urgent', category: 'Mobile', tags: ['mobile', 'ios', 'android'] },
      { name: 'API Integration', status: 'planning', priority: 'medium', category: 'Backend', tags: ['api', 'integration'] },
      { name: 'Security Audit', status: 'on-hold', priority: 'high', category: 'Security', tags: ['security', 'audit'] },
      { name: 'Marketing Website', status: 'completed', priority: 'medium', category: 'Marketing', tags: ['marketing', 'seo'] },
      { name: 'Analytics Dashboard', status: 'active', priority: 'high', category: 'Analytics', tags: ['analytics', 'dashboard'] },
      { name: 'Support Portal', status: 'planning', priority: 'low', category: 'Support', tags: ['support', 'portal'] },
      { name: 'Infrastructure Migration', status: 'cancelled', priority: 'low', category: 'DevOps', tags: ['cloud', 'migration'] }
    ];

    const createdProjects = [];
    for (const template of projectTemplates) {
      const teamMembers = getRandomItems(members, Math.min(4, members.length)).map((m, idx) => ({
        user: m._id,
        role: idx === 0 ? 'project-manager' : getRandomItem(['developer', 'designer', 'tester']),
        permissions: {
          canEdit: true,
          canDelete: idx === 0,
          canManageMembers: idx === 0,
          canViewReports: true
        }
      }));

      const now = new Date();
      const startDate = getRandomDate(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), now);
      const dueDate = template.status === 'completed' 
        ? getRandomDate(startDate, now)
        : getRandomDate(now, new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000));

      const project = new Project({
        name: template.name,
        description: `${template.name} project for SARTTHI workspace`,
        workspace: workspace._id.toString(),
        tier: 'pro',
        createdBy: owner._id.toString(),
        teamMembers,
        status: template.status,
        priority: template.priority,
        category: template.category,
        tags: template.tags,
        startDate,
        dueDate,
        completedDate: template.status === 'completed' ? dueDate : undefined,
        progress: template.status === 'completed' ? 100 :
                 template.status === 'active' ? Math.floor(Math.random() * 60) + 20 :
                 template.status === 'planning' ? Math.floor(Math.random() * 20) : 0,
        isActive: template.status !== 'cancelled'
      });

      await project.save();
      createdProjects.push(project);
      stats.projects++;
      console.log(`   ✅ ${project.name} (${project.status}, ${project.priority})`);
    }

    // ==================== CREATE TASKS ====================
    console.log('\n✅ Creating tasks for each project...');
    console.log('   Schema validation:');
    console.log('   - status: ["pending", "todo", "in-progress", "review", "in-review", "done", "blocked", "verified"]');
    console.log('   - priority: ["low", "medium", "high", "critical"]');
    console.log('   - type: ["task", "bug", "feature", "story", "epic"]\n');

    const taskTemplates = [
      { title: 'Setup Development Environment', type: 'task', priority: 'high', status: 'done', category: 'Setup' },
      { title: 'Implement Authentication', type: 'feature', priority: 'critical', status: 'in-progress', category: 'Backend' },
      { title: 'Fix Login Bug', type: 'bug', priority: 'critical', status: 'in-review', category: 'Frontend' },
      { title: 'Design UI Components', type: 'task', priority: 'high', status: 'review', category: 'Design' },
      { title: 'Database Schema Design', type: 'task', priority: 'medium', status: 'todo', category: 'Database' },
      { title: 'Performance Optimization', type: 'task', priority: 'high', status: 'in-progress', category: 'Performance' },
      { title: 'Write Unit Tests', type: 'task', priority: 'medium', status: 'pending', category: 'Testing' },
      { title: 'API Documentation', type: 'task', priority: 'low', status: 'todo', category: 'Documentation' },
      { title: 'Payment Integration', type: 'feature', priority: 'critical', status: 'verified', category: 'Integration' },
      { title: 'Security Patch', type: 'bug', priority: 'critical', status: 'blocked', category: 'Security' }
    ];

    for (const project of createdProjects) {
      const tasksPerProject = Math.floor(Math.random() * 4) + 5; // 5-8 tasks
      
      for (let i = 0; i < tasksPerProject; i++) {
        const template = getRandomItem(taskTemplates);
        const assignee = getRandomItem(project.teamMembers).user;
        const reporter = project.teamMembers[0].user;

        const now = new Date();
        const startDate = getRandomDate(new Date(project.startDate), now);
        const dueDate = getRandomDate(now, new Date(project.dueDate));
        const completedDate = (['done', 'verified'].includes(template.status))
          ? getRandomDate(startDate, dueDate)
          : undefined;

        const estimatedHours = Math.floor(Math.random() * 25) + 5;
        const actualHours = ['done', 'verified'].includes(template.status)
          ? estimatedHours + Math.floor(Math.random() * 10) - 5
          : template.status === 'in-progress' ? Math.floor(estimatedHours * 0.6) : 0;

        const taskData = {
          title: `${template.title} - ${project.name.split(' ')[0]}`,
          description: `Detailed task for ${template.title.toLowerCase()} in ${project.name}`,
          project: project._id,
          workspace: workspace._id,
          assignee,
          reporter,
          status: template.status,
          priority: template.priority,
          type: template.type,
          taskType: 'general',
          category: template.category,
          tags: project.tags,
          startDate,
          dueDate,
          completedDate,
          estimatedHours,
          actualHours,
          progress: template.status === 'done' || template.status === 'verified' ? 100 :
                   template.status === 'in-progress' ? Math.floor(Math.random() * 40) + 40 :
                   template.status === 'review' || template.status === 'in-review' ? Math.floor(Math.random() * 20) + 70 :
                   Math.floor(Math.random() * 30),
          subtasks: [
            { title: 'Research and planning', completed: true, completedAt: startDate },
            { title: 'Implementation', completed: ['done', 'verified', 'in-review', 'review'].includes(template.status) },
            { title: 'Testing', completed: ['done', 'verified'].includes(template.status) }
          ],
          comments: ['in-progress', 'review', 'in-review', 'done', 'verified'].includes(template.status) ? [
            {
              content: 'Started working on this task.',
              author: assignee,
              createdAt: startDate,
              isEdited: false
            }
          ] : [],
          timeEntries: actualHours > 0 ? [
            {
              user: assignee,
              description: 'Working on implementation',
              startTime: startDate,
              endTime: new Date(startDate.getTime() + actualHours * 60 * 60 * 1000),
              duration: actualHours * 60 * 60 * 1000,
              isActive: false
            }
          ] : [],
          isActive: true
        };

        // Add rating for completed tasks
        if (template.status === 'done' || template.status === 'verified') {
          const baseRating = Math.random() * 1.5 + 3.5;
          taskData.ratingDetails = {
            timeliness: Math.round((baseRating + (Math.random() - 0.5)) * 10) / 10,
            quality: Math.round((baseRating + (Math.random() - 0.5)) * 10) / 10,
            effort: Math.round((baseRating + (Math.random() - 0.5)) * 10) / 10,
            accuracy: Math.round((baseRating + (Math.random() - 0.5)) * 10) / 10,
            collaboration: Math.round((baseRating + (Math.random() - 0.5)) * 10) / 10,
            initiative: Math.round((baseRating + (Math.random() - 0.5)) * 10) / 10,
            reliability: Math.round((baseRating + (Math.random() - 0.5)) * 10) / 10,
            learning: Math.round((baseRating + (Math.random() - 0.5)) * 10) / 10,
            compliance: Math.round((baseRating + (Math.random() - 0.5)) * 10) / 10,
            overallRating: Math.round(baseRating * 10) / 10,
            comments: 'Excellent work! Delivered on time.',
            ratedAt: completedDate,
            ratedBy: reporter
          };
          taskData.rating = taskData.ratingDetails.overallRating;
          
          if (template.status === 'verified') {
            taskData.verifiedBy = reporter;
            taskData.verifiedAt = completedDate;
          }
        }

        const task = new Task(taskData);
        await task.save();
        stats.tasks++;
      }
      
      console.log(`   ✅ Created ${tasksPerProject} tasks for: ${project.name}`);
    }

    // ==================== CREATE REMINDERS ====================
    console.log('\n🔔 Creating reminders...');
    console.log('   Schema validation:');
    console.log('   - type: ["task", "meeting", "deadline", "milestone", "personal"]');
    console.log('   - priority: ["low", "medium", "high", "urgent"]\n');

    const reminderTemplates = [
      { title: 'Daily Standup', type: 'meeting', priority: 'medium', recurring: { frequency: 'daily', interval: 1 } },
      { title: 'Sprint Planning', type: 'meeting', priority: 'high', recurring: { frequency: 'weekly', interval: 2 } },
      { title: 'Monthly Report', type: 'deadline', priority: 'high', recurring: null },
      { title: 'Code Review', type: 'task', priority: 'medium', recurring: null },
      { title: 'Client Demo', type: 'meeting', priority: 'urgent', recurring: null }
    ];

    for (const member of members.slice(0, 5)) { // Create for first 5 members
      const reminderCount = Math.floor(Math.random() * 3) + 3; // 3-5 reminders
      
      for (let i = 0; i < reminderCount; i++) {
        const template = getRandomItem(reminderTemplates);
        const now = new Date();
        
        const timeOffset = Math.random();
        let dueDate, completed, completedAt;
        
        if (timeOffset < 0.2) {
          dueDate = getRandomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now);
          completed = true;
          completedAt = getRandomDate(dueDate, now);
        } else {
          dueDate = getRandomDate(now, new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000));
          completed = false;
        }

        const reminderData = {
          title: `${template.title} - ${member.fullName.split(' ')[0]}`,
          description: `${template.type} reminder for SARTTHI workspace`,
          type: template.type,
          priority: template.priority,
          dueDate,
          completed,
          completedAt,
          createdBy: member._id,
          assignedTo: template.type === 'personal' ? undefined : getRandomItem(members)._id,
          project: Math.random() > 0.5 ? getRandomItem(createdProjects)._id : undefined,
          workspace: workspace._id,
          tags: [template.type, template.priority],
          location: template.type === 'meeting' ? 'Conference Room A' : undefined,
          meetingLink: template.type === 'meeting' ? 'https://meet.google.com/abc-defg' : undefined,
          notifications: !completed && dueDate > now ? [
            { type: 'email', time: new Date(dueDate.getTime() - 60 * 60 * 1000), sent: false },
            { type: 'push', time: new Date(dueDate.getTime() - 15 * 60 * 1000), sent: false }
          ] : [],
          recurring: template.recurring && !completed ? {
            ...template.recurring,
            endDate: new Date(dueDate.getTime() + 180 * 24 * 60 * 60 * 1000)
          } : undefined
        };

        const reminder = new Reminder(reminderData);
        await reminder.save();
        stats.reminders++;
      }
      
      console.log(`   ✅ Created reminders for: ${member.fullName}`);
    }

    // ==================== SUMMARY ====================
    console.log('\n' + '='.repeat(60));
    console.log('\n✨ SARTTHI Workspace Seeding Completed!\n');
    console.log('📊 Summary:');
    console.log(`   Workspace: ${workspace.name}`);
    console.log(`   Members: ${members.length}`);
    console.log(`   Projects: ${stats.projects}`);
    console.log(`   Tasks: ${stats.tasks}`);
    console.log(`   Reminders: ${stats.reminders}`);
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

seedSarthiWorkspace();
