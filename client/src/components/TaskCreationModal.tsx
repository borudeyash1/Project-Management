import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, Calendar, Flag, User } from 'lucide-react';

interface TeamMember {
  _id: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
  };
  name?: string;
  email?: string;
  role: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: any) => void;
  projectTeam: TeamMember[];
  projectId: string;
}

const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  projectTeam,
  projectId
}) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    taskType: 'general' as 'general' | 'report',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    dueDate: '',
    referenceLinks: [] as string[]
  });

  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [newReferenceLink, setNewReferenceLink] = useState('');

  // Extract team members properly from project teamMembers
  const getTeamMembers = () => {
    console.log('📋 [TASK MODAL] Project team:', projectTeam);
    
    if (!projectTeam || projectTeam.length === 0) {
      console.warn('⚠️ [TASK MODAL] No team members found');
      return [];
    }

    return projectTeam
      .filter(member => {
        // Filter out workspace owner and project manager - they should not be assigned tasks
        const isOwner = member.role === 'owner' || member.role === 'workspace-owner';
        const isProjectManager = member.role === 'project-manager' || member.role === 'manager';
        
        if (isOwner || isProjectManager) {
          console.log('🚫 [TASK MODAL] Filtering out:', member.role, member);
          return false;
        }
        return true;
      })
      .map(member => {
        // Handle teamMembers structure from project
        const userId = member.user?._id || member._id;
        const userName = member.user?.fullName || member.name || 'Unknown';
        const userEmail = member.user?.email || member.email || '';
        const userRole = member.role || 'Member';

        console.log('👤 [TASK MODAL] Member:', { userId, userName, userRole });

        return {
          _id: userId,
          name: userName,
          email: userEmail,
          role: userRole
        };
      });
  };

  const teamMembers = getTeamMembers();

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: `subtask_${Date.now()}`,
          title: newSubtask.trim(),
          completed: false
        }
      ]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleAddReferenceLink = () => {
    if (newReferenceLink.trim()) {
      setTaskData({
        ...taskData,
        referenceLinks: [...taskData.referenceLinks, newReferenceLink.trim()]
      });
      setNewReferenceLink('');
    }
  };

  const handleRemoveReferenceLink = (index: number) => {
    setTaskData({
      ...taskData,
      referenceLinks: taskData.referenceLinks.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    // Validation
    if (!taskData.title.trim()) {
      alert('Please enter a task title');
      return;
    }
    if (!taskData.assigneeId) {
      alert('Please select a team member');
      return;
    }
    if (!taskData.dueDate) {
      alert('Please select a due date');
      return;
    }

    // Find assignee details
    const assignee = teamMembers.find(member => member._id === taskData.assigneeId);
    const assigneeName = assignee?.name || 'Unknown';

    // Create task object
    const newTask = {
      _id: `task_${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      taskType: taskData.taskType,
      assignedTo: taskData.assigneeId,
      assignedToName: assigneeName,
      priority: taskData.priority,
      status: 'pending',
      startDate: new Date(),
      dueDate: new Date(taskData.dueDate),
      progress: 0,
      subtasks: subtasks,
      files: [],
      links: taskData.referenceLinks,
      requiresLink: taskData.taskType === 'report',
      requiresFile: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: projectId
    };

    onCreateTask(newTask);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setTaskData({
      title: '',
      description: '',
      assigneeId: '',
      taskType: 'general',
      priority: 'medium',
      dueDate: '',
      referenceLinks: []
    });
    setSubtasks([]);
    setNewSubtask('');
    setNewReferenceLink('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Describe the task"
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Type
            </label>
            <select
              value={taskData.taskType}
              onChange={(e) => setTaskData({ ...taskData, taskType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="general">📋 General Task</option>
              <option value="report">📊 Report Submission</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {taskData.taskType === 'general' && 'Employee can update status: Not Started → In Progress → Completed'}
              {taskData.taskType === 'report' && 'Employee must submit report URL for review by project manager'}
            </p>
          </div>

          {/* Assignee and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Assign To <span className="text-red-500">*</span>
              </label>
              <select
                value={taskData.assigneeId}
                onChange={(e) => setTaskData({ ...taskData, assigneeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="">Select Team Member</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtasks (Optional)
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Add a subtask"
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{subtask.title}</span>
                      <button
                        onClick={() => handleRemoveSubtask(subtask.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reference Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reference Links (Optional)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Add URLs to reference documents, designs, or resources
            </p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newReferenceLink}
                  onChange={(e) => setNewReferenceLink(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddReferenceLink()}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="https://example.com/document"
                />
                <button
                  onClick={handleAddReferenceLink}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {taskData.referenceLinks.length > 0 && (
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
                  {taskData.referenceLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate flex-1"
                      >
                        {link}
                      </a>
                      <button
                        onClick={() => handleRemoveReferenceLink(index)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCreationModal;
