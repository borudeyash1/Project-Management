import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Workspace from '../src/models/Workspace';
import Project from '../src/models/Project';
import Task from '../src/models/Task';
import Team from '../src/models/Team';
import { Goal } from '../src/models/Goal';
import { Report } from '../src/models/Report';
import Payroll from '../src/models/Payroll';
import SubscriptionPlan from '../src/models/SubscriptionPlan';
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
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd722b786?q=80&w=200&auto=format&fit=crop',
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

const testVacantWorkspaces = [
  {
    name: 'Acme Corp',
    description: 'Main workspace for Acme Corporation',
    type: 'enterprise',
    region: 'US',
    settings: {
      isPublic: false,
      allowMemberInvites: true,
      requireApprovalForJoining: false,
      defaultProjectPermissions: {
        canCreate: true,
        canManage: true,
        canView: true,
      },
    },
    subscription: {
      plan: 'enterprise',
      maxMembers: 100,
      maxProjects: 50,
    },
  },
  {
    name: 'Design Team',
    description: 'Workspace for the design team',
    type: 'team',
    region: 'US',
    settings: {
      isPublic: false,
      allowMemberInvites: true,
      requireApprovalForJoining: false,
      defaultProjectPermissions: {
        canCreate: true,
        canManage: false,
        canView: true,
      },
    },
    subscription: {
      plan: 'pro',
      maxMembers: 25,
      maxProjects: 20,
    },
  }
];

const defaultSubscriptionPlans = [
  {
    planKey: 'free',
    displayName: 'Free User',
    summary:
      'Access essential task management features. Create a single workspace/project and experience SaaS task flow with ads.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: {
      maxWorkspaces: 1,
      maxProjects: 1,
      maxTeamMembers: 5,
      storageInGB: 1
    },
    features: {
      aiAccess: false,
      adsEnabled: true,
      collaboratorAccess: false,
      customStorageIntegration: false,
      desktopAppAccess: false,
      automaticScheduling: false,
      realtimeAISuggestions: false
    },
    workspaceFees: {
      personal: 29.99,
      team: 39.99,
      enterprise: 59.99
    },
    perHeadPrice: 8,
    collaboratorsLimit: 0,
    order: 0
  },
  {
    planKey: 'pro',
    displayName: 'Pro User',
    summary:
      'Unlock workspace freedom—manage up to five workspaces with 5 projects each, 20 employees per project, no ads, and limited AI signals.',
    monthlyPrice: 12,
    yearlyPrice: 120,
    limits: {
      maxWorkspaces: 5,
      maxProjects: 5,
      maxTeamMembers: 100,
      storageInGB: 100
    },
    features: {
      aiAccess: true,
      adsEnabled: false,
      collaboratorAccess: true,
      customStorageIntegration: false,
      desktopAppAccess: true,
      automaticScheduling: false,
      realtimeAISuggestions: false
    },
    workspaceFees: {
      personal: 39.99,
      team: 79.99,
      enterprise: 99.99
    },
    perHeadPrice: 5,
    collaboratorsLimit: 5,
    order: 1
  },
  {
    planKey: 'ultra',
    displayName: 'Ultra User',
    summary:
      'Enterprise-grade automation: 10 workspaces, 20 projects each, 30 members, automatic scheduling, AI-driven guidance, and private cloud storage.',
    monthlyPrice: 25,
    yearlyPrice: 250,
    limits: {
      maxWorkspaces: 10,
      maxProjects: 20,
      maxTeamMembers: 30,
      storageInGB: 500
    },
    features: {
      aiAccess: true,
      adsEnabled: false,
      collaboratorAccess: true,
      customStorageIntegration: true,
      desktopAppAccess: true,
      automaticScheduling: true,
      realtimeAISuggestions: true
    },
    workspaceFees: {
      personal: 59.99,
      team: 129.99,
      enterprise: 199.99
    },
    perHeadPrice: 3,
    collaboratorsLimit: 10,
    order: 2
  }
];

const testProjects = [
  {
    name: 'Website Redesign',
    description: 'Complete redesign of the company website',
    client: 'Acme Corp',
    status: 'active',
    priority: 'high',
    category: 'Web Development',
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-03-31'),
    tags: ['website', 'redesign', 'frontend'],
  },
  {
    name: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android',
    client: 'TechStart Inc',
    status: 'planning',
    priority: 'medium',
    category: 'Mobile Development',
    startDate: new Date('2024-02-01'),
    dueDate: new Date('2024-06-30'),
    tags: ['mobile', 'app', 'ios', 'android'],
  }
];

const testReports = [
  {
    name: 'Team Productivity Snapshot',
    description: 'Summary of delivery health and team bandwidth.',
    type: 'team',
    data: {
      totalTasks: 48,
      completed: 36,
      blocked: 3,
      velocityTrend: [12, 14, 11, 15],
      highlights: ['On-time delivery improved 8%', '3 automation rules shipped'],
    },
    isPublic: true,
    tags: ['team', 'performance'],
  },
  {
    name: 'Project Health Overview',
    description: 'High-level metrics for active delivery initiatives.',
    type: 'project',
    data: {
      burnDown: [100, 78, 60, 45, 27, 10],
      risks: ['API dependency delay', 'QA capacity'],
      budget: { spent: 42000, allocated: 60000 },
    },
    isPublic: false,
    tags: ['project', 'budget'],
  }
];

