import { Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import DesktopSessionToken from '../models/DesktopSessionToken';
import {
  AuthenticatedRequest,
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  JWTPayload,
  DesktopDeviceInfo,
} from "../types";
import { sendEmail } from '../services/emailService';
import {
  setCookieToken,
  clearCookieToken
} from '../utils/cookieUtils';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'debug.log');
const log = (msg: string) => {
  try {
    fs.appendFileSync(logFile, new Date().toISOString() + ' ' + msg + '\n');
  } catch (e) {
    console.error('Failed to write to log file', e);
  }
};

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const DESKTOP_SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "30d",
  });
};

// Generate a 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
};

const extractClientMeta = (req: Request) => {
  const ipAddress =
    (req.headers['x-forwarded-for'] as string) ||
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown";

  return {
    ipAddress,
    userAgent: req.get("User-Agent") || "unknown",
    machineId: req.get("X-Machine-ID") || "unknown",
    macAddress: req.get("X-MAC-Address") || "unknown",
    language: req.get("Accept-Language") || undefined,
  };
};

const normalizeDeviceInfo = (info: any): DesktopDeviceInfo | undefined => {
  if (!info || typeof info !== 'object') return undefined;
  const normalized: DesktopDeviceInfo = {};
  if (typeof info.runtime === 'string') normalized.runtime = info.runtime;
  if (typeof info.platform === 'string') normalized.platform = info.platform;
  if (typeof info.userAgent === 'string') normalized.userAgent = info.userAgent;
  if (typeof info.language === 'string') normalized.language = info.language;
  if (info.timestamp) {
    const ts = new Date(info.timestamp);
    if (!isNaN(ts.getTime())) normalized.timestamp = ts;
  }
  return Object.keys(normalized).length ? normalized : undefined;
};

const buildLoginDeviceInfo = (req: Request, fallback: 'browser' | 'desktop' | 'mobile', base?: DesktopDeviceInfo): DesktopDeviceInfo => {
  return {
    runtime: base?.runtime || fallback,
    platform: base?.platform,
    userAgent: base?.userAgent || req.get("User-Agent") || "unknown",
    language: base?.language || req.get("Accept-Language") || undefined,
    timestamp: new Date(),
  };
};

const appendLoginHistoryEntry = (
  user: any,
  req: Request,
  runtime: 'browser' | 'desktop' | 'mobile',
  source?: 'web' | 'desktop' | 'mobile',
  base?: DesktopDeviceInfo
) => {
  const { ipAddress, userAgent, machineId, macAddress } = extractClientMeta(req);
  const loginDeviceInfo = buildLoginDeviceInfo(req, runtime, base);

  if (!user.loginHistory) {
    user.loginHistory = [] as any;
  }

  const history = user.loginHistory as any[];
  history.push({
    ipAddress,
    userAgent,
    machineId,
    macAddress,
    runtime: loginDeviceInfo.runtime || runtime,
    source: source || (runtime === 'desktop' ? 'desktop' : 'web'),
    deviceInfo: loginDeviceInfo,
    loginTime: new Date(),
    location: {
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
    },
  });

  if (history.length > 10) {
    user.loginHistory = history.slice(-10) as any;
  }
};

