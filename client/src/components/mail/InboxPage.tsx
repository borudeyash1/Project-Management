import React, { useState } from 'react';
import { Search, RefreshCw, MoreVertical } from 'lucide-react';
import MailSidebar from './MailSidebar';
import MailRow from './MailRow';

interface Mail {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  isUnread: boolean;
  isStarred: boolean;
}

const InboxPage: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMail, setSelectedMail] = useState<string | null>(null);

  // Sample data
  const mails: Mail[] = [
    {
      id: '1',
      sender: 'Sarah Johnson',
      subject: 'Project Update - Q4 Review',
      preview: 'Hi team, I wanted to share the latest updates on our Q4 project milestones...',
      time: '10:30 AM',
      isUnread: true,
      isStarred: false,
    },
    {
      id: '2',
      sender: 'Michael Chen',
      subject: 'Meeting Notes from Yesterday',
      preview: 'Here are the key takeaways from our discussion about the new feature rollout...',
      time: '9:15 AM',
      isUnread: true,
      isStarred: true,
    },
    {
      id: '3',
      sender: 'Emily Davis',
      subject: 'Design System Updates',
      preview: 'The new component library is ready for review. Please check the Figma file...',
      time: 'Yesterday',
      isUnread: false,
      isStarred: false,
    },
    {
      id: '4',
      sender: 'Alex Thompson',
      subject: 'Budget Approval Request',
      preview: 'I need your approval on the Q1 budget proposal. Attached is the detailed breakdown...',
      time: 'Yesterday',
      isUnread: false,
      isStarred: true,
    },
    {
      id: '5',
      sender: 'Jessica Lee',
      subject: 'Team Lunch Next Friday',
      preview: 'Let\'s plan a team lunch next Friday to celebrate the successful launch...',
      time: 'Nov 23',
      isUnread: false,
      isStarred: false,
    },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'starred', label: 'Starred' },
    { id: 'important', label: 'Important' },
  ];

  return (
    <div className="flex h-screen bg-app-bg text-text-primary">
      {/* Sidebar */}
      <MailSidebar activeFolder={activeFolder} onFolderChange={setActiveFolder} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border-subtle bg-app-bg">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-xl font-semibold text-text-primary capitalize">
              {activeFolder}
            </h1>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-sidebar-bg text-text-muted hover:text-text-light transition-colors">
                <RefreshCw size={18} />
              </button>
              <button className="p-2 rounded-lg hover:bg-sidebar-bg text-text-muted hover:text-text-light transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 pb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter"
                size={18}
              />
              <input
                type="text"
                placeholder="Search mail..."
                className="w-full bg-sidebar-bg border border-border-subtle rounded-lg pl-10 pr-4 py-2 text-sm text-text-light placeholder-text-lighter focus:outline-none focus:border-border-light transition-colors"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-6 pb-3 flex items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  text-xs border rounded-full px-3 py-1 transition-colors
                  ${
                    activeFilter === filter.id
                      ? 'border-border-light text-white bg-hover-bg'
                      : 'border-border-subtle text-text-lighter hover:text-white hover:border-border-light'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mail List */}
        <div className="flex-1 overflow-y-auto">
          {mails.map((mail) => (
            <MailRow
              key={mail.id}
              {...mail}
              isSelected={selectedMail === mail.id}
              onClick={() => setSelectedMail(mail.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
