import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [mails, setMails] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmails();
  }, [activeFolder]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sartthi/mail/messages', {
        params: { folder: activeFolder }
      });
      const fetchedEmails = response.data.emails.map((email: any) => ({
        id: email.id || Math.random().toString(),
        sender: email.sender || email.from || 'Unknown',
        subject: email.subject || 'No Subject',
        preview: email.preview || email.body || '',
        time: email.time || new Date().toLocaleDateString(),
        isUnread: email.isUnread !== undefined ? email.isUnread : true,
        isStarred: email.isStarred !== undefined ? email.isStarred : false,
      }));
      setMails(fetchedEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

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
