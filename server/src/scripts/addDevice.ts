import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AllowedDevice from '../models/AllowedDevice';

// Load environment variables
dotenv.config({ path: './.env' });

// Get device ID from command line argument
const deviceIdToAdd = process.argv[2];
const deviceName = process.argv[3] || 'Team Member Device';

const addDevice = async () => {
  try {
    if (!deviceIdToAdd) {
      console.error('❌ Please provide a device ID as argument');
      console.log('Usage: npx ts-node src/scripts/addDevice.ts <device-id> [device-name]');
      console.log('Example: npx ts-node src/scripts/addDevice.ts abc123def456 "John\'s Laptop"');
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflowhq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if device already exists
    const existingDevice = await AllowedDevice.findOne({ deviceId: deviceIdToAdd });
    
    if (existingDevice) {
      console.log('⚠️  Device already exists in database');
      console.log('Device Info:', {
        deviceId: existingDevice.deviceId,
        deviceName: existingDevice.deviceName,
        deviceType: existingDevice.deviceType,
        isActive: existingDevice.isActive
      });
      
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create new allowed device
    const newDevice = new AllowedDevice({
      deviceId: deviceIdToAdd,
      deviceName: deviceName,
      deviceType: 'admin',
      isActive: true,
      addedBy: 'admin',
      notes: `Added on ${new Date().toLocaleDateString()}`
    });

    await newDevice.save();
    console.log('✅ Device added successfully!');
    console.log('Device Info:', {
      deviceId: newDevice.deviceId,
      deviceName: newDevice.deviceName,
      deviceType: newDevice.deviceType,
      isActive: newDevice.isActive
    });

    // List all allowed devices
    const allDevices = await AllowedDevice.find();
    console.log(`\n📋 Total allowed devices: ${allDevices.length}`);
    allDevices.forEach((device, index) => {
      console.log(`\n${index + 1}. ${device.deviceName}`);
      console.log(`   Device ID: ${device.deviceId.substring(0, 20)}...`);
      console.log(`   Type: ${device.deviceType}`);
      console.log(`   Active: ${device.isActive}`);
      console.log(`   Added by: ${device.addedBy}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding device:', error);
    process.exit(1);
  }
};

// Run the function
addDevice();
