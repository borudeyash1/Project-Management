import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';

const FIGMA_API_URL = 'https://api.figma.com/v1';

export const getFigmaService = () => {

    const getAccessToken = async (userId: string, accountId?: string) => {
        let query: any = { userId, service: 'figma' };
        if (accountId) query._id = accountId;
        else query.isActive = true;

        const account = await ConnectedAccount.findOne(query);
        if (!account || !account.accessToken) throw new Error('Figma account not connected');
        return account.accessToken;
    };

    const getTeamProjects = async (userId: string, teamId: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.get(`${FIGMA_API_URL}/teams/${teamId}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.projects;
        } catch (error: any) {
            console.error('Figma getTeamProjects error:', error.response?.data || error.message);
            throw error;
        }
    };

    const getProjectFiles = async (userId: string, projectId: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.get(`${FIGMA_API_URL}/projects/${projectId}/files`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.files;
        } catch (error: any) {
            console.error('Figma getProjectFiles error:', error.response?.data || error.message);
            throw error;
        }
    };

    // Helper to get current user's teams/files is tricky in Figma API as there isn't a direct "my files" endpoint 
    // without knowing team ID. We might need to ask user for Team ID or use a different approach.
    // For now, we'll expose an endpoint to get "me" to find team ID or assume user knows it.
    const getMe = async (userId: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.get(`${FIGMA_API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Figma getMe error:', error.response?.data || error.message);
            throw error;
        }
    }

    return { getTeamProjects, getProjectFiles, getMe };
};
