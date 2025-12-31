/**
 * Seed Script: Add Sample Reminders for All Users
 * 
 * This script creates comprehensive sample reminders for all existing users in the database.
 * It ensures all reminders have realistic data matching the database schema and application structure.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models - will be loaded after mongoose connection
let User, Workspace, Project, Reminder;

// Reminder templates with diverse, realistic data
// All values match the database schema exactly:
// type: ["task", "meeting", "deadline", "milestone", "personal"]
// priority: ["low", "medium", "high", "urgent"]
// notification types: ["email", "push", "sms", "slack"]
// recurring frequency: ["daily", "weekly", "monthly", "yearly"]
const reminderTemplates = [
  {
    title: 'Team Standup Meeting',
    description: 'Daily standup meeting to discuss progress, blockers, and plan for the day. Keep it brief and focused.',
    type: 'meeting',
    priority: 'medium',
    tags: ['meeting', 'standup', 'team'],
    location: 'Conference Room A',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    hasRecurring: true,
    recurringFrequency: 'daily',
    recurringInterval: 1,
    notificationTypes: ['email', 'push'],
    notificationMinutesBefore: [15, 5]
  },
  {
    title: 'Submit Monthly Report',
    description: 'Compile and submit the monthly progress report including metrics, achievements, and challenges faced during the month.',
    type: 'deadline',
    priority: 'high',
    tags: ['report', 'deadline', 'monthly'],
    hasRecurring: true,
    recurringFrequency: 'monthly',
    recurringInterval: 1,
    notificationTypes: ['email', 'slack'],
    notificationMinutesBefore: [1440, 60] // 1 day and 1 hour before
  },
  {
    title: 'Code Review Session',
    description: 'Review pull requests and provide constructive feedback to team members. Focus on code quality, best practices, and potential improvements.',
    type: 'task',
    priority: 'medium',
    tags: ['code-review', 'development', 'quality'],
    hasRecurring: false,
    notificationTypes: ['email', 'push'],
    notificationMinutesBefore: [30, 10]
  },
  {
    title: 'Project Milestone: Beta Release',
    description: 'Complete all features for beta release. Ensure thorough testing, documentation updates, and deployment preparation.',
    type: 'milestone',
    priority: 'urgent',
    tags: ['milestone', 'release', 'beta'],
    hasRecurring: false,
    notificationTypes: ['email', 'push', 'slack'],
    notificationMinutesBefore: [10080, 1440, 60] // 1 week, 1 day, 1 hour
  },
  {
    title: 'Client Presentation',
    description: 'Present project progress and demo new features to the client. Prepare slides, demo environment, and Q&A responses.',
    type: 'meeting',
    priority: 'high',
    tags: ['client', 'presentation', 'demo'],
    location: 'Client Office / Virtual',
    meetingLink: 'https://zoom.us/j/1234567890',
    hasRecurring: false,
    notificationTypes: ['email', 'push'],
    notificationMinutesBefore: [1440, 120, 30] // 1 day, 2 hours, 30 min
  },
  {
    title: 'Weekly Team Sync',
    description: 'Weekly team synchronization meeting to align on goals, discuss roadblocks, and plan for the upcoming week.',
    type: 'meeting',
    priority: 'medium',
    tags: ['meeting', 'weekly', 'sync'],
    location: 'Virtual Meeting',
    meetingLink: 'https://teams.microsoft.com/meeting/xyz',
    hasRecurring: true,
    recurringFrequency: 'weekly',
    recurringInterval: 1,
    notificationTypes: ['email', 'push'],
    notificationMinutesBefore: [60, 15]
  },
  {
    title: 'Update Dependencies',
    description: 'Review and update project dependencies to latest stable versions. Check for security vulnerabilities and breaking changes.',
    type: 'task',
    priority: 'low',
    tags: ['maintenance', 'dependencies', 'security'],
    hasRecurring: true,
    recurringFrequency: 'monthly',
    recurringInterval: 1,
    notificationTypes: ['email'],
    notificationMinutesBefore: [1440]
  },
  {
    title: 'Performance Review Preparation',
    description: 'Prepare for quarterly performance review. Document achievements, challenges, and goals for next quarter.',
    type: 'personal',
    priority: 'medium',
    tags: ['personal', 'review', 'career'],
    hasRecurring: false,
    notificationTypes: ['email', 'push'],
    notificationMinutesBefore: [10080, 1440] // 1 week, 1 day
  },
  {
    title: 'Sprint Planning Meeting',
    description: 'Plan tasks and stories for the upcoming sprint. Estimate effort, assign tasks, and set sprint goals.',
    type: 'meeting',
    priority: 'high',
    tags: ['sprint', 'planning', 'agile'],
    location: 'Conference Room B',
    meetingLink: 'https://meet.google.com/sprint-planning',
    hasRecurring: true,
    recurringFrequency: 'weekly',
    recurringInterval: 2, // Every 2 weeks
    notificationTypes: ['email', 'push', 'slack'],
    notificationMinutesBefore: [1440, 60, 15]
  },
  {
    title: 'Backup Database',
    description: 'Perform routine database backup and verify backup integrity. Store backups in secure offsite location.',
    type: 'task',
    priority: 'high',
    tags: ['backup', 'database', 'maintenance'],
    hasRecurring: true,
    recurringFrequency: 'weekly',
    recurringInterval: 1,
    notificationTypes: ['email', 'slack'],
    notificationMinutesBefore: [60]
  },
  {
    title: 'Security Patch Deployment',
    description: 'Deploy critical security patches to production environment. Follow change management process and have rollback plan ready.',
    type: 'deadline',
    priority: 'urgent',
    tags: ['security', 'deployment', 'urgent'],
    hasRecurring: false,
    notificationTypes: ['email', 'push', 'sms', 'slack'],
    notificationMinutesBefore: [2880, 1440, 120, 30] // 2 days, 1 day, 2 hours, 30 min
  },
  {
    title: 'Learning Session: New Technology',
    description: 'Dedicated time for learning new technology or framework. Complete online course module or tutorial.',
    type: 'personal',
    priority: 'low',
    tags: ['learning', 'development', 'personal'],
    hasRecurring: true,
    recurringFrequency: 'weekly',
    recurringInterval: 1,
    notificationTypes: ['push'],
    notificationMinutesBefore: [30]
  },
  {
    title: 'Customer Feedback Review',
    description: 'Review customer feedback and support tickets. Identify common issues and improvement opportunities.',
    type: 'task',
    priority: 'medium',
    tags: ['feedback', 'customer', 'improvement'],
    hasRecurring: true,
    recurringFrequency: 'weekly',
    recurringInterval: 1,
    notificationTypes: ['email'],
    notificationMinutesBefore: [1440]
  },
  {
    title: 'Annual Goal Setting',
    description: 'Set professional and personal goals for the year. Define measurable objectives and action plans.',
    type: 'personal',
    priority: 'high',
    tags: ['goals', 'planning', 'annual'],
    hasRecurring: true,
    recurringFrequency: 'yearly',
    recurringInterval: 1,
    notificationTypes: ['email', 'push'],
    notificationMinutesBefore: [43200, 10080] // 30 days, 1 week
  },
  {
    title: 'Infrastructure Cost Review',
    description: 'Review cloud infrastructure costs and optimize resource usage. Identify cost-saving opportunities.',
    type: 'task',
    priority: 'medium',
    tags: ['infrastructure', 'cost', 'optimization'],
    hasRecurring: true,
    recurringFrequency: 'monthly',
    recurringInterval: 1,
    notificationTypes: ['email', 'slack'],
    notificationMinutesBefore: [2880, 1440]
  }
];

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random items from array
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};

// Helper function to generate random date within range
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to create notifications
const createNotifications = (dueDate, notificationTypes, minutesBefore) => {
  const notifications = [];
  
  minutesBefore.forEach((minutes, index) => {
    const notificationTime = new Date(dueDate.getTime() - minutes * 60 * 1000);
    
    // Only create notification if it's in the future
    if (notificationTime > new Date()) {
      const type = notificationTypes[index % notificationTypes.length];
      notifications.push({
        type,
        time: notificationTime,
        sent: false
      });
    }
  });
  
  return notifications;
};

// Helper function to create recurring config
const createRecurring = (template, dueDate) => {
  if (!template.hasRecurring) return undefined;
  
  // Set end date 6 months to 1 year in the future
  const endDate = new Date(dueDate.getTime() + (Math.random() * 6 + 6) * 30 * 24 * 60 * 60 * 1000);
  
  return {
    frequency: template.recurringFrequency,
    interval: template.recurringInterval,
    endDate
  };
};

async function seedSampleReminders() {
  try {
    console.log('🔔 Starting sample reminder seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management');
    console.log('✅ Connected to MongoDB\n');

    // Load models after connection
    User = require('../src/models/User').default;
    Workspace = require('../src/models/Workspace').default;
    Project = require('../src/models/Project').default;
    Reminder = require('../src/models/Reminder').Reminder;

    // Fetch all users
    const users = await User.find({ isActive: true }).select('_id fullName email');
    console.log(`📊 Found ${users.length} active users\n`);

    if (users.length === 0) {
      console.log('⚠️  No users found. Please create users first.');
      process.exit(0);
    }

    // Fetch all workspaces
    const workspaces = await Workspace.find({ isActive: true }).select('_id name owner members');
    console.log(`📊 Found ${workspaces.length} active workspaces\n`);

    // Fetch all projects
    const projects = await Project.find({ isActive: true }).select('_id name workspace teamMembers');
    console.log(`📊 Found ${projects.length} active projects\n`);

    let remindersCreated = 0;
    const errors = [];

    // Create reminders for each user
    for (const user of users) {
      console.log(`\n👤 Creating reminders for: ${user.fullName} (${user.email})`);
      
      // Find workspaces where user is a member
      const userWorkspaces = workspaces.filter(ws => 
        ws.owner === user._id.toString() || 
        ws.members.some(m => m.user.toString() === user._id.toString())
      );

      // Find projects where user is a team member
      const userProjects = projects.filter(proj => 
        proj.teamMembers.some(tm => tm.user.toString() === user._id.toString())
      );

      // Determine how many reminders to create for this user (4-8 reminders)
      const reminderCount = Math.floor(Math.random() * 5) + 4;
      
      for (let i = 0; i < reminderCount; i++) {
        try {
          const template = getRandomItem(reminderTemplates);
          
          // Select a random project or workspace (30% chance for project-related reminders)
          const useProject = userProjects.length > 0 && Math.random() > 0.7;
          const project = useProject ? getRandomItem(userProjects) : null;
          const workspace = project 
            ? workspaces.find(ws => ws._id.toString() === project.workspace.toString())
            : (userWorkspaces.length > 0 && Math.random() > 0.5 ? getRandomItem(userWorkspaces) : null);

          // Select assignedTo (could be the user or another team member for meetings)
          let assignedTo = user._id;
          if (template.type === 'meeting' && project && project.teamMembers.length > 1 && Math.random() > 0.6) {
            const otherMembers = project.teamMembers.filter(tm => tm.user.toString() !== user._id.toString());
            if (otherMembers.length > 0) {
              assignedTo = getRandomItem(otherMembers).user;
            }
          }

          // Calculate dates
          const now = new Date();
          
          // Mix of past, present, and future reminders
          const timeOffset = Math.random();
          let dueDate;
          let completed = false;
          let completedAt = undefined;
          
          if (timeOffset < 0.2) {
            // 20% - Past reminders (completed)
            dueDate = getRandomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now);
            completed = true;
            completedAt = getRandomDate(dueDate, now);
          } else if (timeOffset < 0.3) {
            // 10% - Overdue reminders (not completed)
            dueDate = getRandomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now);
            completed = false;
          } else {
            // 70% - Future reminders
            dueDate = getRandomDate(now, new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000));
            completed = false;
          }

          // Create reminder object
          const reminderData = {
            title: `${template.title} - ${user.fullName.split(' ')[0]}`,
            description: template.description,
            type: template.type,
            priority: template.priority,
            dueDate,
            completed,
            completedAt,
            createdBy: user._id,
            assignedTo: template.type === 'personal' ? undefined : assignedTo,
            project: project?._id,
            workspace: workspace?._id,
            tags: template.tags,
            location: template.location,
            meetingLink: template.meetingLink,
            isActive: true
          };

          // Add recurring configuration
          if (template.hasRecurring && !completed) {
            reminderData.recurring = createRecurring(template, dueDate);
          }

          // Add notifications (only for future reminders)
          if (!completed && dueDate > now) {
            reminderData.notifications = createNotifications(
              dueDate,
              template.notificationTypes,
              template.notificationMinutesBefore
            );
          } else {
            reminderData.notifications = [];
          }

          // Add notes for some reminders
          if (Math.random() > 0.6) {
            const noteOptions = [
              'Important: Please review the agenda before the meeting.',
              'Reminder: Bring your laptop and charger.',
              'Note: This is a high-priority item.',
              'Follow-up required after completion.',
              'Coordinate with team members beforehand.',
              'Prepare presentation materials in advance.'
            ];
            reminderData.notes = getRandomItem(noteOptions);
          }

          // Add Slack channel for team-related reminders
          if (workspace && template.notificationTypes.includes('slack') && Math.random() > 0.5) {
            reminderData.slackChannelId = `C${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
          }

          // Set expiresAt (30 days after due date for completed, or 30 days from now for active)
          if (completed) {
            reminderData.expiresAt = new Date(completedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
          } else {
            reminderData.expiresAt = new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          }

          // Create the reminder
          const reminder = new Reminder(reminderData);
          await reminder.save();
          
          remindersCreated++;
          const status = completed ? '✓ completed' : (dueDate < now ? '⚠ overdue' : '○ upcoming');
          console.log(`   ✅ Created: ${reminder.title} (${reminder.type}, ${status})`);

        } catch (error) {
          errors.push({ user: user.email, error: error.message });
          console.log(`   ❌ Error creating reminder: ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✨ Reminder seeding completed!`);
    console.log(`   🔔 Total reminders created: ${remindersCreated}`);
    console.log(`   👥 Users processed: ${users.length}`);
    console.log(`   ❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(err => {
        console.log(`   - ${err.user}: ${err.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

// Run the seed script
seedSampleReminders();
