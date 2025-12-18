import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const LoginDeviceInfoSchema = new Schema({
  runtime: { type: String, enum: ['browser', 'desktop', 'mobile'], default: 'browser' },
  platform: { type: String },
  userAgent: { type: String },
  language: { type: String },
  timestamp: { type: Date }
}, { _id: false });

const userSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  contactNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  designation: {
    type: String,
    trim: true,
    maxlength: [100, 'Designation cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  about: {
    type: String,
    trim: true,
    maxlength: [500, 'About cannot exceed 500 characters']
  },
  dateOfBirth: {
    type: Date
  },
  faceScanImage: {
    type: String,
    trim: true
  },
  // Enhanced profile information for AI-powered insights
  profile: {
    // Professional Information
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [50, 'Industry cannot exceed 50 characters']
    },
    experience: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid'
    },
    skills: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      },
      category: {
        type: String,
        enum: ['technical', 'soft', 'management', 'creative', 'analytical'],
        default: 'technical'
      }
    }],
    workPreferences: {
      workStyle: {
        type: String,
        enum: ['collaborative', 'independent', 'mixed'],
        default: 'mixed'
      },
      communicationStyle: {
        type: String,
        enum: ['direct', 'diplomatic', 'analytical', 'creative'],
        default: 'direct'
      },
      timeManagement: {
        type: String,
        enum: ['structured', 'flexible', 'deadline-driven', 'spontaneous'],
        default: 'structured'
      },
      preferredWorkingHours: {
        start: {
          type: String,
          default: '09:00'
        },
        end: {
          type: String,
          default: '17:00'
        }
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    },
    // Personal Information for AI insights
    personality: {
      traits: [{
        name: {
          type: String,
          required: true
        },
        score: {
          type: Number,
          min: 1,
          max: 10,
          required: true
        }
      }],
      workingStyle: {
        type: String,
        enum: ['detail-oriented', 'big-picture', 'process-focused', 'results-driven'],
        default: 'results-driven'
      },
      stressLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      motivationFactors: [{
        type: String,
        enum: ['recognition', 'autonomy', 'challenge', 'security', 'growth', 'impact']
      }]
    },
    // Goals and Aspirations
    goals: {
      shortTerm: [{
        description: {
          type: String,
          required: true,
          trim: true
        },
        targetDate: Date,
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium'
        }
      }],
      longTerm: [{
        description: {
          type: String,
          required: true,
          trim: true
        },
        targetDate: Date,
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium'
        }
      }],
      careerAspirations: {
        type: String,
        trim: true,
        maxlength: [500, 'Career aspirations cannot exceed 500 characters']
      }
    },
    // Learning and Development
    learning: {
      interests: [{
        type: String,
        trim: true
      }],
      currentLearning: [{
        topic: {
          type: String,
          required: true,
          trim: true
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        },
        startDate: Date,
        targetCompletion: Date
      }],
      certifications: [{
        name: {
          type: String,
          required: true,
          trim: true
        },
        issuer: {
          type: String,
          required: true,
          trim: true
        },
        dateEarned: Date,
        expiryDate: Date
      }]
    },
    // Productivity and Work Patterns
    productivity: {
      peakHours: [{
        start: String,
        end: String,
        dayOfWeek: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }
      }],
      taskPreferences: {
        preferredTaskTypes: [{
          type: String,
          enum: ['creative', 'analytical', 'administrative', 'collaborative', 'technical']
        }],
        taskComplexity: {
          type: String,
          enum: ['simple', 'moderate', 'complex', 'mixed'],
          default: 'mixed'
        },
        deadlineSensitivity: {
          type: String,
          enum: ['flexible', 'moderate', 'strict'],
          default: 'moderate'
        }
      },
      workEnvironment: {
        preferredEnvironment: {
          type: String,
          enum: ['quiet', 'moderate', 'busy', 'flexible'],
          default: 'moderate'
        },
        collaborationPreference: {
          type: String,
          enum: ['high', 'medium', 'low', 'mixed'],
          default: 'medium'
        }
      }
    },
    // AI Assistant Preferences
    aiPreferences: {
      assistanceLevel: {
        type: String,
        enum: ['minimal', 'moderate', 'comprehensive'],
        default: 'moderate'
      },
      preferredSuggestions: [{
        type: String,
        enum: ['task-prioritization', 'time-estimation', 'resource-allocation', 'deadline-optimization', 'skill-development']
      }],
      communicationStyle: {
        type: String,
        enum: ['formal', 'casual', 'technical', 'friendly'],
        default: 'friendly'
      },
      notificationPreferences: {
        taskReminders: {
          type: Boolean,
          default: true
        },
        deadlineAlerts: {
          type: Boolean,
          default: true
        },
        productivityInsights: {
          type: Boolean,
          default: true
        },
        skillRecommendations: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  faceData: {
    images: {
      type: [String],
      default: []
    },
    verified: {
      type: Boolean,
      default: false
    },
    lastUpdated: Date
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: String, // New field for OTP
  emailVerificationOTPExpires: Date, // New field for OTP expiration
  loginOtp: String, // New field for login OTP
  loginOtpExpiry: Date, // New field for login OTP expiration
  workspaceCreationOtp: String,
  workspaceCreationOtpExpires: Date,
  workspaceCreationOtpVerifiedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '30d'
    }
  }],
  lastLogin: Date,
  loginHistory: [{
    ipAddress: String,
    userAgent: String,
    machineId: String,
    macAddress: String,
    runtime: {
      type: String,
      enum: ['browser', 'desktop', 'mobile'],
      default: 'browser'
    },
    source: {
      type: String,
      enum: ['web', 'desktop', 'mobile'],
      default: 'web'
    },
    deviceInfo: {
      type: LoginDeviceInfoSchema,
      default: undefined
    },
    loginTime: {
      type: Date,
      default: Date.now
    },
    location: {
      country: String,
      city: String,
      region: String
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'ultra'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer', 'crypto'],
      default: null
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    features: {
      maxWorkspaces: { type: Number, default: 1 },
      maxProjects: { type: Number, default: 3 },
      maxTeamMembers: { type: Number, default: 5 },
      maxStorage: { type: Number, default: 1 }, // GB
      aiAssistance: { type: Boolean, default: true },
      advancedAnalytics: { type: Boolean, default: false },
      customIntegrations: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      whiteLabeling: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false }
    },
    // Legacy fields for backward compatibility
    isPro: {
      type: Boolean,
      default: false
    },
    trialEndsAt: Date
  },
  // Sartthi Ecosystem Modules (Mail, Calendar, etc.)
  modules: {
    mail: {
      isEnabled: {
        type: Boolean,
        default: false
      },
      refreshToken: {
        type: String,
        default: null
      },
      connectedAt: Date,
      lastSyncedAt: Date
    },
    calendar: {
      isEnabled: {
        type: Boolean,
        default: false
      },
      refreshToken: {
        type: String,
        default: null
      },
      connectedAt: Date,
      lastSyncedAt: Date
    },
    vault: {
      isEnabled: {
        type: Boolean,
        default: false
      },
      rootFolderId: {
        type: String,
        default: null
      },
      refreshToken: {
        type: String,
        default: null
      },
      connectedAt: Date,
      lastSyncedAt: Date
    }
  },
  settings: {
    themeColor: {
      type: String,
      default: 'yellow',
      enum: ['yellow', 'blue', 'green', 'purple', 'red']
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    notifications: {
      inApp: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    },
    calendar: {
      syncGoogle: {
        type: Boolean,
        default: false
      },
      syncOutlook: {
        type: Boolean,
        default: false
      },
      defaultView: {
        type: String,
        default: 'month',
        enum: ['month', 'week', 'day']
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        default: 'workspace',
        enum: ['public', 'workspace', 'private']
      },
      twoFactorAuth: {
        type: Boolean,
        default: false
      }
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    accentColor: {
      type: String,
      default: '#FBBF24'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    density: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable'
    },
    animations: {
      type: Boolean,
      default: true
    },
    reducedMotion: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ 'refreshTokens.token': 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it's new or has been modified
  if (!this.isModified('password') || this.password === undefined) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    // Ensure this.password is a string before hashing
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // If password is not set (e.g., for some OAuth users), it cannot be compared
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function (): string {
  const crypto = require('crypto');
  const token = crypto.randomBytes(40).toString('hex');
  this.refreshTokens.push({ token });
  return token;
};

// Remove old refresh tokens
userSchema.methods.removeRefreshToken = function (token: string): void {
  this.refreshTokens = this.refreshTokens.filter((t: any) => t.token !== token);
};

// Transform JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  delete userObject.emailVerificationOTP; // New: Delete OTP from output
  delete userObject.emailVerificationOTPExpires; // New: Delete OTP expiration from output
  delete userObject.loginOtp; // New: Delete login OTP from output
  delete userObject.loginOtpExpiry; // New: Delete login OTP expiration from output
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

export default mongoose.model<IUser>('User', userSchema);
