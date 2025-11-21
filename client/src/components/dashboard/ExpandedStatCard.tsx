import React from 'react';
import { X, Clock, Target, Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

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
                        {data.projects && data.projects.length > 0 ? (
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
                        ) : (
                            <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                No active projects
                            </p>
                        )}
                    </div>
                );

            case 'team':
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
                        <div className="grid grid-cols-2 gap-3">
                            {data.teamMembers && data.teamMembers.length > 0 ? (
                                data.teamMembers.map((member: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                                                }`}>
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {member.name || `Member ${index + 1}`}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {member.role || 'Team Member'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={`col-span-2 text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    No team members
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
                        {data.projects && data.projects.length > 0 ? (
                            data.projects.map((project: Project) => (
                                <div key={project._id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {project.name}
                                        </span>
                                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {project.progress}%
                                        </span>
                                    </div>
                                    <div className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                        <div
                                            className={`h-3 rounded-full transition-all ${project.progress >= 80
                                                ? 'bg-green-600'
                                                : project.progress >= 50
                                                    ? 'bg-blue-600'
                                                    : 'bg-yellow-600'
                                                }`}
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                No projects to show
                            </p>
                        )}
                        <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Overall Average
                                </span>
                                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {data.avgProgress || 0}%
                                </span>
                            </div>
                        </div>
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
                        } rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6`}
                >
                    {renderContent()}
                </MotionDiv>
            </MotionDiv>
        </AnimatePresenceComponent>
    );
};

export default ExpandedStatCard;
