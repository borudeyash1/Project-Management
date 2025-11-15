import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Workspace from '../models/Workspace';
import Project from '../models/Project';
import Task from '../models/Task';
import { Reminder } from '../models/Reminder';

dotenv.config({ path: './.env' });

const TARGET_EMAIL = process.argv[2] || 'borudeyash12@gmail.com';
const PASSWORD = process.argv[3] || 'Password123!';

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
        username: TARGET_EMAIL.split('@')[0],
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
      console.log('👤 Created user record');
    } else {
      console.log('ℹ️ User already exists, reusing: ', user.email);
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
            permissions: {
              canCreateProject: true,
              canManageEmployees: true,
              canViewPayroll: true,
              canExportReports: true,
              canManageWorkspace: true,
            },
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

    const project = await Project.findOne({ name: 'Sartthi Platform Revamp', createdBy: user._id.toString() });
    let projectRecord = project;
    if (!project) {
      projectRecord = new Project({
        name: 'Sartthi Platform Revamp',
        description: 'Upgrade planner, tracker, and goal management modules.',
        workspace: workspace._id.toString(),
        createdBy: user._id.toString(),
        status: 'active',
        priority: 'high',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        progress: 45,
        tags: ['web', 'planner', 'tracker'],
        teamMembers: [
          {
            user: user._id.toString(),
            role: 'owner',
            permissions: {
              canEdit: true,
              canDelete: true,
              canManageMembers: true,
              canViewReports: true,
            },
          },
        ],
      });
      await projectRecord.save();
      console.log('📁 Created project');
    }

    const existingTasks = await Task.find({ project: projectRecord!._id });
    if (existingTasks.length === 0) {
      await Task.insertMany([
        {
          title: 'Design planner dashboards',
          description: 'Finalize the UI for planner weekly view and modals.',
          project: projectRecord!._id,
          workspace: workspace._id,
          reporter: user._id,
          assignee: user._id,
          status: 'in-progress',
          priority: 'urgent',
          startDate: new Date(),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Implement tracker API wiring',
          description: 'Connect tracker UI to backend and add automated emails.',
          project: projectRecord!._id,
          workspace: workspace._id,
          reporter: user._id,
          assignee: user._id,
          status: 'todo',
          priority: 'high',
          startDate: new Date(),
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      ]);
      console.log('✅ Seeded tasks');
    }

    const reminders = await Reminder.find({ createdBy: user._id });
    if (reminders.length === 0) {
      await Reminder.insertMany([
        {
          title: 'Planner review',
          description: 'Review planner event participation emails.',
          type: 'meeting',
          priority: 'high',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          createdBy: user._id,
          assignedTo: user._id,
          tags: ['planner', 'email'],
          notifications: [
            { type: 'email', time: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000), sent: false },
          ],
        },
        {
          title: 'Workspace sync',
          description: 'Sync workspace dashboards after seeding data.',
          type: 'task',
          priority: 'medium',
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          createdBy: user._id,
          assignedTo: user._id,
          tags: ['workspace', 'sync'],
          notifications: [
            { type: 'push', time: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000), sent: false },
          ],
        },
      ]);
      console.log('🔔 Seeded reminders');
    }

    console.log('\n🎉 Seed data ready for user:', TARGET_EMAIL);
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
