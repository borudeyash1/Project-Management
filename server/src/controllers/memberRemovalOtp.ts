import { Response } from 'express';
import User from '../models/User';
import Workspace from '../models/Workspace';
import { sendEmail } from '../services/emailService';
import { generateOTP, OTP_VALIDITY_MS } from '../utils/otp';
import { AuthenticatedRequest } from '../types';

// Send OTP for member removal
export const sendMemberRemovalOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!._id;

    // Verify user is workspace owner or admin
    const workspace = await Workspace.findOne({
      _id: id,
      $or: [
        { owner: currentUserId },
        { 'members.user': currentUserId, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_VALIDITY_MS);

    // Store OTP in user document
    const user = await User.findById(currentUserId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const userAny = user as any;
    userAny.otp = otp;
    userAny.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Member Removal OTP',
        html: `<p>Your OTP for member removal is: <strong>${otp}</strong></p><p>This OTP will expire in 5 minutes.</p>`
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Continue anyway - OTP is stored
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error: any) {
    console.error('Send member removal OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Validate member removal OTP
export const validateMemberRemovalOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: workspaceId } = req.params;
    const { otp } = req.body;
    const currentUserId = req.user!._id;

    // Get user
    const user = await User.findById(currentUserId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const userAny = user as any;
    
    // Validate OTP
    if (!userAny.otp || !userAny.otpExpiry || userAny.otp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    if (new Date() > userAny.otpExpiry) {
      res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
      return;
    }

    // OTP is valid - DON'T clear it yet (will be cleared on actual removal)
    res.status(200).json({
      success: true,
      message: 'OTP validated successfully'
    });
  } catch (error: any) {
    console.error('Validate member removal OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
