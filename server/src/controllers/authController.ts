<<<<<<< HEAD
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse, AuthResponse, LoginRequest, RegisterRequest, JWTPayload } from '../types';
=======
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import {
  AuthenticatedRequest,
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  JWTPayload,
} from "../types";
import { sendEmail } from '../services/emailService'; // Import the email service
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId: string): string => {
<<<<<<< HEAD
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
=======
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
<<<<<<< HEAD
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' });
=======
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "30d",
  });
};

// Generate a 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
};

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
<<<<<<< HEAD
    const { fullName, username, email, contactNumber, password, profile }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
      return;
    }
=======
    console.log('🔍 [DEBUG] Registration endpoint called');
    console.log('🔍 [DEBUG] Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 [DEBUG] Request headers:', req.headers);
    
    const {
      fullName,
      username,
      email,
      contactNumber,
      password,
      profile,
    }: RegisterRequest = req.body;

    console.log('🔍 [DEBUG] Extracted data:', {
      fullName,
      username,
      email,
      contactNumber: contactNumber ? 'provided' : 'not provided',
      password: password ? 'provided' : 'not provided',
      profile: profile ? 'provided' : 'not provided'
    });

    // Check if user already exists
    console.log('🔍 [DEBUG] Checking for existing user...');
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      console.log('❌ [DEBUG] User already exists:', {
        email: existingUser.email,
        username: existingUser.username,
        isEmailVerified: existingUser.isEmailVerified,
        existingEmail: existingUser.email === email,
        existingUsername: existingUser.username === username
      });
      
      if (existingUser.isEmailVerified) {
        console.log('❌ [DEBUG] User is already verified');
        res.status(400).json({
          success: false,
          message: "User with this email or username already exists and is verified.",
        });
        return;
      } else {
        console.log('❌ [DEBUG] User exists but not verified');
        // If user exists but is not verified, allow re-registration to resend OTP
        // Or handle specific case of unverified user to resend OTP
        res.status(400).json({
          success: false,
          message: "User with this email or username exists but is not verified. Please verify your email or try logging in.",
        });
        return;
      }
    }
    console.log('✅ [DEBUG] No existing user found, proceeding with registration');
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237

    // Create user with enhanced profile data
    const user = new User({
      fullName,
      username,
      email,
      contactNumber,
      password,
<<<<<<< HEAD
      profile: profile || {}
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;

    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Save refresh token
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    // TODO: Send verification email

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON() as any,
        accessToken,
        refreshToken
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
=======
      profile: profile || {},
      isEmailVerified: false, // User is not verified until OTP is confirmed
    });

    // Generate and save OTP
    console.log('🔍 [DEBUG] Generating OTP...');
    const otp = generateOTP();
    console.log('🔍 [DEBUG] Generated OTP:', otp);
    
    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    console.log('🔍 [DEBUG] Saving user to database...');
    await user.save();
    console.log('✅ [DEBUG] User saved successfully with ID:', user._id);

    // Send OTP email
    console.log('🔍 [DEBUG] Preparing to send OTP email...');
    const emailSubject = 'Proxima: Verify Your Email Address';
    const emailHtml = `
      <p>Hello ${fullName},</p>
      <p>Thank you for registering with Proxima. Please use the following One-Time Password (OTP) to verify your email address:</p>
      <h3>${otp}</h3>
      <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>The Proxima Team</p>
    `;
    
    console.log('🔍 [DEBUG] Email details:', {
      to: email,
      subject: emailSubject,
      otp: otp
    });
    
    try {
      await sendEmail({
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });
      console.log('✅ [DEBUG] OTP email sent successfully to:', email);
    } catch (emailError) {
      console.error('❌ [DEBUG] Failed to send OTP email:', emailError);
      throw emailError;
    }

    const response: ApiResponse = {
      success: true,
      message: "Registration successful! Please check your email to verify your account with the OTP.",
      data: {
        userId: user._id, // Return user ID for frontend to know which user to verify
        email: user.email,
        requiresOtpVerification: true, // Add this field to trigger OTP UI
      },
    };

    console.log('✅ [DEBUG] Registration successful, sending response:', response);
    res.status(201).json(response);
  } catch (error: any) {
    console.error("❌ [DEBUG] Registration error:", error);
    console.error("❌ [DEBUG] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    });
  }
};

