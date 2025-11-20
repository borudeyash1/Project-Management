import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Users, Bell, Mail, Phone, Video, Mic, 
  MicOff, Camera, CameraOff, Volume2, VolumeX, Share2,
  Paperclip, Smile, Send, MoreVertical, Edit, Trash2,
  Eye, EyeOff, Lock, Unlock, Star, Heart, Bookmark,
  Copy, Move, Archive, Download, Upload, Link, FileText,
  Image, File, Folder, Search, Filter, Plus, X, Check,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Minus,
  Maximize, Minimize, RotateCcw, Save, RefreshCw,
  Settings, User, UserCheck, UserX, Award, Trophy, Medal,
  Crown, Shield, Key, Globe, Wifi, Monitor, Smartphone,
  Tablet, Headphones, Calendar, Clock, Timer, Target,
  Activity, TrendingUp, TrendingDown, BarChart3, PieChart,
  LineChart, Zap, Bot, Sparkles, Lightbulb, Database,
  Server, Cloud, Building, Home, DollarSign, CreditCard,
  MapPin, Mail as MailIcon, Phone as PhoneIcon, Video as VideoIcon,
  Mic as MicIcon, MicOff as MicOffIcon, Camera as CameraIcon,
  CameraOff as CameraOffIcon, Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon, Share2 as Share2Icon,
  Paperclip as PaperclipIcon, Smile as SmileIcon,
  Send as SendIcon, MoreVertical as MoreVerticalIcon,
  Edit as EditIcon, Trash2 as Trash2Icon, Eye as EyeIcon,
  EyeOff as EyeOffIcon, Lock as LockIcon, Unlock as UnlockIcon,
  Star as StarIcon, Heart as HeartIcon, Bookmark as BookmarkIcon,
  Copy as CopyIcon, Move as MoveIcon, Archive as ArchiveIcon,
  Download as DownloadIcon, Upload as UploadIcon,
  Link as LinkIcon, FileText as FileTextIcon,
  Image as ImageIcon, File as FileIcon, Folder as FolderIcon,
  Search as SearchIcon, Filter as FilterIcon, Plus as PlusIcon,
  X as XIcon, Check as CheckIcon, ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon, ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon, ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon, ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon, Minus as MinusIcon,
  Maximize as MaximizeIcon, Minimize as MinimizeIcon,
  RotateCcw as RotateCcwIcon, Save as SaveIcon,
  RefreshCw as RefreshCwIcon, Settings as SettingsIcon,
  User as UserIcon, UserCheck as UserCheckIcon,
  UserX as UserXIcon, Award as AwardIcon, Trophy as TrophyIcon,
  Medal as MedalIcon, Crown as CrownIcon, Shield as ShieldIcon,
  Key as KeyIcon, Globe as GlobeIcon, Wifi as WifiIcon,
  Monitor as MonitorIcon, Smartphone as SmartphoneIcon,
  Tablet as TabletIcon, Headphones as HeadphonesIcon,
  Calendar as CalendarIcon, Clock as ClockIcon,
  Timer as TimerIcon, Target as TargetIcon,
  Activity as ActivityIcon, TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon, BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon, LineChart as LineChartIcon,
  Zap as ZapIcon, Bot as BotIcon, Sparkles as SparklesIcon,
  Lightbulb as LightbulbIcon, Database as DatabaseIcon,
  Server as ServerIcon, Cloud as CloudIcon,
  Building as BuildingIcon, Home as HomeIcon,
  DollarSign as DollarSignIcon, CreditCard as CreditCardIcon,
  MapPin as MapPinIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Message {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  };
  channelId: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'text' | 'image' | 'file' | 'link' | 'system';
  attachments?: Attachment[];
  mentions?: string[];
  reactions?: Reaction[];
  isEdited?: boolean;
  editedAt?: Date;
  replyTo?: string;
  thread?: Message[];
}

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: 'image' | 'file' | 'link';
  size?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface Reaction {
  _id: string;
  emoji: string;
  users: Array<{
    _id: string;
    name: string;
    avatarUrl?: string;
  }>;
  count: number;
}

