export interface LinkedInEmailData {
    type: 'connection_request' | 'message' | 'job_alert' | 'invitation' | 'notification' | 'generic';
    senderName?: string;
    senderTitle?: string;
    senderPhoto?: string;
    companyName?: string;
    message?: string;
    actionUrl?: string;
    actionText?: string;
    jobTitle?: string;
    jobCompany?: string;
    jobLocation?: string;
}

export const parseLinkedInEmail = (htmlBody: string, textBody: string, subject: string): LinkedInEmailData => {
    const html = htmlBody || textBody;
    const subjectLower = subject.toLowerCase();

    // Detect email type
    let type: LinkedInEmailData['type'] = 'generic';

    if (subjectLower.includes('invitation to connect') || subjectLower.includes('wants to connect')) {
        type = 'connection_request';
    } else if (subjectLower.includes('message') || subjectLower.includes('sent you a message')) {
        type = 'message';
    } else if (subjectLower.includes('job') || subjectLower.includes('recommended for you')) {
        type = 'job_alert';
    } else if (subjectLower.includes('invitation') || subjectLower.includes('invite')) {
        type = 'invitation';
    } else {
        type = 'notification';
    }

    // Extract sender name (usually in subject or first line)
    const senderNameMatch = subject.match(/^([^,]+),/) || subject.match(/^([\w\s]+)\s+(?:wants to connect|sent you|invited you)/);
    const senderName = senderNameMatch ? senderNameMatch[1].trim() : undefined;

    // Extract sender title (look for common patterns)
    const titleMatch = html.match(/(?:at|@)\s+([^<\n]+?)(?:<|$)/i);
    const senderTitle = titleMatch ? titleMatch[1].trim() : undefined;

    // Extract company name
    const companyMatch = html.match(/(?:at|@)\s+([^<\n]+?)(?:<|$)/i) || html.match(/(?:Company|Employer):\s*([^<\n]+)/i);
    const companyName = companyMatch ? companyMatch[1].trim() : undefined;

    // Extract action URL (LinkedIn links)
    const actionUrlMatch = html.match(/https:\/\/(?:www\.)?linkedin\.com\/[^\s"<]+/);
    const actionUrl = actionUrlMatch ? actionUrlMatch[0] : undefined;

    // Extract message content
    let message = '';
    if (type === 'message') {
        const messageMatch = html.match(/<p[^>]*>(.*?)<\/p>/s) || textBody.match(/Message:\s*(.+)/s);
        message = messageMatch ? messageMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    } else if (type === 'connection_request') {
        message = `${senderName || 'Someone'} wants to connect with you on LinkedIn`;
    }

    // Extract job details if job alert
    let jobTitle, jobCompany, jobLocation;
    if (type === 'job_alert') {
        const jobTitleMatch = html.match(/(?:Job Title|Position):\s*([^<\n]+)/i) || subject.match(/:\s*(.+?)(?:\s+at\s+|\s+-\s+|$)/);
        jobTitle = jobTitleMatch ? jobTitleMatch[1].trim() : undefined;

        const jobCompanyMatch = html.match(/(?:Company|Employer):\s*([^<\n]+)/i);
        jobCompany = jobCompanyMatch ? jobCompanyMatch[1].trim() : undefined;

        const jobLocationMatch = html.match(/(?:Location):\s*([^<\n]+)/i);
        jobLocation = jobLocationMatch ? jobLocationMatch[1].trim() : undefined;
    }

    // Determine action text
    let actionText = 'View on LinkedIn';
    if (type === 'connection_request') {
        actionText = 'Accept Connection';
    } else if (type === 'message') {
        actionText = 'Reply on LinkedIn';
    } else if (type === 'job_alert') {
        actionText = 'View Job';
    }

    return {
        type,
        senderName,
        senderTitle,
        companyName,
        message,
        actionUrl,
        actionText,
        jobTitle,
        jobCompany,
        jobLocation
    };
};