<<<<<<< HEAD
=======
// Verify Email with OTP
export const verifyEmailOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    // Check if this is a registration OTP verification (user not verified yet)
    if (!user.isEmailVerified) {

    if (!user.emailVerificationOTP || !user.emailVerificationOTPExpires) {
      res.status(400).json({ success: false, message: "No OTP sent for this email or OTP expired." });
      return;
    }

    if (user.emailVerificationOTP !== otp) {
      res.status(400).json({ success: false, message: "Invalid OTP." });
      return;
    }

    if (user.emailVerificationOTPExpires < new Date()) {
      res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    // Generate tokens for the newly verified user
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: "Email verified successfully! Welcome to Proxima!",
      data: {
        user: user.toJSON() as any,
        accessToken,
        refreshToken,
      },
    };

    res.status(200).json(response);
    return;
    }

    // Check if this is a login OTP verification (user already verified)
    if (user.isEmailVerified && user.loginOtp && user.loginOtpExpiry) {
      if (user.loginOtp !== otp) {
        res.status(400).json({ success: false, message: "Invalid OTP." });
        return;
      }

      if (user.loginOtpExpiry < new Date()) {
        res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        return;
      }

      // Login OTP verification successful
      user.loginOtp = undefined;
      user.loginOtpExpiry = undefined;
      
      // Update last login and track login information
      user.lastLogin = new Date();

      // Get client information
      const ipAddress =
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        "unknown";
      const userAgent = req.get("User-Agent") || "unknown";
      const machineId = req.get("X-Machine-ID") || "unknown";
      const macAddress = req.get("X-MAC-Address") || "unknown";

      // Add to login history
      if (!user.loginHistory) {
        user.loginHistory = [];
      }
      user.loginHistory.push({
        ipAddress,
        userAgent,
        machineId,
        macAddress,
        loginTime: new Date(),
        location: {
          country: "Unknown",
          city: "Unknown",
          region: "Unknown",
        },
      });

      // Keep only last 10 login records
      if (user.loginHistory.length > 10) {
        user.loginHistory = user.loginHistory.slice(-10);
      }

      await user.save();

      // Generate tokens
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token
      user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
      await user.save();

      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: "Login successful! Welcome back!",
        data: {
          user: user.toJSON() as any,
          accessToken,
          refreshToken,
        },
      };

      res.status(200).json(response);
      return;
    }

    // If we reach here, no valid OTP was found
    res.status(400).json({ success: false, message: "No valid OTP found for this email." });
  } catch (error: any) {
    console.error("Email OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during OTP verification",
    });
  }
};

// Resend Email OTP
export const resendEmailOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ success: false, message: "Email is already verified. Please log in." });
      return;
    }

    // Generate new OTP
    const newOtp = generateOTP();
    user.emailVerificationOTP = newOtp;
    user.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    await user.save();

    // Send new OTP email
    const emailSubject = 'Proxima: Your New Email Verification OTP';
    const emailHtml = `
      <p>Hello ${user.fullName},</p>
      <p>You recently requested a new One-Time Password (OTP) to verify your email address for Proxima:</p>
      <h3>${newOtp}</h3>
      <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>The Proxima Team</p>
    `;
    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message: "New OTP sent successfully. Please check your email.",
      data: {
        userId: user._id,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during OTP resend",
    });
  }
};


