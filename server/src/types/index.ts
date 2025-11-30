import { Request } from 'express';
import { Document } from 'mongoose';

export interface DesktopDeviceInfo {
  runtime?: 'browser' | 'desktop' | 'mobile';
  platform?: string;
  userAgent?: string;
  language?: string;
  timestamp?: Date | string;
}

// User Types
export interface IUser extends Document {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  password?: string; // Made optional as it's not always present for Google OAuth users immediately
  contactNumber?: string;
  designation?: string;
  department?: string;
  location?: string;
  about?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  faceScanImage?: string;
  emailVerificationOTP?: string; // New field for OTP
  emailVerificationOTPExpires?: Date; // New field for OTP expiration
  loginOtp?: string; // New field for login OTP
  loginOtpExpiry?: Date; // New field for login OTP expiration
  workspaceCreationOtp?: string;
  workspaceCreationOtpExpires?: Date;
  workspaceCreationOtpVerifiedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokens: Array<{
    token: string;
    createdAt: Date;
  }>;
  lastLogin?: Date;
  loginHistory?: Array<{
    ipAddress: string;
    userAgent: string;
    machineId: string;
    macAddress: string;
    runtime?: 'browser' | 'desktop' | 'mobile';
    source?: 'web' | 'desktop' | 'mobile';
    deviceInfo?: DesktopDeviceInfo;
    loginTime: Date;
    location: {
      country: string;
      city: string;
      region: string;
    };
  }>;
  isActive: boolean;
  subscription: {
    plan: 'free' | 'pro' | 'ultra';
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    startDate: Date;
    endDate?: Date;
    autoRenew: boolean;
    paymentMethod?: 'card' | 'paypal' | 'bank_transfer' | 'crypto';
    billingCycle: 'monthly' | 'yearly';
    features: {
      maxWorkspaces: number;
      maxProjects: number;
      maxTeamMembers: number;
      aiAssistance: boolean;
      advancedAnalytics: boolean;
      customIntegrations: boolean;
      prioritySupport: boolean;
      whiteLabeling: boolean;
      apiAccess: boolean;
    };
    // Legacy fields for backward compatibility
    isPro: boolean;
    trialEndsAt?: Date;
  };
  settings: {
    themeColor: 'yellow' | 'blue' | 'green' | 'purple' | 'red';
    darkMode: boolean;
    notifications: {
      inApp: boolean;
      email: boolean;
      push: boolean;
    };
    calendar: {
      syncGoogle: boolean;
      syncOutlook: boolean;
      defaultView: 'month' | 'week' | 'day';
    };
    privacy: {
      profileVisibility: 'public' | 'workspace' | 'private';
      twoFactorAuth: boolean;
    };
  };
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
    animations: boolean;
    reducedMotion: boolean;
  };
  // Sartthi Ecosystem Modules
  modules?: {
    mail?: {
      isEnabled: boolean;
      refreshToken?: string | null;
      connectedAt?: Date;
      lastSyncedAt?: Date;
    };
    calendar?: {
      isEnabled: boolean;
      refreshToken?: string | null;
      connectedAt?: Date;
      lastSyncedAt?: Date;
    };
    vault?: {
      isEnabled: boolean;
      rootFolderId?: string;
      refreshToken?: string | null;
      connectedAt?: Date;
      lastSyncedAt?: Date;
    };
  };
  // Enhanced profile information for AI-powered insights
  profile?: {
    // Professional Information
    jobTitle?: string;
    company?: string;
    industry?: string;
    experience?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
    skills?: Array<{
      name: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      category: 'technical' | 'soft' | 'management' | 'creative' | 'analytical';
    }>;
    workPreferences?: {
      workStyle?: 'collaborative' | 'independent' | 'mixed';
      communicationStyle?: 'direct' | 'diplomatic' | 'analytical' | 'creative';
      timeManagement?: 'structured' | 'flexible' | 'deadline-driven' | 'spontaneous';
      preferredWorkingHours?: {
        start: string;
        end: string;
      };
      timezone?: string;
    };
    // Personal Information for AI insights
    personality?: {
      traits?: Array<{
        name: string;
        score: number;
      }>;
      workingStyle?: 'detail-oriented' | 'big-picture' | 'process-focused' | 'results-driven';
      stressLevel?: 'low' | 'medium' | 'high';
      motivationFactors?: Array<'recognition' | 'autonomy' | 'challenge' | 'security' | 'growth' | 'impact'>;
    };
    // Goals and Aspirations
    goals?: {
      shortTerm?: Array<{
        description: string;
        targetDate?: Date;
        priority?: 'low' | 'medium' | 'high';
      }>;
      longTerm?: Array<{
        description: string;
        targetDate?: Date;
        priority?: 'low' | 'medium' | 'high';
      }>;
      careerAspirations?: string;
    };
    // Learning and Development
    learning?: {
      interests?: string[];
      currentLearning?: Array<{
        topic: string;
        progress?: number;
        startDate?: Date;
        targetCompletion?: Date;
      }>;
      certifications?: Array<{
        name: string;
        issuer: string;
        dateEarned?: Date;
        expiryDate?: Date;
      }>;
    };
    // Productivity and Work Patterns
    productivity?: {
      peakHours?: Array<{
        start: string;
        end: string;
        dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      }>;
      taskPreferences?: {
        preferredTaskTypes?: Array<'creative' | 'analytical' | 'administrative' | 'collaborative' | 'technical'>;
        taskComplexity?: 'simple' | 'moderate' | 'complex' | 'mixed';
        deadlineSensitivity?: 'flexible' | 'moderate' | 'strict';
      };
      workEnvironment?: {
        preferredEnvironment?: 'quiet' | 'moderate' | 'busy' | 'flexible';
        collaborationPreference?: 'high' | 'medium' | 'low' | 'mixed';
      };
    };
    // AI Assistant Preferences
    aiPreferences?: {
      assistanceLevel?: 'minimal' | 'moderate' | 'comprehensive';
      preferredSuggestions?: Array<'task-prioritization' | 'time-estimation' | 'resource-allocation' | 'deadline-optimization' | 'skill-development'>;
      communicationStyle?: 'formal' | 'casual' | 'technical' | 'friendly';
      notificationPreferences?: {
        taskReminders?: boolean;
        deadlineAlerts?: boolean;
        productivityInsights?: boolean;
        skillRecommendations?: boolean;
      };
    };
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateRefreshToken(): string;
  removeRefreshToken(token: string): void;
  toJSON(): any;
}

