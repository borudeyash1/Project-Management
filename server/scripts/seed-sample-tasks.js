/**
 * Seed Script: Add Sample Tasks for All Users
 * 
 * This script creates comprehensive sample tasks for all existing users in the database.
 * It ensures all tasks have realistic data matching the database schema and application structure.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models - will be loaded after mongoose connection
let User, Workspace, Project, Task;

// Task templates with diverse, realistic data
// All values match the database schema exactly:
// status: ["pending", "todo", "in-progress", "review", "in-review", "completed", "done", "blocked", "verified"]
// priority: ["low", "medium", "high", "critical"]
// type: ["task", "bug", "feature", "story", "epic"]
// taskType: ["general", "submission", "task"]
const taskTemplates = [
  {
    title: 'Implement User Authentication Flow',
    description: 'Design and implement a secure user authentication system with JWT tokens, refresh tokens, and email verification. Include password reset functionality and rate limiting.',
    type: 'feature',
    priority: 'high',
    status: 'in-progress',
    category: 'Backend',
    tags: ['authentication', 'security', 'backend'],
    estimatedHours: 16,
    actualHours: 8,
    progress: 50,
    requiresFile: false,
    requiresLink: false,
    taskType: 'general'
  },
  {
    title: 'Fix Dashboard Loading Performance Issue',
    description: 'Dashboard is taking 5+ seconds to load. Investigate and optimize database queries, implement caching, and reduce bundle size. Target: < 2 seconds load time.',
    type: 'bug',
    priority: 'critical',
    status: 'todo',
    category: 'Frontend',
    tags: ['performance', 'optimization', 'dashboard'],
    estimatedHours: 8,
    actualHours: 0,
    progress: 0,
    requiresFile: false,
    requiresLink: true,
    taskType: 'general'
  },
  {
    title: 'Design Mobile App Wireframes',
    description: 'Create comprehensive wireframes for the mobile application including user flows, screen designs, and interaction patterns. Focus on intuitive navigation and accessibility.',
    type: 'task',
    priority: 'medium',
    status: 'done',
    category: 'Design',
    tags: ['design', 'mobile', 'wireframes', 'ux'],
    estimatedHours: 12,
    actualHours: 14,
    progress: 100,
    requiresFile: true,
    requiresLink: false,
    taskType: 'submission'
  },
  {
    title: 'API Documentation Update',
    description: 'Update API documentation to reflect recent changes in endpoints. Include examples, error codes, and authentication requirements. Use OpenAPI 3.0 specification.',
    type: 'task',
    priority: 'low',
    status: 'review',
    category: 'Documentation',
    tags: ['documentation', 'api', 'openapi'],
    estimatedHours: 6,
    actualHours: 5,
    progress: 90,
    requiresFile: false,
    requiresLink: true,
    taskType: 'general'
  },
  {
    title: 'Implement Real-time Notifications',
    description: 'Add WebSocket support for real-time notifications. Include push notifications for mobile, email notifications, and in-app notification center with read/unread status.',
    type: 'feature',
    priority: 'high',
    status: 'in-progress',
    category: 'Backend',
    tags: ['websocket', 'notifications', 'real-time'],
    estimatedHours: 20,
    actualHours: 12,
    progress: 60,
    requiresFile: false,
    requiresLink: false,
    taskType: 'general'
  },
  {
    title: 'Database Migration Script',
    description: 'Create migration script to update user schema with new profile fields. Ensure backward compatibility and data integrity. Include rollback mechanism.',
    type: 'task',
    priority: 'medium',
    status: 'blocked',
    category: 'Database',
    tags: ['migration', 'database', 'schema'],
    estimatedHours: 4,
    actualHours: 2,
    progress: 30,
    requiresFile: false,
    requiresLink: false,
    taskType: 'general'
  },
  {
    title: 'User Onboarding Flow Enhancement',
    description: 'Improve the user onboarding experience with interactive tutorials, progress tracking, and personalized recommendations based on user role and preferences.',
    type: 'story',
    priority: 'medium',
    status: 'pending',
    category: 'Frontend',
    tags: ['onboarding', 'ux', 'tutorial'],
    estimatedHours: 24,
    actualHours: 0,
    progress: 0,
    requiresFile: false,
    requiresLink: false,
    taskType: 'general'
  },
  {
    title: 'Security Audit and Penetration Testing',
    description: 'Conduct comprehensive security audit including OWASP Top 10 vulnerabilities, SQL injection, XSS, CSRF protection. Document findings and remediation steps.',
    type: 'task',
    priority: 'critical',
    status: 'todo',
    category: 'Security',
    tags: ['security', 'audit', 'testing'],
    estimatedHours: 40,
    actualHours: 0,
    progress: 0,
    requiresFile: true,
    requiresLink: false,
    taskType: 'submission'
  },
  {
    title: 'Implement Dark Mode Theme',
    description: 'Add dark mode support across the entire application. Ensure proper contrast ratios, smooth transitions, and user preference persistence. Support system theme detection.',
    type: 'feature',
    priority: 'low',
    status: 'verified',
    category: 'Frontend',
    tags: ['theme', 'dark-mode', 'ui'],
    estimatedHours: 10,
    actualHours: 11,
    progress: 100,
    requiresFile: false,
    requiresLink: false,
    taskType: 'general'
  },
  {
    title: 'Integrate Third-Party Payment Gateway',
    description: 'Integrate Stripe payment gateway for subscription management. Include webhook handling, invoice generation, and payment failure recovery mechanisms.',
    type: 'feature',
    priority: 'high',
    status: 'in-review',
    category: 'Backend',
    tags: ['payment', 'stripe', 'integration'],
    estimatedHours: 32,
    actualHours: 28,
    progress: 95,
    requiresFile: false,
    requiresLink: true,
    taskType: 'general'
  },
  {
    title: 'Optimize Image Upload and Processing',
    description: 'Implement image compression, thumbnail generation, and CDN integration. Support multiple formats and automatic format conversion for optimal delivery.',
    type: 'task',
    priority: 'medium',
    status: 'todo',
    category: 'Backend',
    tags: ['images', 'optimization', 'cdn'],
    estimatedHours: 12,
    actualHours: 0,
    progress: 0,
    requiresFile: false,
    requiresLink: false,
    taskType: 'task'
  },
  {
    title: 'Create Automated Testing Suite',
    description: 'Set up comprehensive automated testing including unit tests, integration tests, and E2E tests. Achieve minimum 80% code coverage. Configure CI/CD pipeline.',
    type: 'epic',
    priority: 'high',
    status: 'in-progress',
    category: 'Testing',
    tags: ['testing', 'automation', 'ci-cd'],
    estimatedHours: 60,
    actualHours: 35,
    progress: 58,
    requiresFile: false,
    requiresLink: false,
    taskType: 'general'
  }
];

// Subtask templates
const subtaskTemplates = [
  { title: 'Research best practices and libraries', completed: true },
  { title: 'Create database schema', completed: true },
  { title: 'Implement core functionality', completed: false },
  { title: 'Write unit tests', completed: false },
  { title: 'Code review and refactoring', completed: false },
  { title: 'Update documentation', completed: false }
];

// Comment templates
const commentTemplates = [
  'Great progress on this! The implementation looks solid.',
  'I found a potential issue with the edge case handling. Let\'s discuss.',
  'Updated the requirements based on client feedback.',
  'This is blocked by the API changes. Moving to blocked status.',
  'Code review completed. Approved with minor suggestions.',
  'Added additional test cases to cover edge scenarios.',
  'Performance metrics look good. Ready for production.',
  'Need clarification on the acceptance criteria.'
];

// Link templates
const linkTemplates = [
  'https://github.com/project/repo/pull/123',
  'https://docs.google.com/document/d/sample-doc-id',
  'https://www.figma.com/file/sample-design',
  'https://jira.company.com/browse/PROJ-123',
  'https://confluence.company.com/wiki/spaces/PROJ'
];

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random items from array
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to generate random date within range
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to create subtasks
const createSubtasks = (template) => {
  const count = Math.floor(Math.random() * 4) + 2; // 2-5 subtasks
  const subtasks = getRandomItems(subtaskTemplates, count);
  return subtasks.map(st => ({
    ...st,
    completedAt: st.completed ? getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) : undefined
  }));
};

// Helper function to create time entries
const createTimeEntries = (assigneeId, hours) => {
  if (hours === 0) return [];
  
  const entries = [];
  const entryCount = Math.floor(hours / 2) + 1; // Create multiple time entries
  let remainingHours = hours;
  
  for (let i = 0; i < entryCount && remainingHours > 0; i++) {
    const duration = Math.min(remainingHours, Math.random() * 4 + 1); // 1-5 hours per entry
    const startTime = getRandomDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), new Date());
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    entries.push({
      user: assigneeId,
      description: getRandomItem([
        'Working on implementation',
        'Code review and refactoring',
        'Testing and debugging',
        'Documentation updates',
        'Research and planning'
      ]),
      startTime,
      endTime,
      duration: duration * 60 * 60 * 1000, // Convert to milliseconds
      isActive: false
    });
    
    remainingHours -= duration;
  }
  
  return entries;
};

// Helper function to create rating details
const createRatingDetails = (status) => {
  if (status !== 'done' && status !== 'verified') return undefined;
  
  const baseRating = Math.random() * 2 + 3; // 3-5 rating
  
  return {
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
    comments: 'Excellent work! Met all requirements and delivered on time.',
    ratedAt: new Date()
  };
};

async function seedSampleTasks() {
  try {
    console.log('🌱 Starting sample task seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management');
    console.log('✅ Connected to MongoDB\n');

    // Load models after connection
    User = require('../src/models/User').default;
    Workspace = require('../src/models/Workspace').default;
    Project = require('../src/models/Project').default;
    Task = require('../src/models/Task').default;

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

    let tasksCreated = 0;
    const errors = [];

    // Create tasks for each user
    for (const user of users) {
      console.log(`\n👤 Creating tasks for: ${user.fullName} (${user.email})`);
      
      // Find workspaces where user is a member
      const userWorkspaces = workspaces.filter(ws => 
        ws.owner === user._id.toString() || 
        ws.members.some(m => m.user.toString() === user._id.toString())
      );

      // Find projects where user is a team member
      const userProjects = projects.filter(proj => 
        proj.teamMembers.some(tm => tm.user.toString() === user._id.toString())
      );

      // Determine how many tasks to create for this user (3-6 tasks)
      const taskCount = Math.floor(Math.random() * 4) + 3;
      
      for (let i = 0; i < taskCount; i++) {
        try {
          const template = getRandomItem(taskTemplates);
          
          // Select a random project or workspace
          const useProject = userProjects.length > 0 && Math.random() > 0.3;
          const project = useProject ? getRandomItem(userProjects) : null;
          const workspace = project 
            ? workspaces.find(ws => ws._id.toString() === project.workspace.toString())
            : (userWorkspaces.length > 0 ? getRandomItem(userWorkspaces) : null);

          // Select reporter (could be the user or another team member)
          let reporter = user._id;
          if (project && project.teamMembers.length > 1 && Math.random() > 0.5) {
            const otherMembers = project.teamMembers.filter(tm => tm.user.toString() !== user._id.toString());
            if (otherMembers.length > 0) {
              reporter = getRandomItem(otherMembers).user;
            }
          }

          // Calculate dates
          const now = new Date();
          const startDate = getRandomDate(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), now);
          const dueDate = getRandomDate(now, new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000));
          const completedDate = (template.status === 'done' || template.status === 'verified') 
            ? getRandomDate(startDate, dueDate) 
            : undefined;

          // Create task object
          const taskData = {
            title: `${template.title} - ${user.fullName.split(' ')[0]}`,
            description: template.description,
            project: project?._id,
            workspace: workspace?._id,
            assignee: user._id,
            reporter: reporter,
            status: template.status,
            priority: template.priority,
            type: template.type,
            taskType: template.taskType,
            requiresFile: template.requiresFile,
            requiresLink: template.requiresLink,
            category: template.category,
            tags: template.tags,
            startDate,
            dueDate,
            completedDate,
            estimatedHours: template.estimatedHours,
            actualHours: template.actualHours,
            progress: template.progress,
            subtasks: createSubtasks(template),
            timeEntries: createTimeEntries(user._id, template.actualHours),
            isActive: true
          };

          // Add links if required
          if (template.requiresLink) {
            taskData.links = getRandomItems(linkTemplates, Math.floor(Math.random() * 2) + 1);
          }

          // Add comments (1-3 comments for active tasks)
          if (['in-progress', 'review', 'in-review', 'done', 'verified'].includes(template.status)) {
            const commentCount = Math.floor(Math.random() * 3) + 1;
            taskData.comments = [];
            for (let c = 0; c < commentCount; c++) {
              taskData.comments.push({
                content: getRandomItem(commentTemplates),
                author: Math.random() > 0.5 ? user._id : reporter,
                createdAt: getRandomDate(startDate, new Date()),
                isEdited: Math.random() > 0.7
              });
            }
          }

          // Add rating for completed tasks
          if (template.status === 'done' || template.status === 'verified') {
            taskData.ratingDetails = createRatingDetails(template.status);
            taskData.rating = taskData.ratingDetails.overallRating;
            if (template.status === 'verified') {
              taskData.verifiedBy = reporter;
              taskData.verifiedAt = completedDate;
            }
          }

          // Create custom fields (random 0-2 fields)
          if (Math.random() > 0.6) {
            const customFieldCount = Math.floor(Math.random() * 3);
            taskData.customFields = [];
            const fieldOptions = [
              { name: 'Environment', value: getRandomItem(['Development', 'Staging', 'Production']), type: 'select' },
              { name: 'Browser Compatibility', value: 'Chrome, Firefox, Safari', type: 'text' },
              { name: 'API Version', value: 'v2.1.0', type: 'text' },
              { name: 'Requires Deployment', value: true, type: 'boolean' },
              { name: 'Estimated Cost', value: Math.floor(Math.random() * 5000) + 500, type: 'number' }
            ];
            taskData.customFields = getRandomItems(fieldOptions, customFieldCount);
          }

          // Create the task
          const task = new Task(taskData);
          await task.save();
          
          tasksCreated++;
          console.log(`   ✅ Created: ${task.title} (${task.status})`);

        } catch (error) {
          errors.push({ user: user.email, error: error.message });
          console.log(`   ❌ Error creating task: ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✨ Task seeding completed!`);
    console.log(`   📝 Total tasks created: ${tasksCreated}`);
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
seedSampleTasks();
