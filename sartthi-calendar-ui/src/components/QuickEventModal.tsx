import React, { useState, useEffect } from 'react';
import { X, Clock, Users, MapPin, Link as LinkIcon, Calendar as CalendarIcon, Paperclip } from 'lucide-react';
import VaultPicker from './VaultPicker';

interface QuickEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialTime?: string;
  onSave: (event: {
    title: string;
    startTime: string;
    endTime: string;
    date: string;
    description?: string;
    meetingLink?: string;
    location?: string;
    attendees?: string[]; // Array of emails
    color?: string;
  }) => void;
}

const QuickEventModal: React.FC<QuickEventModalProps> = ({ isOpen, onClose, onSave, initialDate, initialTime }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialTime || '09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [showVaultPicker, setShowVaultPicker] = useState(false);

  // Try to get current user email from localStorage as fallback
  const getUserEmail = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) return JSON.parse(userStr).email;
    } catch (e) { }
    return undefined;
  };

  const handleVaultSelect = (files: any[]) => {
    const fileLinks = files.map(f => `Shared from Sartthi Vault: ${f.name} - ${f.webViewLink}`).join('\n');
    setDescription(prev => prev + (prev ? '\n\n' : '') + fileLinks);
  };

  const colors = [
    { name: 'blue', hex: '#3B82F6' },
    { name: 'purple', hex: '#8B5CF6' },
    { name: 'green', hex: '#10B981' },
    { name: 'orange', hex: '#F59E0B' },
    { name: 'gray', hex: '#6B7280' },
  ];

  // Reset state when modal opens with new props
  useEffect(() => {
    if (isOpen) {
      if (initialDate) setDate(initialDate.toISOString().split('T')[0]);
      if (initialTime) {
        setStartTime(initialTime);
        const [h, m] = initialTime.split(':').map(Number);
        const endH = h + 1;
        setEndTime(`${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
  }, [isOpen, initialDate, initialTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title || '(No Title)',
      date,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      description,
      meetingLink,
      location,
      attendees: attendees.split(',').map(e => e.trim()).filter(e => e),
      color: selectedColor,
    });
    onClose();
    resetForm();
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hours = h % 12 || 12;
    return `${hours}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMeetingLink('');
    setLocation('');
    setAttendees('');
    setSelectedColor('blue');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card-bg border border-border-subtle rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-sidebar-bg/50">
          <h2 className="text-lg font-semibold text-text-primary">Create New Event</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1 hover:bg-hover-bg rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event Title"
              autoFocus
              className="w-full text-xl font-medium bg-transparent border-b-2 border-border-subtle focus:border-accent-blue focus:outline-none py-2 text-white placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <CalendarIcon size={12} /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} /> Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="flex-1 bg-white/5 border border-border-subtle rounded-lg px-2 py-2 text-sm text-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all [color-scheme:dark]"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="flex-1 bg-white/5 border border-border-subtle rounded-lg px-2 py-2 text-sm text-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            {/* Location */}
            <div className="relative group">
              <MapPin className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-accent-blue transition-colors" size={16} />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add Location"
                className="w-full bg-white/5 border border-border-subtle rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all placeholder-gray-500"
              />
            </div>

            {/* Meeting Link */}
            <div className="relative group">
              <LinkIcon className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-accent-blue transition-colors" size={16} />
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="Add Meeting Link"
                className="w-full bg-white/5 border border-border-subtle rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all placeholder-gray-500"
              />
            </div>

            {/* Attendees */}
            <div className="relative group">
              <Users className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-accent-blue transition-colors" size={16} />
              <input
                type="text"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="Add Attendees (comma separated emails)"
                className="w-full bg-white/5 border border-border-subtle rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all placeholder-gray-500"
              />
            </div>

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add Description..."
              rows={3}
              className="w-full bg-white/5 border border-border-subtle rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all placeholder-gray-500 resize-none"
            />
          </div>

          {/* Attachments Trigger */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setShowVaultPicker(true)}
              className="flex items-center gap-2 text-sm text-accent-blue hover:text-blue-400 transition-colors px-1"
            >
              <Paperclip size={14} />
              <span>Attach from Vault</span>
            </button>
          </div>


          {/* Color Picker */}
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Event Color</label>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-offset-gray-900 ${selectedColor === color.name ? 'ring-white scale-110' : 'ring-transparent'
                    }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
            >
              Create Event
            </button>
          </div>
        </form>
      </div >

      <VaultPicker
        isOpen={showVaultPicker}
        onClose={() => setShowVaultPicker(false)}
        onSelect={handleVaultSelect}
        userEmail={getUserEmail()}
      />
    </div >
  );
};

export default QuickEventModal;
