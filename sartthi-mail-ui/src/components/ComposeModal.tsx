import { useState } from 'react';
import './ComposeModal.css';
import { useToast } from '../context/ToastContext';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: EmailData) => Promise<void>;
  replyTo?: {
    messageId: string;
    threadId: string;
    to: string;
    subject: string;
  };
}

interface EmailData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}

function ComposeModal({ isOpen, onClose, onSend, replyTo }: ComposeModalProps) {
  const { toast } = useToast();
  const [to, setTo] = useState(replyTo?.to || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!to || !subject) {
      toast.error('Please fill in recipient and subject');
      return;
    }

    setSending(true);
    try {
      await onSend({ to, cc, bcc, subject, body });
      // Reset form
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setBody('');
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="compose-modal-overlay" onClick={onClose}>
      <div className="compose-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compose-header">
          <h3>{replyTo ? 'Reply' : 'New Message'}</h3>
          <div className="compose-actions">
            <button className="icon-btn-small" onClick={onClose} title="Minimize">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
              </svg>
            </button>
            <button className="icon-btn-small" onClick={onClose} title="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="compose-body">
          <div className="compose-field">
            <label>To</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipients"
              disabled={!!replyTo}
            />
            <div className="cc-bcc-toggle">
              {!showCc && <button onClick={() => setShowCc(true)}>Cc</button>}
              {!showBcc && <button onClick={() => setShowBcc(true)}>Bcc</button>}
            </div>
          </div>

          {showCc && (
            <div className="compose-field">
              <label>Cc</label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="Carbon copy"
              />
            </div>
          )}

          {showBcc && (
            <div className="compose-field">
              <label>Bcc</label>
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="Blind carbon copy"
              />
            </div>
          )}

          <div className="compose-field">
            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
            />
          </div>

          <div className="compose-editor">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Compose your message..."
            />
          </div>
        </div>

        <div className="compose-footer">
          <button
            className="btn-send"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m22 2-7 20-4-9-9-4Z" />
            </svg>
          </button>
          <div className="compose-tools">
            <button className="icon-btn-small" title="Attach file">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button className="icon-btn-small" title="Insert emoji">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
              </svg>
            </button>
            <button className="icon-btn-small" onClick={onClose} title="Delete draft">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComposeModal;
