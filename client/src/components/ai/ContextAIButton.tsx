import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, MessageCircle, Zap, BarChart3, Loader2, Send, Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import { usePageContext } from '../../hooks/usePageContext';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { useStreamingText } from '../../hooks/useStreamingText';
import { AI_MODELS, getDefaultModel, type AIModel } from '../../config/aiModels';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'summary' | 'actions';
    isStreaming?: boolean;
    timestamp: Date;
}

export const ContextAIButton: React.FC<{ pageData?: any }> = ({ pageData }) => {
    const { pageType, pageId, subPage, isContextAware } = usePageContext();
    const { isDarkMode } = useTheme();
    const { state } = useApp();
    const { userProfile } = state;

    const theme = isDarkMode ? 'dark' : 'light';
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState<AIModel>(getDefaultModel());
    const [showModelDropdown, setShowModelDropdown] = useState(false);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [creditsInfo, setCreditsInfo] = useState<{ used: number; remaining: number } | null>(null);

    // Streaming text hook
    const { displayedText, isStreaming, startStreaming } = useStreamingText({ speed: 15 });

    // Subscription Check
    const sub = userProfile?.subscription;
    const plan = sub?.plan?.toLowerCase();
    const isPaidPlan = plan === 'pro' || plan === 'ultra' || sub?.isPro === true;

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, displayedText, isExpanded]);

    // Don't show button if not valid context or free user
    if (!isContextAware || !isPaidPlan) {
        return null;
    }

    const addMessage = (role: 'user' | 'assistant', content: string, type: 'text' | 'summary' | 'actions' = 'text', loading = false) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role,
            content,
            type,
            isStreaming: loading,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    };

    // Helper to format text
    const formatText = (text: string) => {
        if (!text) return '';
        return text.replace(/\*\*/g, '').replace(/\*/g, '');
    };

    const handleAnalyzeContext = async () => {
        setIsLoading(true);
        // Add artificial delay for "thinking" feel if needed, but API usually takes time

        try {
            const response = await apiService.post('/ai/analyze-context', {
                pageType,
                pageId,
                subPage,
                pageData,
                model: selectedModel.id
            });

            const result = response as any;

            if (result.success && result.data?.summary) {
                setCreditsInfo({
                    used: result.creditsUsed || 0,
                    remaining: result.creditsRemaining || 0
                });

                // Add assistant message and start streaming
                const msg = addMessage('assistant', '', 'summary', true);
                startStreaming(result.data.summary);
            }
        } catch (err: any) {
            console.error('Error analyzing context:', err);
            addMessage('assistant', 'Sorry, I failed to analyze the page. Please try again.', 'text');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setInputValue('');
        addMessage('user', userMsg);
        setIsLoading(true);

        try {
            const response = await apiService.post('/ai/ask-question', {
                question: userMsg,
                pageType,
                pageId,
                subPage,
                pageData,
                model: selectedModel.id
            });

            const result = response as any;

            if (result.success && result.data?.answer) {
                setCreditsInfo({
                    used: result.creditsUsed || 0,
                    remaining: result.creditsRemaining || 0
                });

                addMessage('assistant', '', 'text', true);
                startStreaming(result.data.answer);
            }
        } catch (err: any) {
            console.error('Error asking question:', err);
            addMessage('assistant', 'Sorry, I encountered an error answering your question.', 'text');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestActions = async () => {
        setIsLoading(true);

        try {
            const response = await apiService.post('/ai/suggest-action', {
                pageType,
                pageId,
                subPage,
                pageData,
                model: selectedModel.id
            });

            const result = response as any;

            if (result.success && result.data?.actions) {
                setCreditsInfo({
                    used: result.creditsUsed || 0,
                    remaining: result.creditsRemaining || 0
                });

                addMessage('assistant', '', 'actions', true);
                startStreaming(result.data.actions);
            }
        } catch (err: any) {
            console.error('Error suggesting actions:', err);
            addMessage('assistant', 'Sorry, I could not suggest actions at this time.', 'text');
        } finally {
            setIsLoading(false);
        }
    };

    // Update the last message content when streaming completes
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant' && lastMsg.isStreaming) {
                if (!isStreaming && displayedText && displayedText.length > 0) {
                    setMessages(prev => prev.map((msg, idx) =>
                        idx === prev.length - 1 ? { ...msg, content: displayedText, isStreaming: false } : msg
                    ));
                }
            }
        }
    }, [isStreaming, displayedText]);


    // Glassmorphic Container Classes
    const containerClasses = `fixed transition-all duration-500 ease-in-out shadow-2xl flex flex-col overflow-hidden z-50 backdrop-blur-xl border ${isExpanded
        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl h-[85vh] rounded-2xl'
        : 'bottom-24 right-6 w-[380px] h-[600px] rounded-3xl'
        }`;

    const glassStyle = {
        background: theme === 'dark'
            ? 'rgba(17, 24, 39, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
        borderColor: theme === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.5)',
        boxShadow: theme === 'dark'
            ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            : '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
    };

    const renderMessageContent = (msg: Message) => {
        const isCurrentlyStreaming = msg.role === 'assistant' && msg.isStreaming && isStreaming;

        if (isCurrentlyStreaming) {
            return (
                <div className="whitespace-pre-wrap leading-relaxed relative font-sans text-[15px] font-medium">
                    {displayedText}
                    {/* Blinking cursor only while streaming */}
                    <span className="inline-block w-1.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle rounded-full"></span>
                </div>
            );
        }
        return <div className="whitespace-pre-wrap leading-relaxed font-sans text-[15px] font-medium">{formatText(msg.content)}</div>;
    };

    // Dynamic floating button style
    const floatBtnStyle = {
        background: theme === 'dark'
            ? 'rgba(31, 41, 55, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
        color: theme === 'dark' ? '#fff' : '#000'
    };

    return (
        <>
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    data-context-ai-button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-20 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
                    style={floatBtnStyle}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Sparkles size={24} className="text-blue-600 dark:text-blue-400 relative z-10" />
                </button>
            )}

            {/* Main Chat Interface */}
            {isOpen && (
                <div className={containerClasses} style={glassStyle}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between flex-shrink-0 bg-white/40 dark:bg-gray-800/40">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <Sparkles size={18} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-base text-gray-800 dark:text-gray-100 font-sans tracking-tight">AI Assistant</h3>
                                    {/* Model Selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowModelDropdown(!showModelDropdown)}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-all text-xs font-semibold text-gray-700 dark:text-gray-300"
                                        >
                                            <span>{selectedModel.name}</span>
                                            <ChevronDown size={12} className={`transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showModelDropdown && (
                                            <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 backdrop-blur-xl">
                                                {AI_MODELS.map((model) => (
                                                    <button
                                                        key={model.id}
                                                        onClick={() => {
                                                            setSelectedModel(model);
                                                            setShowModelDropdown(false);
                                                        }}
                                                        disabled={!model.enabled}
                                                        className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${!model.enabled ? 'opacity-50 cursor-not-allowed' : ''
                                                            } ${selectedModel.id === model.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                                                                    {model.name}
                                                                    {!model.enabled && <span className="ml-2 text-[10px] text-gray-400">(Coming Soon)</span>}
                                                                </div>
                                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{model.description}</div>
                                                            </div>
                                                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                                {model.creditCost} cr
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                                    <span>Powered by {selectedModel.provider}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-gray-500"
                                title={isExpanded ? "Collapse" : "Expand"}
                            >
                                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors text-gray-500"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {/* Welcome / Empty State */}
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in duration-500">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-2 shadow-sm">
                                    <Sparkles size={32} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="max-w-xs mx-auto">
                                    <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white font-sans">How can I help you?</h3>
                                    <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                                        I can analyze this page, answer questions, or suggest actionable steps to improve your workflow.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 w-full max-w-sm pt-4">
                                    <button
                                        onClick={handleAnalyzeContext}
                                        disabled={isLoading}
                                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group hover:border-blue-200 dark:hover:border-blue-800"
                                    >
                                        <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                            <BarChart3 size={18} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-800 dark:text-gray-200 text-[15px]">Analyze Page</span>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Get a summary & insights</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleSuggestActions}
                                        disabled={isLoading}
                                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left group hover:border-purple-200 dark:hover:border-purple-800"
                                    >
                                        <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                                            <Zap size={18} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-800 dark:text-gray-200 text-[15px]">Suggest Actions</span>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Next steps based on context</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}
                            >
                                <div
                                    className={`
                                        max-w-[85%] rounded-2xl p-4 shadow-sm text-[15px] leading-relaxed font-medium
                                        ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-sm'
                                            : `bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 text-gray-800 dark:text-gray-200 rounded-tl-sm backdrop-blur-sm`
                                        }
                                    `}
                                >
                                    {renderMessageContent(msg)}
                                </div>
                            </div>
                        ))}
                        {/* Loading Indicator */}
                        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                            <div className="flex justify-start">
                                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 border border-gray-100 dark:border-gray-700/30">
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 bg-white/60 dark:bg-gray-900/60 flex-shrink-0 backdrop-blur-md">
                        <div className="relative group">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Ask follow-up questions..."
                                className={`w-full pl-4 pr-12 py-3.5 rounded-xl border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all ${theme === 'dark'
                                    ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300'
                                    }`}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${!inputValue.trim() || isLoading
                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                    }`}
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                        {creditsInfo && (
                            <div className="text-center mt-2 flex items-center justify-center gap-2">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                    {creditsInfo.remaining} credits remaining
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ContextAIButton;
