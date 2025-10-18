import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CalendarPlus, Workflow, Send } from 'lucide-react';

const TaskDrawer = () => {
  const { state, dispatch } = useApp();
  const [comment, setComment] = useState('');

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const toggleModal = (modalName) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: modalName });
  };

  const toggleTaskDrawer = () => {
    dispatch({ type: 'TOGGLE_TASK_DRAWER', payload: false });
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      showToast('Comment added', 'success');
      setComment('');
    }
  };

  if (!state.taskDrawer.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={toggleTaskDrawer}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white border-l border-border shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <div className="text-xs text-slate-500">Task</div>
            <h3 className="text-[18px] tracking-tight font-semibold">{state.taskDrawer.title}</h3>
          </div>
          <button 
            className="p-2 rounded-md hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
            onClick={toggleTaskDrawer}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-auto flex-1 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">Status</label>
              <select className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
                <option>Backlog</option>
                <option selected>In Progress</option>
                <option>Blocked</option>
                <option>Done</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Due date</label>
              <input type="date" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Assignees</label>
              <div className="mt-1 flex -space-x-2">
                <img className="h-8 w-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Alex" />
                <img className="h-8 w-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=100&auto=format&fit=crop" alt="Priya" />
                <button className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs text-slate-600">+1</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Priority</label>
              <select className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
                <option>Low</option>
                <option selected>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500">Description</label>
            <textarea 
              rows="4" 
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" 
              placeholder="Add details, context, and links..."
            />
          </div>

          <div className="rounded-lg border border-border p-3 bg-slate-50">
            <div className="text-xs text-slate-500 mb-2">Quick actions</div>
            <div className="flex flex-wrap items-center gap-2">
              <button 
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-white text-sm"
                onClick={() => toggleModal('requestChange')}
              >
                <CalendarPlus className="w-4 h-4 mr-1 inline-block" />
                Request deadline change
              </button>
              <button 
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-white text-sm"
                onClick={() => toggleModal('requestChange')}
              >
                <Workflow className="w-4 h-4 mr-1 inline-block" />
                Request workload change
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Activity</div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <img className="h-7 w-7 rounded-full" src="https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=100&auto=format&fit=crop" alt="Sam" />
                <div className="bg-white border border-border rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-500">Sam • 2h ago</div>
                  <div className="text-sm">Pushed updated hero illustrations.</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <img className="h-7 w-7 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Alex" />
                <div className="bg-white border border-border rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-500">Alex • 1h ago</div>
                  <div className="text-sm">Marked status as In Progress.</div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input 
                type="text" 
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" 
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button 
                className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500"
                onClick={handleSendComment}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <div className="text-xs text-slate-500">Changes auto-saved</div>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={() => showToast('Task duplicated', 'info')}
            >
              Duplicate
            </button>
            <button 
              className="px-3 py-1.5 rounded-lg text-white text-sm hover:opacity-95 bg-error"
              onClick={() => showToast('Task archived', 'warning')}
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDrawer;
