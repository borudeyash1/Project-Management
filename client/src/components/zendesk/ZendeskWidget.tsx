import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader, ExternalLink } from 'lucide-react';
import { zendeskService, ZendeskTicket } from '../../services/zendeskService';
import { useApp } from '../../context/AppContext';
import { ZendeskLogo } from '../icons/BrandLogos';

// Event for toggling
export const toggleZendeskWidget = () => {
    window.dispatchEvent(new CustomEvent('TOGGLE_ZENDESK_WIDGET'));
};

const ZendeskWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [tickets, setTickets] = useState<ZendeskTicket[]>([]);
    const [loading, setLoading] = useState(false);
    const { state } = useApp();

    const zendeskConnected = !!state.userProfile?.connectedAccounts?.zendesk?.activeAccountId;

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('TOGGLE_ZENDESK_WIDGET', handleToggle);
        return () => window.removeEventListener('TOGGLE_ZENDESK_WIDGET', handleToggle);
    }, []);

    useEffect(() => {
        if (isOpen && zendeskConnected) {
            fetchTickets();
        }
    }, [isOpen, zendeskConnected]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await zendeskService.getRecentTickets();
            setTickets(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!zendeskConnected) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'solved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-24 right-20 w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl z-[60] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-white/50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#03363D]/10 border border-[#03363D]/20">
                                <ZendeskLogo className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recent Tickets</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Content List */}
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-white/30 dark:bg-gray-900/30">
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <Loader className="w-6 h-6 text-[#03363D] animate-spin" />
                            </div>
                        ) : tickets.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {tickets.map((ticket) => (
                                    <a
                                        key={ticket.id}
                                        href={ticket.url || '#'} // If using webUrl from backend, use that. Or construct it.
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-3 mx-2 my-1 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all group"
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-mono font-medium text-gray-400 group-hover:text-[#03363D] transition-colors">
                                                    #{ticket.id}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(ticket.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>

                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                                                {ticket.subject}
                                            </h4>

                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-semibold ${getStatusColor(ticket.status)}`}
                                                >
                                                    {ticket.status}
                                                </span>

                                                {ticket.priority && (
                                                    <div className="flex items-center gap-1">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'urgent' ? 'bg-red-500' :
                                                                ticket.priority === 'high' ? 'bg-orange-500' :
                                                                    ticket.priority === 'normal' ? 'bg-blue-400' : 'bg-gray-400'
                                                            }`} />
                                                        <span className="text-[10px] text-gray-500 capitalize">
                                                            {ticket.priority}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#03363D]/10 flex items-center justify-center">
                                    <ZendeskLogo className="w-6 h-6 opacity-50" />
                                </div>
                                <p className="text-sm font-medium">No tickets found</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700/50 flex justify-between">
                        <span>Synced from Zendesk</span>
                        <span>Assigned to you</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ZendeskWidget;
