import { apiService } from './api';

export interface ZendeskTicket {
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

export const zendeskService = {
    getRecentTickets: async (): Promise<ZendeskTicket[]> => {
        const response = await apiService.get('/zendesk/tickets');
        if (response.success) {
            return response.data;
        }
        return [];
    },

    searchTickets: async (query: string): Promise<ZendeskTicket[]> => {
        const response = await apiService.get(`/zendesk/search?query=${encodeURIComponent(query)}`);
        if (response.success) {
            return response.data;
        }
        return [];
    },

    getTicketDetails: async (ticketId: string | number): Promise<any> => {
        const response = await apiService.get(`/zendesk/tickets/${ticketId}`);
        if (response.success) {
            return response.data;
        }
        throw new Error(response.message || 'Failed to fetch ticket details');
    },

    getTicketComments: async (ticketId: string | number): Promise<any> => {
        const response = await apiService.get(`/zendesk/tickets/${ticketId}/comments`);
        if (response.success) {
            return response.data;
        }
        throw new Error(response.message || 'Failed to fetch ticket comments');
    }
};
