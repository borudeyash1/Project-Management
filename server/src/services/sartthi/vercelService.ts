import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';

const VERCEL_API_URL = 'https://api.vercel.com/v9';

export const getVercelService = () => {

    const getAccessToken = async (userId: string, accountId?: string) => {
        let query: any = { userId, service: 'vercel' };
        if (accountId) query._id = accountId;
        else query.isActive = true;

        const account = await ConnectedAccount.findOne(query);
        if (!account || !account.accessToken) throw new Error('Vercel account not connected');
        return account.accessToken;
    };

    const listProjects = async (userId: string, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.get(`${VERCEL_API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.projects.map((p: any) => ({
                id: p.id,
                name: p.name,
                framework: p.framework,
                link: p.targets?.production?.url ? `https://${p.targets.production.url}` : null,
                latestDeployment: p.latestDeployments?.[0]?.readyState
            }));
        } catch (error: any) {
            console.error('Vercel listProjects error:', error.response?.data || error.message);
            throw error;
        }
    };

    return { listProjects };
};
