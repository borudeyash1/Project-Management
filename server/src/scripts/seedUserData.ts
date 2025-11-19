import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Workspace from '../models/Workspace';
import Project from '../models/Project';
import Task from '../models/Task';
import { Reminder } from '../models/Reminder';

dotenv.config({ path: './.env' });

type WorkspaceRole = 'owner' | 'admin' | 'manager' | 'member';
type ProjectRole = 'owner' | 'manager' | 'member' | 'viewer';

const TARGET_EMAIL = process.argv[2] || 'borudeyash12@gmail.com';
const PASSWORD = process.argv[3] || 'Password123!';

const sanitizeUsername = (identifier: string) => {
  return (identifier.split('@')[0] || identifier)
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .substring(0, 24) || `user_${Date.now()}`;
};
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const WORKSPACE_PERMISSION_MATRIX: Record<
  WorkspaceRole,
  {
    canCreateProject: boolean;
    canManageEmployees: boolean;
    canViewPayroll: boolean;
    canExportReports: boolean;
    canManageWorkspace: boolean;
  }
> = {
  owner: {
    canCreateProject: true,
    canManageEmployees: true,
    canViewPayroll: true,
    canExportReports: true,
    canManageWorkspace: true,
  },
  admin: {
    canCreateProject: true,
    canManageEmployees: true,
    canViewPayroll: true,
    canExportReports: true,
    canManageWorkspace: true,
  },
  manager: {
    canCreateProject: true,
    canManageEmployees: true,
    canViewPayroll: true,
    canExportReports: true,
    canManageWorkspace: false,
  },
  member: {
    canCreateProject: false,
    canManageEmployees: false,
    canViewPayroll: false,
    canExportReports: false,
    canManageWorkspace: false,
  },
};

const PROJECT_PERMISSION_MATRIX: Record<
  ProjectRole,
  {
    canEdit: boolean;
    canDelete: boolean;
    canManageMembers: boolean;
    canViewReports: boolean;
  }
> = {
  owner: {
    canEdit: true,
    canDelete: true,
    canManageMembers: true,
    canViewReports: true,
  },
  manager: {
    canEdit: true,
    canDelete: false,
    canManageMembers: true,
    canViewReports: true,
  },
  member: {
    canEdit: true,
    canDelete: false,
    canManageMembers: false,
    canViewReports: true,
  },
  viewer: {
    canEdit: false,
    canDelete: false,
    canManageMembers: false,
    canViewReports: true,
  },
};

const TEAM_MEMBER_SEEDS = [
  {
    fullName: 'Leo Messi',
    email: 'oblong_pencil984@simplelogin.com',
    workspaceRole: 'manager' as WorkspaceRole,
    projectRole: 'manager' as ProjectRole,
    jobTitle: 'Project Manager',
    department: 'Product',
  },
  {
    fullName: 'Andres Iniesta',
    email: 'andres.iniesta@taskflowhq.com',
    workspaceRole: 'member' as WorkspaceRole,
    projectRole: 'manager' as ProjectRole,
    jobTitle: 'Solutions Architect',
    department: 'Engineering',
  },
  {
    fullName: 'Sergio Busquets',
    email: 'sergio.busquets@taskflowhq.com',
    workspaceRole: 'member' as WorkspaceRole,
    projectRole: 'member' as ProjectRole,
    jobTitle: 'Operations Lead',
    department: 'Operations',
  },
  {
    fullName: 'Pedro Rodriguez',
    email: 'pedro.rodriguez@taskflowhq.com',
    workspaceRole: 'member' as WorkspaceRole,
    projectRole: 'member' as ProjectRole,
    jobTitle: 'QA Specialist',
    department: 'Quality',
  },
];

const PROJECT_SEEDS = [
  {
    name: 'Sartthi Platform Revamp',
    description: 'Upgrade planner, tracker, and goal management modules.',
    status: 'active',
    priority: 'high',
    progress: 45,
    tags: ['web', 'planner', 'tracker'],
    category: 'Platform',
    managerEmail: 'oblong_pencil984@simplelogin.com',
    startOffsetDays: -7,
    dueOffsetDays: 21,
  },
  {
    name: 'Mobile Productivity Suite',
    description: 'Build a unified Android/iOS client for planners, tasks, and goals.',
    status: 'active',
    priority: 'medium',
    progress: 30,
    tags: ['mobile', 'release'],
    category: 'Mobile',
    managerEmail: 'andres.iniesta@taskflowhq.com',
    startOffsetDays: -14,
    dueOffsetDays: 35,
  },
  {
    name: 'Intelligent Automation Core',
    description: 'Automate recurring workflows and reminders with AI recommendations.',
    status: 'planning',
    priority: 'high',
    progress: 10,
    tags: ['automation', 'ai'],
    category: 'AI',
    managerEmail: 'sergio.busquets@taskflowhq.com',
    startOffsetDays: -3,
    dueOffsetDays: 60,
  },
];

const buildWorkspacePermissions = (
  role: WorkspaceRole,
  overrides?: Partial<(typeof WORKSPACE_PERMISSION_MATRIX)[WorkspaceRole]>
) => ({
  ...WORKSPACE_PERMISSION_MATRIX[role],
  ...overrides,
});

