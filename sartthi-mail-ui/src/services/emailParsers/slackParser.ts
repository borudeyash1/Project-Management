export interface SlackEmailData {
    type: 'message' | 'mention' | 'channel_invite' | 'thread_reply' | 'notification' | 'generic';
    senderName?: string;
    senderAvatar?: string;
    channelName?: string;
    workspaceName?: string;
    message?: string;
    messagePreview?: string;
    timestamp?: string;
    url?: string;
    threadCount?: number;
}

export const parseSlackEmail = (htmlBody: string, textBody: string, subject: string): SlackEmailData => {
    const html = htmlBody || textBody;
    const subjectLower = subject.toLowerCase();

    // Detect email type
    let type: SlackEmailData['type'] = 'generic';

    if (subjectLower.includes('mentioned you') || subjectLower.includes('@')) {
        type = 'mention';
    } else if (subjectLower.includes('message') || subjectLower.includes('sent you')) {
        type = 'message';
    } else if (subjectLower.includes('invited you') || subjectLower.includes('channel')) {
        type = 'channel_invite';
    } else if (subjectLower.includes('thread') || subjectLower.includes('replied')) {
        type = 'thread_reply';
    } else {
        type = 'notification';
    }

    // Extract sender name
    const senderMatch = subject.match(/^([^:]+):/) || html.match(/from\s+([^<\n]+)/i);
    const senderName = senderMatch ? senderMatch[1].trim() : undefined;

    // Extract channel name
    const channelMatch = subject.match(/#([a-zA-Z0-9_-]+)/) || html.match(/#([a-zA-Z0-9_-]+)/);
    const channelName = channelMatch ? `#${channelMatch[1]}` : undefined;

    // Extract workspace name
    const workspaceMatch = html.match(/(?:in|workspace)\s+([A-Z][a-zA-Z0-9\s]+)/);
    const workspaceName = workspaceMatch ? workspaceMatch[1].trim() : undefined;

    // Extract message content
    const messageMatch = html.match(/<p[^>]*>(.*?)<\/p>/s) || textBody.match(/Message:\s*(.+)/s);
    const message = messageMatch ? messageMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const messagePreview = message.substring(0, 150) + (message.length > 150 ? '...' : '');

    // Extract URL
    const urlMatch = html.match(/https:\/\/[a-zA-Z0-9-]+\.slack\.com\/[^\s"<]+/);
    const url = urlMatch ? urlMatch[0] : undefined;

    // Extract thread count
    const threadMatch = html.match(/(\d+)\s+(?:replies|messages)/i);
    const threadCount = threadMatch ? parseInt(threadMatch[1]) : undefined;

    return {
        type,
        senderName,
        channelName,
        workspaceName,
        message,
        messagePreview,
        url,
        threadCount
    };
};
