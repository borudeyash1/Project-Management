import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { LoginRequest, RegisterRequest, User, Workspace } from "../types";
import { apiService } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import SharedNavbar from "./SharedNavbar";
import EnhancedRegistration from "./EnhancedRegistration";
import { googleAuthService } from "../config/googleAuth";

const Auth: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [otpTimer, setOtpTimer] = useState(0);
  const [formData, setFormData] = useState<LoginRequest & RegisterRequest>({
    email: "",
    password: "",
    fullName: "",
    username: "",
    contactNumber: "",
    confirmPassword: "",
  });

  // Set auth tab based on route
  useEffect(() => {
    if (location.pathname === "/register") {
      setAuthTab("register");
    } else {
      setAuthTab("login");
    }
  }, [location.pathname]);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
  ) => {
    dispatch({ type: "ADD_TOAST", payload: { message, type } });
  };

  // OTP Timer
  const startOtpTimer = (seconds: number) => {
    setOtpTimer(seconds);
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password,
        rememberMe: false,
      };

      const response = await apiService.login(loginData);

      // Check if OTP verification is required
      if (response.requiresOtpVerification) {
        setShowOtpVerification(true);
        setLoginEmail(formData.email);
        startOtpTimer(60); // 60 seconds for OTP timer
        showToast('Please check your email to verify your login', 'info');
      } else {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        // Update user profile in context
        dispatch({ type: "SET_USER", payload: response.user });

        showToast("Welcome back!", "success");
        navigate("/home");
      }
    } catch (error: any) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBypassLogin = () => {
    const fakeUser: User = {
      _id: 'dev-bypass',
      fullName: 'Dev Bypass',
      email: 'dev@example.com',
      username: 'dev',
      isEmailVerified: true,
      isActive: true,
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        autoRenew: false,
        billingCycle: 'monthly',
        features: {
          maxWorkspaces: 1,
          maxProjects: 3,
          maxTeamMembers: 5,
          maxStorage: 1,
          aiAssistance: true,
          advancedAnalytics: false,
          customIntegrations: false,
          prioritySupport: false,
          whiteLabeling: false,
          apiAccess: false,
        },
        isPro: false,
      },
      settings: {
        themeColor: 'yellow',
        darkMode: false,
        notifications: {
          inApp: true,
          email: true,
          push: false,
        },
        calendar: {
          syncGoogle: false,
          syncOutlook: false,
          defaultView: 'month',
        },
        privacy: {
          profileVisibility: 'workspace',
          twoFactorAuth: false,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    localStorage.setItem('accessToken', 'dev-bypass');
    localStorage.setItem('refreshToken', 'dev-bypass');
    dispatch({ type: 'SET_USER', payload: fakeUser });
    
    // Set Free workspaces
    const freeWorkspaces: Workspace[] = [
      {
        _id: 'free-ws-1',
        name: 'My Personal Workspace',
        type: 'personal' as const,
        owner: 'dev-bypass',
        members: [],
        settings: {
          isPublic: false,
          allowMemberInvites: false,
          requireApprovalForJoining: true,
          defaultProjectPermissions: {
            canCreate: true,
            canManage: true,
            canView: true
          }
        },
        subscription: {
          plan: 'free',
          maxMembers: 5,
          maxProjects: 3,
          features: {
            advancedAnalytics: false,
            customFields: false,
            apiAccess: false,
            prioritySupport: false
          }
        },
        isActive: true,
        memberCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    dispatch({ type: 'SET_WORKSPACES', payload: freeWorkspaces });
    dispatch({ type: 'SET_WORKSPACE', payload: 'free-ws-1' });
    dispatch({ type: 'SET_MODE', payload: 'Workspace' });
    
    // Set Free projects
    const freeProjects = [
      {
        _id: 'free-proj-1',
        name: 'Personal Website',
        description: 'Build my portfolio website',
        workspace: 'free-ws-1',
        createdBy: 'dev-bypass',
        status: 'active' as const,
        priority: 'high' as const,
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        progress: 45,
        teamMembers: [{ user: 'dev-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['web', 'portfolio'],
        attachments: [],
        settings: { isPublic: false, allowMemberInvites: false, timeTracking: { enabled: false, requireApproval: false }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 5,
        totalTasksCount: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'free-proj-2',
        name: 'Learning React',
        description: 'Complete React course and build projects',
        workspace: 'free-ws-1',
        createdBy: 'dev-bypass',
        status: 'active' as const,
        priority: 'medium' as const,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-06-30'),
        progress: 60,
        teamMembers: [{ user: 'dev-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['learning', 'react'],
        attachments: [],
        settings: { isPublic: false, allowMemberInvites: false, timeTracking: { enabled: false, requireApproval: false }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 8,
        totalTasksCount: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    dispatch({ type: 'SET_PROJECTS', payload: freeProjects });
    
    showToast('Bypassed login', 'success');
    navigate('/home');
  };

  const handleBypassPro = () => {
    const proUser: User = {
      _id: 'pro-bypass',
      fullName: 'Alex Johnson',
      email: 'alex@techcorp.com',
      username: 'alexjohnson',
      isEmailVerified: true,
      isActive: true,
      subscription: {
        plan: 'pro',
        status: 'active',
        startDate: new Date(),
        autoRenew: true,
        billingCycle: 'monthly',
        features: {
          maxWorkspaces: 10,
          maxProjects: 50,
          maxTeamMembers: 25,
          maxStorage: 100,
          aiAssistance: true,
          advancedAnalytics: true,
          customIntegrations: true,
          prioritySupport: true,
          whiteLabeling: false,
          apiAccess: true,
        },
        isPro: true,
      },
      settings: {
        themeColor: 'blue',
        darkMode: false,
        notifications: {
          inApp: true,
          email: true,
          push: true,
        },
        calendar: {
          syncGoogle: true,
          syncOutlook: true,
          defaultView: 'month',
        },
        privacy: {
          profileVisibility: 'workspace',
          twoFactorAuth: true,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    localStorage.setItem('accessToken', 'pro-bypass');
    localStorage.setItem('refreshToken', 'pro-bypass');
    dispatch({ type: 'SET_USER', payload: proUser });
    
    // Set Pro workspaces
    const proWorkspaces: Workspace[] = [
      {
        _id: 'pro-ws-1',
        name: 'TechCorp Solutions',
        type: 'enterprise' as const,
        owner: 'pro-bypass',
        members: [],
        settings: {
          isPublic: false,
          allowMemberInvites: true,
          requireApprovalForJoining: false,
          defaultProjectPermissions: {
            canCreate: true,
            canManage: true,
            canView: true
          }
        },
        subscription: {
          plan: 'pro',
          maxMembers: 25,
          maxProjects: 50,
          features: {
            advancedAnalytics: true,
            customFields: true,
            apiAccess: true,
            prioritySupport: true
          }
        },
        isActive: true,
        memberCount: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'pro-ws-2',
        name: 'Innovation Hub',
        type: 'team' as const,
        owner: 'pro-bypass',
        members: [],
        settings: {
          isPublic: true,
          allowMemberInvites: true,
          requireApprovalForJoining: false,
          defaultProjectPermissions: {
            canCreate: true,
            canManage: false,
            canView: true
          }
        },
        subscription: {
          plan: 'pro',
          maxMembers: 25,
          maxProjects: 50,
          features: {
            advancedAnalytics: true,
            customFields: true,
            apiAccess: true,
            prioritySupport: true
          }
        },
        isActive: true,
        memberCount: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    dispatch({ type: 'SET_WORKSPACES', payload: proWorkspaces });
    dispatch({ type: 'SET_WORKSPACE', payload: 'pro-ws-1' });
    dispatch({ type: 'SET_MODE', payload: 'Workspace' });
    
    // Set Pro projects
    const proProjects = [
      {
        _id: 'pro-proj-1',
        name: 'E-Commerce Platform',
        description: 'Build scalable e-commerce solution with React and Node.js',
        workspace: 'pro-ws-1',
        createdBy: 'pro-bypass',
        status: 'active' as const,
        priority: 'critical' as const,
        startDate: new Date('2024-01-15'),
        dueDate: new Date('2024-06-30'),
        progress: 65,
        teamMembers: [{ user: 'pro-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['e-commerce', 'react', 'node'],
        attachments: [],
        settings: { isPublic: false, allowMemberInvites: true, timeTracking: { enabled: true, requireApproval: false }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 15,
        totalTasksCount: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'pro-proj-2',
        name: 'Mobile App Development',
        description: 'Cross-platform mobile app using React Native',
        workspace: 'pro-ws-1',
        createdBy: 'pro-bypass',
        status: 'active' as const,
        priority: 'high' as const,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-08-31'),
        progress: 40,
        teamMembers: [{ user: 'pro-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['mobile', 'react-native'],
        attachments: [],
        settings: { isPublic: false, allowMemberInvites: true, timeTracking: { enabled: true, requireApproval: false }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 8,
        totalTasksCount: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'pro-proj-3',
        name: 'API Gateway Service',
        description: 'Microservices API gateway with authentication',
        workspace: 'pro-ws-1',
        createdBy: 'pro-bypass',
        status: 'planning' as const,
        priority: 'high' as const,
        startDate: new Date('2024-03-01'),
        dueDate: new Date('2024-07-31'),
        progress: 20,
        teamMembers: [{ user: 'pro-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['backend', 'microservices', 'api'],
        attachments: [],
        settings: { isPublic: false, allowMemberInvites: true, timeTracking: { enabled: true, requireApproval: true }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 3,
        totalTasksCount: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'pro-proj-4',
        name: 'Innovation Lab Research',
        description: 'AI/ML research and prototype development',
        workspace: 'pro-ws-2',
        createdBy: 'pro-bypass',
        status: 'active' as const,
        priority: 'medium' as const,
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        progress: 35,
        teamMembers: [{ user: 'pro-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['ai', 'ml', 'research'],
        attachments: [],
        settings: { isPublic: true, allowMemberInvites: true, timeTracking: { enabled: true, requireApproval: false }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 12,
        totalTasksCount: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    dispatch({ type: 'SET_PROJECTS', payload: proProjects });
    
    showToast('🚀 Pro features unlocked!', 'success');
    navigate('/home');
  };

  const handleBypassUltra = () => {
    const ultraUser: User = {
      _id: 'ultra-bypass',
      fullName: 'Sarah Chen',
      email: 'sarah@innovatetech.com',
      username: 'sarahchen',
      isEmailVerified: true,
      isActive: true,
      subscription: {
        plan: 'ultra',
        status: 'active',
        startDate: new Date(),
        autoRenew: true,
        billingCycle: 'yearly',
        features: {
          maxWorkspaces: 999,
          maxProjects: 999,
          maxTeamMembers: 999,
          maxStorage: 999,
          aiAssistance: true,
          advancedAnalytics: true,
          customIntegrations: true,
          prioritySupport: true,
          whiteLabeling: true,
          apiAccess: true,
        },
        isPro: true,
      },
      settings: {
        themeColor: 'purple',
        darkMode: false,
        notifications: {
          inApp: true,
          email: true,
          push: true,
        },
        calendar: {
          syncGoogle: true,
          syncOutlook: true,
          defaultView: 'month',
        },
        privacy: {
          profileVisibility: 'public',
          twoFactorAuth: true,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    localStorage.setItem('accessToken', 'ultra-bypass');
    localStorage.setItem('refreshToken', 'ultra-bypass');
    dispatch({ type: 'SET_USER', payload: ultraUser });
    
    // Set Ultra workspaces
    const ultraWorkspaces: Workspace[] = [
      {
        _id: 'ultra-ws-1',
        name: 'InnovateTech Global',
        type: 'enterprise' as const,
        owner: 'ultra-bypass',
        members: [],
        settings: {
          isPublic: false,
          allowMemberInvites: true,
          requireApprovalForJoining: false,
          defaultProjectPermissions: {
            canCreate: true,
            canManage: true,
            canView: true
          }
        },
        subscription: {
          plan: 'enterprise',
          maxMembers: 999,
          maxProjects: 999,
          features: {
            advancedAnalytics: true,
            customFields: true,
            apiAccess: true,
            prioritySupport: true
          }
        },
        isActive: true,
        memberCount: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'ultra-ws-2',
        name: 'AI Research Lab',
        type: 'enterprise' as const,
        owner: 'ultra-bypass',
        members: [],
        settings: {
          isPublic: true,
          allowMemberInvites: true,
          requireApprovalForJoining: false,
          defaultProjectPermissions: {
            canCreate: true,
            canManage: true,
            canView: true
          }
        },
        subscription: {
          plan: 'enterprise',
          maxMembers: 999,
          maxProjects: 999,
          features: {
            advancedAnalytics: true,
            customFields: true,
            apiAccess: true,
            prioritySupport: true
          }
        },
        isActive: true,
        memberCount: 28,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'ultra-ws-3',
        name: 'Startup Incubator',
        type: 'team' as const,
        owner: 'ultra-bypass',
        members: [],
        settings: {
          isPublic: true,
          allowMemberInvites: true,
          requireApprovalForJoining: true,
          defaultProjectPermissions: {
            canCreate: true,
            canManage: false,
            canView: true
          }
        },
        subscription: {
          plan: 'enterprise',
          maxMembers: 999,
          maxProjects: 999,
          features: {
            advancedAnalytics: true,
            customFields: true,
            apiAccess: true,
            prioritySupport: true
          }
        },
        isActive: true,
        memberCount: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    dispatch({ type: 'SET_WORKSPACES', payload: ultraWorkspaces });
    dispatch({ type: 'SET_WORKSPACE', payload: 'ultra-ws-1' });
    dispatch({ type: 'SET_MODE', payload: 'Workspace' });
    
    // Set Ultra projects
    const ultraProjects = [
      {
        _id: 'ultra-proj-1',
        name: 'Global Platform Launch',
        description: 'Enterprise-scale platform for international markets',
        workspace: 'ultra-ws-1',
        createdBy: 'ultra-bypass',
        status: 'active' as const,
        priority: 'critical' as const,
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        progress: 55,
        teamMembers: [{ user: 'ultra-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['enterprise', 'global', 'platform'],
        attachments: [],
        settings: { isPublic: false, allowMemberInvites: true, timeTracking: { enabled: true, requireApproval: true }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 45,
        totalTasksCount: 80,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'ultra-proj-2',
        name: 'AI Research Initiative',
        description: 'Advanced AI/ML research and development',
        workspace: 'ultra-ws-2',
        createdBy: 'ultra-bypass',
        status: 'active' as const,
        priority: 'high' as const,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-11-30'),
        progress: 70,
        teamMembers: [{ user: 'ultra-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['ai', 'research', 'innovation'],
        attachments: [],
        settings: { isPublic: true, allowMemberInvites: true, timeTracking: { enabled: true, requireApproval: false }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 28,
        totalTasksCount: 40,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'ultra-proj-3',
        name: 'Startup Accelerator Program',
        description: 'Mentorship and funding program for startups',
        workspace: 'ultra-ws-3',
        createdBy: 'ultra-bypass',
        status: 'active' as const,
        priority: 'medium' as const,
        startDate: new Date('2024-03-01'),
        dueDate: new Date('2024-09-30'),
        progress: 40,
        teamMembers: [{ user: 'ultra-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['startup', 'accelerator', 'mentorship'],
        attachments: [],
        settings: { isPublic: true, allowMemberInvites: true, timeTracking: { enabled: false, requireApproval: false }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 12,
        totalTasksCount: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'ultra-proj-4',
        name: 'Cloud Infrastructure Migration',
        description: 'Migrate entire infrastructure to cloud-native architecture',
        workspace: 'ultra-ws-1',
        createdBy: 'ultra-bypass',
        status: 'planning' as const,
        priority: 'high' as const,
        startDate: new Date('2024-04-01'),
        dueDate: new Date('2024-10-31'),
        progress: 15,
        teamMembers: [{ user: 'ultra-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['cloud', 'infrastructure', 'devops'],
        attachments: [],
        settings: { isPublic: false, allowMemberInvites: true, timeTracking: { enabled: true, requireApproval: true }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 5,
        totalTasksCount: 35,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'ultra-proj-5',
        name: 'Machine Learning Pipeline',
        description: 'Build automated ML pipeline for data processing',
        workspace: 'ultra-ws-2',
        createdBy: 'ultra-bypass',
        status: 'active' as const,
        priority: 'critical' as const,
        startDate: new Date('2024-01-15'),
        dueDate: new Date('2024-08-15'),
        progress: 80,
        teamMembers: [{ user: 'ultra-bypass', role: 'project-manager' as const, permissions: { canManageTasks: true, canManageTeam: true, canViewReports: true, canManageProject: true }, joinedAt: new Date() }],
        milestones: [],
        tags: ['ml', 'pipeline', 'automation'],
        attachments: [],
        settings: { isPublic: true, allowMemberInvites: true, timeTracking: { enabled: true, requireApproval: false }, notifications: { taskUpdates: true, milestoneReminders: true, deadlineAlerts: true } },
        isActive: true,
        teamMemberCount: 1,
        completedTasksCount: 32,
        totalTasksCount: 40,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    dispatch({ type: 'SET_PROJECTS', payload: ultraProjects });
    
    showToast('⚡ Ultra features unlocked!', 'success');
    navigate('/home');
  };

  // OTP verification functions
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input if a digit is entered and it's not the last input
    if (element.nextElementSibling && element.value !== '') {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpVerification = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast('Please enter the complete 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifyEmailOTP(loginEmail, otpCode);

      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Update user profile in context
      dispatch({ type: "SET_USER", payload: response.user });

      showToast("Login successful! Welcome back!", "success");
      navigate("/home");
    } catch (error: any) {
      showToast(error.message || "OTP verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await apiService.resendEmailOTP(loginEmail);
      showToast('OTP resent successfully', 'success');
      startOtpTimer(60);
    } catch (error: any) {
      showToast(error.message || "Failed to resend OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);

      // Initialize Google Auth if not already done
      await googleAuthService.initializeGapi();

      // Sign in with Google
      const googleUser = await googleAuthService.signInWithGoogle();

      // Try to authenticate with backend
      try {
        const response = await apiService.googleAuth({
          id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          imageUrl: googleUser.imageUrl,
          accessToken: googleUser.accessToken,
          idToken: googleUser.idToken,
          isRegistration: false,
        });

        // Store tokens in localStorage
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        // Update user profile in context
        dispatch({ type: "SET_USER", payload: response.user });

        showToast("Successfully signed in with Google!", "success");
        navigate("/home");
      } catch (authError: any) {
        // Check if user needs to register
        if (authError.message === "USER_NOT_REGISTERED") {
          // Store Google data in sessionStorage to pass to registration
          sessionStorage.setItem("googleAuthData", JSON.stringify(googleUser));
          showToast("Please complete your registration", "info");
          navigate("/register");
        } else {
          throw authError;
        }
      }
    } catch (error: any) {
      console.error("Google authentication error:", error);
      showToast(error.message || "Google authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    navigate("/register");
  };

  const switchToLogin = () => {
    navigate("/login");
  };

  // If on register route, show enhanced registration
  if (location.pathname === "/register") {
    return <EnhancedRegistration />;
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900" : "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50"} relative overflow-hidden`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-96 h-96 ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-200/20'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-200/20'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
      </div>
      <SharedNavbar />
      <section className="min-h-screen flex pt-16 relative z-10">
        <div className="hidden lg:flex w-1/2 bg-white border-r border-border relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-black/20"></div>
          <div className="relative p-12 mt-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20 mb-6 shadow-xl">
              <div className="w-5 h-5 text-yellow-600">🚀</div>
              <span className="text-sm font-semibold text-slate-700">
                Projects, Payroll, Planner — unified
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl tracking-tight font-bold text-white mb-4 leading-tight">
              Plan, track, and pay — all in one place
            </h1>
            <p className="text-white/90 text-lg mt-4 max-w-lg leading-relaxed">
              Workspaces, roles, analytics, and automations for teams of any
              size.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold tracking-tight bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
                TF
              </div>
              <div>
                <div className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sartthi
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  Project & Payroll Suite
                </div>
              </div>
            </div>

            <div className={`flex ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-1.5 mb-8 shadow-lg`}>
              <button
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  authTab === "login"
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
                    : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`
                }`}
                onClick={switchToLogin}
              >
                Login
              </button>
              <button
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  authTab === "register"
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
                    : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`
                }`}
                onClick={switchToRegister}
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            {authTab === "login" && (
              <form
                className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm rounded-2xl p-8 space-y-6 shadow-2xl`}
                onSubmit={handleLogin}
              >
                <div>
                  <label className={`text-sm font-semibold block mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Email or Username
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border ${isDarkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder:text-slate-400'} px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all duration-200`}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Password</label>
                    <button
                      type="button"
                      className={`text-xs font-medium ${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'} transition-colors`}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border ${isDarkMode ? 'border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder:text-slate-400'} px-4 py-3 pr-12 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all duration-200`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-3.5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
                      ) : (
                        <Eye className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className={`inline-flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} cursor-pointer font-medium`}>
                    <input type="checkbox" className="peer sr-only" />
                    <span className={`relative inline-flex h-6 w-11 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-slate-200'} transition-colors peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-500 shadow-inner`}>
                      <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-md transition-all peer-checked:left-6"></span>
                    </span>
                    Remember me
                  </label>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'} font-medium`}>SSO enabled</div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-base font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
                >
                  {loading ? "Signing in..." : "Continue"}
                </button>

                <button
                  type="button"
                  onClick={handleBypassLogin}
                  className={`w-full mt-2 px-4 py-3.5 rounded-xl border-2 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700/50 text-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} text-sm font-semibold transition-all duration-200 hover:scale-[1.02] transform shadow-lg`}
                >
                  Bypass Login (Free)
                </button>

                <button
                  type="button"
                  onClick={handleBypassPro}
                  className={`w-full mt-2 px-4 py-3.5 rounded-xl border-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-500 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] transform shadow-lg`}
                >
                  🚀 Bypass Pro
                </button>

                <button
                  type="button"
                  onClick={handleBypassUltra}
                  className={`w-full mt-2 px-4 py-3.5 rounded-xl border-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-500 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] transform shadow-lg`}
                >
                  ⚡ Bypass Ultra
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      or
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700/50 text-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] transform shadow-lg`}
                  onClick={handleGoogleAuth}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="h-5 w-5"
                    alt="Google"
                  />
                  Continue with Google
                </button>
              </form>
            )}

            {/* OTP Verification for Login */}
            {authTab === "login" && showOtpVerification && (
              <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm rounded-2xl p-8 space-y-6 shadow-2xl`}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <span className="text-3xl">📧</span>
                  </div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-3`}>
                    Verify Your Login
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
                    We've sent a 6-digit verification code to <strong className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}>{loginEmail}</strong>
                  </p>
                </div>

                <div className="flex justify-center gap-3 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className={`w-14 h-14 text-center text-xl font-bold border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700/50 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
                      autoComplete="off"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleOtpVerification}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full px-4 py-3.5 rounded-xl text-white text-base font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'} font-medium`}>
                      Resend OTP in <span className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}>{otpTimer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className={`text-sm ${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'} font-bold disabled:opacity-50 transition-colors`}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
