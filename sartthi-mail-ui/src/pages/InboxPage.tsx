import { useState, useEffect, useRef } from 'react';
import './InboxPage.css';
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

type ViewType = 'primary' | 'updates' | 'social' | 'promotions' | 'forums' | 'starred' | 'sent' | 'drafts' | 'snoozed' | 'spam' | 'trash' | 'all';
type SortBy = 'date' | 'sender' | 'subject';
type FilterBy = 'all' | 'unread' | 'read' | 'attachments';

function InboxPage({ user }: InboxPageProps) {
  const { toast } = useToast();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('primary');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);

  // UI State for enhancements
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [listWidth, setListWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Email action handlers
  const handleSendEmail = async (emailData: any) => {
    try {
      const endpoint = replyTo ? '/api/mail/reply' : '/api/mail/send';
      const body = replyTo
        ? { ...emailData, messageId: replyTo.messageId, threadId: replyTo.threadId }
        : emailData;

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
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
      await fetch('/api/mail/star', {
        method: 'POST',
        credentials: 'include',
        headers: {
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
      await fetch('/api/mail/delete', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
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

  // Categorize email based on content
  const categorizeEmail = (email: any): Email['category'] => {
    const from = email.from.toLowerCase();
    const subject = email.subject.toLowerCase();
    
    if (from.includes('linkedin') || from.includes('facebook') || from.includes('twitter') || 
        from.includes('instagram') || from.includes('reddit') || subject.includes('connection request')) {
      return 'social';
    }
    
    if (subject.includes('sale') || subject.includes('discount') || subject.includes('offer') ||
        subject.includes('deal') || subject.includes('promo') || subject.includes('% off') ||
        from.includes('marketing') || from.includes('newsletter')) {
      return 'promotions';
    }
    
    if (subject.includes('notification') || subject.includes('alert') || subject.includes('update') ||
        subject.includes('reminder') || from.includes('noreply') || from.includes('no-reply')) {
      return 'updates';
    }
    
    if (from.includes('forum') || from.includes('community') || from.includes('discussion') ||
        subject.includes('[forum]') || subject.includes('thread')) {
      return 'forums';
    }
    
    return 'primary';
  };

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('/api/mail/messages', {
          credentials: 'include'
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
            hasAttachment: false,
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

  // Resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // Calculate new width: mouse X position minus sidebar width
      const sidebarWidth = isSidebarCollapsed ? 80 : 280;
      const newWidth = e.clientX - sidebarWidth;
      
      // Min width 300px, Max width 800px
      if (newWidth >= 300 && newWidth <= 800) {
        setListWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing, isSidebarCollapsed]);

  // Filter emails based on active view
  const getFilteredEmails = () => {
    let filtered = emails;

    switch (activeView) {
      case 'primary':
      case 'social':
      case 'promotions':
      case 'updates':
      case 'forums':
        filtered = filtered.filter(e => e.category === activeView);
        break;
      case 'starred':
        filtered = filtered.filter(e => e.isStarred);
        break;
      case 'spam':
        filtered = filtered.filter(e => e.labels.includes('SPAM'));
        break;
      case 'trash':
        filtered = filtered.filter(e => e.labels.includes('TRASH'));
        break;
      case 'all':
        break;
      default:
        filtered = filtered.filter(e => e.category === 'primary');
    }

    if (filterBy === 'unread') {
      filtered = filtered.filter(e => !e.isRead);
    } else if (filterBy === 'read') {
      filtered = filtered.filter(e => e.isRead);
    } else if (filterBy === 'attachments') {
      filtered = filtered.filter(e => e.hasAttachment);
    }

    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'sender':
          return a.from.localeCompare(b.from);
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredEmails = getFilteredEmails();

  const views = [
    { id: 'primary' as ViewType, name: 'Primary', icon: '📨', count: emails.filter(e => e.category === 'primary' && !e.isRead).length },
    { id: 'updates' as ViewType, name: 'Updates', icon: '🔔', count: emails.filter(e => e.category === 'updates' && !e.isRead).length },
    { id: 'social' as ViewType, name: 'Social', icon: '👥', count: emails.filter(e => e.category === 'social' && !e.isRead).length },
    { id: 'promotions' as ViewType, name: 'Promotions', icon: '🏷️', count: emails.filter(e => e.category === 'promotions' && !e.isRead).length },
    { id: 'forums' as ViewType, name: 'Forums', icon: '💬', count: emails.filter(e => e.category === 'forums' && !e.isRead).length },
    { id: 'starred' as ViewType, name: 'Starred', icon: '⭐', count: emails.filter(e => e.isStarred).length },
    { id: 'snoozed' as ViewType, name: 'Snoozed', icon: '⏰', count: 0 },
    { id: 'sent' as ViewType, name: 'Sent', icon: '📤', count: 0 },
    { id: 'drafts' as ViewType, name: 'Drafts', icon: '📝', count: 0 },
    { id: 'spam' as ViewType, name: 'Spam', icon: '🚫', count: emails.filter(e => e.labels.includes('SPAM')).length },
    { id: 'trash' as ViewType, name: 'Trash', icon: '🗑️', count: emails.filter(e => e.labels.includes('TRASH')).length },
    { id: 'all' as ViewType, name: 'All Mail', icon: '📬', count: emails.length }
  ];

  return (
    <div className="inbox-page" style={{ display: 'flex', gridTemplateColumns: 'none' }}>
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => { setIsComposeOpen(false); setReplyTo(null); }}
        onSend={handleSendEmail}
        replyTo={replyTo}
      />

      {/* Sidebar */}
      <div 
        className="inbox-sidebar" 
        style={{ 
          width: isSidebarCollapsed ? '80px' : '280px', 
          transition: 'width 0.3s ease',
          padding: isSidebarCollapsed ? '1rem 0.5rem' : '1.5rem',
          flexShrink: 0
        }}
      >
        <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: isSidebarCollapsed ? 'center' : 'stretch' }}>
          <div className="logo" style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}>
            <div className="logo-icon">📧</div>
            {!isSidebarCollapsed && <h1>Sartthi Mail</h1>}
          </div>
          
          <button 
            className="btn-compose" 
            onClick={() => { setReplyTo(null); setIsComposeOpen(true); }}
            title={isSidebarCollapsed ? "Compose" : ""}
            style={{ padding: isSidebarCollapsed ? '0.875rem' : '0.875rem' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {!isSidebarCollapsed && "Compose"}
          </button>
        </div>

        <div className="views-section">
          {!isSidebarCollapsed && <div className="section-label">Views</div>}
          {views.slice(0, 5).map((view) => (
            <button
              key={view.id}
              className={`folder-item ${activeView === view.id ? 'active' : ''}`}
              onClick={() => setActiveView(view.id)}
              style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '0.75rem' : '0.75rem 1rem' }}
              title={isSidebarCollapsed ? view.name : ""}
            >
              <span className="folder-icon">{view.icon}</span>
              {!isSidebarCollapsed && <span className="folder-name">{view.name}</span>}
              {!isSidebarCollapsed && view.count > 0 && (
                <span className="folder-count">{view.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="folders">
          {!isSidebarCollapsed && <div className="section-label">Mail</div>}
          {views.slice(5).map((view) => (
            <button
              key={view.id}
              className={`folder-item ${activeView === view.id ? 'active' : ''}`}
              onClick={() => setActiveView(view.id)}
              style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '0.75rem' : '0.75rem 1rem' }}
              title={isSidebarCollapsed ? view.name : ""}
            >
              <span className="folder-icon">{view.icon}</span>
              {!isSidebarCollapsed && <span className="folder-name">{view.name}</span>}
              {!isSidebarCollapsed && view.count > 0 && (
                <span className="folder-count">{view.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: '#a0a0a0', 
              cursor: 'pointer', 
              padding: '0.5rem',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
              </svg>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                </svg>
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>

          <div className="user-profile" style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}>
            <div className="user-avatar">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            {!isSidebarCollapsed && (
              <div className="user-info">
                <div className="user-name">{user.fullName}</div>
                <div className="user-email">{user.email}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email List */}
      <div 
        className="email-list" 
        style={{ 
          width: `${listWidth}px`, 
          flexShrink: 0,
          position: 'relative'
        }}
      >
        <div className="list-header">
          <h2>{views.find(v => v.id === activeView)?.name || 'Inbox'}</h2>
          <div className="list-actions">
            <button className="icon-btn" title="Refresh" onClick={() => window.location.reload()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-group" style={{ flex: 1 }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', minWidth: '0' }}
            />
          </div>
          
          <div className="filter-group">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="filter-select">
              <option value="date">Date</option>
              <option value="sender">Sender</option>
              <option value="subject">Subject</option>
            </select>
          </div>

          <div className="filter-group">
            <select value={filterBy} onChange={(e) => setFilterBy(e.target.value as FilterBy)} className="filter-select">
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="attachments">Attachments</option>
            </select>
          </div>
        </div>

        <div className="emails-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading emails...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="empty-container">
              <p>No emails in this view</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
            <div
              key={email.id}
              className={`email-item ${!email.isRead ? 'unread' : ''} ${selectedEmail?.id === email.id ? 'selected' : ''}`}
              onClick={() => setSelectedEmail(email)}
            >
              <div className="email-checkbox">
                <input type="checkbox" onClick={(e) => e.stopPropagation()} />
              </div>
              <button 
                className={`email-star ${email.isStarred ? 'starred' : ''}`} 
                onClick={(e) => { e.stopPropagation(); handleStarEmail(email.id, !email.isStarred); }}
              >
                ⭐
              </button>
              <div className="email-content">
                <div className="email-header">
                  <span className="email-from">{email.from}</span>
                  <span className="email-time">{email.time}</span>
                </div>
                <div className="email-subject">{email.subject}</div>
                <div className="email-preview">{email.preview}</div>
              </div>
              {email.hasAttachment && (
                <div className="email-attachment">📎</div>
              )}
            </div>
          )))}</div>

          {/* Resize Handle */}
          <div
            ref={resizeRef}
            onMouseDown={() => setIsResizing(true)}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '4px',
              height: '100%',
              cursor: 'col-resize',
              zIndex: 10,
              background: isResizing ? '#6366f1' : 'transparent',
              transition: 'background 0.2s'
            }}
            className="resize-handle hover:bg-indigo-500/50"
          />
      </div>

      {/* Email Detail */}
      <div className="email-detail" style={{ flex: 1, minWidth: 0 }}>
        {selectedEmail ? (
          <>
            <div className="detail-header">
              <h3>{selectedEmail.subject}</h3>
              <div className="detail-actions">
                <button className="icon-btn" title="Reply" onClick={() => handleReply(selectedEmail)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5l-5 5v-5z" />
                  </svg>
                </button>
                <button className="icon-btn" title="Delete" onClick={() => handleDeleteEmail(selectedEmail.id)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="detail-from">
              <div className="from-avatar">
                {selectedEmail.from.charAt(0).toUpperCase()}
              </div>
              <div className="from-info">
                <div className="from-name">{selectedEmail.from}</div>
                <div className="from-email">to me</div>
              </div>
              <div className="from-time">{selectedEmail.time}</div>
            </div>

            <div className="detail-body">
              <p>{selectedEmail.preview}</p>
            </div>
          </>
        ) : (
          <div className="detail-empty">
            <div className="empty-icon">📧</div>
            <h3>Select an email to read</h3>
            <p>Choose an email from the list to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InboxPage;