interface Channel {
  _id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct';
  projectId?: string;
  projectName?: string;
  members: Array<{
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
    joinedAt: Date;
    isOnline: boolean;
    lastSeen: Date;
  }>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  settings: {
    allowFileUploads: boolean;
    allowMentions: boolean;
    allowReactions: boolean;
    muteNotifications: boolean;
  };
  lastMessage?: {
    content: string;
    author: string;
    timestamp: Date;
  };
  unreadCount: number;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  designation: string;
  isOnline: boolean;
  lastActive: Date;
  status: 'available' | 'busy' | 'away' | 'offline';
  customStatus?: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
}

interface Document {
  _id: string;
  name: string;
  description: string;
  content: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'note';
  projectId?: string;
  projectName?: string;
  channelId?: string;
  createdBy: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  lastModifiedAt: Date;
  version: number;
  isShared: boolean;
  sharedWith: Array<{
    _id: string;
    name: string;
    email: string;
    permission: 'view' | 'edit' | 'admin';
  }>;
  tags: string[];
  size: number;
}

interface Poll {
  _id: string;
  question: string;
  description?: string;
  options: Array<{
    _id: string;
    text: string;
    votes: number;
    voters: string[];
  }>;
  channelId: string;
  createdBy: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  expiresAt?: Date;
  isAnonymous: boolean;
  allowMultipleVotes: boolean;
  status: 'active' | 'closed' | 'expired';
  totalVotes: number;
  participants: string[];
}

