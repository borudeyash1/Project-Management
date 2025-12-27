/**
 * Enhanced Utility for parsing GitHub commit messages
 * Features:
 * - Extensive keyword detection (50+ keywords)
 * - Typo tolerance using Levenshtein distance
 * - Progress percentage calculation
 * - Multi-status priority system
 * - Abbreviation support
 * - Partial completion detection
 */

export interface TaskReference {
    taskId: string;
    format: 'hash' | 'bracket' | 'plain' | 'objectid';
    position: number;
}

export interface StatusKeyword {
    keyword: string;
    status: 'completed' | 'in-progress' | 'partial' | 'testing' | 'review' | 'blocked';
    confidence: number;
    progressPercentage: number;
}

export interface ParsedCommit {
    taskReferences: TaskReference[];
    statusKeywords: StatusKeyword[];
    suggestedStatus?: 'completed' | 'in-progress' | 'partial' | 'testing' | 'review' | 'blocked';
    progressPercentage?: number;
    titleKeywords: string[];
}

// Comprehensive status keyword mappings with progress percentages
const STATUS_KEYWORDS = {
    completed: {
        keywords: [
            'done', 'finished', 'completed', 'complete',
            'fixed', 'fix', 'fixes', 'fixxed', 'fixt', // typo variations
            'resolved', 'resolve', 'resolves', 'resovled', 'resolvd',
            'closed', 'close', 'closes', 'closd',
            'implemented', 'implement', 'implements', 'implementd',
            'merged', 'merge', 'deployed', 'deploy',
            'finsihed', 'complted', 'finihsed' // common typos
        ],
        progress: 100
    },
    testing: {
        keywords: [
            'testing', 'test', 'tested', 'testin',
            'qa', 'verify', 'verifying', 'verified',
            'checking', 'check', 'checked',
            'validating', 'validate', 'validated'
        ],
        progress: 85
    },
    review: {
        keywords: [
            'review', 'reviewing', 'reviewed',
            'ready for review', 'needs review', 'pr ready',
            'pull request', 'pr', 'code review'
        ],
        progress: 80
    },
    'in-progress': {
        keywords: [
            'working on', 'wip', 'workin on', 'workin',
            'started', 'start', 'starting',
            'implementing', 'develop', 'developing', 'developin',
            'building', 'build', 'buildin',
            'creating', 'create', 'creatin',
            'adding', 'add', 'addin',
            'updating', 'update', 'updatin',
            'refactoring', 'refactor',
            'improving', 'improve'
        ],
        progress: 60
    },
    partial: {
        keywords: [
            'partially', 'partial', 'partilly',
            'halfway', 'half done', 'half way',
            'progress on', 'some work on', 'made progress',
            'initial', 'draft', 'wip on',
            'ongoing', 'some fixes', 'partial fix'
        ],
        progress: 35
    },
    blocked: {
        keywords: [
            'blocked', 'blocked by', 'blockd',
            'waiting for', 'waiting on',
            'on hold', 'paused',
            'stuck', 'need help', 'needs help',
            'cant proceed', 'cannot proceed'
        ],
        progress: 0 // No progress change when blocked
    }
};

// Common abbreviations
const ABBREVIATIONS: Record<string, string[]> = {
    'auth': ['authentication', 'authorize', 'authorization'],
    'db': ['database'],
    'api': ['application programming interface', 'endpoint'],
    'ui': ['user interface', 'interface'],
    'ux': ['user experience', 'experience'],
    'repo': ['repository'],
    'config': ['configuration'],
    'impl': ['implement', 'implementation'],
    'func': ['function', 'functionality'],
    'btn': ['button'],
    'msg': ['message'],
    'err': ['error'],
    'req': ['request'],
    'res': ['response']
};

/**
 * Calculate Levenshtein distance between two strings
 * Used for typo tolerance
 */
function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    // Initialize matrix properly using Array.from to ensure TS knows array structure
    const matrix: number[][] = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) {
        matrix[i]![0] = i;
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0]![j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i]![j] = Math.min(
                matrix[i - 1]![j]! + 1,      // deletion
                matrix[i]![j - 1]! + 1,      // insertion
                matrix[i - 1]![j - 1]! + cost // substitution
            );
        }
    }

    return matrix[len1]![len2]!;
}

/**
 * Check if two words are similar (handles typos)
 * Allows 1-2 character differences for words >5 characters
 */
function isSimilarWord(word1: string, word2: string): boolean {
    const w1 = word1.toLowerCase();
    const w2 = word2.toLowerCase();

    if (w1 === w2) return true;

    const distance = levenshteinDistance(w1, w2);
    const maxLength = Math.max(w1.length, w2.length);

    // Allow 1 char diff for words 5-8 chars, 2 char diff for words >8 chars
    if (maxLength <= 4) return distance === 0;
    if (maxLength <= 8) return distance <= 1;
    return distance <= 2;
}

/**
 * Extract task references from commit message
 * Supports: #TASK-123, [TASK-123], TASK-123, MongoDB ObjectIds
 */