>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user by email or username
    const user = await User.findOne({
<<<<<<< HEAD
      $or: [{ email }, { username: email }]
=======
      $or: [{ email }, { username: email }],
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    });

    if (!user) {
      res.status(401).json({
        success: false,
<<<<<<< HEAD
        message: 'Invalid credentials'
=======
        message: "Invalid credentials",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
<<<<<<< HEAD
        message: 'Account has been deactivated'
=======
        message: "Account has been deactivated",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      });
      return;
    }

<<<<<<< HEAD
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
=======
    // Check if email is verified
    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        message: "Please verify your email address with the OTP sent to your inbox.",
        data: {
          email: user.email,
          requiresOtpVerification: true,
        }
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      });
      return;
    }

<<<<<<< HEAD
    // Update last login and track login information
    user.lastLogin = new Date();
    
    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const machineId = req.get('X-Machine-ID') || 'unknown';
    const macAddress = req.get('X-MAC-Address') || 'unknown';
    
    // Add to login history
    if (!user.loginHistory) {
      user.loginHistory = [];
    }
    user.loginHistory.push({
      ipAddress,
      userAgent,
      machineId,
      macAddress,
      loginTime: new Date(),
      location: {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown'
      }
    });
    
    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Save refresh token
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON() as any,
        accessToken,
        refreshToken
      }