const TeamCollaboration: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('channels');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Mock data - replace with actual API calls
  const channels: Channel[] = [
    {
      _id: 'c1',
      name: 'general',
      description: 'General team discussions',
      type: 'public',
      projectId: 'p1',
      projectName: 'E-commerce Platform',
      members: [
        {
          _id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          avatarUrl: '',
          role: 'designer',
          joinedAt: new Date('2024-01-01'),
          isOnline: true,
          lastSeen: new Date('2024-03-15T10:30:00')
        },
        {
          _id: 'u2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatarUrl: '',
          role: 'developer',
          joinedAt: new Date('2024-01-01'),
          isOnline: true,
          lastSeen: new Date('2024-03-15T11:45:00')
        }
      ],
      createdBy: 'pm1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-03-15'),
      isArchived: false,
      settings: {
        allowFileUploads: true,
        allowMentions: true,
        allowReactions: true,
        muteNotifications: false
      },
      lastMessage: {
        content: 'Great work on the design mockups!',
        author: 'John Doe',
        timestamp: new Date('2024-03-15T10:30:00')
      },
      unreadCount: 3
    },
    {
      _id: 'c2',
      name: 'backend-dev',
      description: 'Backend development discussions',
      type: 'private',
      projectId: 'p1',
      projectName: 'E-commerce Platform',
      members: [
        {
          _id: 'u2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatarUrl: '',
          role: 'developer',
          joinedAt: new Date('2024-01-01'),
          isOnline: true,
          lastSeen: new Date('2024-03-15T11:45:00')
        },
        {
          _id: 'u4',
          name: 'Alice Brown',
          email: 'alice@example.com',
          avatarUrl: '',
          role: 'developer',
          joinedAt: new Date('2024-01-15'),
          isOnline: true,
          lastSeen: new Date('2024-03-15T09:15:00')
        }
      ],
      createdBy: 'u2',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-03-15'),
      isArchived: false,
      settings: {
        allowFileUploads: true,
        allowMentions: true,
        allowReactions: true,
        muteNotifications: false
      },
      lastMessage: {
        content: 'API endpoints are ready for testing',
        author: 'Jane Smith',
        timestamp: new Date('2024-03-15T11:45:00')
      },
      unreadCount: 0
    },
    {
      _id: 'c3',
      name: 'john-doe',
      description: 'Direct message with John Doe',
      type: 'direct',
      members: [
        {
          _id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          avatarUrl: '',
          role: 'designer',
          joinedAt: new Date('2024-01-01'),
          isOnline: true,
          lastSeen: new Date('2024-03-15T10:30:00')
        }
      ],
      createdBy: 'current-user',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-03-15'),
      isArchived: false,
      settings: {
        allowFileUploads: true,
        allowMentions: true,
        allowReactions: true,
        muteNotifications: false
      },
      lastMessage: {
        content: 'Thanks for the feedback!',
        author: 'John Doe',
        timestamp: new Date('2024-03-15T10:30:00')
      },
      unreadCount: 1
    }
  ];

  const messages: Message[] = [
    {
      _id: 'm1',
      content: 'Hey team! How is everyone doing with the new project?',
      author: {
        _id: 'pm1',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        avatarUrl: '',
        role: 'project-manager'
      },
      channelId: 'c1',
      createdAt: new Date('2024-03-15T09:00:00'),
      updatedAt: new Date('2024-03-15T09:00:00'),
      type: 'text',
      reactions: [
        {
          _id: 'r1',
          emoji: '👍',
          users: [
            { _id: 'u1', name: 'John Doe', avatarUrl: '' },
            { _id: 'u2', name: 'Jane Smith', avatarUrl: '' }
          ],
          count: 2
        }
      ]
    },
    {
      _id: 'm2',
      content: 'Great! I just finished the wireframes for the dashboard. Should I share them?',
      author: {
        _id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        avatarUrl: '',
        role: 'designer'
      },
      channelId: 'c1',
      createdAt: new Date('2024-03-15T09:15:00'),
      updatedAt: new Date('2024-03-15T09:15:00'),
      type: 'text',
      attachments: [
        {
          _id: 'a1',
          name: 'dashboard-wireframes.pdf',
          url: '/files/dashboard-wireframes.pdf',
          type: 'file',
          size: 1024000,
          mimeType: 'application/pdf',
          uploadedBy: 'u1',
          uploadedAt: new Date('2024-03-15T09:15:00')
        }
      ]
    },
    {
      _id: 'm3',
      content: 'Yes, please share! I\'d love to see them.',
      author: {
        _id: 'u2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatarUrl: '',
        role: 'developer'
      },
      channelId: 'c1',
      createdAt: new Date('2024-03-15T09:20:00'),
      updatedAt: new Date('2024-03-15T09:20:00'),
      type: 'text',
      replyTo: 'm2'
    }
  ];

  const teamMembers: TeamMember[] = [
    {
      _id: 'u1',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: '',
      role: 'designer',
      designation: 'UI/UX Designer',
      isOnline: true,
      lastActive: new Date('2024-03-15T10:30:00'),
      status: 'available',
      customStatus: 'Working on wireframes',
      timezone: 'UTC-5',
      workingHours: {
        start: '09:00',
        end: '17:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    },
    {
      _id: 'u2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatarUrl: '',
      role: 'developer',
      designation: 'Backend Developer',
      isOnline: true,
      lastActive: new Date('2024-03-15T11:45:00'),
      status: 'busy',
      customStatus: 'In a meeting',
      timezone: 'UTC-5',
      workingHours: {
        start: '09:00',
        end: '17:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    },
    {
      _id: 'u3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      avatarUrl: '',
      role: 'tester',
      designation: 'QA Engineer',
      isOnline: false,
      lastActive: new Date('2024-03-14T17:30:00'),
      status: 'offline',
      timezone: 'UTC-5',
      workingHours: {
        start: '09:00',
        end: '17:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    }
  ];

  const documents: Document[] = [
    {
      _id: 'd1',
      name: 'Project Requirements',
      description: 'Detailed project requirements document',
      content: 'This document outlines the requirements for the e-commerce platform...',
      type: 'document',
      projectId: 'p1',
      projectName: 'E-commerce Platform',
      channelId: 'c1',
      createdBy: {
        _id: 'pm1',
        name: 'Mike Johnson',
        avatarUrl: ''
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-03-15'),
      lastModifiedBy: {
        _id: 'pm1',
        name: 'Mike Johnson',
        avatarUrl: ''
      },
      lastModifiedAt: new Date('2024-03-15'),
      version: 3,
      isShared: true,
      sharedWith: [
        { _id: 'u1', name: 'John Doe', email: 'john@example.com', permission: 'edit' },
        { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com', permission: 'edit' }
      ],
      tags: ['requirements', 'project', 'documentation'],
      size: 2048000
    },
    {
      _id: 'd2',
      name: 'API Documentation',
      description: 'REST API documentation',
      content: 'This document describes the REST API endpoints...',
      type: 'document',
      projectId: 'p1',
      projectName: 'E-commerce Platform',
      channelId: 'c2',
      createdBy: {
        _id: 'u2',
        name: 'Jane Smith',
        avatarUrl: ''
      },
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-15'),
      lastModifiedBy: {
        _id: 'u2',
        name: 'Jane Smith',
        avatarUrl: ''
      },
      lastModifiedAt: new Date('2024-03-15'),
      version: 2,
      isShared: true,
      sharedWith: [
        { _id: 'u1', name: 'John Doe', email: 'john@example.com', permission: 'view' },
        { _id: 'u4', name: 'Alice Brown', email: 'alice@example.com', permission: 'edit' }
      ],
      tags: ['api', 'documentation', 'backend'],
      size: 1536000
    }
  ];

  const polls: Poll[] = [
    {
      _id: 'p1',
      question: 'Which design approach do you prefer for the dashboard?',
      description: 'Please vote on your preferred design approach',
      options: [
        { _id: 'o1', text: 'Minimalist', votes: 3, voters: ['u1', 'u2', 'u3'] },
        { _id: 'o2', text: 'Detailed', votes: 1, voters: ['u4'] },
        { _id: 'o3', text: 'Hybrid', votes: 2, voters: ['pm1', 'u5'] }
      ],
      channelId: 'c1',
      createdBy: {
        _id: 'pm1',
        name: 'Mike Johnson',
        avatarUrl: ''
      },
      createdAt: new Date('2024-03-15T09:00:00'),
      expiresAt: new Date('2024-03-20T09:00:00'),
      isAnonymous: false,
      allowMultipleVotes: false,
      status: 'active',
      totalVotes: 6,
      participants: ['u1', 'u2', 'u3', 'u4', 'pm1', 'u5']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case 'public': return <Users className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      case 'direct': return <User className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChannel) {
      console.log(`Sending message to ${selectedChannel.name}: ${newMessage}`);
      setNewMessage('');
      // In real app, call API to send message
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // In real app, emit typing event
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const renderChannels = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Channels</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">All Types</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="direct">Direct</option>
          </select>
          <button
            onClick={() => setShowChannelModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Channel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels
          .filter(channel => {
            const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                channel.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || channel.type === filterType;
            return matchesSearch && matchesType;
          })
          .map(channel => (
            <div
              key={channel._id}
              onClick={() => setSelectedChannel(channel)}
              className="bg-white p-6 rounded-lg border border-gray-300 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getChannelTypeIcon(channel.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">#{channel.name}</h4>
                    <p className="text-sm text-gray-600">{channel.description}</p>
                  </div>
                </div>
                {channel.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {channel.unreadCount}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{channel.type}</span>
                </div>

                {channel.projectName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Project:</span>
                    <span className="text-sm font-medium text-gray-900">{channel.projectName}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Members:</span>
                  <span className="text-sm font-medium text-gray-900">{channel.members.length}</span>
                </div>

                {channel.lastMessage && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{channel.lastMessage.author}</span>
                      <span className="text-xs text-gray-600">
                        {new Date(channel.lastMessage.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{channel.lastMessage.content}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderMessages = () => {
    if (!selectedChannel) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Channel</h3>
            <p className="text-gray-600">Choose a channel to start messaging.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Channel Header */}
        <div className="p-4 border-b border-gray-300 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                {getChannelTypeIcon(selectedChannel.type)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">#{selectedChannel.name}</h3>
                <p className="text-sm text-gray-600">{selectedChannel.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:text-gray-600">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-600">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages
            .filter(message => message.channelId === selectedChannel._id)
            .map(message => (
              <div key={message._id} className="flex gap-3">
                <img
                  src={message.author.avatarUrl || `https://ui-avatars.com/api/?name=${message.author.name}&background=random`}
                  alt={message.author.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{message.author.name}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-600">(edited)</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{message.content}</p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {message.attachments.map(attachment => (
                        <div key={attachment._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{attachment.name}</span>
                          <button className="text-accent-dark hover:text-blue-800">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {message.reactions.map(reaction => (
                        <button
                          key={reaction._id}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-300"
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-300 bg-white">
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:text-gray-600">
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Message #${selectedChannel.name}`}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              />
              {isTyping && (
                <div className="absolute -top-8 left-0 text-xs text-gray-600">
                  {typingUsers.length > 0 && `${typingUsers.join(', ')} typing...`}
                </div>
              )}
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-600">
              <Smile className="w-4 h-4" />
            </button>
            <button
              onClick={handleSendMessage}
              className="p-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTeamMembers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers
          .filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                member.role.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
          })
          .map(member => (
            <div
              key={member._id}
              onClick={() => {
                setSelectedMember(member);
                setShowMemberModal(true);
              }}
              className="bg-white p-6 rounded-lg border border-gray-300 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                      alt={member.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.designation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-gray-600">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-600">
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                    <span className="text-sm font-medium text-gray-900 capitalize">{member.status}</span>
                  </div>
                </div>

                {member.customStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Custom Status:</span>
                    <span className="text-sm text-gray-700">{member.customStatus}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Active:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(member.lastActive).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Timezone:</span>
                  <span className="text-sm text-gray-600">{member.timezone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Working Hours:</span>
                  <span className="text-sm text-gray-600">
                    {member.workingHours.start} - {member.workingHours.end}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="all">All Projects</option>
            <option value="p1">E-commerce Platform</option>
            <option value="p2">Mobile App</option>
          </select>
          <button
            onClick={() => setShowDocumentModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents
          .filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                doc.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProject = filterProject === 'all' || doc.projectId === filterProject;
            return matchesSearch && matchesProject;
          })
          .map(doc => (
            <div key={doc._id} className="bg-white p-6 rounded-lg border border-gray-300 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                    <p className="text-sm text-gray-600">{doc.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-600 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{doc.type}</span>
                </div>

                {doc.projectName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Project:</span>
                    <span className="text-sm font-medium text-gray-900">{doc.projectName}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Version:</span>
                  <span className="text-sm font-medium text-gray-900">v{doc.version}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Size:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Modified:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(doc.lastModifiedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shared:</span>
                  <span className={`text-sm font-medium ${doc.isShared ? 'text-green-600' : 'text-gray-600'}`}>
                    {doc.isShared ? 'Yes' : 'No'}
                  </span>
                </div>

                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderPolls = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Polls</h3>
        <button
          onClick={() => setShowPollModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Poll
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map(poll => (
          <div key={poll._id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{poll.question}</h4>
                  {poll.description && (
                    <p className="text-sm text-gray-600">{poll.description}</p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                poll.status === 'active' ? 'bg-green-100 text-green-800' :
                poll.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {poll.status}
              </span>
            </div>

            <div className="space-y-3">
              {poll.options.map(option => (
                <div key={option._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{option.text}</span>
                    <span className="text-sm text-gray-600">{option.votes} votes</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${(option.votes / poll.totalVotes) * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Total Votes: {poll.totalVotes}</span>
                  <span>Participants: {poll.participants.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                  <span>Created: {new Date(poll.createdAt).toLocaleDateString()}</span>
                  {poll.expiresAt && (
                    <span>Expires: {new Date(poll.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'channels', label: 'Channels', icon: MessageSquare, description: 'Team communication channels' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Real-time messaging' },
    { id: 'members', label: 'Team Members', icon: Users, description: 'Team member directory' },
    { id: 'documents', label: 'Documents', icon: FileText, description: 'Shared documents and files' },
    { id: 'polls', label: 'Polls', icon: BarChart3, description: 'Team polls and surveys' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'channels':
        return renderChannels();
      case 'messages':
        return renderMessages();
      case 'members':
        return renderTeamMembers();
      case 'documents':
        return renderDocuments();
      case 'polls':
        return renderPolls();
      default:
        return renderChannels();
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Team Collaboration</h1>
              <p className="text-sm text-gray-600 mt-1">Communicate, collaborate, and share with your team.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{teamMembers.filter(m => m.isOnline).length}</span> members online
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-accent text-accent-dark'
                      : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={tab.description}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TeamCollaboration;