export function extractTaskReferences(message: string): TaskReference[] {
    const references: TaskReference[] = [];

    // Pattern 1: #TASK-123 or #123
    const hashPattern = /#(TASK-\\d+|\\d+)/gi;
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
    const bracketPattern = /\\[(TASK-\\d+)\\]/gi;
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
    const plainPattern = /\\b(TASK-\\d+)\\b/gi;
    let plainMatch: RegExpExecArray | null;
    while ((plainMatch = plainPattern.exec(message)) !== null) {
        const capturedId = plainMatch[1] || '';
        if (!references.some(ref => ref.taskId === capturedId && ref.position === plainMatch!.index)) {
            references.push({
                taskId: capturedId,
                format: 'plain',
                position: plainMatch.index
            });
        }
    }

    // Pattern 4: MongoDB ObjectId (24 hex characters)
    const objectIdPattern = /#([a-f0-9]{24})\\b/gi;
    let objectIdMatch: RegExpExecArray | null;
    while ((objectIdMatch = objectIdPattern.exec(message)) !== null) {
        const capturedId = objectIdMatch[1] || '';
        references.push({
            taskId: capturedId,
            format: 'objectid',
            position: objectIdMatch.index
        });
    }

    return references;
}

/**
 * Detect status keywords with typo tolerance
 */
export function detectStatusKeywords(message: string): StatusKeyword[] {
    const keywords: StatusKeyword[] = [];
    const messageLower = message.toLowerCase();

    // Priority order (highest to lowest)
    const statusPriority: Array<keyof typeof STATUS_KEYWORDS> = [
        'blocked', 'completed', 'testing', 'review', 'in-progress', 'partial'
    ];

    for (const status of statusPriority) {
        const config = STATUS_KEYWORDS[status];

        for (const keyword of config.keywords) {
            // Check for exact match or phrase match
            if (messageLower.includes(keyword.toLowerCase())) {
                keywords.push({
                    keyword,
                    status: status as any,
                    confidence: 1.0,
                    progressPercentage: config.progress
                });
                continue;
            }

            // Check for typo tolerance (single words only)
            if (!keyword.includes(' ')) {
                const words = messageLower.split(/\\s+/);
                for (const word of words) {
                    if (word.length > 3 && isSimilarWord(word, keyword)) {
                        keywords.push({
                            keyword: word,
                            status: status as any,
                            confidence: 0.9, // Slightly lower confidence for typo matches
                            progressPercentage: config.progress
                        });
                    }
                }
            }
        }
    }

    return keywords;
}

/**
 * Determine suggested status based on detected keywords
 * Uses priority system: blocked > completed > testing > review > in-progress > partial
 */
export function determineSuggestedStatus(keywords: StatusKeyword[]): {
    status?: 'completed' | 'in-progress' | 'partial' | 'testing' | 'review' | 'blocked';
    progress?: number;
} {
    if (keywords.length === 0) return {};

    // Priority order
    const priority = ['blocked', 'completed', 'testing', 'review', 'in-progress', 'partial'];

    for (const status of priority) {
        const match = keywords.find(k => k.status === status);
        if (match) {
            return {
                status: match.status,
                progress: match.progressPercentage
            };
        }
    }

    return {};
}

/**
 * Extract keywords from commit message for fuzzy title matching
 * Expands abbreviations
 */
export function extractTitleKeywords(message: string): string[] {
    // Remove task references and common words
    const cleaned = message
        .replace(/#(TASK-\\d+|\\d+)/gi, '')
        .replace(/\\[(TASK-\\d+)\\]/gi, '')
        .replace(/\\b(TASK-\\d+)\\b/gi, '')
        .toLowerCase();

    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can',
        // Common project management words (noise)
        'issue', 'bug', 'task', 'ticket', 'feature', 'chore', 'refactor', 'work', 'job',
        // Status keywords (should not be part of title match)
        'fix', 'fixes', 'fixed', 'closed', 'close', 'closes', 'resolved', 'resolve', 'update', 'updated', 'updating', 'add', 'added', 'adding', 'implement', 'implemented'
    ]);

    const words = cleaned
        .split(/[^a-z0-9]+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

    // Expand abbreviations
    const expanded: string[] = [];
    for (const word of words) {
        expanded.push(word);
        if (ABBREVIATIONS[word]) {
            expanded.push(...ABBREVIATIONS[word]);
        }
    }

    return [...new Set(expanded)]; // Remove duplicates
}

/**
 * Calculate similarity between commit keywords and task title
 * Enhanced with abbreviation support
 */
export function calculateTitleSimilarity(commitKeywords: string[], taskTitle: string): number {
    if (commitKeywords.length === 0) return 0;

    const titleWords = taskTitle
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(word => word.length > 2);

    let matches = 0;
    for (const keyword of commitKeywords) {
        for (const titleWord of titleWords) {
            if (titleWord.includes(keyword) || keyword.includes(titleWord)) {
                matches++;
                break;
            }
            // Check with typo tolerance
            if (isSimilarWord(keyword, titleWord)) {
                matches += 0.8; // Slightly lower weight for fuzzy matches
                break;
            }
        }
    }

    return matches / Math.max(commitKeywords.length, titleWords.length);
}

/**
 * Main function to parse commit message
 */
export function parseCommitMessage(message: string): ParsedCommit {
    const taskReferences = extractTaskReferences(message);
    const statusKeywords = detectStatusKeywords(message);
    const { status, progress } = determineSuggestedStatus(statusKeywords);
    const titleKeywords = extractTitleKeywords(message);

    return {
        taskReferences,
        statusKeywords,
        suggestedStatus: status,
        progressPercentage: progress,
        titleKeywords
    };
}
