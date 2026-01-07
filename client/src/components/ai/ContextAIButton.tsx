import React, { useState } from 'react';
import { Sparkles, X, MessageCircle, Zap, BarChart3, Loader2 } from 'lucide-react';
import { usePageContext } from '../../hooks/usePageContext';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';

interface AIInsight {
    summary?: string;
    answer?: string;
    actions?: string;
    focusAreas?: string[];
    quickQuestions?: string[];
    context?: any;
    cached?: boolean;
    creditsUsed?: number;
    creditsRemaining?: number;
    warning?: string;
}

export const ContextAIButton: React.FC<{ pageData?: any }> = ({ pageData }) => {
    const { pageType, pageId, subPage, isContextAware } = usePageContext();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? 'dark' : 'light';
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'question' | 'actions'>('summary');
    const [insight, setInsight] = useState<AIInsight | null>(null);
    const [question, setQuestion] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Don't show button if not on a context-aware page
    if (!isContextAware || !pageId) {
        return null;
    }

    const handleAnalyzeContext = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiService.post('/ai/analyze-context', {
                pageType,
                pageId,
                subPage,
                pageData
            });

            if (response.data.success) {
                setInsight(response.data.data);
                if (response.data.warning) {
                    console.warn('[AI Credits]', response.data.warning);
                }
            }
        } catch (err: any) {
            console.error('[Context AI] Error:', err);
            if (err.response?.status === 402) {
                setError(`Insufficient credits. You need ${err.response.data.data.required} credits but only have ${err.response.data.data.remaining}. Resets at ${new Date(err.response.data.data.resetsAt).toLocaleString()}`);
            } else if (err.response?.status === 429) {
                setError(`Please wait ${err.response.data.remainingMinutes} minutes before using this feature again`);
            } else {
                setError('Failed to analyze context. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAskQuestion = async () => {
        if (!question.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await apiService.post('/ai/ask-question', {
                question,
                pageType,
                pageId,
                subPage,
                pageData
            });

            if (response.data.success) {
                setInsight(response.data.data);
                setQuestion('');
            }
        } catch (err: any) {
            console.error('[Context AI] Error:', err);
            if (err.response?.status === 402) {
                setError('Insufficient credits');
            } else if (err.response?.status === 429) {
                setError(`Please wait ${err.response.data.remainingMinutes} minutes`);
            } else {
                setError('Failed to get answer. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestActions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiService.post('/ai/suggest-action', {
                pageType,
                pageId,
                subPage,
                pageData
            });

            if (response.data.success) {
                setInsight(response.data.data);
            }
        } catch (err: any) {
            console.error('[Context AI] Error:', err);
            if (err.response?.status === 402) {
                setError('Insufficient credits');
            } else if (err.response?.status === 429) {
                setError(`Please wait ${err.response.data.remainingMinutes} minutes`);
            } else {
                setError('Failed to get suggestions. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickQuestion = (q: string) => {
        setQuestion(q);
        setActiveTab('question');
    };

    return (
        <>
            {/* Floating AI Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-20 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                style={{
                    background: theme === 'dark'
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
                title="Ask AI Assistant"
            >
                <Sparkles size={24} />
            </button>

            {/* AI Assistant Modal */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-50 w-96 rounded-xl shadow-2xl overflow-hidden"
                    style={{
                        background: theme === 'dark' ? '#1f2937' : '#ffffff',
                        border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
                    }}
                >
                    {/* Header */}
                    <div
                        className="p-4 flex items-center justify-between"
                        style={{
                            background: theme === 'dark'
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles size={20} />
                            <h3 className="font-semibold">AI Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 p-1 rounded transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div
                        className="flex border-b"
                        style={{
                            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                        }}
                    >
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`flex-1 p-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'summary' ? 'border-b-2 border-purple-500' : ''
                                }`}
                            style={{
                                color: activeTab === 'summary' ? '#8b5cf6' : theme === 'dark' ? '#9ca3af' : '#6b7280'
                            }}
                        >
                            <BarChart3 size={16} />
                            <span className="text-sm">Summary</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('question')}
                            className={`flex-1 p-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'question' ? 'border-b-2 border-purple-500' : ''
                                }`}
                            style={{
                                color: activeTab === 'question' ? '#8b5cf6' : theme === 'dark' ? '#9ca3af' : '#6b7280'
                            }}
                        >
                            <MessageCircle size={16} />
                            <span className="text-sm">Ask</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('actions')}
                            className={`flex-1 p-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'actions' ? 'border-b-2 border-purple-500' : ''
                                }`}
                            style={{
                                color: activeTab === 'actions' ? '#8b5cf6' : theme === 'dark' ? '#9ca3af' : '#6b7280'
                            }}
                        >
                            <Zap size={16} />
                            <span className="text-sm">Actions</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-96 overflow-y-auto">
                        {error && (
                            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Summary Tab */}
                        {activeTab === 'summary' && (
                            <div className="space-y-4">
                                {!insight?.summary ? (
                                    <button
                                        onClick={handleAnalyzeContext}
                                        disabled={isLoading}
                                        className="w-full p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        style={{
                                            background: isLoading ? '#9ca3af' : '#8b5cf6',
                                            color: 'white'
                                        }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <BarChart3 size={16} />
                                                Analyze Page (15 credits)
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        {insight.cached && (
                                            <div className="text-xs text-green-600 dark:text-green-400">
                                                ✓ Cached result (0 credits)
                                            </div>
                                        )}
                                        <div
                                            className="p-3 rounded-lg text-sm whitespace-pre-wrap"
                                            style={{
                                                background: theme === 'dark' ? '#374151' : '#f3f4f6',
                                                color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                                            }}
                                        >
                                            {insight.summary}
                                        </div>
                                        {insight.quickQuestions && insight.quickQuestions.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                                    💡 Quick Questions:
                                                </p>
                                                {insight.quickQuestions.map((q, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleQuickQuestion(q)}
                                                        className="w-full text-left p-2 rounded text-xs hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                                                        style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                                                    >
                                                        • {q}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Question Tab */}
                        {activeTab === 'question' && (
                            <div className="space-y-4">
                                <div>
                                    <textarea
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="Ask a question about this page..."
                                        className="w-full p-3 rounded-lg text-sm resize-none"
                                        rows={3}
                                        style={{
                                            background: theme === 'dark' ? '#374151' : '#f3f4f6',
                                            color: theme === 'dark' ? '#e5e7eb' : '#1f2937',
                                            border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`
                                        }}
                                    />
                                    <button
                                        onClick={handleAskQuestion}
                                        disabled={isLoading || !question.trim()}
                                        className="mt-2 w-full p-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        style={{
                                            background: isLoading || !question.trim() ? '#9ca3af' : '#8b5cf6',
                                            color: 'white'
                                        }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Thinking...
                                            </>
                                        ) : (
                                            <>
                                                <MessageCircle size={16} />
                                                Ask (10 credits)
                                            </>
                                        )}
                                    </button>
                                </div>
                                {insight?.answer && (
                                    <div
                                        className="p-3 rounded-lg text-sm whitespace-pre-wrap"
                                        style={{
                                            background: theme === 'dark' ? '#374151' : '#f3f4f6',
                                            color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                                        }}
                                    >
                                        {insight.answer}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions Tab */}
                        {activeTab === 'actions' && (
                            <div className="space-y-4">
                                {!insight?.actions ? (
                                    <button
                                        onClick={handleSuggestActions}
                                        disabled={isLoading}
                                        className="w-full p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        style={{
                                            background: isLoading ? '#9ca3af' : '#8b5cf6',
                                            color: 'white'
                                        }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={16} />
                                                Get Suggestions (10 credits)
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div
                                        className="p-3 rounded-lg text-sm whitespace-pre-wrap"
                                        style={{
                                            background: theme === 'dark' ? '#374151' : '#f3f4f6',
                                            color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                                        }}
                                    >
                                        {insight.actions}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ContextAIButton;
