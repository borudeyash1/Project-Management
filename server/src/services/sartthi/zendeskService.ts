import axios from 'axios';
import { IConnectedAccount } from '../../models/ConnectedAccount';

interface ZendeskTicket {
    id: number;
    subject: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    url: string;
    assignee_id: number;
    requester_id: number;
}

interface ZendeskUser {
    id: number;
    name: string;
    email: string;
    role: string;
    photo?: {
        content_url: string;
    };
}

export const zendeskService = {
    /**
     * Get Zendesk Subdomain from account settings
     */
    getSubdomain: (account: IConnectedAccount): string => {
        // We stored subdomain in account.settings.zendesk.subdomain during callback
        const subdomain = account.settings?.zendesk?.subdomain;
        if (!subdomain) {
            throw new Error('Zendesk subdomain not found in account settings');
        }
        return subdomain;
    },

    /**
     * Fetch tickets from Zendesk
     */
    getTickets: async (account: IConnectedAccount, status?: string): Promise<ZendeskTicket[]> => {
        try {
            const subdomain = zendeskService.getSubdomain(account);
            let url = `https://${subdomain}.zendesk.com/api/v2/tickets.json`;

            // If status provided, use search or specific view (simplified here to basic list)
            // For better filtering, we might use /search.json?query=type:ticket status:${status}

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.tickets;
        } catch (error: any) {
            console.error('Error fetching Zendesk tickets:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Search tickets (e.g. by term)
     */
    searchTickets: async (account: IConnectedAccount, query: string): Promise<ZendeskTicket[]> => {
        try {
            const subdomain = zendeskService.getSubdomain(account);
            const response = await axios.get(`https://${subdomain}.zendesk.com/api/v2/search.json`, {
                params: {
                    query: `type:ticket ${query}`
                },
                headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.results;
        } catch (error: any) {
            console.error('Error searching Zendesk tickets:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Get current user (me)
     */
    getCurrentUser: async (account: IConnectedAccount): Promise<ZendeskUser> => {
        try {
            const subdomain = zendeskService.getSubdomain(account);
            const response = await axios.get(`https://${subdomain}.zendesk.com/api/v2/users/me.json`, {
                headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.user;
        } catch (error: any) {
            console.error('Error fetching Zendesk user:', error.response?.data || error.message);
            throw error;
        }
    },
    /**
     * Get single ticket details
     */
    getTicketDetails: async (account: IConnectedAccount, ticketId: string | number): Promise<any> => {
        try {
            const subdomain = zendeskService.getSubdomain(account);
            // Side-load users, groups, organizations for full context
            const response = await axios.get(`https://${subdomain}.zendesk.com/api/v2/tickets/${ticketId}.json?include=users,groups,organizations`, {
                headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data; // Returns { ticket: {}, users: [], groups: [], organizations: [] }
        } catch (error: any) {
            console.error('Error fetching Zendesk ticket details:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Get ticket comments (conversation)
     */
    getTicketComments: async (account: IConnectedAccount, ticketId: string | number): Promise<any> => {
        try {
            const subdomain = zendeskService.getSubdomain(account);
            // Side-load users to get author details
            const response = await axios.get(`https://${subdomain}.zendesk.com/api/v2/tickets/${ticketId}/comments.json?include=users`, {
                headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data; // Returns { comments: [], users: [] }
        } catch (error: any) {
            console.error('Error fetching Zendesk ticket comments:', error.response?.data || error.message);
            throw error;
        }
    }
};
