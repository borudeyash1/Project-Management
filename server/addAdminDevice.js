// Script to add an admin device to the database
require('dotenv').config();
const mongoose = require('mongoose');

// Define the AllowedDevice schema inline
const allowedDeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  deviceName: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'laptop', 'mobile', 'tablet', 'other'],
    default: 'desktop'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastAccess: {
    type: Date,
    default: null
  },
  addedBy: {
    type: String,
    default: 'system'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const AllowedDevice = mongoose.model('AllowedDevice', allowedDeviceSchema);

async function addDevice() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Device ID to add (the customDeviceId from your logs)
    const deviceId = '37D98603-981B-493F-9A74-C3DD4A3AEE48';

    // Check if device already exists
    const existingDevice = await AllowedDevice.findOne({ deviceId });
    
    if (existingDevice) {
      console.log('⚠️  Device already exists in database:');
      console.log('   Device ID:', existingDevice.deviceId);
      console.log('   Device Name:', existingDevice.deviceName);
      console.log('   Is Active:', existingDevice.isActive);
      
      // Update to make sure it's active
      if (!existingDevice.isActive) {
        existingDevice.isActive = true;
        await existingDevice.save();
        console.log('✅ Device has been activated!');
      }
    } else {
      // Create new device
      const newDevice = new AllowedDevice({
        deviceId: deviceId,
        deviceName: 'Admin Development Device',
        deviceType: 'desktop',
        isActive: true,
        addedBy: 'system',
        notes: 'Added via script for admin access'
      });

      await newDevice.save();
      console.log('✅ Device added successfully!');
      console.log('   Device ID:', newDevice.deviceId);
      console.log('   Device Name:', newDevice.deviceName);
    }

    // List all allowed devices
    console.log('\n📋 All allowed devices:');
    const allDevices = await AllowedDevice.find();
    allDevices.forEach((device, index) => {
      console.log(`\n${index + 1}. ${device.deviceName}`);
      console.log(`   ID: ${device.deviceId}`);
      console.log(`   Type: ${device.deviceType}`);
      console.log(`   Active: ${device.isActive}`);
      console.log(`   Last Access: ${device.lastAccess || 'Never'}`);
    });

    console.log('\n✅ Done! You should now be able to access the admin portal.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
addDevice();
