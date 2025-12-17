import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface PendingTask {
    _id: string;
    title: string;
    dueDate: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    project?: {
        _id: string;
        name: string;
    };
}

const PendingTasksWidget: React.FC = () => {
    const { isDarkMode } = useTheme();
    const { state } = useApp();
    const navigate = useNavigate();
    const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
    const [loading, setLoading] = useState(false);
    const currentUserId = state.userProfile?._id;

    useEffect(() => {
        loadPendingTasks();
    }, [currentUserId]);

    const loadPendingTasks = async () => {
        if (!currentUserId) return;

        try {
            setLoading(true);
            const response = await api.get('/home/dashboard');
            
            if (response.data?.data?.quickTasks) {
                // Filter for pending tasks assigned to current user
                const pending = response.data.data.quickTasks
                    .filter((task: any) => {
                        const isAssignedToUser = task.assignee === currentUserId || 
                                                task.assignee?._id === currentUserId ||
                                                task.assignedTo === currentUserId;
                        return !task.completed && isAssignedToUser && task.dueDate;
                    })
                    .map((task: any) => ({
                        _id: task._id,
                        title: task.title,
                        dueDate: new Date(task.dueDate),
                        priority: task.priority || 'medium',
                        project: task.project
                    }))
                    .sort((a: PendingTask, b: PendingTask) => 
                        a.dueDate.getTime() - b.dueDate.getTime()
                    )
                    .slice(0, 5); // Show only top 5 urgent tasks

                setPendingTasks(pending);
            }
        } catch (error) {
            console.error('Failed to load pending tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDeadline = (date: Date) => {
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return 'Due tomorrow';
        } else if (diffDays <= 7) {
            return `Due in ${diffDays} days`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'rgb(239 68 68)'; // red
            case 'high':
                return 'rgb(249 115 22)'; // orange
            case 'medium':
                return 'rgb(250 204 21)'; // yellow
            case 'low':
                return 'rgb(34 197 94)'; // green
            default:
                return 'rgb(250 204 21)';
        }
    };

    if (loading) {
        return (
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading pending tasks...</p>
            </div>
        );
    }

    if (pendingTasks.length === 0) {
        return (
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Pending Tasks
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No pending tasks. Great job! 🎉
                </p>
            </div>
        );
    }

    return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Pending Tasks
            </h2>
            
            <div className="notifications-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingTasks.map((task) => {
                    const borderColor = getPriorityColor(task.priority);
                    const isOverdue = task.dueDate.getTime() < new Date().getTime();
                    
                    return (
                        <div
                            key={task._id}
                            className="alert"
                            style={{
                                backgroundColor: isDarkMode ? 'rgb(31 41 55)' : 'rgb(254 252 232)',
                                borderLeftWidth: '4px',
                                borderLeftColor: borderColor,
                                borderRadius: '0.375rem',
                                padding: '1rem',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/tasks/${task._id}`)}
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle 
                                        className="alert-svg" 
                                        style={{ 
                                            height: '1.25rem', 
                                            width: '1.25rem', 
                                            color: borderColor 
                                        }} 
                                    />
                                </div>
                                <div className="alert-prompt-wrap" style={{ marginLeft: '0.75rem', flex: 1 }}>
                                    <p 
                                        className="alert-prompt" 
                                        style={{ 
                                            fontWeight: 500,
                                            color: isDarkMode ? 'rgb(209 213 219)' : 'rgb(202 138 4)',
                                            marginBottom: '0.25rem'
                                        }}
                                    >
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs" style={{ 
                                        color: isDarkMode ? 'rgb(156 163 175)' : 'rgb(161 98 7)' 
                                    }}>
                                        <Clock className="w-3 h-3" />
                                        <span className={isOverdue ? 'font-semibold' : ''}>
                                            {formatDeadline(task.dueDate)}
                                        </span>
                                        {task.project && (
                                            <>
                                                <span>•</span>
                                                <span>{task.project.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {pendingTasks.length >= 5 && (
                <button
                    onClick={() => navigate('/tasks')}
                    className={`mt-4 w-full text-sm font-medium py-2 px-4 rounded-lg transition-colors ${
                        isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                >
                    View All Tasks
                </button>
            )}
        </div>
    );
};

export default PendingTasksWidget;
