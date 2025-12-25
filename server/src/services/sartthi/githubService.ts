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

const getAccessToken = async (userId: string, accountId?: string): Promise<string> => {
    let query: any = {
        userId,
        service: 'github'
    };

    if (accountId) {
        query._id = accountId;
    } else {
        query.isActive = true;
    }

    const account = await ConnectedAccount.findOne(query);

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
    getRepositories(userId: string, accountId?: string): Promise<GitHubRepo[]>;
    getPullRequests(userId: string, owner: string, repo: string, accountId?: string): Promise<GitHubPR[]>;
    getIssues(userId: string, owner: string, repo: string, accountId?: string): Promise<any[]>;
    addComment(userId: string, owner: string, repo: string, number: number, body: string, accountId?: string): Promise<any>;
    addLabel(userId: string, owner: string, repo: string, number: number, labels: string[], accountId?: string): Promise<any>;
}

export const getGitHubService = (): IGitHubService => {
    return {
        async getRepositories(userId: string, accountId?: string): Promise<GitHubRepo[]> {
            const accessToken = await getAccessToken(userId, accountId);
            const response = await axios.get<GitHubRepo[]>(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=100`, {
                headers: getHeaders(accessToken)
            });
            return response.data;
        },

        async getPullRequests(userId: string, owner: string, repo: string, accountId?: string): Promise<GitHubPR[]> {
            const accessToken = await getAccessToken(userId, accountId);
            const response = await axios.get<GitHubPR[]>(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=all&sort=updated&per_page=50`, {
                headers: getHeaders(accessToken)
            });
            return response.data;
        },

        async getIssues(userId: string, owner: string, repo: string, accountId?: string): Promise<any[]> {
            const accessToken = await getAccessToken(userId, accountId);
            const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=all&sort=updated&per_page=50`, {
                headers: getHeaders(accessToken)
            });
            return response.data;
        },

        async addComment(userId: string, owner: string, repo: string, number: number, body: string, accountId?: string): Promise<any> {
            const accessToken = await getAccessToken(userId, accountId);
            const response = await axios.post(
                `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${number}/comments`,
                { body },
                { headers: getHeaders(accessToken) }
            );
            return response.data;
        },

        async addLabel(userId: string, owner: string, repo: string, number: number, labels: string[], accountId?: string): Promise<any> {
            const accessToken = await getAccessToken(userId, accountId);
            const response = await axios.post(
                `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${number}/labels`,
                { labels },
                { headers: getHeaders(accessToken) }
            );
            return response.data;
        }
    };
};
