import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: any;
  assignees: any[];
  reporter?: any;
  project?: any;
  workspace?: any;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  estimatedTime: number;
  actualHours?: number;
  progress?: number;
  subtasks: Subtask[];
  tags: string[];
  comments: Comment[];
  attachments: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  _id?: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface Comment {
  _id: string;
  author: string;
  content: string;
  createdAt: Date;
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
  title: string;
  description?: string;
  dueDate: Date;
  startDate?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  project?: any;
  workspace?: any;
  tasks?: any[];
  createdBy?: any;
}

export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  completed: boolean;
  assignedTo?: any;
  createdBy?: any;
}

export interface PlannerEvent {
  _id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: string;
  participants?: any[];
}

interface PlannerContextType {
  tasks: Task[];
  columns: Column[];
  milestones: Milestone[];
  reminders: Reminder[];
  events: PlannerEvent[];
  loading: boolean;
  dataVersion: number;
  fetchData: () => Promise<void>;
  addTask: (columnId: string) => void;
  createTask: (taskData: Partial<Task>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: string) => Promise<void>;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<Task>) => Promise<void>;
  addSubtask: (taskId: string, subtask: Omit<Subtask, '_id'>) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addComment: (taskId: string, comment: Omit<Comment, '_id' | 'createdAt'>) => Promise<void>;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

// Global state to persist across re-renders
let globalTasks: Task[] = [];
let globalMilestones: Milestone[] = [];
let globalReminders: Reminder[] = [];
let globalEvents: PlannerEvent[] = [];

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const [columns] = useState<Column[]>([
    { id: 'todo', name: 'planner.board.todo', color: 'bg-gray-500', order: 1 },
    { id: 'in-progress', name: 'planner.board.inProgress', color: 'bg-blue-500', order: 2 },
    { id: 'in-review', name: 'planner.board.review', color: 'bg-yellow-500', order: 3 },
    { id: 'done', name: 'planner.board.done', color: 'bg-green-500', order: 4 }
  ]);

  const fetchData = async () => {
    console.log('🚀 [PlannerContext] Fetching data...');
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await apiService.get(`/planner/data?_t=${timestamp}`);
      console.log('✅ [PlannerContext] Response:', response.data);
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        
        const normalizedTasks = (data.tasks || []).map((task: any) => ({
          ...task,
          subtasks: task.subtasks || [],
          tags: task.tags || [],
          comments: task.comments || [],
          attachments: task.attachments || [],
          assignees: task.assignee ? [task.assignee] : [],
          estimatedTime: task.estimatedHours || task.estimatedTime || 0
        }));
        
        console.log('💾 [PlannerContext] Setting tasks:', normalizedTasks.length);
        console.log('📋 [PlannerContext] Tasks data:', normalizedTasks);
        
        // Update global state
        globalTasks = normalizedTasks;
        globalMilestones = data.milestones || [];
        globalReminders = data.reminders || [];
        globalEvents = data.events || [];
        
        // Force update with new data
        setTasks([...normalizedTasks]);
        setMilestones([...globalMilestones]);
        setReminders([...globalReminders]);
        setEvents([...globalEvents]);
        setDataVersion(v => v + 1);
        forceUpdate();
        
        console.log('✅ [PlannerContext] State updated. Version:', dataVersion + 1);
        
        // Verify
        setTimeout(() => {
          console.log('🔍 [PlannerContext] Verification - globalTasks:', globalTasks.length);
        }, 100);
      }
    } catch (error) {
      console.error('❌ [PlannerContext] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🎬 [PlannerContext] Mounted, fetching data');
    fetchData();
  }, []);

  useEffect(() => {
    console.log('🔄 [PlannerContext] Tasks state:', tasks.length);
  }, [tasks]);

  const addTask = (columnId: string) => {
    console.log('Add task to column:', columnId);
  };

  const createTask = (taskData: Partial<Task>) => {
    console.log('Create task:', taskData);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    await apiService.put(`/tasks/${taskId}`, updates);
    await fetchData();
  };

  const deleteTask = async (taskId: string) => {
    await apiService.delete(`/tasks/${taskId}`);
    await fetchData();
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    await apiService.put(`/tasks/${taskId}`, { status: newStatus });
    const updatedTasks = tasks.map(task => 
      task._id === taskId ? { ...task, status: newStatus } : task
    );
    globalTasks = updatedTasks;
    setTasks([...updatedTasks]);
  };

  const bulkUpdateTasks = async (taskIds: string[], updates: Partial<Task>) => {
    await Promise.all(taskIds.map(id => apiService.put(`/tasks/${id}`, updates)));
    await fetchData();
  };

  const addSubtask = async (taskId: string, subtask: Omit<Subtask, '_id'>) => {
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      const updatedSubtasks = [...(task.subtasks || []), subtask];
      await apiService.put(`/tasks/${taskId}`, { subtasks: updatedSubtasks });
      await fetchData();
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (task && task.subtasks) {
      const updatedSubtasks = task.subtasks.map(st =>
        st._id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      await apiService.put(`/tasks/${taskId}`, { subtasks: updatedSubtasks });
      await fetchData();
    }
  };

  const addComment = async (taskId: string, comment: Omit<Comment, '_id' | 'createdAt'>) => {
    console.log('Add comment:', taskId, comment);
    await fetchData();
  };

  return (
    <PlannerContext.Provider
      value={{
        tasks,
        columns,
        milestones,
        reminders,
        events,
        loading,
        dataVersion,
        fetchData,
        addTask,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        bulkUpdateTasks,
        addSubtask,
        toggleSubtask,
        addComment
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
