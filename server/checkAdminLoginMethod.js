// Script to check and update admin login method
require('dotenv').config();
const mongoose = require('mongoose');

// Define the Admin schema inline
const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  loginMethod: {
    type: String,
    enum: ['email', 'google', 'both'],
    default: 'email'
  },
  googleId: String,
  avatar: String,
  isActive: Boolean,
  lastLogin: Date
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

async function checkAndUpdateAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin by email
    const email = 'admin@taskflowhq.com'; // Change this to your admin email
    
    console.log('🔍 Searching for admin:', email);
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log('❌ Admin not found with email:', email);
      console.log('\n📋 All admins in database:');
      const allAdmins = await Admin.find();
      allAdmins.forEach((a, index) => {
        console.log(`\n${index + 1}. ${a.name || 'No name'}`);
        console.log(`   Email: ${a.email}`);
        console.log(`   Login Method: ${a.loginMethod}`);
        console.log(`   Google ID: ${a.googleId || 'Not set'}`);
        console.log(`   Active: ${a.isActive}`);
      });
    } else {
      console.log('\n✅ Admin found!');
      console.log('   Name:', admin.name);
      console.log('   Email:', admin.email);
      console.log('   Current Login Method:', admin.loginMethod);
      console.log('   Google ID:', admin.googleId || 'Not set');
      console.log('   Active:', admin.isActive);

      // Ask if user wants to update
      console.log('\n💡 To enable Google login, the loginMethod should be "google" or "both"');
      console.log('   Current value:', admin.loginMethod);
      
      // Update to 'both' to allow both email/password and Google login
      const newLoginMethod = 'both';
      
      console.log(`\n🔄 Updating loginMethod to "${newLoginMethod}"...`);
      admin.loginMethod = newLoginMethod;
      await admin.save();
      
      console.log('✅ Admin login method updated successfully!');
      console.log('   New Login Method:', admin.loginMethod);
      console.log('\n✅ You can now use both email/password and Google OAuth to login!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkAndUpdateAdmin();