const buildProjectPermissions = (
  role: ProjectRole,
  overrides?: Partial<(typeof PROJECT_PERMISSION_MATRIX)[ProjectRole]>
) => ({
  ...PROJECT_PERMISSION_MATRIX[role],
  ...overrides,
});

const ensureSampleUser = async (seed: typeof TEAM_MEMBER_SEEDS[number]) => {
  let sampleUser = await User.findOne({ email: seed.email });
  if (!sampleUser) {
    sampleUser = new User({
      fullName: seed.fullName,
      email: seed.email,
      username: sanitizeUsername(seed.email),
      password: await bcrypt.hash(PASSWORD, 10),
      isEmailVerified: true,
      profile: {
        jobTitle: seed.jobTitle,
        department: seed.department,
        experience: 'senior',
      },
    });
    await sampleUser.save();
    console.log(`👤 Created sample user ${seed.fullName}`);
  }
  return sampleUser;
};

const upsertWorkspaceMembers = async (
  workspace: any,
  users: Awaited<ReturnType<typeof User.find>>,
  sampleLookup: Map<string, typeof TEAM_MEMBER_SEEDS[number]>,
  ownerId: string
) => {
  let updated = false;

  for (const person of users as any[]) {
    const userId = person._id.toString();
    const sampleSeed = sampleLookup.get(userId);
    let role: WorkspaceRole = 'member';
    let permissionOverrides: Partial<(typeof WORKSPACE_PERMISSION_MATRIX)[WorkspaceRole]> | undefined;

    if (userId === ownerId) {
      role = 'owner';
    } else if (sampleSeed) {
      role = sampleSeed.workspaceRole;
    }

    const permissions = buildWorkspacePermissions(role, permissionOverrides);
    const existingMember = workspace.members.find((member: any) => member.user.toString() === userId);

    if (existingMember) {
      const needsUpdate =
        existingMember.role !== role ||
        existingMember.status !== 'active' ||
        JSON.stringify(existingMember.permissions) !== JSON.stringify(permissions);

      if (needsUpdate) {
        existingMember.role = role;
        existingMember.status = 'active';
        existingMember.permissions = permissions;
        updated = true;
      }
    } else {
      workspace.members.push({
        user: userId,
        role,
        status: 'active',
        permissions,
      });
      updated = true;
    }
  }

  if (updated) {
    workspace.markModified('members');
    await workspace.save();
    console.log('👥 Synced workspace members with all users');
  } else {
    console.log('ℹ️ Workspace already has every user enrolled');
  }
};

const buildProjectTeamMembers = (
  workspace: any,
  managerId: string | undefined
) => {
  const ownerId = workspace.owner?.toString?.() ?? workspace.owner;

  return workspace.members.map((member: any) => {
    const memberId = member.user.toString();
    let role: ProjectRole = 'member';

    if (memberId === ownerId) {
      role = 'owner';
    } else if (managerId && memberId === managerId) {
      role = 'manager';
    } else if (member.role === 'manager' || member.role === 'admin') {
      role = 'manager';
    }

    return {
      user: memberId,
      role,
      permissions: buildProjectPermissions(role),
    };
  });
};

const seedProjects = async (
  workspace: any,
  ownerId: string,
  managerLookup: Map<string, string>
) => {
  const projectMap: Record<string, any> = {};

  for (const seed of PROJECT_SEEDS) {
    const managerId = managerLookup.get(seed.managerEmail) || ownerId;
    const teamMembers = buildProjectTeamMembers(workspace, managerId);

    let projectDoc: any = await Project.findOne({ name: seed.name, workspace: workspace._id.toString() });
    if (!projectDoc) {
      projectDoc = new Project({
        name: seed.name,
        description: seed.description,
        workspace: workspace._id.toString(),
        createdBy: ownerId,
        status: seed.status,
        priority: seed.priority,
        startDate: new Date(Date.now() + seed.startOffsetDays * DAY_IN_MS),
        dueDate: new Date(Date.now() + seed.dueOffsetDays * DAY_IN_MS),
        progress: seed.progress,
        tags: seed.tags,
        category: seed.category,
        teamMembers,
      });
      await projectDoc.save();
      console.log(`📁 Created project: ${seed.name}`);
    } else {
      projectDoc.description = seed.description;
      projectDoc.status = seed.status as any;
      projectDoc.priority = seed.priority as any;
      projectDoc.progress = seed.progress;
      projectDoc.tags = seed.tags;
      projectDoc.category = seed.category;
      projectDoc.startDate = new Date(Date.now() + seed.startOffsetDays * DAY_IN_MS);
      projectDoc.dueDate = new Date(Date.now() + seed.dueOffsetDays * DAY_IN_MS);
      projectDoc.teamMembers = teamMembers;
      await projectDoc.save();
      console.log(`🔁 Updated project: ${seed.name}`);
    }

    projectMap[seed.name] = projectDoc;
  }

  return projectMap;
};

