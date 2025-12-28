import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Send, Paperclip, MoreHorizontal, User,
    Clock, Tag, ChevronDown, CheckCircle, AlertCircle,
    MessageSquare, UserCircle, RefreshCcw
} from 'lucide-react';
import { zendeskService } from '../../services/zendeskService';
import { useApp } from '../../context/AppContext';
import { ZendeskLogo } from '../icons/BrandLogos';
import LoadingAnimation from '../LoadingAnimation';

const ZendeskTicketDetail: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const { state } = useApp();

    // State
    const [ticket, setTicket] = useState<any>(null);
    const [users, setUsers] = useState<Map<number, any>>(new Map());
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyMode, setReplyMode] = useState<'public' | 'internal'>('public');
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        if (ticketId) {
            fetchData();
        }
    }, [ticketId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Details and Comments in parallel
            const [detailsData, commentsData] = await Promise.all([
                zendeskService.getTicketDetails(ticketId!),
                zendeskService.getTicketComments(ticketId!)
            ]);

            setTicket(detailsData.ticket);

            // Process Users (from both calls side-loading)
            const usersMap = new Map();
            [...(detailsData.users || []), ...(commentsData.users || [])].forEach((u: any) => {
                usersMap.set(u.id, u);
            });
            setUsers(usersMap);

            setComments(commentsData.comments || []);
        } catch (error) {
            console.error('Failed to load ticket data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUser = (id: number) => users.get(id);

    const requester = ticket ? getUser(ticket.requester_id) : null;
    const assignee = ticket ? getUser(ticket.assignee_id) : null;

    if (loading) {
        return <div className="h-full flex items-center justify-center"><LoadingAnimation message="Loading Ticket..." /></div>;
    }

    if (!ticket) {
        return <div className="p-8 text-center text-gray-500">Ticket not found</div>;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-500">#{ticket.id}</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold uppercase rounded ${ticket.status === 'open' ? 'bg-red-100 text-red-700' :
                                    ticket.status === 'solved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {ticket.status}
                            </span>
                        </div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                            {ticket.subject}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#03363D] text-white rounded-md text-sm font-medium hover:bg-[#022a30] transition-colors">
                        Submit as {ticket.status}
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar (Metadata) */}
                <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4 flex flex-col gap-6">
                    {/* Requester / Assignee */}
                    <div className="space-y-4">
                        <div className="form-group">
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Requester</label>
                            <div className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                <UserCircle className="w-8 h-8 text-gray-400" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{requester?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500 truncate">{requester?.email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Assignee</label>
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 -ml-1 rounded transition-colors">
                                <div className="w-6 h-6 rounded-full bg-[#03363D]/10 flex items-center justify-center text-xs font-bold text-[#03363D]">
                                    {(assignee?.name || 'U')[0]}
                                </div>
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                    {assignee?.name || 'take it'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700" />

                    {/* Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Tags</label>
                            <div className="flex flex-wrap gap-1.5">
                                {ticket.tags?.map((tag: string) => (
                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                                <button className="text-xs text-gray-400 hover:text-gray-600 p-1">+ Add</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Type</label>
                                <div className="text-sm border-b border-gray-300 dark:border-gray-600 pb-1">
                                    {ticket.type || '-'}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Priority</label>
                                <div className={`text-sm font-medium border-b border-gray-300 dark:border-gray-600 pb-1 ${ticket.priority === 'urgent' ? 'text-red-600' :
                                        ticket.priority === 'high' ? 'text-orange-600' : 'text-gray-900 dark:text-gray-100'
                                    }`}>
                                    {ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content (Conversation) */}
                <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Initial Description as first message */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-yellow-50/30 dark:bg-yellow-900/10">
                                <div className="flex items-center gap-2">
                                    <UserCircle className="w-5 h-5 text-gray-400" />
                                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                        {requester?.name}
                                    </span>
                                    <span className="text-xs text-gray-500">created this ticket</span>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(ticket.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="p-4 prose prose-sm max-w-none dark:prose-invert">
                                <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                                    {ticket.description}
                                </p>
                            </div>
                        </div>

                        {/* Comments */}
                        {comments.map((comment: any) => {
                            const author = getUser(comment.author_id);
                            const isAgent = author?.role === 'agent' || author?.role === 'admin';

                            return (
                                <div key={comment.id} className={`flex gap-3 ${comment.public ? '' : 'bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/20'}`}>
                                    <div className="flex-shrink-0">
                                        {author?.photo?.content_url ? (
                                            <img src={author.photo.content_url} alt={author.name} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <span className="text-xs font-bold text-gray-500">{author?.name?.[0]}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{author?.name}</span>
                                            {isAgent && <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 rounded font-medium">Agent</span>}
                                            {!comment.public && <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-[10px] px-1.5 rounded font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Internal Note</span>}
                                            <span className="text-xs text-gray-400 ml-auto">
                                                {new Date(comment.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="prose prose-sm max-w-none dark:prose-invert bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                            <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 mb-0">
                                                {comment.body}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Reply Box */}
                    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#03363D] focus-within:border-transparent transition-all shadow-sm">
                            <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex">
                                <button
                                    onClick={() => setReplyMode('public')}
                                    className={`flex-1 py-2 text-sm font-medium transition-colors ${replyMode === 'public'
                                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-b-2 border-[#03363D]'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Public Reply
                                </button>
                                <button
                                    onClick={() => setReplyMode('internal')}
                                    className={`flex-1 py-2 text-sm font-medium transition-colors ${replyMode === 'internal'
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-b-2 border-yellow-500'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Internal Note
                                </button>
                            </div>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={replyMode === 'public' ? "Type your reply to the customer..." : "Leave an internal note for your team..."}
                                className={`w-full p-3 min-h-[100px] text-sm bg-transparent border-none focus:ring-0 resize-none ${replyMode === 'internal' ? 'bg-yellow-50/30' : ''
                                    }`}
                            />
                            <div className={`flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 ${replyMode === 'internal' ? 'bg-yellow-50/50' : ''}`}>
                                <div className="flex items-center gap-2">
                                    <button className="p-1.5 hover:bg-black/5 rounded text-gray-500"><Paperclip className="w-4 h-4" /></button>
                                    <button className="p-1.5 hover:bg-black/5 rounded text-gray-500"><MoreHorizontal className="w-4 h-4" /></button>
                                </div>
                                <button
                                    disabled={!replyText.trim()}
                                    className={`px-4 py-1.5 rounded text-sm font-medium text-white transition-colors flex items-center gap-2 ${replyMode === 'internal' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-700'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {replyMode === 'internal' ? 'Save Note' : 'Send Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (Customer Info) */}
                <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-4 hidden xl:block">
                    <div className="flex items-center gap-2 mb-4">
                        <UserCircle className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Customer</span>
                        <button className="ml-auto p-1 hover:bg-gray-100 rounded"><ExternalLink className="w-4 h-4 text-gray-400" /></button>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div>
                            <label className="text-xs text-gray-500">Email</label>
                            <div className="text-blue-600 truncate" title={requester?.email}>{requester?.email}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Local Time</label>
                            <div>{new Date().toLocaleTimeString()}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Language</label>
                            <div>English (United States)</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                            <textarea
                                placeholder="Add user notes"
                                className="w-full text-xs p-2 border border-gray-200 dark:border-gray-700 rounded h-20 resize-none"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-6" />

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">Interaction history</span>
                            <RefreshCcw className="w-3 h-3 text-gray-400 cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border-l-2 border-blue-500">
                                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{ticket.subject}</div>
                                <div className="flex items-center justify-between mt-1 text-[10px] text-gray-500">
                                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    <span>{ticket.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Generic ExternalLink Icon
function ExternalLink({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
    );
}

export default ZendeskTicketDetail;
