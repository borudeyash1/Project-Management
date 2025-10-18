import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Workspace from '../src/models/Workspace';
import Project from '../src/models/Project';
import Task from '../src/models/Task';
import Team from '../src/models/Team';
import Payroll from '../src/models/Payroll';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env' });

// Test users with their plain text passwords
const testUsers = [
  {
    fullName: 'Alex Johnson',
    email: 'alex@example.com',
    username: 'alexjohnson',
    password: 'password123',
    phone: '+1 555-0102',
    designation: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    about: 'Loves building delightful product experiences.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    isEmailVerified: true,
    subscription: {
      isPro: false,
      plan: 'free'
    },
    profile: {
      jobTitle: 'Product Manager',
      company: 'TechCorp',
      industry: 'Technology',
      experience: 'senior',
      skills: [
        { name: 'Product Management', level: 'expert', category: 'management' },
        { name: 'Agile', level: 'advanced', category: 'management' },
        { name: 'User Research', level: 'intermediate', category: 'analytical' }
      ],
      workPreferences: {
        workStyle: 'collaborative',
        communicationStyle: 'direct',
        timeManagement: 'structured',
        preferredWorkingHours: { start: '09:00', end: '17:00' },
        timezone: 'UTC'
      },
      personality: {
        workingStyle: 'results-driven',
        stressLevel: 'medium',
        motivationFactors: ['growth', 'impact', 'challenge']
      },
      goals: {
        shortTerm: [
          { description: 'Launch new product feature', priority: 'high' }
        ],
        longTerm: [
          { description: 'Become VP of Product', priority: 'high' }
        ],
        careerAspirations: 'Lead product strategy for a major tech company'
      },
      learning: {
        interests: ['AI/ML', 'Data Analytics', 'Leadership'],
        currentLearning: [
          { topic: 'Machine Learning', progress: 30, startDate: new Date() }
        ]
      },
      productivity: {
        peakHours: [
          { start: '09:00', end: '11:00', dayOfWeek: 'monday' },
          { start: '09:00', end: '11:00', dayOfWeek: 'tuesday' },
          { start: '09:00', end: '11:00', dayOfWeek: 'wednesday' },
          { start: '09:00', end: '11:00', dayOfWeek: 'thursday' },
          { start: '09:00', end: '11:00', dayOfWeek: 'friday' }
        ],
        taskPreferences: {
          preferredTaskTypes: ['analytical', 'collaborative'],
          taskComplexity: 'mixed',
          deadlineSensitivity: 'moderate'
        },
        workEnvironment: {
          preferredEnvironment: 'moderate',
          collaborationPreference: 'high'
        }
      },
      aiPreferences: {
        assistanceLevel: 'comprehensive',
        preferredSuggestions: ['task-prioritization', 'time-estimation', 'resource-allocation'],
        communicationStyle: 'friendly',
        notificationPreferences: {
          taskReminders: true,
          deadlineAlerts: true,
          productivityInsights: true,
          skillRecommendations: true
        }
      }
    }
  },
  {
    fullName: 'Sarah Chen',
    email: 'sarah@example.com',
    username: 'sarahchen',
    password: 'sarah123',
    phone: '+1 555-0103',
    designation: 'UI/UX Designer',
    department: 'Design',
    location: 'San Francisco',
    about: 'Passionate about creating beautiful and functional designs.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=200&auto=format&fit=crop',
    isEmailVerified: true,
    subscription: {
      isPro: true,
      plan: 'pro'
    },
    profile: {
      jobTitle: 'Senior UI/UX Designer',
      company: 'DesignStudio',
      industry: 'Technology',
      experience: 'senior',
      skills: [
        { name: 'Figma', level: 'expert', category: 'technical' },
        { name: 'User Research', level: 'advanced', category: 'analytical' },
        { name: 'Prototyping', level: 'expert', category: 'creative' }
      ],
      workPreferences: {
        workStyle: 'collaborative',
        communicationStyle: 'creative',
        timeManagement: 'flexible',
        preferredWorkingHours: { start: '10:00', end: '18:00' },
        timezone: 'PST'
      },
      personality: {
        workingStyle: 'creative',
        stressLevel: 'low',
        motivationFactors: ['autonomy', 'creativity', 'impact']
      },
      goals: {
        shortTerm: [
          { description: 'Complete design system', priority: 'high' }
        ],
        longTerm: [
          { description: 'Lead design team', priority: 'medium' }
        ],
        careerAspirations: 'Become a design leader in a major tech company'
      },
      learning: {
        interests: ['Design Systems', 'Accessibility', 'Animation'],
        currentLearning: [
          { topic: 'Advanced Figma', progress: 60, startDate: new Date() }
        ]
      },
      productivity: {
        peakHours: [
          { start: '10:00', end: '12:00', dayOfWeek: 'monday' },
          { start: '10:00', end: '12:00', dayOfWeek: 'tuesday' },
          { start: '10:00', end: '12:00', dayOfWeek: 'wednesday' },
          { start: '10:00', end: '12:00', dayOfWeek: 'thursday' },
          { start: '10:00', end: '12:00', dayOfWeek: 'friday' }
        ],
        taskPreferences: {
          preferredTaskTypes: ['creative', 'collaborative'],
          taskComplexity: 'mixed',
          deadlineSensitivity: 'flexible'
        },
        workEnvironment: {
          preferredEnvironment: 'quiet',
          collaborationPreference: 'medium'
        }
      },
      aiPreferences: {
        assistanceLevel: 'moderate',
        preferredSuggestions: ['task-prioritization', 'skill-development'],
        communicationStyle: 'creative',
        notificationPreferences: {
          taskReminders: true,
          deadlineAlerts: false,
          productivityInsights: true,
          skillRecommendations: true
        }
      }
    }
  },
  {
    fullName: 'Mike Rodriguez',
    email: 'mike@example.com',
    username: 'mikerodriguez',
    password: 'mike123',
    phone: '+1 555-0104',
    designation: 'Full Stack Developer',
    department: 'Engineering',
    location: 'Austin',
    about: 'Passionate about building scalable web applications.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    isEmailVerified: true,
    subscription: {
      isPro: false,
      plan: 'free'
    },
    profile: {
      jobTitle: 'Senior Full Stack Developer',
      company: 'DevCorp',
      industry: 'Technology',
      experience: 'senior',
      skills: [
        { name: 'JavaScript', level: 'expert', category: 'technical' },
        { name: 'React', level: 'expert', category: 'technical' },
        { name: 'Node.js', level: 'advanced', category: 'technical' },
        { name: 'Problem Solving', level: 'expert', category: 'analytical' }
      ],
      workPreferences: {
        workStyle: 'independent',
        communicationStyle: 'direct',
        timeManagement: 'deadline-driven',
        preferredWorkingHours: { start: '08:00', end: '16:00' },
        timezone: 'CST'
      },
      personality: {
        workingStyle: 'detail-oriented',
        stressLevel: 'medium',
        motivationFactors: ['challenge', 'growth', 'autonomy']
      },
      goals: {
        shortTerm: [
          { description: 'Learn TypeScript', priority: 'high' }
        ],
        longTerm: [
          { description: 'Become Tech Lead', priority: 'high' }
        ],
        careerAspirations: 'Lead engineering teams and build innovative products'
      },
      learning: {
        interests: ['TypeScript', 'Microservices', 'DevOps'],
        currentLearning: [
          { topic: 'TypeScript', progress: 40, startDate: new Date() }
        ]
      },
      productivity: {
        peakHours: [
          { start: '08:00', end: '10:00', dayOfWeek: 'monday' },
          { start: '08:00', end: '10:00', dayOfWeek: 'tuesday' },
          { start: '08:00', end: '10:00', dayOfWeek: 'wednesday' },
          { start: '08:00', end: '10:00', dayOfWeek: 'thursday' },
          { start: '08:00', end: '10:00', dayOfWeek: 'friday' }
        ],
        taskPreferences: {
          preferredTaskTypes: ['technical', 'analytical'],
          taskComplexity: 'complex',
          deadlineSensitivity: 'strict'
        },
        workEnvironment: {
          preferredEnvironment: 'quiet',
          collaborationPreference: 'low'
        }
      },
      aiPreferences: {
        assistanceLevel: 'minimal',
        preferredSuggestions: ['time-estimation', 'deadline-optimization'],
        communicationStyle: 'technical',
        notificationPreferences: {
          taskReminders: true,
          deadlineAlerts: true,
          productivityInsights: false,
          skillRecommendations: true
        }
      }
    }
  }
];

