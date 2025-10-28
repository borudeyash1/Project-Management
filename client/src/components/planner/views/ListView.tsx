import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Edit2, Trash2, CheckSquare, Square,
  User, Calendar, Flag, Tag, MoreVertical, Filter, Download, Plus
} from 'lucide-react';
import { usePlanner } from '../../../context/PlannerContext';
import { Task } from '../../../context/PlannerContext';

interface ListViewProps {
  searchQuery: string;
}

type SortField = 'title' | 'priority' | 'status' | 'dueDate' | 'assignees';
type SortDirection = 'asc' | 'desc';
type GroupBy = 'none' | 'status' | 'priority' | 'assignee' | 'project';

const ListView: React.FC<ListViewProps> = ({ searchQuery }) => {
  const { tasks, updateTask, deleteTask, bulkUpdateTasks } = usePlanner();
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Filter tasks by search query
  const filteredTasks = tasks.filter(task =>
    !searchQuery ||
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'assignees') {
      aValue = a.assignees.length;
      bValue = b.assignees.length;
    }

    if (sortField === 'dueDate') {
      aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Group tasks
  const groupedTasks = groupBy === 'none' 
    ? { 'All Tasks': sortedTasks }
    : sortedTasks.reduce((groups, task) => {
        let key = 'Ungrouped';
        if (groupBy === 'status') key = task.status;
        else if (groupBy === 'priority') key = task.priority;
        else if (groupBy === 'assignee') key = task.assignees[0] || 'Unassigned';
        else if (groupBy === 'project') key = task.project || 'No Project';
        
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
        return groups;
      }, {} as Record<string, Task[]>);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === sortedTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(sortedTasks.map(t => t._id));
    }
  };

  const handleBulkAction = (action: 'delete' | 'status' | 'priority', value?: string) => {
    if (action === 'delete') {
      selectedTasks.forEach(id => deleteTask(id));
      setSelectedTasks([]);
    } else if (action === 'status' && value) {
      bulkUpdateTasks(selectedTasks, { status: value });
      setSelectedTasks([]);
    } else if (action === 'priority' && value) {
      bulkUpdateTasks(selectedTasks, { priority: value as any });
      setSelectedTasks([]);
    }
  };

  const handleCellEdit = (taskId: string, field: string, currentValue: any) => {
    setEditingCell({ taskId, field });
    setEditValue(currentValue || '');
  };

  const handleCellSave = () => {
    if (editingCell) {
      updateTask(editingCell.taskId, { [editingCell.field]: editValue });
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'text-gray-600 bg-gray-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'review': return 'text-yellow-600 bg-yellow-100';
      case 'done': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Group By */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="none">No Grouping</option>
              <option value="status">Group by Status</option>
              <option value="priority">Group by Priority</option>
              <option value="assignee">Group by Assignee</option>
              <option value="project">Group by Project</option>
            </select>

            {/* Bulk Actions */}
            {selectedTasks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTasks.length} selected
                </span>
                <select
                  onChange={(e) => {
                    const [action, value] = e.target.value.split(':');
                    handleBulkAction(action as any, value);
                    e.target.value = '';
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Bulk Actions</option>
                  <option value="status:todo">Move to To Do</option>
                  <option value="status:in-progress">Move to In Progress</option>
                  <option value="status:done">Move to Done</option>
                  <option value="priority:high">Set High Priority</option>
                  <option value="priority:medium">Set Medium Priority</option>
                  <option value="priority:low">Set Low Priority</option>
                  <option value="delete">Delete Selected</option>
                </select>
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <div key={groupName} className="mb-6">
            {groupBy !== 'none' && (
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">
                {groupName} ({groupTasks.length})
              </h3>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTasks.length === sortedTasks.length && sortedTasks.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        Task
                        <SortIcon field="title" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('priority')}
                    >
                      <div className="flex items-center gap-2">
                        Priority
                        <SortIcon field="priority" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('assignees')}
                    >
                      <div className="flex items-center gap-2">
                        Assignee
                        <SortIcon field="assignees" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('dueDate')}
                    >
                      <div className="flex items-center gap-2">
                        Due Date
                        <SortIcon field="dueDate" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="w-12 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groupTasks.map(task => (
                    <tr
                      key={task._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task._id)}
                          onChange={() => handleSelectTask(task._id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onDoubleClick={() => handleCellEdit(task._id, 'title', task.title)}
                      >
                        {editingCell?.taskId === task._id && editingCell?.field === 'title' ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellSave}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCellSave();
                              if (e.key === 'Escape') handleCellCancel();
                            }}
                            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            {task.status === 'done' ? (
                              <CheckSquare className="w-4 h-4 text-green-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 3).map((assignee, idx) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium"
                              title={assignee}
                            >
                              {assignee[0].toUpperCase()}
                            </div>
                          ))}
                          {task.assignees.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {task.dueDate ? (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {task.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {sortedTasks.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
