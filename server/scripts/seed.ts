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
    }
  },
  {
    fullName: 'Mike Rodriguez',
    email: 'mike@example.com',
    username: 'mikerodriguez',
    password: 'mike123',
    phone: '+1 555-0104',
    designation: 'Senior Developer',
    department: 'Engineering',
    location: 'New York',
    about: 'Full-stack developer with 8+ years of experience.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    isEmailVerified: true,
    subscription: {
      isPro: false,
      plan: 'free'
    }
  },
  {
    fullName: 'Emily Davis',
    email: 'emily@example.com',
    username: 'emilydavis',
    password: 'emily123',
    phone: '+1 555-0105',
    designation: 'Project Manager',
    department: 'Operations',
    location: 'Chicago',
    about: 'Experienced in managing complex projects and cross-functional teams.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    isEmailVerified: true,
    subscription: {
      isPro: true,
      plan: 'enterprise'
    }
  },
  {
    fullName: 'David Kim',
    email: 'david@example.com',
    username: 'davidkim',
    password: 'david123',
    phone: '+1 555-0106',
    designation: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Seattle',
    about: 'Specialized in cloud infrastructure and automation.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    isEmailVerified: true,
    subscription: {
      isPro: false,
      plan: 'free'
    }
  }
];

// Test workspaces
const testWorkspaces = [
  {
    name: 'NovaTech Solutions',
    description: 'Leading software development company focused on innovative solutions.',
    type: 'enterprise',
    region: 'North America',
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
      plan: 'enterprise',
      maxMembers: 100,
      maxProjects: 50,
      features: {
        advancedAnalytics: true,
        customFields: true,
        apiAccess: true,
        prioritySupport: true
      }
    }
  },
  {
    name: 'Creative Studio',
    description: 'A creative agency specializing in branding and digital marketing.',
    type: 'team',
    region: 'North America',
    members: [],
    settings: {
      isPublic: true,
      allowMemberInvites: true,
      requireApprovalForJoining: true,
      defaultProjectPermissions: {
        canCreate: true,
        canManage: true,
        canView: true
      }
    },
    subscription: {
      plan: 'pro',
      maxMembers: 25,
      maxProjects: 20,
      features: {
        advancedAnalytics: true,
        customFields: false,
        apiAccess: false,
        prioritySupport: false
      }
    }
  }
];

// Test projects
const testProjects = [
  {
    name: 'NovaTech Website Redesign',
    description: 'Complete overhaul of the company website for better user experience and modern aesthetics.',
    client: 'NovaTech Internal',
    status: 'active',
    priority: 'high',
    category: 'Web Development',
    startDate: new Date('2024-09-01'),
    dueDate: new Date('2024-12-31'),
    budget: {
      estimated: 50000,
      currency: 'USD'
    },
    progress: 75,
    teamMembers: [],
    milestones: [
      {
        name: 'Design Approval',
        dueDate: new Date('2024-09-30'),
        status: 'completed',
        createdBy: ''
      },
      {
        name: 'Frontend Development Complete',
        dueDate: new Date('2024-11-15'),
        status: 'in-progress',
        createdBy: ''
      }
    ],
    tags: ['website', 'redesign', 'UI/UX'],
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
    }
  },
  {
    name: 'Mobile App Development',
    description: 'Building a cross-platform mobile application for project management.',
    client: 'TechCorp',
    status: 'active',
    priority: 'medium',
    category: 'Mobile Development',
    startDate: new Date('2024-10-01'),
    dueDate: new Date('2025-03-31'),
    budget: {
      estimated: 80000,
      currency: 'USD'
    },
    progress: 30,
    teamMembers: [],
    milestones: [
      {
        name: 'UI/UX Design Complete',
        dueDate: new Date('2024-11-30'),
        status: 'in-progress',
        createdBy: ''
      },
      {
        name: 'MVP Development',
        dueDate: new Date('2025-01-31'),
        status: 'pending',
        createdBy: ''
      }
    ],
    tags: ['mobile', 'react-native', 'app'],
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
    }
  }
];

