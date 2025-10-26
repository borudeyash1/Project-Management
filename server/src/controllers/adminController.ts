import { Request, Response } from 'express';
import AllowedDevice from '../models/AllowedDevice';
import Admin from '../models/Admin';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { sendEmail } from '../services/emailService';

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

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Password Change OTP
export const sendPasswordChangeOTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?._id;
    const { currentPassword } = req.body;

    console.log('🔍 [ADMIN] Send password change OTP request for admin:', adminId);

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Find admin with password
    const admin = await Admin.findById(adminId).select('+password');

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);

    if (!isPasswordValid) {
      console.log('❌ [ADMIN] Invalid current password');
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiry (10 minutes)
    admin.loginOtp = otp;
    admin.loginOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await admin.save();

    // Send OTP via email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #f59e0b; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #f59e0b; letter-spacing: 5px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Change Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${admin.name}</strong>,</p>
            <p>You have requested to change your admin password. Please use the OTP below to verify this action:</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Your OTP Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Valid for 10 minutes</p>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              If you did not request this password change, please ignore this email and contact support immediately.
            </div>

            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
            <p>For security reasons, never share this OTP with anyone.</p>
          </div>
          <div class="footer">
            <p>© 2025 TaskFlowHQ Admin Portal. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: admin.email,
      subject: '🔐 Password Change OTP - TaskFlowHQ Admin',
      html: emailHtml
    });

    console.log('✅ [ADMIN] Password change OTP sent to:', admin.email);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        email: admin.email
      }
    });
  } catch (error: any) {
    console.error('❌ [ADMIN] Send password change OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Verify OTP and Change Password
export const verifyOTPAndChangePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?._id;
    const { otp, newPassword } = req.body;

    console.log('🔍 [ADMIN] Verify OTP and change password for admin:', adminId);

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    if (!otp || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'OTP and new password are required'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
      return;
    }

    // Find admin with OTP
    const admin = await Admin.findById(adminId).select('+password +loginOtp +loginOtpExpiry');

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    // Verify OTP
    if (!admin.loginOtp || admin.loginOtp !== otp) {
      console.log('❌ [ADMIN] Invalid OTP');
      res.status(401).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    // Check OTP expiry
    if (!admin.loginOtpExpiry || admin.loginOtpExpiry < new Date()) {
      console.log('❌ [ADMIN] OTP expired');
      res.status(401).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
      return;
    }

    // Update password
    admin.password = newPassword;
    admin.loginOtp = undefined;
    admin.loginOtpExpiry = undefined;
    await admin.save();

    console.log('✅ [ADMIN] Password changed successfully for:', admin.email);

    // Send confirmation email
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed Successfully</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${admin.name}</strong>,</p>
            
            <div class="success-box">
              <strong>✅ Success!</strong><br>
              Your admin password has been changed successfully.
            </div>

            <p><strong>Details:</strong></p>
            <ul>
              <li>Changed at: ${new Date().toLocaleString()}</li>
              <li>Account: ${admin.email}</li>
            </ul>

            <p>If you did not make this change, please contact support immediately.</p>
          </div>
          <div class="footer">
            <p>© 2025 TaskFlowHQ Admin Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: admin.email,
      subject: '✅ Password Changed Successfully - TaskFlowHQ Admin',
      html: confirmationHtml
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('❌ [ADMIN] Verify OTP and change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};
