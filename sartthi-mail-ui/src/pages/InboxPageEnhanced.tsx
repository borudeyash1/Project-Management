import { useState, useEffect, useRef } from 'react';
import { 
  Archive, Trash2, Clock, Star, Mail, RefreshCw, Search, Send, 
  Inbox, Tag, Settings, ChevronLeft, ChevronRight, FileText, 
  AlertCircle, Users, Megaphone, MessageSquare 
} from 'lucide-react';
import ComposeModal from '../components/ComposeModal';
import { useToast } from '../context/ToastContext';

interface InboxPageProps {
  user: {
    fullName: string;
    email: string;
  };
}

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  labels: string[];
  category?: 'primary' | 'social' | 'promotions' | 'updates' | 'forums';
  threadId?: string;
}

type ViewType = 'inbox' | 'starred' | 'snoozed' | 'sent' | 'drafts' | 'spam' | 'trash' | 'all';
type FilterBy = 'all' | 'unread' | 'starred' | 'important';

function InboxPage({ user }: InboxPageProps) {
  const { toast } = useToast();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('inbox');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [listWidth, setListWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  
  const resizeRef = useRef<HTMLDivElement>(null);

  // Email action handlers
  const handleSendEmail = async (emailData: any) => {
    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = replyTo ? '/api/mail/reply' : '/api/mail/send';
      const body = replyTo
        ? { ...emailData, messageId: replyTo.messageId, threadId: replyTo.threadId }
        : emailData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Email sent successfully!');
        setReplyTo(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast.error('Failed to send email');
      throw error;
    }
  };

  const handleStarEmail = async (emailId: string, starred: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/mail/star', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId: emailId, starred })
      });

      setEmails(emails.map(e => e.id === emailId ? { ...e, isStarred: starred } : e));
    } catch (error) {
      console.error('Star email error:', error);
      toast.error('Failed to star email');
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (!confirm('Move this email to trash?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/mail/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId: emailId })
      });

      setEmails(emails.filter(e => e.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
      toast.success('Email moved to trash');
    } catch (error) {
      console.error('Delete email error:', error);
      toast.error('Failed to delete email');
    }
  };

  const handleReply = (email: Email) => {
    setReplyTo({
      messageId: email.id,
      threadId: email.threadId,
      to: email.from,
      subject: email.subject
    });
    setIsComposeOpen(true);
  };

  // Categorize email based on Gmail's logic
  const categorizeEmail = (email: any): Email['category'] => {
    const from = email.from.toLowerCase();
    const subject = email.subject.toLowerCase();
    const labels = email.labels || [];
    
    // Check Gmail labels first
    if (labels.includes('CATEGORY_SOCIAL')) return 'social';
    if (labels.includes('CATEGORY_PROMOTIONS')) return 'promotions';
    if (labels.includes('CATEGORY_UPDATES')) return 'updates';
    if (labels.includes('CATEGORY_FORUMS')) return 'forums';
    
    // Fallback to content-based categorization
    if (from.includes('linkedin') || from.includes('facebook') || from.includes('twitter') || 
        from.includes('instagram') || from.includes('reddit') || subject.includes('connection request') ||
        subject.includes('friend request') || subject.includes('follow')) {
      return 'social';
    }
    
    if (subject.includes('sale') || subject.includes('discount') || subject.includes('offer') ||
        subject.includes('deal') || subject.includes('promo') || subject.includes('% off') ||
        subject.includes('limited time') || from.includes('marketing') || from.includes('newsletter') ||
        from.includes('promo') || subject.includes('shop now')) {
      return 'promotions';
    }
    
    if (subject.includes('notification') || subject.includes('alert') || subject.includes('update') ||
        subject.includes('reminder') || from.includes('noreply') || from.includes('no-reply') ||
        subject.includes('confirm') || subject.includes('verify') || subject.includes('receipt')) {
      return 'updates';
    }
    
    if (from.includes('forum') || from.includes('community') || from.includes('discussion') ||
        subject.includes('[forum]') || subject.includes('thread') || subject.includes('digest')) {
      return 'forums';
    }
    
    return 'primary';
  };

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/mail/messages', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          const realEmails = data.data.map((msg: any) => ({
            id: msg.id,
            from: msg.from.replace(/<.*>/, '').trim(),
            subject: msg.subject,
            preview: msg.snippet,
            date: msg.date,
            time: new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: msg.isRead,
            isStarred: msg.labels?.includes('STARRED') || false,
            hasAttachment: msg.hasAttachment || false,
            labels: msg.labels || [],
            category: categorizeEmail(msg),
            threadId: msg.threadId
          }));
          setEmails(realEmails);
        }
      } catch (error) {
        console.error('Failed to fetch emails', error);
        toast.error('Failed to fetch emails');
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  // Filter emails based on active view (Gmail-like)
  const getFilteredEmails = () => {
    let filtered = emails;

    switch (activeView) {
      case 'inbox':
        // Inbox shows Primary category emails that are not in Trash or Spam
        filtered = filtered.filter(e => 
          e.category === 'primary' && 
          !e.labels.includes('TRASH') && 
          !e.labels.includes('SPAM')
        );
        break;
      case 'starred':
        filtered = filtered.filter(e => e.isStarred && !e.labels.includes('TRASH'));
        break;
      case 'snoozed':
        filtered = filtered.filter(e => e.labels.includes('SNOOZED'));
        break;
      case 'sent':
        filtered = filtered.filter(e => e.labels.includes('SENT'));
        break;
      case 'drafts':
        filtered = filtered.filter(e => e.labels.includes('DRAFT'));
        break;
      case 'spam':
        filtered = filtered.filter(e => e.labels.includes('SPAM'));
        break;
      case 'trash':
        filtered = filtered.filter(e => e.labels.includes('TRASH'));
        break;
      case 'all':
        filtered = filtered.filter(e => !e.labels.includes('TRASH') && !e.labels.includes('SPAM'));
        break;
      default:
        filtered = filtered.filter(e => e.category === 'primary');
    }

    if (filterBy === 'unread') {
      filtered = filtered.filter(e => !e.isRead);
    } else if (filterBy === 'starred') {
      filtered = filtered.filter(e => e.isStarred);
    }

    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  };

  const filteredEmails = getFilteredEmails();

  // Get category counts for tabs
  const getCategoryCount = (category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums') => {
    return emails.filter(e => 
      e.category === category && 
      !e.isRead && 
      !e.labels.includes('TRASH') && 
      !e.labels.includes('SPAM')
    ).length;
  };

  const folders = [
    { id: 'inbox' as ViewType, label: 'Inbox', icon: Inbox, count: emails.filter(e => e.category === 'primary' && !e.isRead && !e.labels.includes('TRASH') && !e.labels.includes('SPAM')).length },
    { id: 'starred' as ViewType, label: 'Starred', icon: Star, count: emails.filter(e => e.isStarred && !e.labels.includes('TRASH')).length },
    { id: 'snoozed' as ViewType, label: 'Snoozed', icon: Clock, count: emails.filter(e => e.labels.includes('SNOOZED')).length },
    { id: 'sent' as ViewType, label: 'Sent', icon: Send, count: emails.filter(e => e.labels.includes('SENT')).length },
    { id: 'drafts' as ViewType, label: 'Drafts', icon: FileText, count: emails.filter(e => e.labels.includes('DRAFT')).length },
    { id: 'spam' as ViewType, label: 'Spam', icon: AlertCircle, count: emails.filter(e => e.labels.includes('SPAM')).length },
    { id: 'trash' as ViewType, label: 'Trash', icon: Trash2, count: emails.filter(e => e.labels.includes('TRASH')).length },
    { id: 'all' as ViewType, label: 'All Mail', icon: Mail, count: emails.filter(e => !e.labels.includes('TRASH') && !e.labels.includes('SPAM')).length },
  ];

  const filters = [
    { id: 'all' as FilterBy, label: 'All' },
    { id: 'unread' as FilterBy, label: 'Unread' },
    { id: 'starred' as FilterBy, label: 'Starred' },
    { id: 'important' as FilterBy, label: 'Important' },
  ];

  const categoryTabs = [
    { id: 'primary', label: 'Primary', icon: Inbox, count: getCategoryCount('primary') },
    { id: 'social', label: 'Social', icon: Users, count: getCategoryCount('social') },
    { id: 'promotions', label: 'Promotions', icon: Megaphone, count: getCategoryCount('promotions') },
    { id: 'updates', label: 'Updates', icon: AlertCircle, count: getCategoryCount('updates') },
    { id: 'forums', label: 'Forums', icon: MessageSquare, count: getCategoryCount('forums') },
  ];

  // Resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX - (isSidebarCollapsed ? 64 : 256);
      if (newWidth >= 300 && newWidth <= 600) {
        setListWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isSidebarCollapsed]);

  return (
    <div className="flex h-screen bg-app-bg text-text-primary">
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => { setIsComposeOpen(false); setReplyTo(null); }}
        onSend={handleSendEmail}
        replyTo={replyTo}
      />

      {/* Sidebar */}
      <div 
        className={`bg-sidebar-bg border-r border-border-subtle h-full flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo & Compose */}
        <div className="p-4">
          {!isSidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Mail size={24} className="text-accent-blue" />
                <h1 className="text-lg font-bold">Sartthi Mail</h1>
              </div>
              <button 
                onClick={() => { setReplyTo(null); setIsComposeOpen(true); }}
                className="w-full bg-accent-blue hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <span>✏️</span>
                Compose
              </button>
            </>
          ) : (
            <button 
              onClick={() => { setReplyTo(null); setIsComposeOpen(true); }}
              className="w-full bg-accent-blue hover:bg-blue-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
              title="Compose"
            >
              <span className="text-xl">✏️</span>
            </button>
          )}
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto px-2">
          <nav className="space-y-0.5">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <div key={folder.id} className="relative group">
                  <button
                    onClick={() => setActiveView(folder.id)}
                    className={`
                      w-full flex items-center gap-3 py-2 px-2 rounded-md text-13 transition-colors
                      ${
                        activeView === folder.id
                          ? 'bg-border-subtle text-white font-medium'
                          : 'text-text-muted hover:bg-hover-bg hover:text-text-light'
                      }
                      ${isSidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!isSidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{folder.label}</span>
                        {folder.count > 0 && (
                          <span className="text-xs text-text-lighter bg-hover-bg px-2 py-0.5 rounded-full">
                            {folder.count}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {folder.label}
                      {folder.count > 0 && ` (${folder.count})`}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Collapse Toggle & Settings */}
        <div className="p-2 border-t border-border-subtle space-y-1">
          {!isSidebarCollapsed && (
            <button className="w-full flex items-center gap-3 py-1.5 px-2 rounded-md text-13 text-text-muted hover:bg-hover-bg hover:text-text-light transition-colors">
              <Settings size={16} />
              <span>Settings</span>
            </button>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center gap-3 py-1.5 px-2 rounded-md text-13 text-text-muted hover:bg-hover-bg hover:text-text-light transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!isSidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>

      {/* Email List */}
      <div 
        className="flex flex-col border-r border-border-subtle bg-app-bg relative"
        style={{ width: `${listWidth}px` }}
      >
        {/* Header */}
        <div className="border-b border-border-subtle bg-app-bg">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-lg font-semibold text-text-primary">
              {folders.find(f => f.id === activeView)?.label || 'Inbox'}
            </h2>
            <button 
              onClick={() => window.location.reload()}
              className="p-2 rounded-lg hover:bg-sidebar-bg text-text-muted hover:text-text-light transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter"
                size={16}
              />
              <input
                type="text"
                placeholder="Search mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-sidebar-bg border border-border-subtle rounded-lg pl-9 pr-4 py-1.5 text-sm text-text-light placeholder-text-lighter focus:outline-none focus:border-border-light transition-colors"
              />
            </div>
          </div>

          {/* Category Tabs (Gmail-style) */}
          {activeView === 'inbox' && (
            <div className="px-4 pb-2 flex gap-1 overflow-x-auto">
              {categoryTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border border-border-subtle text-text-muted hover:bg-hover-bg hover:text-text-light transition-colors whitespace-nowrap"
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="bg-accent-blue text-white px-1.5 py-0.5 rounded-full text-2xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Filter Pills */}
          <div className="px-4 pb-3 flex items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterBy(filter.id)}
                className={`
                  text-xs border rounded-full px-3 py-1 transition-colors
                  ${
                    filterBy === filter.id
                      ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
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
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
                <p className="text-text-muted text-sm">Loading emails...</p>
              </div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Mail size={48} className="mx-auto mb-4 text-text-lighter opacity-50" />
                <p className="text-text-muted">No emails in this view</p>
              </div>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`
                  group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b border-border-subtle/50
                  ${selectedEmail?.id === email.id ? 'bg-hover-bg border-l-2 border-l-accent-blue' : 'bg-app-bg hover:bg-sidebar-bg/50'}
                `}
              >
                {/* Left Section: Checkbox + Star */}
                <div className="flex flex-col items-center gap-2 pt-1">
                  {/* Unread Indicator */}
                  {!email.isRead && (
                    <div className="w-2 h-2 rounded-full bg-accent-blue flex-shrink-0" />
                  )}
                  {email.isRead && <div className="w-2 h-2" />}

                  {/* Star */}
                  <button
                    className="flex-shrink-0 text-text-lighter hover:text-yellow-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStarEmail(email.id, !email.isStarred);
                    }}
                  >
                    <Star
                      size={16}
                      className={email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}
                    />
                  </button>
                </div>

                {/* Mail Content */}
                <div className="flex-1 min-w-0">
                  {/* Sender */}
                  <div className="flex items-center justify-between mb-1">
                    <p
                      className={`text-sm truncate ${
                        !email.isRead ? 'font-semibold text-text-primary' : 'font-normal text-text-light'
                      }`}
                    >
                      {email.from}
                    </p>
                    <span className="text-2xs text-text-lighter ml-2 flex-shrink-0">{email.time}</span>
                  </div>

                  {/* Subject */}
                  <p className={`text-sm mb-1 truncate ${!email.isRead ? 'font-medium text-text-light' : 'text-text-muted'}`}>
                    {email.subject}
                  </p>

                  {/* Preview */}
                  <p className="text-xs text-text-lighter truncate">
                    {email.preview}
                  </p>

                  {/* Attachment indicator */}
                  {email.hasAttachment && (
                    <div className="mt-1">
                      <span className="text-2xs text-text-lighter">📎 Attachment</span>
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1.5 rounded hover:bg-hover-bg text-text-lighter hover:text-text-light transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle archive
                    }}
                    title="Archive"
                  >
                    <Archive size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-hover-bg text-text-lighter hover:text-text-light transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEmail(email.id);
                    }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-hover-bg text-text-lighter hover:text-text-light transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle snooze
                    }}
                    title="Snooze"
                  >
                    <Clock size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent-blue/50 transition-colors group"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="absolute inset-y-0 -right-1 w-3" />
        </div>
      </div>

      {/* Email Detail Panel */}
      <div className="flex-1 bg-app-bg overflow-y-auto">
        {selectedEmail ? (
          <div className="p-6">
            {/* Email Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary mb-4">{selectedEmail.subject}</h1>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center text-white font-semibold">
                    {selectedEmail.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{selectedEmail.from}</p>
                    <p className="text-sm text-text-muted">to me</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-lighter">{selectedEmail.time}</span>
                  <button
                    onClick={() => handleStarEmail(selectedEmail.id, !selectedEmail.isStarred)}
                    className="p-2 rounded hover:bg-sidebar-bg transition-colors"
                  >
                    <Star size={18} className={selectedEmail.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-text-lighter'} />
                  </button>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="prose prose-invert max-w-none">
              <p className="text-text-light leading-relaxed whitespace-pre-wrap">{selectedEmail.preview}</p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleReply(selectedEmail)}
                className="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Reply
              </button>
              <button
                onClick={() => handleDeleteEmail(selectedEmail.id)}
                className="px-4 py-2 bg-sidebar-bg hover:bg-hover-bg text-text-light rounded-lg transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail size={64} className="mx-auto mb-4 text-text-lighter opacity-30" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">Select an email to read</h3>
              <p className="text-text-muted">Choose an email from the list to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InboxPage;