// Test tasks
const testTasks = [
  {
    title: 'Design hero section',
    status: 'in-progress',
    priority: 'high',
    type: 'task',
    dueDate: new Date('2024-10-20'),
    estimatedHours: 8,
    actualHours: 0,
    progress: 60,
    subtasks: [],
    dependencies: [],
    comments: [],
    attachments: [],
    tags: ['UI'],
    watchers: [],
    timeEntries: [],
    customFields: [],
    settings: {
      isPublic: false,
      allowComments: true,
      allowTimeTracking: true,
      requireApproval: false
    }
  },
  {
    title: 'Implement user authentication',
    status: 'pending',
    priority: 'high',
    type: 'task',
    dueDate: new Date('2024-10-25'),
    estimatedHours: 12,
    actualHours: 0,
    progress: 0,
    subtasks: [],
    dependencies: [],
    comments: [],
    attachments: [],
    tags: ['backend', 'auth'],
    watchers: [],
    timeEntries: [],
    customFields: [],
    settings: {
      isPublic: false,
      allowComments: true,
      allowTimeTracking: true,
      requireApproval: false
    }
  },
  {
    title: 'Create project dashboard',
    status: 'completed',
    priority: 'medium',
    type: 'task',
    dueDate: new Date('2024-10-15'),
    estimatedHours: 6,
    actualHours: 6,
    progress: 100,
    subtasks: [],
    dependencies: [],
    comments: [],
    attachments: [],
    tags: ['frontend', 'dashboard'],
    watchers: [],
    timeEntries: [],
    customFields: [],
    settings: {
      isPublic: false,
      allowComments: true,
      allowTimeTracking: true,
      requireApproval: false
    }
  }
];

// Test teams
const testTeams = [
  {
    name: 'Frontend Team',
    description: 'Responsible for user interface and user experience development.',
    members: [],
    settings: {
      isPublic: true,
      allowMemberInvites: true,
      requireApproval: false
    }
  },
  {
    name: 'Backend Team',
    description: 'Handles server-side development and database management.',
    members: [],
    settings: {
      isPublic: true,
      allowMemberInvites: true,
      requireApproval: false
    }
  }
];

// Test payroll entries
const testPayroll = [
  {
    employee: '',
    period: {
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-31')
    },
    salary: {
      base: 5000,
      currency: 'USD'
    },
    hours: {
      regular: 160,
      overtime: 0
    },
    deductions: {
      tax: 1000,
      insurance: 200,
      other: 0
    },
    netPay: 3800,
    status: 'pending',
    paymentMethod: 'direct-deposit'
  }
];

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Team.deleteMany({});
    await Payroll.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

async function seedUsers() {
  try {
    console.log('👥 Creating test users...');
    
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.fullName} (${user.email})`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Hashed Password: ${(user as any).password}`);
      console.log('');
    }
    
    return createdUsers;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    return [];
  }
}

async function seedWorkspaces(users: any[]) {
  try {
    console.log('🏢 Creating test workspaces...');
    
    const createdWorkspaces = [];
    for (let i = 0; i < testWorkspaces.length; i++) {
      const workspaceData: any = { ...testWorkspaces[i] };
      workspaceData.owner = users[0]._id; // First user is owner
      
      // Add members to workspace
      workspaceData.members = users.slice(0, 3).map((user, index) => ({
        user: user._id,
        role: index === 0 ? 'owner' : 'member',
        permissions: {
          canCreateProject: true,
          canManageEmployees: index === 0,
          canViewPayroll: index === 0,
          canExportReports: true,
          canManageWorkspace: index === 0
        },
        joinedAt: new Date(),
        status: 'active'
      }));
      
      const workspace = new Workspace(workspaceData);
      await workspace.save();
      createdWorkspaces.push(workspace);
      console.log(`✅ Created workspace: ${workspace.name}`);
    }
    
    return createdWorkspaces;
  } catch (error) {
    console.error('❌ Error creating workspaces:', error);
    return [];
  }
}

