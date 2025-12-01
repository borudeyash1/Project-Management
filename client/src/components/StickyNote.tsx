import React, { useState, useEffect, useRef } from 'react';
import { X, Save, GripHorizontal, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';

interface StickyNoteProps {
  id?: string;
  initialTitle?: string;
  initialContent?: string;
  initialColor?: string;
  initialPosition?: { x: number; y: number };
  onClose: () => void;
  onDelete?: (id: string) => void;
  onSave?: (note: any) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  initialTitle = '',
  initialContent = '',
  initialColor = '#fff9c4', // Default yellow
  initialPosition = { x: 100, y: 100 },
  onClose,
  onDelete,
  onSave
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [noteId, setNoteId] = useState(id);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const colors = [
    '#fff9c4', // Yellow
    '#e1bee7', // Purple
    '#c8e6c9', // Green
    '#bbdefb', // Blue
    '#ffcdd2', // Red
  ];

  const [currentColor, setCurrentColor] = useState(initialColor);

  useEffect(() => {
    // Auto-save logic
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (title || content) {
      setIsSaving(true);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const noteData = {
            title,
            content,
            isSticky: true,
            color: currentColor,
            position
          };

          let savedNote;
          if (noteId) {
            savedNote = await apiService.put(`/notes/${noteId}`, noteData);
          } else {
            savedNote = await apiService.post('/notes', noteData);
            setNoteId((savedNote as any)._id);
          }
          
          if (onSave) onSave(savedNote);
          setIsSaving(false);
        } catch (error) {
          console.error('Error auto-saving note:', error);
          setIsSaving(false);
        }
      }, 1000); // Debounce for 1 second
    }
  }, [title, content, currentColor, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDelete = async () => {
    if (noteId && onDelete) {
      try {
        await apiService.delete(`/notes/${noteId}`);
        onDelete(noteId);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
    onClose();
  };

  return (
    <div
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: currentColor,
      }}
      className="fixed w-64 min-h-[200px] rounded-lg shadow-xl z-50 flex flex-col transition-shadow hover:shadow-2xl border border-gray-200/50"
    >
      {/* Header / Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="h-8 flex items-center justify-between px-2 cursor-move border-b border-black/5"
      >
        <GripHorizontal size={16} className="text-gray-500" />
        <div className="flex items-center gap-1">
          {isSaving && <Save size={12} className="text-gray-500 animate-pulse" />}
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded">
            <X size={14} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title..."
          className="bg-transparent border-none outline-none font-bold text-gray-800 placeholder-gray-500/50"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a note..."
          className="flex-1 bg-transparent border-none outline-none resize-none text-gray-700 text-sm leading-relaxed placeholder-gray-500/50"
        />
      </div>

      {/* Footer / Colors */}
      <div className="h-8 flex items-center justify-between px-2 border-t border-black/5 bg-black/5">
        <div className="flex gap-1">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setCurrentColor(c)}
              className={`w-4 h-4 rounded-full border border-black/10 ${currentColor === c ? 'ring-1 ring-black/30' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        {noteId && (
          <button onClick={handleDelete} className="p-1 hover:bg-red-500/20 rounded text-red-600">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export default StickyNote;
