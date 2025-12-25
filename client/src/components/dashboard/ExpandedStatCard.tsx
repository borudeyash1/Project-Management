import React from 'react';
import { X, Clock, Target, Users, TrendingUp, MessageSquare, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import QuickChat from '../chat/QuickChat';

interface Task {
    _id: string;
    title: string;
    priority: string;
    dueDate?: Date;
    project?: string;
    status: string;
}

interface Project {
    _id: string;
    name: string;
    progress: number;
    status: string;
    team: number;
}

interface ExpandedStatCardProps {
    type: 'tasks' | 'projects' | 'team' | 'progress';
    onClose: () => void;
    data: any;
}

const ExpandedStatCard: React.FC<ExpandedStatCardProps> = ({ type, onClose, data }) => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const { state } = useApp();
    const [selectedProfile, setSelectedProfile] = React.useState<any>(null);
    const [chatUser, setChatUser] = React.useState<any>(null);
    const [profileData, setProfileData] = React.useState<any>(null);
    const [loadingProfile, setLoadingProfile] = React.useState(false);

    // Fetch full profile data when a profile is selected
    React.useEffect(() => {
        if (selectedProfile?._id) {
            fetchUserProfile(selectedProfile._id);
        }
    }, [selectedProfile]);

    const fetchUserProfile = async (userId: string) => {
        setLoadingProfile(true);
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setProfileData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleChatClick = (member: any) => {
        // Open quick chat modal with this user
        setChatUser(member);
    };

    const closeChatModal = () => {
        setChatUser(null);
    };

    const handleProfileClick = (member: any) => {
        setSelectedProfile(member);
        setProfileData(null); // Reset profile data
    };

    const closeProfileModal = () => {
        setSelectedProfile(null);
        setProfileData(null);
    };

    const renderContent = () => {
        switch (type) {
            case 'tasks':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Pending Tasks
                            </h3>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {data.tasks && data.tasks.length > 0 ? (
                            data.tasks.map((task: Task) => (
                                <div
                                    key={task._id}
                                    className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {task.title}
                                            </h4>
                                            {task.project && (
                                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {task.project}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'high' || task.priority === 'urgent'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                                                : task.priority === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            {task.dueDate && (
                                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                No pending tasks
                            </p>
                        )}
                    </div>
                );

            case 'projects':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Active Projects
                            </h3>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Show skeleton loader if no data */}
                        {!data.projects || data.projects.length === 0 ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`h-5 w-32 rounded animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                            <div className={`h-6 w-16 rounded animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className={`h-4 w-16 rounded animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                                <div className={`h-4 w-10 rounded animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                            </div>
                                            <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                                <div className={`h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ width: '60%' }}></div>
                                            </div>
                                            <div className={`h-3 w-28 rounded animate-pulse ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            data.projects.map((project: Project) => (
                                <div
                                    key={project._id}
                                    className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {project.name}
                                        </h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${project.status === 'active'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {project.progress}%
                                            </span>
                                        </div>
                                        <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {project.team} team members
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );

            case 'team':
                console.log('👥 [EXPANDED CARD] Team data received:', data);
                console.log('👥 [EXPANDED CARD] Team members:', data.teamMembers);
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Team Members
                            </h3>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {data.teamMembers && data.teamMembers.length > 0 ? (
                                data.teamMembers
                                    .filter((member: any) => member._id !== state.userProfile?._id) // Filter out current user
                                    .map((member: any, index: number) => {
                                        console.log('👤 [EXPANDED CARD] Rendering member:', member);
                                        return (
                                            <div
                                                key={member._id || index}
                                                className={`rounded-xl overflow-hidden relative text-center p-4 group items-center flex flex-col transition-all duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-white'
                                                    }`}
                                            >
                                                {/* Avatar */}
                                                <div className={`transition-all group-hover:scale-105 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {member.avatar ? (
                                                        <img
                                                            src={member.avatar}
                                                            alt={member.name}
                                                            className="w-16 h-16 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <svg className="w-16 h-16" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" fill="none">
                                                            <path d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" strokeLinejoin="round" strokeLinecap="round"></path>
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Name and Role */}
                                                <div className="group-hover:pb-10 transition-all duration-500 delay-200">
                                                    <h1 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        {member.name || `Member ${index + 1}`}
                                                    </h1>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {member.email || `@${member.role || 'member'}`}
                                                    </p>
                                                </div>

                                                {/* Social Icons - Appear on Hover */}
                                                <div className="flex items-center transition-all duration-500 delay-200 group-hover:bottom-3 -bottom-full absolute gap-2 justify-evenly w-full">
                                                    <div className={`flex gap-3 text-2xl p-1 hover:p-2 transition-all duration-500 delay-200 rounded-full ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-700 text-white'
                                                        }`}>
                                                        {/* Message Icon */}
                                                        <button
                                                            onClick={() => handleChatClick(member)}
                                                            className="hover:scale-110 transition-all duration-500 delay-200"
                                                            title="Send message"
                                                        >
                                                            <MessageSquare className="w-5 h-5" />
                                                        </button>

                                                        {/* Email Icon */}
                                                        {member.email && (
                                                            <a
                                                                href={`mailto:${member.email}`}
                                                                className="hover:scale-110 transition-all duration-500 delay-200"
                                                                title="Send email"
                                                            >
                                                                <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                                    <path d="M22 6l-10 7L2 6"></path>
                                                                </svg>
                                                            </a>
                                                        )}

                                                        {/* User Profile Icon */}
                                                        <button
                                                            onClick={() => handleProfileClick(member)}
                                                            className="hover:scale-110 transition-all duration-500 delay-200"
                                                            title="View profile"
                                                        >
                                                            <User className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <p className={`col-span-2 text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    No team members found
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 'progress':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Progress Breakdown
                            </h3>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Skill Bars Container */}
                        <div className="space-y-6">
                            {data.projects && data.projects.length > 0 ? (
                                data.projects.map((project: Project, index: number) => (
                                    <div key={project._id} className="skill-box">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {project.name}
                                            </span>
                                            <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                {project.progress}%
                                            </span>
                                        </div>
                                        <div className={`skill-bar h-2 w-full rounded-md ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-200'}`}>
                                            <div
                                                className="skill-per relative h-full rounded-md"
                                                style={{
                                                    width: `${project.progress}%`,
                                                    background: project.progress >= 80
                                                        ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                                        : project.progress >= 50
                                                            ? 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                                                            : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                                                    animation: 'progressAnimation 0.6s ease-in-out forwards',
                                                    animationDelay: `${index * 0.1}s`,
                                                    opacity: 0
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    No projects to show
                                </p>
                            )}
                        </div>

                        {/* Overall Average */}
                        <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Overall Average
                                </span>
                                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {data.avgProgress || 0}%
                                </span>
                            </div>
                        </div>

                        {/* Add keyframe animation */}
                        <style>{`
                            @keyframes progressAnimation {
                                0% {
                                    width: 0;
                                    opacity: 1;
                                }
                                100% {
                                    opacity: 1;
                                }
                            }
                        `}</style>
                    </div>
                );

            default:
                return null;
        }
    };

    const MotionDiv = motion.div as any;
    const AnimatePresenceComponent = AnimatePresence as any;

    return (
        <AnimatePresenceComponent>
            <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <MotionDiv
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e: any) => e.stopPropagation()}
                    className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6`}
                >
                    {renderContent()}
                </MotionDiv>
            </MotionDiv>

            {/* Profile Modal */}
            {selectedProfile && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4"
                    onClick={closeProfileModal}
                >
                    <MotionDiv
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e: any) => e.stopPropagation()}
                        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6`}
                    >
                        {/* Profile Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                User Profile
                            </h3>
                            <button
                                onClick={closeProfileModal}
                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {loadingProfile ? (
                            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Loading profile...
                            </div>
                        ) : (
                            <>
                                {/* Profile Content */}
                                <div className="flex flex-col items-center text-center mb-6">
                                    {/* Avatar */}
                                    <div className="mb-4">
                                        {(profileData?.avatarUrl || selectedProfile.avatar) ? (
                                            <img
                                                src={profileData?.avatarUrl || selectedProfile.avatar}
                                                alt={profileData?.fullName || selectedProfile.name}
                                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                                            />
                                        ) : (
                                            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300'
                                                }`}>
                                                <User className={`w-12 h-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {profileData?.fullName || selectedProfile.name || 'Unknown User'}
                                    </h2>

                                    {/* Email */}
                                    {(profileData?.email || selectedProfile.email) && (
                                        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {profileData?.email || selectedProfile.email}
                                        </p>
                                    )}

                                    {/* Designation/Role */}
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {profileData?.designation || selectedProfile.role || 'Member'}
                                    </span>

                                    {/* Bio */}
                                    {profileData?.bio && (
                                        <div className={`w-full text-left p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                            }`}>
                                            <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Bio
                                            </h4>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {profileData.bio}
                                            </p>
                                        </div>
                                    )}

                                    {/* Recent Activity */}
                                    {profileData?.recentActivity && profileData.recentActivity.length > 0 && (
                                        <div className={`w-full text-left p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                            }`}>
                                            <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Recent Activity
                                            </h4>
                                            <div className="space-y-2">
                                                {profileData.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className={`text-xs p-2 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'
                                                            }`}
                                                    >
                                                        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                                            {activity.description || activity.title || activity.message}
                                                        </p>
                                                        {activity.timestamp && (
                                                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                {new Date(activity.timestamp).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={() => {
                                                handleChatClick(selectedProfile);
                                                closeProfileModal();
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${isDarkMode
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                            Send Message
                                        </button>

                                        {(profileData?.email || selectedProfile.email) && (
                                            <a
                                                href={`mailto:${profileData?.email || selectedProfile.email}`}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${isDarkMode
                                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                    <path d="M22 6l-10 7L2 6"></path>
                                                </svg>
                                                Email
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </MotionDiv>
                </MotionDiv>
            )}

            {/* Quick Chat Modal */}
            {chatUser && (
                <QuickChat
                    isOpen={!!chatUser}
                    onClose={closeChatModal}
                    recipientId={chatUser._id}
                    recipientName={chatUser.name || 'User'}
                    recipientAvatar={chatUser.avatar}
                />
            )}
        </AnimatePresenceComponent>
    );
};

export default ExpandedStatCard;
