import request from 'supertest';
import express from 'express';
import { linkRepoToProject } from '../controllers/githubController';
import Project from '../models/Project';
import { getGitHubService } from '../services/sartthi/githubService';

jest.mock('../models/Project');
jest.mock('../services/sartthi/githubService');

const app = express();
app.use(express.json());
// Mock auth middleware putting user in req
app.use((req: any, res, next) => {
    req.user = { id: 'user1' };
    next();
});
app.post('/api/github/projects/:projectId/link-repo', linkRepoToProject);

describe('GitHub Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should link repo successfully', async () => {
        const mockProject = {
            _id: 'project1',
            teamMembers: [{ user: 'user1' }],
            integrations: { github: { repos: [] } },
            save: jest.fn()
        };
        (Project.findById as jest.Mock).mockResolvedValue(mockProject);

        const mockGithubService = {
            getRepositories: jest.fn().mockResolvedValue([]),
            getPullRequests: jest.fn().mockResolvedValue([])
        };
        (getGitHubService as jest.Mock).mockReturnValue(mockGithubService);

        const response = await request(app)
            .post('/api/github/projects/project1/link-repo')
            .send({ owner: 'owner', repo: 'repo' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Project.findById).toHaveBeenCalled();
        expect(mockProject.save).toHaveBeenCalled();
    });

    it('should return 404 if project not found', async () => {
        (Project.findById as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .post('/api/github/projects/project1/link-repo')
            .send({ owner: 'owner', repo: 'repo' });

        expect(response.status).toBe(404);
    });
});