// Sample workspaces
const testWorkspaces = [
  {
    name: 'Acme Corp',
    description: 'Main workspace for Acme Corporation',
    type: 'enterprise',
    region: 'US',
    owner: null, // Will be set after user creation
    members: [],
    settings: {
      isPublic: false,
      allowMemberInvites: true,
      requireApprovalForJoining: false,
      defaultProjectPermissions: {
        canCreate: true,
        canManage: true,
        canView: true
      }
    },
    subscription: {
      plan: 'enterprise',
      maxMembers: 100,
      maxProjects: 50,
      features: {
        advancedAnalytics: true,
        customFields: true,
        apiAccess: true,
        prioritySupport: true
      }
    },
    isActive: true,
    memberCount: 0
  },
  {
    name: 'Design Team',
    description: 'Workspace for the design team',
    type: 'team',
    region: 'US',
    owner: null, // Will be set after user creation
    members: [],
    settings: {
      isPublic: false,
      allowMemberInvites: true,
      requireApprovalForJoining: false,
      defaultProjectPermissions: {
        canCreate: true,
        canManage: false,
        canView: true
      }
    },
    subscription: {
      plan: 'pro',
      maxMembers: 25,
      maxProjects: 20,
      features: {
        advancedAnalytics: true,
        customFields: true,
        apiAccess: false,
        prioritySupport: false
      }
    },
    isActive: true,
    memberCount: 0
  }
];

