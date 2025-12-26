import { syncPRToTask } from '../services/githubSync';
import Task from '../models/Task';
import Project from '../models/Project';
import User from '../models/User';

jest.mock('../models/Task');
jest.mock('../models/Project');
jest.mock('../models/User');

describe('syncPRToTask', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create task if auto-create is enabled', async () => {
        // Mock data setup
        (Project.findById as jest.Mock).mockResolvedValue({
            _id: 'project1',
            workspace: 'workspace1',
            createdBy: 'user1',
            integrations: {
                github: {
                    repos: [{ fullName: 'owner/repo', autoCreateTasks: true }]
                }
            }
        });
        (Task.findOne as jest.Mock).mockResolvedValue(null);
        (Task.create as jest.Mock).mockResolvedValue({ _id: 'task1', title: 'Test PR' });
        (User.findOne as jest.Mock).mockResolvedValue(null); // No mapping found

        const pr: any = {
            id: 101,
            number: 1,
            title: 'Test PR',
            body: 'Body',
            html_url: 'http://url',
            state: 'open',
            user: { login: 'ghuser1' },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const repo: any = { full_name: 'owner/repo', name: 'repo' };

        const result = await syncPRToTask(pr, repo, 'project1');

        expect(Project.findById).toHaveBeenCalledWith('project1');
        expect(Task.create).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Test PR',
            autoCreated: true
        }));
        expect(result).toBeDefined();
    });

    it('should skip if auto-create is disabled', async () => {
        (Project.findById as jest.Mock).mockResolvedValue({
            _id: 'project1',
            integrations: {
                github: {
                    repos: [{ fullName: 'owner/repo', autoCreateTasks: false }]
                }
            }
        });

        const pr: any = { number: 1, title: 'Test PR', user: { login: 'user1' } };
        const repo: any = { full_name: 'owner/repo', name: 'repo' };

        const result = await syncPRToTask(pr, repo, 'project1');
        expect(Task.create).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });
});
