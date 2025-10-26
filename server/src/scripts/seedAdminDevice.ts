import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AllowedDevice from '../models/AllowedDevice';

// Load environment variables
dotenv.config({ path: './.env' });

const seedAdminDevice = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflowhq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Your real device ID (SHA-256 fingerprint)
    const yourDeviceId = 'ee16529e29783f94017b264bdf4446d226dfc6506ba02cf0c4c8b8a73c6e9f5a';

    // Check if device already exists
    const existingDevice = await AllowedDevice.findOne({ deviceId: yourDeviceId });
    
    if (existingDevice) {
      console.log('⚠️  Device already exists in database');
      console.log('Device Info:', {
        deviceId: existingDevice.deviceId,
        deviceName: existingDevice.deviceName,
        deviceType: existingDevice.deviceType,
        isActive: existingDevice.isActive
      });
    } else {
      // Create new allowed device
      const newDevice = new AllowedDevice({
        deviceId: yourDeviceId,
        deviceName: 'Primary Admin Device',
        deviceType: 'admin',
        userAgent: 'Windows/Chrome',
        platform: 'Win32',
        isActive: true,
        addedBy: 'system',
        notes: 'Initial admin device - added during setup'
      });

      await newDevice.save();
      console.log('✅ Admin device added successfully!');
      console.log('Device Info:', {
        deviceId: newDevice.deviceId,
        deviceName: newDevice.deviceName,
        deviceType: newDevice.deviceType,
        isActive: newDevice.isActive
      });
    }

    // List all allowed devices
    const allDevices = await AllowedDevice.find();
    console.log(`\n📋 Total allowed devices: ${allDevices.length}`);
    allDevices.forEach((device, index) => {
      console.log(`\n${index + 1}. ${device.deviceName}`);
      console.log(`   Device ID: ${device.deviceId}`);
      console.log(`   Type: ${device.deviceType}`);
      console.log(`   Active: ${device.isActive}`);
      console.log(`   Added by: ${device.addedBy}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin device:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAdminDevice();