export const createDesktopSessionToken: RequestHandler = async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + DESKTOP_SESSION_TTL_MS);
    const deviceInfo = normalizeDeviceInfo((req.body || {}).deviceInfo);
    const { ipAddress, userAgent } = extractClientMeta(req);

    await DesktopSessionToken.create({
      tokenHash,
      user: authReq.user._id,
      expiresAt,
      consumed: false,
      source: 'desktop',
      deviceInfo,
      ipAddress,
      userAgent
    });

    res.status(201).json({
      success: true,
      message: 'Desktop session token created',
      data: {
        token: rawToken,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Desktop token creation failed:', error);
    res.status(500).json({ success: false, message: 'Failed to create desktop session token' });
  }
};

export const exchangeDesktopSessionToken: RequestHandler = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: 'Token is required' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await DesktopSessionToken.findOne({ tokenHash });

    if (!record) {
      res.status(400).json({ success: false, message: 'Invalid desktop session token' });
      return;
    }

    if (record.consumed) {
      res.status(400).json({ success: false, message: 'Desktop session token already used' });
      return;
    }

    if (record.expiresAt < new Date()) {
      res.status(400).json({ success: false, message: 'Desktop session token expired' });
      return;
    }

    const user = await User.findById(record.user);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    record.consumed = true;
    record.consumedAt = new Date();
    record.source = record.source || 'desktop';
    await record.save();

    const accessToken = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });

    appendLoginHistoryEntry(user, req, 'desktop', record.source || 'desktop', record.deviceInfo);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Desktop session established',
      data: {
        user: user.toJSON() as any,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Desktop token exchange failed:', error);
    res.status(500).json({ success: false, message: 'Failed to exchange desktop session token' });
  }
};

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
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

    // Create user with enhanced profile data
    const user = new User({
      fullName,
      username,
      email,
      contactNumber,
      password,
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
    const emailSubject = 'Sartthi: Verify Your Email Address';
    const emailHtml = `
      <p>Hello ${fullName},</p>
      <p>Thank you for registering with Sartthi. Please use the following One-Time Password (OTP) to verify your email address:</p>
      <h3>${otp}</h3>
      <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>The Sartthi Team</p>
    `;

    console.log('🔍 [DEBUG] Email details:', {
      to: email,
      subject: emailSubject,
      otp: otp
    });

    let emailSent = false;
    try {
      await sendEmail({
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });
      console.log('✅ [DEBUG] OTP email sent successfully to:', email);
      emailSent = true;
    } catch (emailError) {
      console.error('❌ [DEBUG] Failed to send OTP email:', emailError);
      // Don't throw error - allow registration to continue without email
      console.warn('⚠️ [DEBUG] Continuing registration without email verification');
    }

    const response: ApiResponse = {
      success: true,
      message: emailSent
        ? "Registration successful! Please check your email to verify your account with the OTP."
        : "Registration successful! Email service is not configured. Your account has been created but email verification is skipped.",
      data: {
        userId: user._id, // Return user ID for frontend to know which user to verify
        email: user.email,
        requiresOtpVerification: emailSent, // Only require OTP if email was sent
        emailSent: emailSent, // Indicate if email was actually sent
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
    });
  }
};

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

      // Generate tokens for the newly verified user
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
      appendLoginHistoryEntry(user, req, 'browser');
      await user.save();

      // Set HTTP-only cookie for SSO across subdomains
      setCookieToken(res, 'accessToken', accessToken, 7 * 24 * 60 * 60 * 1000); // 7 days

      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: "Email verified successfully! Welcome to Sartthi!",
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
      appendLoginHistoryEntry(user, req, 'browser');
      await user.save();

      // Generate tokens
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token
      user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
      await user.save();

      // Set HTTP-only cookie for SSO across subdomains
      setCookieToken(res, 'accessToken', accessToken, 7 * 24 * 60 * 60 * 1000); // 7 days

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
    const emailSubject = 'Sartthi: Your New Email Verification OTP';
    const emailHtml = `
      <p>Hello ${user.fullName},</p>
      <p>You recently requested a new One-Time Password (OTP) to verify your email address for Sartthi:</p>
      <h3>${newOtp}</h3>
      <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>The Sartthi Team</p>
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


// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    console.log('🔍 [LOGIN] Attempting login for:', email);

    // Debug: Check total users in database
    const totalUsers = await User.countDocuments();
    console.log('📊 [LOGIN] Total users in database:', totalUsers);

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    if (!user) {
      console.log('❌ [LOGIN] User not found:', email);
      
      // Debug: Check if any user with similar email exists
      const similarUsers = await User.find({ email: { $regex: email.split('@')[0], $options: 'i' } }).select('email username');
      console.log('🔍 [LOGIN] Similar users found:', similarUsers.length);
      if (similarUsers.length > 0) {
        console.log('📧 [LOGIN] Similar emails:', similarUsers.map(u => u.email));
      }
      
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    console.log('✅ [LOGIN] User found:', user.email);
    console.log('🔍 [LOGIN] User isActive:', user.isActive);
    console.log('🔍 [LOGIN] User isEmailVerified:', user.isEmailVerified);

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ [LOGIN] User account is deactivated');
      res.status(401).json({
        success: false,
        message: "Account has been deactivated",
      });
      return;
    }

    // Verify password
    console.log('🔍 [LOGIN] Comparing password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔍 [LOGIN] Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Invalid password for user:', email);
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    console.log('✅ [LOGIN] Password verified successfully');

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log('⚠️ [LOGIN] Email not verified, sending verification OTP');
      res.status(403).json({
        success: false,
        message: "Please verify your email address with the OTP sent to your inbox.",
        data: {
          email: user.email,
          requiresOtpVerification: true,
        }
      });
      return;
    }

    // For verified users, send OTP for login verification
    console.log('🔍 [LOGIN] User is verified, sending OTP for login verification');
    const loginOtp = generateOTP();
    user.loginOtp = loginOtp;
    user.loginOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    try {
      const emailSubject = 'Sartthi: Login Verification Code';
      const emailHtml = `
        <p>Hello ${user.fullName || user.email},</p>
        <p>We received a request to sign in to your Sartthi account. Use the following One-Time Password (OTP) to complete your login:</p>
        <h2>${loginOtp}</h2>
        <p>This code is valid for 10 minutes. If you did not attempt to log in, please secure your account.</p>
        <p>Best regards,<br/>The Sartthi Team</p>
      `;
      await sendEmail({
        to: user.email,
        subject: emailSubject,
        html: emailHtml,
      });
      console.log('✅ [LOGIN] OTP email sent successfully');
    } catch (emailError) {
      console.error('❌ [LOGIN] Failed to send login OTP email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: "Please check your email for the login verification code.",
      data: { email: user.email, requiresOtpVerification: true },
    });
    return;
  } catch (error: any) {
    console.error("❌ [LOGIN] Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

// Logout user
export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      req.user?.removeRefreshToken(refreshToken);
      await req.user?.save();
    }

    // Clear cookies
    clearCookieToken(res, 'accessToken');
    clearCookieToken(res, 'refreshToken');

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

// Refresh token
export const refreshToken = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const user = req.user!;

    // Remove old refresh token
    user.removeRefreshToken(refreshToken);

    // Generate new tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Save new refresh token
    user.refreshTokens.push({ token: newRefreshToken, createdAt: new Date() });
    await user.save();

    // Set HTTP-only cookies
    setCookieToken(res, 'accessToken', newAccessToken, 7 * 24 * 60 * 60 * 1000); // 7 days
    setCookieToken(res, 'refreshToken', newRefreshToken, 30 * 24 * 60 * 60 * 1000); // 30 days

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: "Token refreshed successfully",
      data: {
        user: user.toJSON(),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during token refresh",
    });
  }
};

// Get current user
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const response: ApiResponse = {
      success: true,
      message: "User retrieved successfully",
      data: req.user?.toJSON(),
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Forgot password
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // TODO: Send reset email

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset password
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
      return;
    }

    // Update password
    user.set("password", password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





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

    log(`[DEBUG] Google Auth Request: email=${email}, isRegistration=${isRegistration}`);
    log(`[DEBUG] Env Check: hasJwtSecret=${!!process.env.JWT_SECRET}, hasRefreshSecret=${!!process.env.JWT_REFRESH_SECRET}`);

    console.log('🔍 [DEBUG] Google Auth Request:', { email, isRegistration });
    console.log('🔍 [DEBUG] Env Check:', {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasRefreshSecret: !!process.env.JWT_REFRESH_SECRET
    });

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
      });
      return;
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
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

      user = new User({
        fullName: name,
        username,
        email,
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
          },
          goals: {
            shortTerm: [],
            longTerm: [],
            careerAspirations: "",
          },
          learning: {
            interests: [],
            currentLearning: [],
            certifications: [],
          },
          productivity: {
            peakHours: [],
            taskPreferences: {
              preferredTaskTypes: [],
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
            notificationPreferences: {
              taskReminders: true,
              deadlineAlerts: true,
              productivityInsights: true,
              skillRecommendations: true,
            },
          },
        },
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
    appendLoginHistoryEntry(user, req, 'browser');
    await user.save();

    // Generate tokens
    const jwtAccessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    // Set HTTP-only cookies
    setCookieToken(res, 'accessToken', jwtAccessToken, 7 * 24 * 60 * 60 * 1000); // 7 days
    setCookieToken(res, 'refreshToken', refreshToken, 30 * 24 * 60 * 60 * 1000); // 30 days

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: isRegistration
        ? "Registration successful! Welcome to Sartthi!"
        : "Google authentication successful",
      data: {
        user: user.toJSON() as any,
        accessToken: jwtAccessToken,
        refreshToken,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Google authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during Google authentication",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    log(`[ERROR] Google Auth Failed: ${error.message}\n${error.stack}`);
  }
};
