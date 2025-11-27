export interface GitHubEmailData {
    type: 'pull_request' | 'issue' | 'release' | 'mention' | 'review' | 'commit' | 'generic';
    repoName?: string;
    repoOwner?: string;
    prNumber?: string;
    issueNumber?: string;
    title?: string;
    author?: string;
    authorAvatar?: string;
    description?: string;
    url?: string;
    status?: 'open' | 'closed' | 'merged';
    labels?: string[];
    assignees?: string[];
    reviewers?: string[];
    branch?: string;
    commitHash?: string;
}

export const parseGitHubEmail = (htmlBody: string, textBody: string, subject: string): GitHubEmailData => {
    const html = htmlBody || textBody;
    const subjectLower = subject.toLowerCase();

    // Detect email type
    let type: GitHubEmailData['type'] = 'generic';

    if (subjectLower.includes('pull request') || subjectLower.includes('[pr]')) {
        type = 'pull_request';
    } else if (subjectLower.includes('issue') || subjectLower.includes('[issue]')) {
        type = 'issue';
    } else if (subjectLower.includes('release') || subjectLower.includes('published')) {
        type = 'release';
    } else if (subjectLower.includes('mentioned you') || subjectLower.includes('@')) {
        type = 'mention';
    } else if (subjectLower.includes('review') || subjectLower.includes('requested your review')) {
        type = 'review';
    } else if (subjectLower.includes('commit') || subjectLower.includes('pushed')) {
        type = 'commit';
    }

    // Extract repo name (format: owner/repo)
    const repoMatch = subject.match(/\[([^\]]+\/[^\]]+)\]/) || html.match(/github\.com\/([^\/\s]+\/[^\/\s]+)/);
    const repoFullName = repoMatch ? repoMatch[1] : undefined;
    const [repoOwner, repoName] = repoFullName ? repoFullName.split('/') : [undefined, undefined];

    // Extract PR/Issue number
    const numberMatch = subject.match(/#(\d+)/) || html.match(/#(\d+)/);
    const number = numberMatch ? numberMatch[1] : undefined;

    const prNumber = type === 'pull_request' ? number : undefined;
    const issueNumber = type === 'issue' ? number : undefined;

    // Extract title (usually after the number)
    const titleMatch = subject.match(/#\d+\s+(.+?)(?:\s+\(|$)/) || subject.match(/:\s+(.+?)(?:\s+\(|$)/);
    const title = titleMatch ? titleMatch[1].trim() : subject;

    // Extract author
    const authorMatch = html.match(/(?:by|from)\s+@?([a-zA-Z0-9_-]+)/) || subject.match(/\(([^)]+)\)$/);
    const author = authorMatch ? authorMatch[1].trim() : undefined;

    // Extract URL
    const urlMatch = html.match(/https:\/\/github\.com\/[^\s"<]+/);
    const url = urlMatch ? urlMatch[0] : undefined;

    // Extract status
    let status: GitHubEmailData['status'] = 'open';
    if (subjectLower.includes('closed') || subjectLower.includes('close')) {
        status = 'closed';
    } else if (subjectLower.includes('merged') || subjectLower.includes('merge')) {
        status = 'merged';
    }

    // Extract description (first paragraph)
    const descMatch = html.match(/<p[^>]*>(.*?)<\/p>/s);
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 200) : undefined;

    // Extract labels
    const labelsMatch = html.match(/Labels?:\s*([^<\n]+)/i);
    const labels = labelsMatch ? labelsMatch[1].split(',').map(l => l.trim()) : [];

    // Extract branch name
    const branchMatch = html.match(/(?:branch|from)\s+([a-zA-Z0-9_\/-]+)/i);
    const branch = branchMatch ? branchMatch[1] : undefined;

    // Extract commit hash
    const commitMatch = html.match(/([0-9a-f]{7,40})/i);
    const commitHash = type === 'commit' && commitMatch ? commitMatch[1].substring(0, 7) : undefined;

    return {
        type,
        repoName,
        repoOwner,
        prNumber,
        issueNumber,
        title,
        author,
        description,
        url,
        status,
        labels,
        branch,
        commitHash
    };
};
