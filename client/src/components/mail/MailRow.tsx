import React from 'react';
import { Archive, Trash2, Clock, Star, Mail } from 'lucide-react';

interface MailRowProps {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  isUnread?: boolean;
  isStarred?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const MailRow: React.FC<MailRowProps> = ({
  sender,
  subject,
  preview,
  time,
  isUnread = false,
  isStarred = false,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        group relative flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors
        ${isSelected ? 'bg-hover-bg' : 'bg-app-bg hover:bg-sidebar-bg'}
        border-b border-border-subtle
      `}
    >
      {/* Unread Indicator */}
      {isUnread && (
        <div className="w-2 h-2 rounded-full bg-accent-blue flex-shrink-0" />
      )}
      {!isUnread && <div className="w-2" />}

      {/* Star */}
      <button
        className="flex-shrink-0 text-text-lighter hover:text-yellow-400 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          // Handle star toggle
        }}
      >
        <Star
          size={16}
          className={isStarred ? 'fill-yellow-400 text-yellow-400' : ''}
        />
      </button>

      {/* Mail Content */}
      <div className="flex-1 min-w-0 flex items-center gap-4">
        {/* Sender */}
        <div className="w-48 flex-shrink-0">
          <p
            className={`text-sm truncate ${
              isUnread ? 'font-medium text-text-primary' : 'font-normal text-text-light'
            }`}
          >
            {sender}
          </p>
        </div>

        {/* Subject & Preview */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-light truncate">
            <span className={isUnread ? 'font-medium' : 'font-normal'}>
              {subject}
            </span>
            {' - '}
            <span className="text-text-lighter font-light">{preview}</span>
          </p>
        </div>

        {/* Time */}
        <div className="w-20 flex-shrink-0 text-right">
          <p className="text-xs text-text-lighter">{time}</p>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1.5 rounded hover:bg-hover-bg text-text-lighter hover:text-text-light transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle archive
          }}
          title="Archive"
        >
          <Archive size={16} />
        </button>
        <button
          className="p-1.5 rounded hover:bg-hover-bg text-text-lighter hover:text-text-light transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle delete
          }}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
        <button
          className="p-1.5 rounded hover:bg-hover-bg text-text-lighter hover:text-text-light transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle snooze
          }}
          title="Snooze"
        >
          <Clock size={16} />
        </button>
      </div>
    </div>
  );
};

export default MailRow;
