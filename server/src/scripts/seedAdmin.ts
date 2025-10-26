import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin';

// Load environment variables
dotenv.config({ path: './.env' });

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflowhq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Your admin credentials
    const adminEmail = 'yborude678@gmail.com';
    const adminPassword = 'Yash@1234';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists in database');
      console.log('Admin Info:', {
        email: existingAdmin.email,
        name: existingAdmin.name,
        role: existingAdmin.role,
        isActive: existingAdmin.isActive,
        loginMethod: existingAdmin.loginMethod
      });
    } else {
      // Create new admin
      const newAdmin = new Admin({
        email: adminEmail,
        password: adminPassword,
        name: 'Yash Borude',
        role: 'super_admin',
        isActive: true,
        loginMethod: 'email'
      });

      await newAdmin.save();
      console.log('✅ Admin created successfully!');
      console.log('Admin Info:', {
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
        loginMethod: newAdmin.loginMethod
      });
      console.log('\n🔐 Login Credentials:');
      console.log('   Email:', adminEmail);
      console.log('   Password:', adminPassword);
    }

    // List all admins
    const allAdmins = await Admin.find();
    console.log(`\n📋 Total admins: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Login Method: ${admin.loginMethod}`);
      console.log(`   Last Login: ${admin.lastLogin || 'Never'}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();
