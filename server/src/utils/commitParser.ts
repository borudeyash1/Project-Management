/**
 * Utility for parsing GitHub commit messages to extract task references and status keywords
 */

export interface TaskReference {
    taskId: string;
    format: 'hash' | 'bracket' | 'plain'; // #TASK-123, [TASK-123], TASK-123
    position: number;
}

export interface StatusKeyword {
    keyword: string;
    status: 'completed' | 'in-progress' | 'testing' | 'review';
    confidence: number; // 0-1
}

export interface ParsedCommit {
    taskReferences: TaskReference[];
    statusKeywords: StatusKeyword[];
    suggestedStatus?: 'completed' | 'in-progress' | 'testing' | 'review';
    titleKeywords: string[]; // For fuzzy matching against task titles
}

// Status keyword mappings
const STATUS_KEYWORDS = {
    completed: [
        'fix', 'fixes', 'fixed',
        'close', 'closes', 'closed',
        'resolve', 'resolves', 'resolved',
        'complete', 'completes', 'completed',
        'done', 'finished', 'implement', 'implemented'
    ],
    'in-progress': [
        'working on', 'wip', 'started', 'starting',
        'implementing', 'developing', 'building',
        'adding', 'creating', 'updating'
    ],
    testing: [
        'test', 'testing', 'tested',
        'qa', 'verify', 'verifying'
    ],
    review: [
        'review', 'ready for review', 'pr',
        'pull request', 'needs review'
    ]
};

/**
 * Extract task references from commit message
 * Supports formats: #TASK-123, [TASK-123], TASK-123
 */
export function extractTaskReferences(message: string): TaskReference[] {
    const references: TaskReference[] = [];

    // Pattern 1: #TASK-123 or #123
    const hashPattern = /#(TASK-\d+|\d+)/gi;
    let hashMatch: RegExpExecArray | null;
    while ((hashMatch = hashPattern.exec(message)) !== null) {
        const capturedId = hashMatch[1] || '';
        references.push({
            taskId: capturedId.startsWith('TASK-') ? capturedId : `TASK-${capturedId}`,
            format: 'hash',
            position: hashMatch.index
        });
    }

    // Pattern 2: [TASK-123]
    const bracketPattern = /\[(TASK-\d+)\]/gi;
    let bracketMatch: RegExpExecArray | null;
    while ((bracketMatch = bracketPattern.exec(message)) !== null) {
        const capturedId = bracketMatch[1] || '';
        references.push({
            taskId: capturedId,
            format: 'bracket',
            position: bracketMatch.index
        });
    }

    // Pattern 3: TASK-123 (standalone)
    const plainPattern = /\b(TASK-\d+)\b/gi;
    let plainMatch: RegExpExecArray | null;
    while ((plainMatch = plainPattern.exec(message)) !== null) {
        const capturedId = plainMatch[1] || '';
        // Avoid duplicates from bracket pattern
        if (!references.some(ref => ref.taskId === capturedId && ref.position === plainMatch!.index)) {
            references.push({
                taskId: capturedId,
                format: 'plain',
                position: plainMatch.index
            });
        }
    }

    return references;
}

/**
 * Detect status keywords in commit message
 */
export function detectStatusKeywords(message: string): StatusKeyword[] {
    const lowerMessage = message.toLowerCase();
    const keywords: StatusKeyword[] = [];

    for (const [status, keywordList] of Object.entries(STATUS_KEYWORDS)) {
        for (const keyword of keywordList) {
            if (lowerMessage.includes(keyword)) {
                // Calculate confidence based on keyword position and context
                const position = lowerMessage.indexOf(keyword);
                const isAtStart = position < 20; // Higher confidence if near start
                const hasTaskRef = extractTaskReferences(message).length > 0;

                let confidence = 0.5;
                if (isAtStart) confidence += 0.2;
                if (hasTaskRef) confidence += 0.2;
                if (keyword.length > 5) confidence += 0.1; // Longer keywords are more specific

                keywords.push({
                    keyword,
                    status: status as any,
                    confidence: Math.min(confidence, 1.0)
                });
            }
        }
    }

    return keywords;
}

/**
 * Determine the most likely task status from detected keywords
 */
export function determineSuggestedStatus(keywords: StatusKeyword[]): 'completed' | 'in-progress' | 'testing' | 'review' | undefined {
    if (keywords.length === 0) return undefined;

    // Group by status and sum confidence scores
    const statusScores: Record<string, number> = {};
    for (const kw of keywords) {
        statusScores[kw.status] = (statusScores[kw.status] || 0) + kw.confidence;
    }

    // Find status with highest confidence
    let maxScore = 0;
    let suggestedStatus: string | undefined;
    for (const [status, score] of Object.entries(statusScores)) {
        if (score > maxScore) {
            maxScore = score;
            suggestedStatus = status;
        }
    }

    return suggestedStatus as any;
}

/**
 * Extract meaningful keywords from commit message for fuzzy task matching
 */
export function extractTitleKeywords(message: string): string[] {
    // Remove task references and common words
    let cleaned = message
        .replace(/#(TASK-\d+|\d+)/gi, '')
        .replace(/\[(TASK-\d+)\]/gi, '')
        .replace(/\b(TASK-\d+)\b/gi, '');

    // Remove status keywords
    for (const keywordList of Object.values(STATUS_KEYWORDS)) {
        for (const keyword of keywordList) {
            cleaned = cleaned.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '');
        }
    }

    // Extract words (3+ characters)
    const words = cleaned
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length >= 3)
        .filter(word => !['the', 'and', 'for', 'with', 'from'].includes(word));

    return [...new Set(words)]; // Remove duplicates
}

/**
 * Main parsing function
 */
export function parseCommitMessage(message: string): ParsedCommit {
    const taskReferences = extractTaskReferences(message);
    const statusKeywords = detectStatusKeywords(message);
    const suggestedStatus = determineSuggestedStatus(statusKeywords);
    const titleKeywords = extractTitleKeywords(message);

    return {
        taskReferences,
        statusKeywords,
        suggestedStatus,
        titleKeywords
    };
}

/**
 * Calculate similarity score between commit keywords and task title
 * Returns a score between 0 and 1
 */
export function calculateTitleSimilarity(commitKeywords: string[], taskTitle: string): number {
    if (commitKeywords.length === 0) return 0;

    const taskWords = taskTitle
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length >= 3);

    let matchCount = 0;
    for (const keyword of commitKeywords) {
        if (taskWords.some(word => word.includes(keyword) || keyword.includes(word))) {
            matchCount++;
        }
    }

    return matchCount / commitKeywords.length;
}
