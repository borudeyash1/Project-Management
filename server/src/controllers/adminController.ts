import { Request, Response } from 'express';
import AllowedDevice from '../models/AllowedDevice';
import Admin from '../models/Admin';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

// Check if device is allowed to access admin
export const checkDeviceAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.body;

    console.log('🔍 [BACKEND] Check device access request received');
    console.log('🔍 [BACKEND] Device ID from request:', deviceId);

    if (!deviceId) {
      console.log('❌ [BACKEND] No device ID provided');
      res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
      return;
    }

    console.log('🔍 [BACKEND] Searching for device in database...');
    const device = await AllowedDevice.findOne({ 
      deviceId, 
      isActive: true 
    });

    console.log('🔍 [BACKEND] Database query result:', device ? 'Device found' : 'Device not found');
    if (device) {
      console.log('🔍 [BACKEND] Device details:', {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        isActive: device.isActive
      });
    }

    if (device) {
      // Update last access time
      device.lastAccess = new Date();
      await device.save();

      console.log('✅ [BACKEND] Device authorized!');
      res.status(200).json({
        success: true,
        message: 'Device is authorized',
        data: {
          allowed: true,
          deviceName: device.deviceName,
          deviceType: device.deviceType
        }
      });
    } else {
      console.log('❌ [BACKEND] Device not authorized');
      res.status(403).json({
        success: false,
        message: 'Device is not authorized',
        data: {
          allowed: false
        }
      });
    }
  } catch (error: any) {
    console.error('Check device access error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all allowed devices (admin only)
export const getAllowedDevices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const devices = await AllowedDevice.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Allowed devices retrieved successfully',
      data: devices
    });
  } catch (error: any) {
    console.error('Get allowed devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add new allowed device
export const addAllowedDevice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { deviceId, deviceName, deviceType, userAgent, platform, notes } = req.body;

    if (!deviceId || !deviceName) {
      res.status(400).json({
        success: false,
        message: 'Device ID and name are required'
      });
      return;
    }

    // Check if device already exists
    const existingDevice = await AllowedDevice.findOne({ deviceId });
    if (existingDevice) {
      res.status(400).json({
        success: false,
        message: 'Device already exists'
      });
      return;
    }

    const newDevice = new AllowedDevice({
      deviceId,
      deviceName,
      deviceType: deviceType || 'admin',
      userAgent,
      platform,
      notes,
      addedBy: req.user?.email || 'admin',
      isActive: true
    });

    await newDevice.save();

    res.status(201).json({
      success: true,
      message: 'Device added successfully',
      data: newDevice
    });
  } catch (error: any) {
    console.error('Add allowed device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update allowed device
export const updateAllowedDevice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deviceName, deviceType, isActive, notes } = req.body;

    const device = await AllowedDevice.findById(id);
    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      });
      return;
    }

    if (deviceName) device.deviceName = deviceName;
    if (deviceType) device.deviceType = deviceType;
    if (typeof isActive === 'boolean') device.isActive = isActive;
    if (notes !== undefined) device.notes = notes;

    await device.save();

    res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: device
    });
  } catch (error: any) {
    console.error('Update allowed device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete allowed device
export const deleteAllowedDevice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const device = await AllowedDevice.findByIdAndDelete(id);
    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete allowed device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Log device access attempt
export const logDeviceAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, deviceInfo } = req.body;

    // Log the access attempt (you can create a separate AccessLog model if needed)
    console.log('Device access attempt:', {
      deviceId,
      deviceInfo,
      timestamp: new Date(),
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Access logged'
    });
  } catch (error: any) {
    console.error('Log device access error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin Login with Email/Password
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('🔍 [ADMIN LOGIN] Login attempt for:', email);

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Find admin with password field
    const admin = await Admin.findOne({ email, isActive: true }).select('+password');

    if (!admin) {
      console.log('❌ [ADMIN LOGIN] Admin not found or inactive');
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check if admin uses email login method
    if (admin.loginMethod !== 'email') {
      console.log('❌ [ADMIN LOGIN] Admin uses different login method:', admin.loginMethod);
      res.status(401).json({
        success: false,
        message: 'Please use Google Sign-In for this account'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      console.log('❌ [ADMIN LOGIN] Invalid password');
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email, 
        role: admin.role,
        type: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ [ADMIN LOGIN] Login successful');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          avatar: admin.avatar
        }
      }
    });
  } catch (error: any) {
    console.error('❌ [ADMIN LOGIN] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin Login with Google
export const adminGoogleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, googleId, name, avatar } = req.body;

    console.log('🔍 [ADMIN GOOGLE LOGIN] Login attempt for:', email);

    if (!email || !googleId) {
      res.status(400).json({
        success: false,
        message: 'Email and Google ID are required'
      });
      return;
    }

    // Find or create admin
    let admin = await Admin.findOne({ email, isActive: true });

    if (!admin) {
      console.log('❌ [ADMIN GOOGLE LOGIN] Admin not found');
      res.status(401).json({
        success: false,
        message: 'This Google account is not authorized as an admin'
      });
      return;
    }

    // Check if admin uses Google login
    if (admin.loginMethod !== 'google') {
      console.log('❌ [ADMIN GOOGLE LOGIN] Admin uses different login method:', admin.loginMethod);
      res.status(401).json({
        success: false,
        message: 'Please use email/password login for this account'
      });
      return;
    }

    // Update Google ID if not set
    if (!admin.googleId) {
      admin.googleId = googleId;
    }

    // Update profile info
    if (name) admin.name = name;
    if (avatar) admin.avatar = avatar;
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email, 
        role: admin.role,
        type: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ [ADMIN GOOGLE LOGIN] Login successful');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          avatar: admin.avatar
        }
      }
    });
  } catch (error: any) {
    console.error('❌ [ADMIN GOOGLE LOGIN] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
