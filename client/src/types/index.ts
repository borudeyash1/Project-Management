// User Types
export interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  phone?: string;
  designation?: string;
  department?: string;
  location?: string;
  about?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  isActive: boolean;
  subscription: UserSubscription;
  settings: UserSettings;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
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
    maxStorage: number; // GB
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
}

export interface UserSettings {
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
}

// Workspace Types
export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  type: 'personal' | 'team' | 'enterprise';
  region?: string;
  owner: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  subscription: WorkspaceSubscription;
  isActive: boolean;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  clients?: Array<{
    _id: string;
    name: string;
    email: string;
    projects: number;
    totalValue: number;
  }>;
}

export interface WorkspaceMember {
  user: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  permissions: {
    canManageMembers: boolean;
    canManageProjects: boolean;
    canManageClients: boolean;
    canUpdateWorkspaceDetails: boolean;
    canManageCollaborators: boolean;
    canManageInternalProjectSettings: boolean;
    canAccessProjectManagerTabs: boolean;
  };
  joinedAt: Date;
  status: 'active' | 'pending' | 'suspended';
}

export interface WorkspaceSettings {
  isPublic: boolean;
  allowMemberInvites: boolean;
  requireApprovalForJoining: boolean;
  defaultProjectPermissions: {
    canCreate: boolean;
    canManage: boolean;
    canView: boolean;
  };
}

export interface WorkspaceSubscription {
  plan: 'free' | 'pro' | 'enterprise';
  maxMembers: number;
  maxProjects: number;
  features: {
    advancedAnalytics: boolean;
    customFields: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
}

// Project Types
export interface Project {
  _id: string;
  name: string;
  description?: string;
  client?: string;
  workspace: string;
  createdBy: string;
  projectManager?: string; // User ID of the project manager
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled' | 'abandoned';
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
  team?: Array<{
    _id: string;
    name: string;
    email: string;
    role: 'project-manager' | 'member';
    addedAt: Date;
  }>;
  teamMembers: ProjectTeamMember[];
  milestones: Milestone[];
  tags: string[];
  attachments: Attachment[];
  settings: ProjectSettings;
  isActive: boolean;
  teamMemberCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  createdAt: Date;
  updatedAt: Date;
  tasks?: any[]; // For storing project tasks
}

export interface ProjectTeamMember {
  user: string;
  role: 'project-manager' | 'developer' | 'designer' | 'tester' | 'analyst' | 'member';
  permissions: {
    canManageTasks: boolean;
    canManageTeam: boolean;
    canViewReports: boolean;
    canManageProject: boolean;
  };
  joinedAt: Date;
}

export interface Milestone {
  _id: string;
  name: string;
  description?: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  createdBy: string;
}

export interface ProjectSettings {
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
}

// Task Types
export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  workspace: string;
  createdBy: string;
  assignee?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  type: 'task' | 'bug' | 'feature' | 'epic' | 'story' | 'subtask';
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours: number;
  progress: number;
  subtasks: Subtask[];
  dependencies: TaskDependency[];
  comments: TaskComment[];
  attachments: Attachment[];
  tags: string[];
  watchers: string[];
  timeEntries: TimeEntry[];
  customFields: CustomField[];
  settings: TaskSettings;
  isActive: boolean;
  subtaskCompletionPercentage: number;
  totalTimeLogged: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  _id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  assignee?: string;
  dueDate?: Date;
  completedDate?: Date;
  createdBy: string;
}

export interface TaskDependency {
  task: string;
  type: 'blocks' | 'blocked-by' | 'relates-to';
}

export interface TaskComment {
  _id: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
}

export interface TimeEntry {
  _id: string;
  user: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  description?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface CustomField {
  name: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
}

export interface TaskSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowTimeTracking: boolean;
  requireApproval: boolean;
}

// Attachment Type
export interface Attachment {
  _id?: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
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
  // Enhanced profile information
  profile?: {
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
    personality?: {
      traits?: Array<{
        name: string;
        score: number;
      }>;
      workingStyle?: 'detail-oriented' | 'big-picture' | 'process-focused' | 'results-driven';
      stressLevel?: 'low' | 'medium' | 'high';
      motivationFactors?: Array<'recognition' | 'autonomy' | 'challenge' | 'security' | 'growth' | 'impact'>;
    };
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
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requiresOtpVerification?: boolean;
  email?: string;
}

export interface GoogleAuthRequest {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  accessToken: string;
  idToken: string;
}

// App State Types
export interface AppState {
  currentSection: string;
  currentWorkspace: string;
  currentProject: string;
  cwStep: number;
  toasts: Toast[];
  isAuthLoading: boolean;
  subscription: UserSubscription;
  modals: {
    createWorkspace: boolean;
    createProject: boolean;
    workspaceCreateProject: boolean;
    workloadDeadline: boolean;
    taskDetails: boolean;
    taskRating: boolean;
    polls: boolean;
    leaderboard: boolean;
    payroll: boolean;
    exportReports: boolean;
    manageProject: boolean;
    documentsHub: boolean;
    timesheet: boolean;
    inviteEmployee: boolean;
    client: boolean;
    pricing: boolean;
    requestChange: boolean;
    notifications: boolean;
  };
  userProfile: User;
  settings: UserSettings;
  taskDrawer: {
    isOpen: boolean;
    title: string;
  };
  quickAddMenu: boolean;
  userMenu: boolean;
  sidebar: {
    collapsed: boolean;
  };
  workspaces: Workspace[];
  pendingWorkspaceRequests: any[];
  mode: string;
  clients: Client[];
  projects: Project[];
  tasks: Task[];
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  website?: string;
  address?: string;
  contactPerson?: string;
  status: 'active' | 'inactive';
  projectsCount?: number;
  totalRevenue?: number;
  notes?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id?: string;
  duration?: number;
}

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  protected?: boolean;
  roles?: string[];
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

// Filter and Search Types
export interface FilterOptions {
  status?: string[];
  priority?: string[];
  assignee?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
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

export interface UpcomingDeadline {
  id: string;
  title: string;
  dueDate: Date;
  priority: string;
  status: string;
}

// Notification Types
export interface Notification {
  _id: string;
  type: 'task' | 'project' | 'workspace' | 'system';
  title: string;
  message: string;
  read: boolean;
  userId: string;
  relatedId?: string;
  createdAt: Date;
}