export interface ISubscriptionCoupon {
  code: string;
  type: 'percentage' | 'flat';
  amount: number;
  maxRedemptions?: number;
  redeemedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  notes?: string;
}

export interface ISubscriptionAffiliate {
  code: string;
  referralUrl?: string;
  commissionRate: number;
  discountPercentage: number;
  totalReferrals: number;
  isActive: boolean;
  notes?: string;
}

export interface ISubscriptionPlan extends Document {
  _id: string;
  planKey: 'free' | 'pro' | 'ultra';
  displayName: string;
  summary: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: {
    maxWorkspaces: number;
    maxProjects: number;
    maxTeamMembers: number;
  };
  features: {
    aiAccess: boolean;
    adsEnabled: boolean;
    collaboratorAccess: boolean;
    customStorageIntegration: boolean;
    desktopAppAccess: boolean;
    automaticScheduling: boolean;
    realtimeAISuggestions: boolean;
  };
  workspaceFees: {
    personal: number;
    team: number;
    enterprise: number;
  };
  perHeadPrice: number;
  collaboratorsLimit: number;
  order: number;
  couponCodes?: ISubscriptionCoupon[];
  affiliateLinks?: ISubscriptionAffiliate[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Workspace Types
export interface IWorkspace extends Document {
  _id: string;
  name: string;
  description?: string;
  type: 'personal' | 'team' | 'enterprise';
  region?: string;
  owner: string;
  members: Array<{
    user: string;
    role: 'owner' | 'admin' | 'manager' | 'member';
    permissions: {
      canCreateProject: boolean;
      canManageEmployees: boolean;
      canViewPayroll: boolean;
      canExportReports: boolean;
      canManageWorkspace: boolean;
    };
    joinedAt: Date;
    status: 'active' | 'pending' | 'suspended';
  }>;
  settings: {
    isPublic: boolean;
    allowMemberInvites: boolean;
    requireApprovalForJoining: boolean;
    defaultProjectPermissions: {
      canCreate: boolean;
      canManage: boolean;
      canView: boolean;
    };
  };
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    maxMembers: number;
    maxProjects: number;
    features: {
      advancedAnalytics: boolean;
      customFields: boolean;
      apiAccess: boolean;
      prioritySupport: boolean;
    };
  };
  vaultFolderId?: string;
  quickAccessDocs?: string[];
  documentSettings?: {
    autoSync: boolean;
    allowedFileTypes: string[];
    maxStorageGB: number;
  };
  isActive: boolean;
  memberCount: number;
  addMember(userId: string, role?: string): Promise<IWorkspace>;
  removeMember(userId: string): Promise<IWorkspace>;
  updateMemberRole(userId: string, role: string): Promise<IWorkspace>;
  isMember(userId: string): boolean;
  hasPermission(userId: string, permission: string): boolean;
  toJSON(): any;
}

// Project Types
export interface IProject extends Document {
  _id: string;
  name: string;
  description?: string;
  client?: string;
  tier: 'free' | 'pro' | 'ultra' | 'enterprise';
  workspace?: string;
  createdBy: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  budget?: {
    estimated?: number;
    actual?: number;
    currency: string;
  };
  progress: number;
  teamMembers: Array<{
    user: string;
    role: 'project-manager' | 'developer' | 'designer' | 'tester' | 'analyst' | 'member';
    permissions: {
      canManageTasks: boolean;
      canManageTeam: boolean;
      canViewReports: boolean;
      canManageProject: boolean;
    };
    joinedAt: Date;
  }>;
  milestones: Array<{
    _id: string;
    name: string;
    description?: string;
    dueDate: Date;
    completedDate?: Date;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    createdBy: string;
  }>;
  tags: string[];
  attachments: Array<{
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimeType: string;
    uploadedBy: string;
    uploadedAt: Date;
  }>;
  settings: {
    isPublic: boolean;
    allowMemberInvites: boolean;
    timeTracking: {
      enabled: boolean;
      requireApproval: boolean;
    };
    notifications: {
      taskUpdates: boolean;
      milestoneReminders: boolean;
      deadlineAlerts: boolean;
    };
  };
  isActive: boolean;
  teamMemberCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  addTeamMember(userId: string, role?: string): Promise<IProject>;
  removeTeamMember(userId: string): Promise<IProject>;
  isTeamMember(userId: string): boolean;
  hasPermission(userId: string, permission: string): boolean;
  upgradeTier(newTier: 'pro' | 'ultra' | 'enterprise', workspaceId?: string): Promise<IProject>;
  addMilestone(milestoneData: any, userId: string): Promise<IProject>;
  updateMilestone(milestoneId: string, updateData: any): Promise<IProject>;
  deleteMilestone(milestoneId: string): Promise<IProject>;
  toJSON(): any;
}

// Task Types
export interface ITask extends Document {
  _id: string;
  title: string;
  description?: string;
  type: 'task' | 'bug' | 'feature' | 'epic' | 'story' | 'subtask';
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours: number;
  progress: number;
  subtasks: Array<{
    _id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'completed';
    assignee?: string;
    dueDate?: Date;
    completedDate?: Date;
    createdBy: string;
  }>;
  dependencies: Array<{
    task: string;
    type: 'blocks' | 'blocked-by' | 'relates-to';
  }>;
  comments: Array<{
    _id: string;
    content: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    isEdited: boolean;
  }>;
  attachments: Array<{
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimeType: string;
    uploadedBy: string;
    uploadedAt: Date;
  }>;
  tags: string[];
  watchers: string[];
  timeEntries: Array<{
    _id: string;
    user: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    description?: string;
    isApproved: boolean;
    approvedBy?: string;
    approvedAt?: Date;
  }>;
  customFields: Array<{
    name: string;
    value: any;
    type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  }>;
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    allowTimeTracking: boolean;
    requireApproval: boolean;
  };
  isActive: boolean;
  subtaskCompletionPercentage: number;
  totalTimeLogged: number;
  commentCount: number;
  addSubtask(subtaskData: any, userId: string): Promise<ITask>;
  updateSubtask(subtaskId: string, updateData: any): Promise<ITask>;
  deleteSubtask(subtaskId: string): Promise<ITask>;
  addComment(content: string, userId: string): Promise<ITask>;
  updateComment(commentId: string, content: string, userId: string): Promise<ITask>;
  deleteComment(commentId: string, userId: string): Promise<ITask>;
  addTimeEntry(timeEntryData: any, userId: string): Promise<ITask>;
  approveTimeEntry(timeEntryId: string, approverId: string): Promise<ITask>;
  addWatcher(userId: string): Promise<ITask>;
  removeWatcher(userId: string): Promise<ITask>;
  toJSON(): any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  contactNumber?: string;
  password: string;
  confirmPassword: string;
  profile?: any; // Enhanced profile information
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: any;
  workspace?: IWorkspace;
  project?: IProject;
  workspaceMember?: any;
  projectMember?: any;
  refreshToken?: string;
  isAdmin?: boolean;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// File Upload Types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Query Types
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: Record<string, any>;
  search?: string;
}

