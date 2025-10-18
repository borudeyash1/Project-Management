const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

// Simple user schema for seeding
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  username: String,
  password: String,
  phone: String,
  designation: String,
  department: String,
  location: String,
  about: String,
  avatarUrl: String,
  isEmailVerified: Boolean,
  subscription: {
    isPro: Boolean,
    plan: String
  },
  profile: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Add isActive field
userSchema.add({
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

// Test users
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
    isActive: true,
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
        { name: 'Agile', level: 'advanced', category: 'management' }
      ],
      workPreferences: {
        workStyle: 'collaborative',
        communicationStyle: 'direct',
        timeManagement: 'structured'
      },
      personality: {
        workingStyle: 'results-driven',
        stressLevel: 'medium',
        motivationFactors: ['growth', 'impact', 'challenge']
      },
      goals: {
        shortTerm: [{ description: 'Launch new product feature', priority: 'high' }],
        longTerm: [{ description: 'Become VP of Product', priority: 'high' }]
      },
      learning: {
        interests: ['AI/ML', 'Data Analytics', 'Leadership']
      },
      productivity: {
        peakHours: [
          { start: '09:00', end: '11:00', dayOfWeek: 'monday' },
          { start: '09:00', end: '11:00', dayOfWeek: 'tuesday' }
        ]
      },
      aiPreferences: {
        assistanceLevel: 'comprehensive',
        preferredSuggestions: ['task-prioritization', 'time-estimation'],
        communicationStyle: 'friendly'
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
    isActive: true,
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
        { name: 'User Research', level: 'advanced', category: 'analytical' }
      ],
      workPreferences: {
        workStyle: 'collaborative',
        communicationStyle: 'creative',
        timeManagement: 'flexible'
      },
      personality: {
        workingStyle: 'creative',
        stressLevel: 'low',
        motivationFactors: ['autonomy', 'creativity', 'impact']
      },
      goals: {
        shortTerm: [{ description: 'Complete design system', priority: 'high' }],
        longTerm: [{ description: 'Lead design team', priority: 'medium' }]
      },
      learning: {
        interests: ['Design Systems', 'Accessibility', 'Animation']
      },
      productivity: {
        peakHours: [
          { start: '10:00', end: '12:00', dayOfWeek: 'monday' },
          { start: '10:00', end: '12:00', dayOfWeek: 'tuesday' }
        ]
      },
      aiPreferences: {
        assistanceLevel: 'moderate',
        preferredSuggestions: ['task-prioritization', 'skill-development'],
        communicationStyle: 'creative'
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
    isActive: true,
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
        { name: 'Node.js', level: 'advanced', category: 'technical' }
      ],
      workPreferences: {
        workStyle: 'independent',
        communicationStyle: 'direct',
        timeManagement: 'deadline-driven'
      },
      personality: {
        workingStyle: 'detail-oriented',
        stressLevel: 'medium',
        motivationFactors: ['challenge', 'growth', 'autonomy']
      },
      goals: {
        shortTerm: [{ description: 'Learn TypeScript', priority: 'high' }],
        longTerm: [{ description: 'Become Tech Lead', priority: 'high' }]
      },
      learning: {
        interests: ['TypeScript', 'Microservices', 'DevOps']
      },
      productivity: {
        peakHours: [
          { start: '08:00', end: '10:00', dayOfWeek: 'monday' },
          { start: '08:00', end: '10:00', dayOfWeek: 'tuesday' }
        ]
      },
      aiPreferences: {
        assistanceLevel: 'minimal',
        preferredSuggestions: ['time-estimation', 'deadline-optimization'],
        communicationStyle: 'technical'
      }
    }
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
    console.log('🗑️  Cleared existing user data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

// Create users
async function createUsers() {
  try {
    // Hash passwords manually before inserting
    const hashedUsers = await Promise.all(testUsers.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      return {
        ...user,
        password: hashedPassword
      };
    }));
    
    const users = await User.insertMany(hashedUsers);
    console.log(`👥 Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('❌ Error creating users:', error);
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
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    
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

module.exports = { seed };