async function seedProjects(users: any[], workspaces: any[]) {
  try {
    console.log('📋 Creating test projects...');
    
    const createdProjects = [];
    for (let i = 0; i < testProjects.length; i++) {
      const projectData = { ...testProjects[i] };
      projectData.workspace = workspaces[0]._id;
      projectData.createdBy = users[0]._id;
      
      // Add team members to project
      projectData.teamMembers = users.slice(0, 2).map((user, index) => ({
        user: user._id,
        role: index === 0 ? 'project-manager' : 'developer',
        permissions: {
          canManageTasks: true,
          canManageTeam: index === 0,
          canViewReports: true,
          canManageProject: index === 0
        },
        joinedAt: new Date()
      }));
      
      // Update milestone createdBy
      projectData.milestones = projectData.milestones.map((milestone: any) => ({
        ...milestone,
        createdBy: users[0]._id
      }));
      
      const project = new Project(projectData);
      await project.save();
      createdProjects.push(project);
      console.log(`✅ Created project: ${project.name}`);
    }
    
    return createdProjects;
  } catch (error) {
    console.error('❌ Error creating projects:', error);
    return [];
  }
}

async function seedTasks(users: any[], projects: any[], workspaces: any[]) {
  try {
    console.log('📝 Creating test tasks...');
    
    const createdTasks = [];
    for (let i = 0; i < testTasks.length; i++) {
      const taskData = { ...testTasks[i] };
      taskData.project = projects[0]._id;
      taskData.workspace = workspaces[0]._id;
      taskData.createdBy = users[0]._id;
      taskData.assignee = users[i % users.length]._id;
      
      const task = new Task(taskData);
      await task.save();
      createdTasks.push(task);
      console.log(`✅ Created task: ${task.title}`);
    }
    
    return createdTasks;
  } catch (error) {
    console.error('❌ Error creating tasks:', error);
    return [];
  }
}

async function seedTeams(users: any[], workspaces: any[]) {
  try {
    console.log('👥 Creating test teams...');
    
    const createdTeams = [];
    for (let i = 0; i < testTeams.length; i++) {
      const teamData = { ...testTeams[i] };
      teamData.workspace = workspaces[0]._id;
      teamData.createdBy = users[0]._id;
      
      // Add members to team
      teamData.members = users.slice(0, 2).map((user) => ({
        user: user._id,
        role: 'member',
        joinedAt: new Date(),
        status: 'active'
      }));
      
      const team = new Team(teamData);
      await team.save();
      createdTeams.push(team);
      console.log(`✅ Created team: ${team.name}`);
    }
    
    return createdTeams;
  } catch (error) {
    console.error('❌ Error creating teams:', error);
    return [];
  }
}

async function seedPayroll(users: any[]) {
  try {
    console.log('💰 Creating test payroll entries...');
    
    const createdPayroll = [];
    for (let i = 0; i < testPayroll.length; i++) {
      const payrollData = { ...testPayroll[i] };
      payrollData.employee = users[0]._id;
      payrollData.createdBy = users[0]._id;
      
      const payroll = new Payroll(payrollData);
      await payroll.save();
      createdPayroll.push(payroll);
      console.log(`✅ Created payroll entry for: ${users[0].fullName}`);
    }
    
    return createdPayroll;
  } catch (error) {
    console.error('❌ Error creating payroll entries:', error);
    return [];
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearDatabase();
    
    // Seed data in order
    const users = await seedUsers();
    const workspaces = await seedWorkspaces(users);
    const projects = await seedProjects(users, workspaces);
    const tasks = await seedTasks(users, projects, workspaces);
    const teams = await seedTeams(users, workspaces);
    const payroll = await seedPayroll(users);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test User Credentials:');
    console.log('========================');
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log('');
    });
    
    console.log('🔗 You can now test the application with these credentials!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
