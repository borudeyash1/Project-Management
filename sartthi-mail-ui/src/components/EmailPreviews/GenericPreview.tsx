import React from 'react';
import { getSourceInfo } from '../../services/emailDetector';
import './GenericPreview.css';

interface GenericPreviewProps {
  emailContent: {
    subject: string;
    from: string;
    to: string;
    date: string;
    body: {
      html: string;
      text: string;
    };
    attachments?: Array<{
      filename: string;
      mimeType: string;
      size: number;
    }>;
  };
  source?: string;
}

const GenericPreview: React.FC<GenericPreviewProps> = ({ emailContent, source = 'generic' }) => {
  const sourceInfo = getSourceInfo(source as any);

  const sanitizeHTML = (html: string) => {
    // Basic sanitization - remove scripts and dangerous tags
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleAttachmentClick = (attachment: any) => {
    // In a real implementation, this would download the attachment
    console.log('Download attachment:', attachment.filename);
  };

  return (
    <div className="generic-preview">
      {/* Header with source branding */}
      <div 
        className="generic-header" 
        style={{ background: sourceInfo.bgGradient }}
      >
        <div className="source-icon">{sourceInfo.icon}</div>
        <div className="source-info">
          <span className="source-name">{sourceInfo.name}</span>
          <span className="email-date">
            {new Date(emailContent.date).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Email metadata */}
      <div className="email-metadata">
        <div className="metadata-row">
          <span className="metadata-label">From:</span>
          <span className="metadata-value">{emailContent.from}</span>
        </div>
        <div className="metadata-row">
          <span className="metadata-label">To:</span>
          <span className="metadata-value">{emailContent.to}</span>
        </div>
        <div className="metadata-row">
          <span className="metadata-label">Subject:</span>
          <span className="metadata-value subject">{emailContent.subject}</span>
        </div>
      </div>

      {/* Email body */}
      <div className="email-body">
        {emailContent.body.html ? (
          <div 
            className="html-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(emailContent.body.html) }}
          />
        ) : (
          <div className="text-content">
            <pre>{emailContent.body.text}</pre>
          </div>
        )}
      </div>

      {/* Attachments */}
      {emailContent.attachments && emailContent.attachments.length > 0 && (
        <div className="attachments-section">
          <div className="attachments-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
            <span>{emailContent.attachments.length} Attachment{emailContent.attachments.length > 1 ? 's' : ''}</span>
          </div>
          <div className="attachments-list">
            {emailContent.attachments.map((attachment, idx) => (
              <div 
                key={idx} 
                className="attachment-item"
                onClick={() => handleAttachmentClick(attachment)}
              >
                <div className="attachment-icon">
                  {attachment.mimeType.startsWith('image/') ? '🖼️' :
                   attachment.mimeType.includes('pdf') ? '📄' :
                   attachment.mimeType.includes('zip') ? '📦' :
                   attachment.mimeType.includes('video') ? '🎥' :
                   '📎'}
                </div>
                <div className="attachment-info">
                  <span className="attachment-name">{attachment.filename}</span>
                  <span className="attachment-size">{formatFileSize(attachment.size)}</span>
                </div>
                <button className="btn-download">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="generic-footer">
        <p className="footer-text">
          This email was received on {new Date(emailContent.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default GenericPreview;
