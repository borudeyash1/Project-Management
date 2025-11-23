import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignees: string[];
  reporter?: string;
  watchers: string[];
  startDate?: Date;
  dueDate?: Date;
  estimatedTime?: number;
  loggedTime?: number;
  dependencies: string[];
  recurrence?: string;
  clientVisible: boolean;
  attachments: any[];
  comments: Comment[];
  subtasks: Subtask[];
  customFields: Record<string, any>;
  tags: string[];
  project?: string;
  milestone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  assignee?: string;
}

export interface Comment {
  _id: string;
  author: string;
  content: string;
  mentions: string[];
  attachments: any[];
  createdAt: Date;
  replies: Comment[];
}

export interface Column {
  id: string;
  name: string;
  color: string;
  wip?: number;
  order: number;
}

export interface Milestone {
  _id: string;
  name: string;
  description?: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  approver?: string;
  project: string;
}

export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  deadline: Date;
  taskId: string;
  createdBy: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

interface PlannerContextType {
  tasks: Task[];
  columns: Column[];
  milestones: Milestone[];
  polls: Poll[];
  addTask: (columnId: string) => void;
  createTask: (taskData: Partial<Task>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: string) => void;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<Task>) => void;
  addComment: (taskId: string, comment: Omit<Comment, '_id' | 'createdAt' | 'replies'>) => void;
  addSubtask: (taskId: string, subtask: Omit<Subtask, '_id'>) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  createPoll: (taskId: string, poll: Omit<Poll, '_id'>) => void;
  votePoll: (pollId: string, optionId: string, userId: string) => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      _id: '1',
      title: 'Design new landing page',
      description: 'Create mockups for the new marketing landing page',
      status: 'todo',
      priority: 'high',
      assignees: ['user1'],
      reporter: 'user2',
      watchers: [],
      dueDate: new Date('2024-12-01'),
      estimatedTime: 8,
      loggedTime: 0,
      dependencies: [],
      clientVisible: true,
      attachments: [],
      comments: [],
      subtasks: [
        { _id: 'st1', title: 'Research competitors', completed: true },
        { _id: 'st2', title: 'Create wireframes', completed: false }
      ],
      customFields: {},
      tags: ['design', 'marketing'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      title: 'Implement authentication API',
      description: 'Build JWT-based authentication system',
      status: 'in-progress',
      priority: 'urgent',
      assignees: ['user2'],
      reporter: 'user1',
      watchers: ['user3'],
      dueDate: new Date('2024-11-28'),
      estimatedTime: 16,
      loggedTime: 8,
      dependencies: [],
      clientVisible: false,
      attachments: [],
      comments: [],
      subtasks: [],
      customFields: {},
      tags: ['backend', 'security'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [columns] = useState<Column[]>([
    { id: 'todo', name: 'planner.board.toDo', color: 'bg-gray-400', order: 1 },
    { id: 'in-progress', name: 'planner.board.inProgress', color: 'bg-accent', wip: 3, order: 2 },
    { id: 'review', name: 'planner.board.review', color: 'bg-yellow-500', order: 3 },
    { id: 'done', name: 'planner.board.done', color: 'bg-green-500', order: 4 }
  ]);


  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);

  const addTask = (columnId: string) => {
    const newTask: Task = {
      _id: Date.now().toString(),
      title: 'New Task',
      status: columnId,
      priority: 'medium',
      assignees: [],
      watchers: [],
      dependencies: [],
      clientVisible: false,
      attachments: [],
      comments: [],
      subtasks: [],
      customFields: {},
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks([...tasks, newTask]);
  };

  const createTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      _id: Date.now().toString(),
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      assignees: taskData.assignees || [],
      reporter: taskData.reporter,
      watchers: taskData.watchers || [],
      startDate: taskData.startDate,
      dueDate: taskData.dueDate,
      estimatedTime: taskData.estimatedTime,
      loggedTime: 0,
      dependencies: taskData.dependencies || [],
      recurrence: taskData.recurrence,
      clientVisible: taskData.clientVisible || false,
      attachments: [],
      comments: [],
      subtasks: [],
      customFields: taskData.customFields || {},
      tags: taskData.tags || [],
      project: taskData.project,
      milestone: taskData.milestone,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task._id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task._id !== taskId));
  };

  const moveTask = (taskId: string, newStatus: string) => {
    updateTask(taskId, { status: newStatus });
  };

  const bulkUpdateTasks = (taskIds: string[], updates: Partial<Task>) => {
    setTasks(tasks.map(task =>
      taskIds.includes(task._id) ? { ...task, ...updates, updatedAt: new Date() } : task
    ));
  };

  const addComment = (taskId: string, comment: Omit<Comment, '_id' | 'createdAt' | 'replies'>) => {
    const newComment: Comment = {
      ...comment,
      _id: Date.now().toString(),
      createdAt: new Date(),
      replies: []
    };
    setTasks(tasks.map(task =>
      task._id === taskId ? { ...task, comments: [...task.comments, newComment] } : task
    ));
  };

  const addSubtask = (taskId: string, subtask: Omit<Subtask, '_id'>) => {
    const newSubtask: Subtask = {
      ...subtask,
      _id: Date.now().toString()
    };
    setTasks(tasks.map(task =>
      task._id === taskId ? { ...task, subtasks: [...task.subtasks, newSubtask] } : task
    ));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task =>
      task._id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(st =>
              st._id === subtaskId ? { ...st, completed: !st.completed } : st
            )
          }
        : task
    ));
  };

  const createPoll = (taskId: string, poll: Omit<Poll, '_id'>) => {
    const newPoll: Poll = {
      ...poll,
      _id: Date.now().toString()
    };
    setPolls([...polls, newPoll]);
  };

  const votePoll = (pollId: string, optionId: string, userId: string) => {
    setPolls(polls.map(poll =>
      poll._id === pollId
        ? {
            ...poll,
            options: poll.options.map(opt =>
              opt.id === optionId
                ? { ...opt, votes: [...opt.votes, userId] }
                : opt
            )
          }
        : poll
    ));
  };

  return (
    <PlannerContext.Provider
      value={{
        tasks,
        columns,
        milestones,
        polls,
        addTask,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        bulkUpdateTasks,
        addComment,
        addSubtask,
        toggleSubtask,
        createPoll,
        votePoll
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within PlannerProvider');
  }
  return context;
};
