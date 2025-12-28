import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, RotateCw, ExternalLink, Filter, AlertCircle, Loader } from 'lucide-react';
import { zendeskService, ZendeskTicket } from '../../services/zendeskService';
import { useApp } from '../../context/AppContext';
import { ZendeskLogo } from '../icons/BrandLogos';

interface WorkspaceZendeskTabProps {
    workspaceId: string;
}

const WorkspaceZendeskTab: React.FC<WorkspaceZendeskTabProps> = ({ workspaceId }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useApp();
    const [tickets, setTickets] = useState<ZendeskTicket[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const zendeskConnected = !!state.userProfile?.connectedAccounts?.zendesk?.activeAccountId;

    useEffect(() => {
        if (zendeskConnected) {
            fetchTickets();
        }
    }, [zendeskConnected, workspaceId]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            // For now, we fetch ALL tickets for the user as we don't have workspace-specific mapping yet.
            // Future improvement: Filter by organization_id matching workspace client.
            const data = await zendeskService.getRecentTickets();
            setTickets(data);
        } catch (error) {
            console.error('Failed to fetch Zendesk tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchTickets();
            return;
        }
        setLoading(true);
        try {
            const data = await zendeskService.searchTickets(searchQuery);
            setTickets(data);
        } catch (error) {
            console.error('Failed to search tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        if (statusFilter === 'all') return true;
        return ticket.status === statusFilter;
    });

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

    if (!zendeskConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <ZendeskLogo size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Zendesk Not Connected
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    Connect your Zendesk account to view and manage support tickets directly from your workspace.
                </p>
                {/* Potentially a button to go to settings, but usually managed in Settings */}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full min-h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#03363D]/10 rounded-lg">
                        <ZendeskLogo className="w-5 h-5 text-[#03363D] dark:text-[#03363D]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Support Tickets
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Synced from Zendesk
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchTickets}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    {/* Filter Dropdown could go here */}
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#03363D]/20 focus:border-[#03363D] transition-colors"
                    />
                </form>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['all', 'new', 'open', 'pending', 'solved', 'closed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize whitespace-nowrap transition-colors ${statusFilter === status
                                ? 'bg-[#03363D] text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto">
                {loading && tickets.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader className="w-8 h-8 text-[#03363D] animate-spin" />
                    </div>
                ) : filteredTickets.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium sticky top-0 bg-opacity-95 backdrop-blur-sm z-10">
                            <tr>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">ID</th>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 w-full">Subject</th>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">Status</th>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">Priority</th>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">Updated</th>
                                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 text-xs font-mono text-gray-500">#{ticket.id}</td>
                                    <td className="px-6 py-4">
                                        <div
                                            onClick={() => navigate(`${ticket.id}`)}
                                            className="font-medium text-gray-900 dark:text-gray-100 mb-0.5 cursor-pointer hover:text-[#03363D] transition-colors"
                                        >
                                            {ticket.subject}
                                        </div>
                                        <div className="text-xs text-gray-500 max-w-md truncate">
                                            {ticket.description?.substring(0, 100)}...
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {ticket.priority ? (
                                            <span className={`text-xs font-semibold uppercase ${ticket.priority === 'urgent' ? 'text-red-600' :
                                                ticket.priority === 'high' ? 'text-orange-600' :
                                                    ticket.priority === 'normal' ? 'text-blue-600' :
                                                        'text-gray-500'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {new Date(ticket.updated_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={ticket.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-gray-400 hover:text-[#03363D] rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all inline-block"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                            <Search className="w-6 h-6 opacity-40" />
                        </div>
                        <p>No tickets found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceZendeskTab;