// Sample projects
const testProjects = [
  {
    name: 'Website Redesign',
    description: 'Complete redesign of the company website',
    client: 'Acme Corp',
    workspace: null, // Will be set after workspace creation
    createdBy: null, // Will be set after user creation
    status: 'active',
    priority: 'high',
    category: 'Web Development',
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-03-31'),
    budget: {
      estimated: 50000,
      actual: 25000,
      currency: 'USD'
    },
    progress: 50,
    teamMembers: [],
    milestones: [
      {
        name: 'Design Phase Complete',
        description: 'All designs approved and ready for development',
        dueDate: new Date('2024-02-15'),
        status: 'completed',
        createdBy: null
      },
      {
        name: 'Development Phase',
        description: 'Frontend and backend development',
        dueDate: new Date('2024-03-15'),
        status: 'in-progress',
        createdBy: null
      }
    ],
    tags: ['website', 'redesign', 'frontend'],
    attachments: [],
    settings: {
      isPublic: false,
      allowMemberInvites: true,
      timeTracking: {
        enabled: true,
        requireApproval: false
      },
      notifications: {
        taskUpdates: true,
        milestoneReminders: true,
        deadlineAlerts: true
      }
    },
    isActive: true,
    teamMemberCount: 0,
    completedTasksCount: 5,
    totalTasksCount: 15
  },
  {
    name: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android',
    client: 'TechStart Inc',
    workspace: null, // Will be set after workspace creation
    createdBy: null, // Will be set after user creation
    status: 'planning',
    priority: 'medium',
    category: 'Mobile Development',
    startDate: new Date('2024-02-01'),
    dueDate: new Date('2024-06-30'),
    budget: {
      estimated: 100000,
      actual: 0,
      currency: 'USD'
    },
    progress: 10,
    teamMembers: [],
    milestones: [
      {
        name: 'Project Planning',
        description: 'Complete project requirements and planning',
        dueDate: new Date('2024-02-28'),
        status: 'in-progress',
        createdBy: null
      }
    ],
    tags: ['mobile', 'app', 'ios', 'android'],
    attachments: [],
    settings: {
      isPublic: false,
      allowMemberInvites: true,
      timeTracking: {
        enabled: true,
        requireApproval: true
      },
      notifications: {
        taskUpdates: true,
        milestoneReminders: true,
        deadlineAlerts: true
      }
    },
    isActive: true,
    teamMemberCount: 0,
    completedTasksCount: 1,
    totalTasksCount: 8
  }
];