const testTeams = [
  {
    name: 'Product Strategy Squad',
    description: 'Cross-functional team responsible for roadmap prioritization and AI feature strategy.',
    skills: ['Strategy', 'AI', 'Collaboration']
  },
  {
    name: 'Delivery Ops Crew',
    description: 'Handles delivery tracking, quality metrics, and operational reporting.',
    skills: ['Delivery', 'Reporting', 'Automation']
  }
];

const testGoals = [
  {
    title: 'Launch AI Insights',
    description: 'Ship AI-based analytics dashboards for customer success and delivery teams.',
    type: 'team',
    category: 'productivity',
    priority: 'high',
    status: 'in_progress',
    progress: 45,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    tags: ['ai', 'analytics', 'team'],
    isPublic: true,
    milestones: [
      { _id: 'g-m1', title: 'Define AI metrics', dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), completed: true },
      { _id: 'g-m2', title: 'Build data pipeline', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), completed: true },
      { _id: 'g-m3', title: 'Ship dashboard beta', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), completed: false },
      { _id: 'g-m4', title: 'Collect feedback', dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), completed: false }
    ]
  },
  {
    title: 'Improve delivery predictability',
    description: 'Cut cycle time by standardizing delivery rituals and reporting.',
    type: 'company',
    category: 'productivity',
    priority: 'medium',
    status: 'not_started',
    progress: 0,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    targetDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    tags: ['delivery', 'ops', 'reporting'],
    isPublic: false,
    milestones: [
      { _id: 'g-m5', title: 'Define delivery rituals', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), completed: false },
      { _id: 'g-m6', title: 'Roll out reporting templates', dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), completed: false }
    ]
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
    await Goal.deleteMany({});
    await Report.deleteMany({});
    await Payroll.deleteMany({});
    await SubscriptionPlan.deleteMany({});
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
    const workspacesPayload = testVacantWorkspaces.map((workspace) => ({
      ...workspace,
      owner: users[0]._id,
      members: [
        {
          user: users[0]._id,
          role: 'owner',
          status: 'active',
          joinedAt: new Date(),
          permissions: {
            canCreateProject: true,
            canManageEmployees: true,
            canViewPayroll: true,
            canExportReports: true,
            canManageWorkspace: true,
          },
        },
      ],
    }));

    const createdWorkspaces = await Workspace.insertMany(workspacesPayload);
    console.log(`🏢 Created ${createdWorkspaces.length} workspaces`);
    return createdWorkspaces;
  } catch (error) {
    console.error('❌ Error creating workspaces:', error);
    throw error;
  }
}

// Create teams
async function createTeams(users: any[], workspaces: any[]) {
  try {
    const teamsPayload = testTeams.map((team: any) => ({
      ...team,
      workspace: workspaces[0]._id,
      leader: users[0]._id,
      members: [
        {
          user: users[0]._id,
          role: 'leader',
          status: 'active',
          joinedAt: new Date(),
        },
      ],
    }));

    const createdTeams = await Team.insertMany(teamsPayload);
    console.log(`👥 Created ${createdTeams.length} teams`);
    return createdTeams;
  } catch (error) {
    console.error('❌ Error creating teams:', error);
    throw error;
  }
}

// Create projects
async function createProjects(users: any[], workspaces: any[]) {
  try {
    const projectsPayload = testProjects.map((project: any) => ({
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
            canManageProject: true,
          },
          joinedAt: new Date(),
        },
      ],
    }));

    const createdProjects = await Project.insertMany(projectsPayload);
    console.log(`📁 Created ${createdProjects.length} projects`);
    return createdProjects;
  } catch (error) {
    console.error('❌ Error creating projects:', error);
    throw error;
  }
}

// Create goals
async function createGoals(users: any[], projects: any[], workspaces: any[]) {
  try {
    const goalsPayload = testGoals.map((goal: any) => ({
      ...goal,
      createdBy: users[0]._id,
      assignedTo: users[0]._id,
      project: projects[0]._id,
      workspace: workspaces[0]._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const createdGoals = await Goal.insertMany(goalsPayload);
    console.log(`🎯 Created ${createdGoals.length} goals`);
    return createdGoals;
  } catch (error) {
    console.error('❌ Error creating goals:', error);
    throw error;
  }
}

// Create reports
async function createReports(users: any[]) {
  try {
    const reportsPayload = testReports.map((report: any) => ({
      ...report,
      createdBy: users[0]._id,
    }));

    const createdReports = await Report.insertMany(reportsPayload);
    console.log(`📈 Created ${createdReports.length} reports`);
    return createdReports;
  } catch (error) {
    console.error('❌ Error creating reports:', error);
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
    const teams = await createTeams(users, workspaces);
    await createGoals(users, projects, workspaces);
    const reports = await createReports(users);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏢 Workspaces: ${workspaces.length}`);
    console.log(`📁 Projects: ${projects.length}`);
    console.log(`👥 Teams: ${teams.length}`);
    console.log(`🎯 Goals seeded`);
    console.log(`📈 Reports: ${reports.length}`);
    
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