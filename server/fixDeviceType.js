// Script to fix the device type in the database
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
    enum: ['admin', 'trusted'],
    default: 'admin',
    required: true
  },
  userAgent: String,
  platform: String,
  lastAccess: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: String,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

const AllowedDevice = mongoose.model('AllowedDevice', allowedDeviceSchema);

async function fixDevice() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Device ID to fix
    const deviceId = '37D98603-981B-493F-9A74-C3DD4A3AEE48';

    console.log('🔍 Searching for device...');
    
    // Use updateOne to bypass validation on read, but apply it on write
    const result = await AllowedDevice.updateOne(
      { deviceId: deviceId },
      { 
        $set: { 
          deviceType: 'admin',
          isActive: true
        } 
      }
    );

    if (result.matchedCount > 0) {
      console.log('✅ Device type updated successfully!');
      console.log('   Matched:', result.matchedCount);
      console.log('   Modified:', result.modifiedCount);
      
      // Verify the update
      const device = await AllowedDevice.findOne({ deviceId });
      console.log('\n📋 Updated device details:');
      console.log('   Device ID:', device.deviceId);
      console.log('   Device Name:', device.deviceName);
      console.log('   Device Type:', device.deviceType);
      console.log('   Is Active:', device.isActive);
    } else {
      console.log('❌ Device not found');
    }

    console.log('\n✅ Done! You should now be able to access the admin portal.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
fixDevice();