=======
    // For verified users, send OTP for login verification
    console.log('🔍 [DEBUG] Login - User is verified, sending OTP for login verification');
    
    // Generate OTP for login verification
    const loginOtp = generateOTP();
    user.loginOtp = loginOtp;
    user.loginOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Proxima: Login Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Login Verification</h2>
            <p>Hello ${user.fullName},</p>
            <p>You're attempting to log in to your Proxima account. Please use the following verification code:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #f59e0b; font-size: 32px; margin: 0; letter-spacing: 4px;">${loginOtp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this login, please ignore this email.</p>
            <p>Best regards,<br>The Proxima Team</p>
          </div>
        `,
      });
      console.log('✅ [DEBUG] Login OTP email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('❌ [DEBUG] Failed to send login OTP email:', emailError);
    }

    // Return response indicating OTP verification is required
    const response: ApiResponse = {
      success: true,
      message: "Please check your email for the login verification code.",
      data: {
        email: user.email,
        requiresOtpVerification: true,
      },
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    };

    res.status(200).json(response);
  } catch (error: any) {
<<<<<<< HEAD
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
=======
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    });
  }
};

// Logout user
<<<<<<< HEAD
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
=======
export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    if (refreshToken) {
      req.user?.removeRefreshToken(refreshToken);
      await req.user?.save();
    }

    res.status(200).json({
      success: true,
<<<<<<< HEAD
      message: 'Logout successful'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
=======
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    });
  }
};

// Refresh token
<<<<<<< HEAD
export const refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
=======
export const refreshToken = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
  try {
    const { refreshToken } = req.body;
    const user = req.user!;

    // Remove old refresh token
    user.removeRefreshToken(refreshToken);

    // Generate new tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
<<<<<<< HEAD
    
=======

>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    // Save new refresh token
    user.refreshTokens.push({ token: newRefreshToken, createdAt: new Date() });
    await user.save();

    const response: ApiResponse<AuthResponse> = {
      success: true,
<<<<<<< HEAD
      message: 'Token refreshed successfully',
      data: {
        user: user.toJSON(),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
=======
      message: "Token refreshed successfully",
      data: {
        user: user.toJSON(),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    };

    res.status(200).json(response);
  } catch (error: any) {
<<<<<<< HEAD
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
=======
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during token refresh",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    });
  }
};

// Get current user
<<<<<<< HEAD
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'User retrieved successfully',
      data: req.user?.toJSON()
=======
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const response: ApiResponse = {
      success: true,
      message: "User retrieved successfully",
      data: req.user?.toJSON(),
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    };

    res.status(200).json(response);
  } catch (error: any) {
<<<<<<< HEAD
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
=======
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    });
  }
};

// Forgot password
<<<<<<< HEAD
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
=======
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
<<<<<<< HEAD
        message: 'User not found'
=======
        message: "User not found",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      });
      return;
    }

    // Generate reset token
<<<<<<< HEAD
    const resetToken = crypto.randomBytes(32).toString('hex');
=======
    const resetToken = crypto.randomBytes(32).toString("hex");
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // TODO: Send reset email

    res.status(200).json({
      success: true,
<<<<<<< HEAD
      message: 'Password reset email sent'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
=======
      message: "Password reset email sent",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    });
  }
};

// Reset password
<<<<<<< HEAD
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
=======
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
<<<<<<< HEAD
      passwordResetExpires: { $gt: Date.now() }
=======
      passwordResetExpires: { $gt: Date.now() },
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    });

    if (!user) {
      res.status(400).json({
        success: false,
<<<<<<< HEAD
        message: 'Invalid or expired reset token'
=======
        message: "Invalid or expired reset token",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      });
      return;
    }

    // Update password
<<<<<<< HEAD
    user.set('password', password);
=======
    user.set("password", password);
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
<<<<<<< HEAD
      message: 'Password reset successful'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
=======
      message: "Password reset successful",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    });
  }
};

<<<<<<< HEAD
// Verify email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Google OAuth authentication
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, email, imageUrl, accessToken, idToken, password } = req.body;

    // Verify Google ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (error) {
      console.error('Google token verification failed:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid Google token'
      });
      return;
    }

    const payload = ticket.getPayload();
    if (!payload || payload.email !== email) {
      res.status(400).json({
        success: false,
        message: 'Google token verification failed'
=======

// Google OAuth authentication
export const googleAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      id,
      name,
      email,
      imageUrl,
      accessToken,
      idToken,
      isRegistration,
      registrationData,
    } = req.body;

    // Verify Google access token by fetching user info
    let userInfo: any;
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      if (!response.ok) {
        throw new Error(`Failed to verify access token: ${response.statusText}`);
      }
      userInfo = await response.json();
      
      // Verify the email matches
      if (userInfo.email !== email) {
        res.status(400).json({
          success: false,
          message: "Google token verification failed - email mismatch",
        });
        return;
      }
    } catch (error) {
      console.error("Google token verification failed:", error);
      res.status(400).json({
        success: false,
        message: "Invalid Google token",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      });
      return;
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
<<<<<<< HEAD
      // Create new user with Google data
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
      
=======
      // If this is not a registration request, return error to prompt user to register
      if (!isRegistration) {
        res.status(404).json({
          success: false,
          message: "USER_NOT_REGISTERED",
          data: {
            googleData: {
              id,
              name,
              email,
              imageUrl,
            },
          },
        });
        return;
      }

      // Create new user with Google data and registration data
      const username =
        registrationData?.username ||
        email.split("@")[0] + "_" + Math.random().toString(36).substr(2, 5);

>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      user = new User({
        fullName: name,
        username,
        email,
<<<<<<< HEAD
        password: password || crypto.randomBytes(16).toString('hex'), // Use provided password or generate random
        avatarUrl: imageUrl,
        isEmailVerified: true,
        profile: {
          jobTitle: '',
          company: '',
          experience: 'mid',
          skills: [],
          workPreferences: {
            workStyle: 'mixed',
            communicationStyle: 'direct',
            timeManagement: 'structured',
            preferredWorkingHours: {
              start: '09:00',
              end: '17:00'
            },
            timezone: 'UTC'
          },
          personality: {
            traits: [],
            workingStyle: 'results-driven',
            stressLevel: 'medium',
            motivationFactors: ['growth', 'challenge']
=======
        password:
          registrationData?.password || crypto.randomBytes(16).toString("hex"),
        contactNumber: registrationData?.contactNumber || "",
        avatarUrl: imageUrl,
        isEmailVerified: true, // Google verified emails are considered verified
        profile: registrationData?.profile || {
          jobTitle: "",
          company: "",
          experience: "mid",
          skills: [],
          workPreferences: {
            workStyle: "mixed",
            communicationStyle: "direct",
            timeManagement: "structured",
            preferredWorkingHours: {
              start: "09:00",
              end: "17:00",
            },
            timezone: "UTC",
          },
          personality: {
            traits: [],
            workingStyle: "results-driven",
            stressLevel: "medium",
            motivationFactors: ["growth", "challenge"],
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
          },
          goals: {
            shortTerm: [],
            longTerm: [],
<<<<<<< HEAD
            careerAspirations: ''
=======
            careerAspirations: "",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
          },
          learning: {
            interests: [],
            currentLearning: [],
<<<<<<< HEAD
            certifications: []
=======
            certifications: [],
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
          },
          productivity: {
            peakHours: [],
            taskPreferences: {
              preferredTaskTypes: [],
<<<<<<< HEAD
              taskComplexity: 'mixed',
              deadlineSensitivity: 'moderate'
            },
            workEnvironment: {
              preferredEnvironment: 'moderate',
              collaborationPreference: 'medium'
            }
          },
          aiPreferences: {
            assistanceLevel: 'moderate',
            preferredSuggestions: ['task-prioritization', 'time-estimation'],
            communicationStyle: 'friendly',
=======
              taskComplexity: "mixed",
              deadlineSensitivity: "moderate",
            },
            workEnvironment: {
              preferredEnvironment: "moderate",
              collaborationPreference: "medium",
            },
          },
          aiPreferences: {
            assistanceLevel: "moderate",
            preferredSuggestions: ["task-prioritization", "time-estimation"],
            communicationStyle: "friendly",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
            notificationPreferences: {
              taskReminders: true,
              deadlineAlerts: true,
              productivityInsights: true,
<<<<<<< HEAD
              skillRecommendations: true
            }
          }
        }
=======
              skillRecommendations: true,
            },
          },
        },
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
      });

      await user.save();
    } else {
      // Update existing user with Google data if needed
      if (!user.avatarUrl && imageUrl) {
        user.avatarUrl = imageUrl;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
      }
      await user.save();
    }

    // Update last login and track login information
    user.lastLogin = new Date();
<<<<<<< HEAD
    
    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const machineId = req.get('X-Machine-ID') || 'unknown';
    const macAddress = req.get('X-MAC-Address') || 'unknown';
    
=======

    // Get client information
    const ipAddress =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "unknown";
    const userAgent = req.get("User-Agent") || "unknown";
    const machineId = req.get("X-Machine-ID") || "unknown";
    const macAddress = req.get("X-MAC-Address") || "unknown";

>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    // Add to login history
    if (!user.loginHistory) {
      user.loginHistory = [];
    }
    user.loginHistory.push({
      ipAddress,
      userAgent,
      machineId,
      macAddress,
      loginTime: new Date(),
      location: {
<<<<<<< HEAD
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown'
      }
    });
    
=======
        country: "Unknown",
        city: "Unknown",
        region: "Unknown",
      },
    });

>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
<<<<<<< HEAD
    
=======

>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    await user.save();

    // Generate tokens
    const jwtAccessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
<<<<<<< HEAD
    
=======

>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    // Save refresh token
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    const response: ApiResponse<AuthResponse> = {
      success: true,
<<<<<<< HEAD
      message: 'Google authentication successful',
      data: {
        user: user.toJSON() as any,
        accessToken: jwtAccessToken,
        refreshToken
      }
=======
      message: isRegistration
        ? "Registration successful! Welcome to Proxima!"
        : "Google authentication successful",
      data: {
        user: user.toJSON() as any,
        accessToken: jwtAccessToken,
        refreshToken,
      },
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    };

    res.status(200).json(response);
  } catch (error: any) {
<<<<<<< HEAD
    console.error('Google authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google authentication'
=======
    console.error("Google authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during Google authentication",
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    });
  }
};
