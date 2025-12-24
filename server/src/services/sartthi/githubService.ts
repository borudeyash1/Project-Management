import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string;
    owner: {
        login: string;
        avatar_url: string;
    };
}

interface GitHubPR {
    id: number;
    number: number;
    title: string;
    state: string;
    html_url: string;
    user: {
        login: string;
        avatar_url: string;
    };
    created_at: string;
}

const GITHUB_API_BASE = 'https://api.github.com';

const getAccessToken = async (userId: string): Promise<string> => {
    const account = await ConnectedAccount.findOne({
        userId,
        service: 'github',
        isActive: true
    });

    if (!account || !account.accessToken) {
        throw new Error('No active GitHub account found');
    }

    return account.accessToken;
};

const getHeaders = (accessToken: string) => ({
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github.v3+json'
});

interface IGitHubService {
    getRepositories(userId: string): Promise<GitHubRepo[]>;
    getPullRequests(userId: string, owner: string, repo: string): Promise<GitHubPR[]>;
}

export const getGitHubService = (): IGitHubService => {
    return {
        async getRepositories(userId: string): Promise<GitHubRepo[]> {
            const accessToken = await getAccessToken(userId);
            // Fetch repos where the user is an owner or collaborator
            // Using /user/repos?sort=updated for most relevant
            const response = await axios.get<GitHubRepo[]>(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=100`, {
                headers: getHeaders(accessToken)
            });
            return response.data;
        },

        async getPullRequests(userId: string, owner: string, repo: string): Promise<GitHubPR[]> {
            const accessToken = await getAccessToken(userId);
            const response = await axios.get<GitHubPR[]>(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=all&sort=updated&per_page=50`, {
                headers: getHeaders(accessToken)
            });
            return response.data;
        }
    };
};