const seedUserData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflowhq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    let user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
      user = new User({
        fullName: 'Borude Yash',
        email: TARGET_EMAIL,
        username: sanitizeUsername(TARGET_EMAIL),
        password: await bcrypt.hash(PASSWORD, 10),
        isEmailVerified: true,
        subscription: {
          plan: 'pro',
          status: 'active',
          startDate: new Date(),
          autoRenew: true,
          billingCycle: 'monthly',
          features: {
            maxWorkspaces: 5,
            maxProjects: 50,
            maxTeamMembers: 50,
            maxStorage: 50,
            aiAssistance: true,
            advancedAnalytics: true,
            customIntegrations: true,
            prioritySupport: true,
            whiteLabeling: false,
            apiAccess: true,
          },
          isPro: true,
        },
      });
      await user.save();
      console.log('👤 Created owner user');
    } else {
      console.log('ℹ️ Owner user already exists, reusing:', user.email);
    }

    let workspace = await Workspace.findOne({ owner: user._id, name: 'Sartthi Operations' });
    if (!workspace) {
      workspace = new Workspace({
        name: 'Sartthi Operations',
        description: 'Primary workspace for Sartthi projects',
        type: 'team',
        owner: user._id.toString(),
        members: [
          {
            user: user._id.toString(),
            role: 'owner',
            status: 'active',
            permissions: WORKSPACE_PERMISSION_MATRIX.owner,
          },
        ],
        subscription: {
          plan: 'pro',
          maxMembers: 50,
          maxProjects: 50,
          features: {
            advancedAnalytics: true,
            customFields: true,
            apiAccess: true,
            prioritySupport: true,
          },
        },
      });
      await workspace.save();
      console.log('🏢 Created workspace');
    }

    const sampleLookup = new Map<string, typeof TEAM_MEMBER_SEEDS[number]>();
    const managerLookup = new Map<string, string>();

    for (const seed of TEAM_MEMBER_SEEDS) {
      const sampleUser = await ensureSampleUser(seed);
      const userId = sampleUser._id.toString();
      sampleLookup.set(userId, seed);
      managerLookup.set(seed.email, userId);
    }

    const allUsers = await User.find({});
    await upsertWorkspaceMembers(workspace, allUsers, sampleLookup, user._id.toString());

    // Reload workspace to capture latest members
    workspace = await Workspace.findById(workspace._id);
    if (!workspace) {
      throw new Error('Workspace could not be reloaded');
    }

    const projectMap = await seedProjects(workspace, user._id.toString(), managerLookup);
    const primaryProjectSeed = PROJECT_SEEDS[0];
    const primaryProject = primaryProjectSeed ? projectMap[primaryProjectSeed.name] : null;
    if (!primaryProject) {
      throw new Error('Primary project not found for task seeding');
    }

    const existingTasks = await Task.find({ project: primaryProject._id });
    if (existingTasks.length === 0) {
      await Task.insertMany([
        {
          title: 'Design planner dashboards',
          description: 'Finalize the UI for planner weekly view and modals.',
          project: primaryProject._id,
          workspace: workspace._id,
          reporter: user._id,
          assignee: managerLookup.get('leo.messi@taskflowhq.com') || user._id,
          status: 'in-progress',
          priority: 'urgent',
          startDate: new Date(),
          dueDate: new Date(Date.now() + 3 * DAY_IN_MS),
        },
        {
          title: 'Implement tracker API wiring',
          description: 'Connect tracker UI to backend and add automated emails.',
          project: primaryProject._id,
          workspace: workspace._id,
          reporter: user._id,
          assignee: managerLookup.get('andres.iniesta@taskflowhq.com') || user._id,
          status: 'todo',
          priority: 'high',
          startDate: new Date(),
          dueDate: new Date(Date.now() + 5 * DAY_IN_MS),
        },
      ]);
      console.log('✅ Seeded tasks for primary project');
    } else {
      console.log('ℹ️ Tasks already exist for primary project');
    }

    const reminders = await Reminder.find({ createdBy: user._id });
    if (reminders.length === 0) {
      await Reminder.insertMany([
        {
          title: 'Planner review',
          description: 'Review planner event participation emails.',
          type: 'meeting',
          priority: 'high',
          dueDate: new Date(Date.now() + 2 * DAY_IN_MS),
          createdBy: user._id,
          assignedTo: user._id,
          tags: ['planner', 'email'],
          notifications: [
            { type: 'email', time: new Date(Date.now() + 1.5 * DAY_IN_MS), sent: false },
          ],
        },
        {
          title: 'Workspace sync',
          description: 'Sync workspace dashboards after seeding data.',
          type: 'task',
          priority: 'medium',
          dueDate: new Date(Date.now() + 4 * DAY_IN_MS),
          createdBy: user._id,
          assignedTo: user._id,
          tags: ['workspace', 'sync'],
          notifications: [
            { type: 'push', time: new Date(Date.now() + 3.5 * DAY_IN_MS), sent: false },
          ],
        },
      ]);
      console.log('🔔 Seeded reminders');
    } else {
      console.log('ℹ️ Reminders already exist, skipping seed');
    }

    console.log('\n🎉 Workspace, members, and projects prepared for testing');
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedUserData();
