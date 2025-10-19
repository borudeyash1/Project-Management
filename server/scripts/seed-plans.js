const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../dist/models/User');

// Plan configurations
const PLAN_CONFIGS = {
  free: {
    plan: 'free',
    status: 'active',
    features: {
      maxWorkspaces: 1,
      maxProjects: 3,
      maxTeamMembers: 5,
      maxStorage: 1,
      aiAssistance: true,
      advancedAnalytics: false,
      customIntegrations: false,
      prioritySupport: false,
      whiteLabeling: false,
      apiAccess: false
    }
  },
  pro: {
    plan: 'pro',
    status: 'active',
    features: {
      maxWorkspaces: 5,
      maxProjects: -1, // unlimited
      maxTeamMembers: 50,
      maxStorage: 100,
      aiAssistance: true,
      advancedAnalytics: true,
      customIntegrations: true,
      prioritySupport: true,
      whiteLabeling: false,
      apiAccess: false
    }
  },
  ultra: {
    plan: 'ultra',
    status: 'active',
    features: {
      maxWorkspaces: -1, // unlimited
      maxProjects: -1, // unlimited
      maxTeamMembers: -1, // unlimited
      maxStorage: 1000,
      aiAssistance: true,
      advancedAnalytics: true,
      customIntegrations: true,
      prioritySupport: true,
      whiteLabeling: true,
      apiAccess: true
    }
  }
};

// Sample users for each plan
const SAMPLE_USERS = [
  // Free Plan User
  {
    fullName: 'Alex Johnson',
    email: 'alex@example.com',
    username: 'alexjohnson',
    password: 'password123',
    contactNumber: '+1 555-0101',
    designation: 'Freelancer',
    department: 'Design',
    location: 'San Francisco, CA',
    about: 'Creative designer passionate about user experience',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    isEmailVerified: true,
    subscription: PLAN_CONFIGS.free,
    profile: {
      jobTitle: 'UI/UX Designer',
      company: 'Freelance',
      industry: 'Design',
      experience: 'mid',
      skills: [
        { name: 'Figma', level: 'expert', category: 'technical' },
        { name: 'Adobe Creative Suite', level: 'advanced', category: 'technical' },
        { name: 'User Research', level: 'intermediate', category: 'analytical' }
      ],
      workPreferences: {
        workStyle: 'collaborative',
        communicationStyle: 'creative',
        timeManagement: 'flexible',
        preferredWorkingHours: { start: '09:00', end: '17:00' },
        timezone: 'PST'
      }
    }
  },
  // Pro Plan User
  {
    fullName: 'Sarah Chen',
    email: 'sarah@techcorp.com',
    username: 'sarahchen',
    password: 'password123',
    contactNumber: '+1 555-0102',
    designation: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    about: 'Product manager with 8+ years experience in tech startups',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    isEmailVerified: true,
    subscription: PLAN_CONFIGS.pro,
    profile: {
      jobTitle: 'Senior Product Manager',
      company: 'TechCorp Inc.',
      industry: 'Technology',
      experience: 'senior',
      skills: [
        { name: 'Product Strategy', level: 'expert', category: 'management' },
        { name: 'Agile/Scrum', level: 'expert', category: 'management' },
        { name: 'Data Analysis', level: 'advanced', category: 'analytical' },
        { name: 'User Research', level: 'advanced', category: 'analytical' }
      ],
      workPreferences: {
        workStyle: 'collaborative',
        communicationStyle: 'analytical',
        timeManagement: 'structured',
        preferredWorkingHours: { start: '08:00', end: '18:00' },
        timezone: 'EST'
      }
    }
  },
  // Ultra Plan User
  {
    fullName: 'Michael Rodriguez',
    email: 'michael@enterprise.com',
    username: 'michaelrodriguez',
    password: 'password123',
    contactNumber: '+1 555-0103',
    designation: 'CTO',
    department: 'Engineering',
    location: 'Austin, TX',
    about: 'Technology leader with 15+ years experience building scalable systems',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    isEmailVerified: true,
    subscription: PLAN_CONFIGS.ultra,
    profile: {
      jobTitle: 'Chief Technology Officer',
      company: 'Enterprise Solutions',
      industry: 'Technology',
      experience: 'executive',
      skills: [
        { name: 'Technical Leadership', level: 'expert', category: 'management' },
        { name: 'System Architecture', level: 'expert', category: 'technical' },
        { name: 'Team Management', level: 'expert', category: 'management' },
        { name: 'Strategic Planning', level: 'expert', category: 'management' }
      ],
      workPreferences: {
        workStyle: 'mixed',
        communicationStyle: 'direct',
        timeManagement: 'deadline-driven',
        preferredWorkingHours: { start: '07:00', end: '19:00' },
        timezone: 'CST'
      }
    }
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and create users
    for (const userData of SAMPLE_USERS) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        subscription: {
          ...userData.subscription,
          startDate: new Date(),
          autoRenew: userData.subscription.plan !== 'free',
          billingCycle: userData.subscription.plan === 'free' ? 'monthly' : 'yearly',
          paymentMethod: userData.subscription.plan === 'free' ? undefined : 'card',
          isPro: userData.subscription.plan !== 'free',
          trialEndsAt: userData.subscription.plan === 'free' ? undefined : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        }
      });

      await user.save();
      console.log(`Created ${userData.subscription.plan} user: ${userData.fullName}`);
    }

    console.log('✅ Successfully seeded users for all plans!');
    console.log('\n📋 Test Accounts:');
    console.log('🆓 Free Plan: alex@example.com / password123');
    console.log('⚡ Pro Plan: sarah@techcorp.com / password123');
    console.log('👑 Ultra Plan: michael@enterprise.com / password123');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedUsers();