// Sample tasks
const testTasks = [
  {
    title: 'Design Homepage Layout',
    description: 'Create wireframes and mockups for the new homepage',
    project: null, // Will be set after project creation
    workspace: null, // Will be set after workspace creation
    createdBy: null, // Will be set after user creation
    assignee: null, // Will be set after user creation
    status: 'in-progress',
    priority: 'high',
    category: 'Design',
    type: 'task',
    startDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-01'),
    estimatedHours: 16,
    actualHours: 8,
    progress: 50,
    subtasks: [
      {
        title: 'Create wireframes',
        status: 'completed',
        assignee: null,
        dueDate: new Date('2024-01-20'),
        createdBy: null
      },
      {
        title: 'Design mockups',
        status: 'in-progress',
        assignee: null,
        dueDate: new Date('2024-02-01'),
        createdBy: null
      }
    ],
    dependencies: [],
    comments: [
      {
        content: 'Great start on the wireframes!',
        author: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false
      }
    ],
    attachments: [],
    tags: ['design', 'homepage', 'wireframes'],
    watchers: [],
    timeEntries: [],
    customFields: [],
    settings: {
      isPublic: true,
      allowComments: true,
      allowTimeTracking: true,
      requireApproval: false
    },
    isActive: true,
    subtaskCompletionPercentage: 50,
    totalTimeLogged: 8,
    commentCount: 1
  },
  {
    title: 'Implement User Authentication',
    description: 'Set up secure user authentication system',
    project: null, // Will be set after project creation
    workspace: null, // Will be set after workspace creation
    createdBy: null, // Will be set after user creation
    assignee: null, // Will be set after user creation
    status: 'todo',
    priority: 'high',
    category: 'Development',
    type: 'feature',
    startDate: new Date('2024-02-01'),
    dueDate: new Date('2024-02-15'),
    estimatedHours: 24,
    actualHours: 0,
    progress: 0,
    subtasks: [],
    dependencies: [],
    comments: [],
    attachments: [],
    tags: ['authentication', 'security', 'backend'],
    watchers: [],
    timeEntries: [],
    customFields: [],
    settings: {
      isPublic: true,
      allowComments: true,
      allowTimeTracking: true,
      requireApproval: false
    },
    isActive: true,
    subtaskCompletionPercentage: 0,
    totalTimeLogged: 0,
    commentCount: 0
  }
];

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/proxima';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Clear existing data
async function clearData() {
  try {
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Team.deleteMany({});
    await Payroll.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

// Hash passwords
async function hashPasswords(users: any[]) {
  return Promise.all(users.map(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    return { ...user, password: hashedPassword };
  }));
}

// Create users
async function createUsers() {
  try {
    const hashedUsers = await hashPasswords(testUsers);
    const users = await User.insertMany(hashedUsers);
    console.log(`👥 Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
}

// Create workspaces
async function createWorkspaces(users: any[]) {
  try {
    const workspaces = testWorkspaces.map((workspace, index) => ({
      ...workspace,
      owner: users[0]._id, // Alex is the owner
      members: [
        {
          user: users[0]._id,
          role: 'owner',
          permissions: {
            canCreateProject: true,
            canManageEmployees: true,
            canViewPayroll: true,
            canExportReports: true,
            canManageWorkspace: true
          },
          joinedAt: new Date(),
          status: 'active'
        }
      ],
      memberCount: 1
    }));

    const createdWorkspaces = await Workspace.insertMany(workspaces);
    console.log(`🏢 Created ${createdWorkspaces.length} workspaces`);
    return createdWorkspaces;
  } catch (error) {
    console.error('❌ Error creating workspaces:', error);
    throw error;
  }
}

// Create projects
async function createProjects(users: any[], workspaces: any[]) {
  try {
    const projects = testProjects.map((project, index) => ({
      ...project,
      workspace: workspaces[0]._id,
      createdBy: users[0]._id,
      teamMembers: [
        {
          user: users[0]._id,
          role: 'project-manager',
          permissions: {
            canManageTasks: true,
            canManageTeam: true,
            canViewReports: true,
            canManageProject: true
          },
          joinedAt: new Date()
        }
      ],
      teamMemberCount: 1
    }));

    const createdProjects = await Project.insertMany(projects);
    console.log(`📁 Created ${createdProjects.length} projects`);
    return createdProjects;
  } catch (error) {
    console.error('❌ Error creating projects:', error);
    throw error;
  }
}

// Create tasks
async function createTasks(users: any[], workspaces: any[], projects: any[]) {
  try {
    const tasks = testTasks.map((task, index) => ({
      ...task,
      project: projects[0]._id,
      workspace: workspaces[0]._id,
      createdBy: users[0]._id,
      assignee: users[index % users.length]._id
    }));

    const createdTasks = await Task.insertMany(tasks);
    console.log(`📋 Created ${createdTasks.length} tasks`);
    return createdTasks;
  } catch (error) {
    console.error('❌ Error creating tasks:', error);
    throw error;
  }
}

// Main seed function
async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    await clearData();
    
    const users = await createUsers();
    const workspaces = await createWorkspaces(users);
    const projects = await createProjects(users, workspaces);
    const tasks = await createTasks(users, workspaces, projects);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏢 Workspaces: ${workspaces.length}`);
    console.log(`📁 Projects: ${projects.length}`);
    console.log(`📋 Tasks: ${tasks.length}`);
    
    console.log('\n🔑 Test User Credentials:');
    console.log('Alex Johnson - alex@example.com / password123');
    console.log('Sarah Chen - sarah@example.com / sarah123');
    console.log('Mike Rodriguez - mike@example.com / mike123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
if (require.main === module) {
  seed();
}

export default seed;