// Dashboard Types
export interface DashboardStats {
  activeProjects: number;
  tasksDue: number;
  weeklyHours: number;
  payrollStatus: {
    amount: number;
    status: string;
  };
}

// Notification Types
export interface INotification extends Document {
  _id: string;
  type: 'task' | 'project' | 'workspace' | 'system';
  title: string;
  message: string;
  read: boolean;
  userId: string;
  relatedId?: string;
  createdAt: Date;
}

// Error Types
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Middleware Types
export interface MiddlewareFunction {
  (req: AuthenticatedRequest, res: any, next: any): void | Promise<void>;
}

// Team Types
export interface ITeam extends Document {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  leader: string;
  members: Array<{
    user: string;
    role: 'leader' | 'senior' | 'member' | 'intern';
    joinedAt: Date;
    status: 'active' | 'inactive' | 'on-leave';
  }>;
  skills: string[];
  isActive: boolean;
  memberCount: number;
  addMember(userId: string, role?: string): Promise<ITeam>;
  removeMember(userId: string): Promise<ITeam>;
  updateMemberRole(userId: string, role: string): Promise<ITeam>;
  toJSON(): any;
}

// Payroll Types
export interface IPayroll extends Document {
  _id: string;
  employee: string;
  workspace: string;
  period: {
    startDate: Date;
    endDate: Date;
    month: number;
    year: number;
  };
  salary: {
    baseSalary: number;
    hourlyRate?: number;
    overtimeRate?: number;
  };
  hours: {
    regularHours: number;
    overtimeHours: number;
    totalHours: number;
  };
  earnings: {
    regularPay: number;
    overtimePay: number;
    bonuses: number;
    commissions: number;
    totalEarnings: number;
  };
  deductions: {
    taxes: {
      federal: number;
      state: number;
      local: number;
    };
    insurance: {
      health: number;
      dental: number;
      vision: number;
    };
    retirement: number;
    other: number;
    totalDeductions: number;
  };
  netPay: number;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'cancelled';
  paymentMethod: 'direct-deposit' | 'check' | 'cash';
  paymentDate?: Date;
  notes?: string;
  isActive: boolean;
  calculateTotals(): Promise<IPayroll>;
  approve(): Promise<IPayroll>;
  markAsPaid(paymentDate: Date): Promise<IPayroll>;
  toJSON(): any;
}

// Controller Types
export interface ControllerFunction {
  (req: AuthenticatedRequest, res: any): Promise<void>;
}
