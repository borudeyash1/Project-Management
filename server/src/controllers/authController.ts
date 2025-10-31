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

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    await user.save();

    // Generate tokens for the newly verified user
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

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

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: "Account has been deactivated",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
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
        subject: 'Sartthi: Login Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Login Verification</h2>
            <p>Hello ${user.fullName},</p>
            <p>You're attempting to log in to your Sartthi account. Please use the following verification code:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #f59e0b; font-size: 32px; margin: 0; letter-spacing: 4px;">${loginOtp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this login, please ignore this email.</p>
            <p>Best regards,<br>The Sartthi Team</p>
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
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Login error:", error);
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
    const jwtAccessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

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
    });
  }
};
