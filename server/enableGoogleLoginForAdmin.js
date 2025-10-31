// Script to enable Google login for admin
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

async function enableGoogleLogin() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update admin email - change this to your admin email
    const email = 'yborude678@gmail.com';
    
    console.log('🔍 Updating admin:', email);
    
    const result = await Admin.updateOne(
      { email: email },
      { 
        $set: { 
          loginMethod: 'both' // Allow both email/password and Google login
        } 
      }
    );

    if (result.matchedCount > 0) {
      console.log('✅ Admin login method updated successfully!');
      console.log('   Matched:', result.matchedCount);
      console.log('   Modified:', result.modifiedCount);
      
      // Verify the update
      const admin = await Admin.findOne({ email });
      console.log('\n📋 Updated admin details:');
      console.log('   Name:', admin.name);
      console.log('   Email:', admin.email);
      console.log('   Login Method:', admin.loginMethod);
      console.log('   Active:', admin.isActive);
      
      console.log('\n✅ You can now use both email/password and Google OAuth to login!');
    } else {
      console.log('❌ Admin not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
enableGoogleLogin();
