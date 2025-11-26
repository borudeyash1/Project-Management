import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Pencil, Trash2, Mail, MoreVertical, 
  Share2, Bell, Calendar, Copy, Printer, Globe, User
} from 'lucide-react';
import { CalendarEvent } from '../services/calendarApi';
import { format, parseISO } from 'date-fns';

interface EventDetailPopoverProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

const EventDetailPopover: React.FC<EventDetailPopoverProps> = ({ event, onClose, onEdit, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateRange = () => {
    if (!event.date) return '';
    const date = parseISO(event.date);
    const dateStr = format(date, 'EEEE, MMMM d');
    return `${dateStr} ⋅ ${event.startTime} – ${event.endTime}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#1F1F1F] rounded-2xl shadow-2xl w-full max-w-[448px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Actions */}
        <div className="flex items-center justify-end gap-1 p-2 pr-4 pt-3">
          <button 
            onClick={() => onEdit(event)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Edit event"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => onDelete(event.id)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Delete event"
          >
            <Trash2 size={18} />
          </button>
          <button 
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Email participants"
          >
            <Mail size={18} />
          </button>
          
          <div className="relative" ref={optionsRef}>
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="Options"
            >
              <MoreVertical size={18} />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#2C2C2C] rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                  <Printer size={14} /> Print
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                  <Copy size={14} /> Duplicate
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                  <Globe size={14} /> Publish event
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                  <User size={14} /> Change owner
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ml-1"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="flex gap-4">
            <div className={`mt-1 w-4 h-4 rounded-sm flex-shrink-0 bg-${event.color || 'blue'}-500`} />
            <div className="flex-1 space-y-4">
              {/* Title & Time */}
              <div>
                <h2 className="text-[22px] leading-tight text-gray-900 dark:text-white font-normal mb-1">
                  {event.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatDateRange()}
                </p>
              </div>

              {/* Action Button */}
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Share2 size={16} />
                Invite via link
              </button>

              {/* Details List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Bell size={18} className="text-gray-400" />
                  <span>30 minutes before</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar size={18} className="text-gray-400" />
                  <span>Yash Borude</span>
                </div>

                {event.description && (
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 mt-2">
                    <div className="w-[18px] flex justify-center">
                      <div className="w-4 h-0.5 bg-gray-400 rounded-full mt-2" />
                    </div>
                    <p className="whitespace-pre-wrap">{event.description}</p>
                  </div>
                )}
                
                {event.meetingLink && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-[18px] flex justify-center">
                      <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center text-white text-[10px] font-bold">G</div>
                    </div>
                    <a href={event.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                      Join with Google Meet
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPopover;
