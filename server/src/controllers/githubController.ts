import { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { getGitHubService } from '../services/sartthi/githubService';
import { syncPRToTask, syncIssueToTask } from '../services/githubSync';

// Link a repository to a project
export const linkRepoToProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { owner, repo, autoCreateTasks, syncStatus } = req.body;
        const userId = (req as any).user._id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check permission - must be project creator, owner, or project-manager
        const isCreator = project.createdBy.toString() === userId.toString();
        const userMember = project.teamMembers.find(m => m.user.toString() === userId.toString());
        const allowedRoles = ['owner', 'project-manager'];
        const hasPermission = isCreator || (userMember && allowedRoles.includes(userMember.role));
        
        if (!hasPermission) {
            return res.status(403).json({ success: false, message: 'Not authorized. Only project creators, owners, and managers can link repositories.' });
        }

        // Check if a repository is already linked (only one repo allowed)
        if (project.integrations?.github?.repos && project.integrations.github.repos.length > 0) {
            return res.status(400).json({ success: false, message: 'Only one repository can be linked per project. Please unlink the existing repository first.' });
        }

        const fullName = `${owner}/${repo}`;

        // Verify repo access
        const githubService = getGitHubService();
        try {
            // Try to fetch repo details to verify access
            await githubService.getRepositories(userId.toString());
            // We could filter to check if specific repo is accessible, but getRepositories returns list.
            // A better check might be to try getting PRs or Issues for that repo.
            await githubService.getPullRequests(userId.toString(), owner, repo);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Cannot verify repository access. Ensure GitHub is connected and you have access.' });
        }

        if (!project.integrations) {
            project.integrations = {};
        }

        if (!project.integrations.github) {
            project.integrations.github = { repos: [] };
        }

        if (!project.integrations.github.repos) {
            project.integrations.github.repos = [];
        }

        project.integrations.github.repos.push({
            owner,
            repo,
            fullName,
            autoCreateTasks: autoCreateTasks ?? true,
            syncStatus: syncStatus ?? true,
            linkedAt: new Date(),
            syncErrors: []
        });

        await project.save();

        return res.json({
            success: true,
            data: project.integrations.github.repos
        });

    } catch (error: any) {
        console.error('Error linking repo:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Unlink a repository
export const unlinkRepoFromProject = async (req: Request, res: Response) => {
    try {
        const { projectId, repoId } = req.params;
        const userId = (req as any).user._id; // Permission check needed

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        if (!project.integrations?.github?.repos) {
            return res.status(400).json({ success: false, message: 'No repos linked' });
        }

        // Remove repo
        project.integrations.github.repos = project.integrations.github.repos.filter(
            (r: any) => r._id.toString() !== repoId
        );

        await project.save();
        return res.json({ success: true, message: 'Repository unlinked' });

    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update repo settings
export const updateRepoSettings = async (req: Request, res: Response) => {
    try {
        const { projectId, repoId } = req.params;
        const { autoCreateTasks, syncStatus } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        const repo = project.integrations?.github?.repos?.find((r: any) => r._id.toString() === repoId);
        if (!repo) return res.status(404).json({ success: false, message: 'Repository link not found' });

        if (autoCreateTasks !== undefined) repo.autoCreateTasks = autoCreateTasks;
        if (syncStatus !== undefined) repo.syncStatus = syncStatus;

        await project.save();
        return res.json({ success: true, data: repo });

    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


// Link PR to Task manually
export const linkPrToTask = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const { owner, repo, number, enableSync } = req.body;
        const userId = (req as any).user._id;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const githubService = getGitHubService();

        // Fetch PR details
        const pr = await githubService.getPullRequest(userId, owner, repo, number);

        task.githubPr = {
            id: pr.id,
            number: pr.number,
            title: pr.title,
            url: pr.html_url,
            state: pr.state as any,
            repo: `${owner}/${repo}`,
            author: pr.user.login,
            createdAt: new Date(pr.created_at),
            updatedAt: new Date(),
            syncEnabled: enableSync ?? true
        };

        await task.save();
        return res.json({ success: true, data: task });

    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Create GitHub Issue from Task
export const createIssueFromTask = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const { repoId, title, body } = req.body; // repoId is ID of linked repo in project
        const userId = (req as any).user._id;

        const task = await Task.findById(taskId).populate('project');
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const project = task.project as any;
        const linkedRepo = project.integrations.github?.repos?.find((r: any) => r._id.toString() === repoId);

        if (!linkedRepo) return res.status(400).json({ success: false, message: 'Target repository not linked to project' });

        const { owner, repo } = linkedRepo;

        const githubService = getGitHubService();
        const issue = await githubService.createIssue(userId, owner, repo, { title: title || task.title, body: body || task.description });

        task.githubIssue = {
            id: issue.id,
            number: issue.number,
            title: issue.title,
            url: issue.html_url,
            state: issue.state,
            repo: `${owner}/${repo}`,
            syncEnabled: true
        };

        await task.save();

        return res.json({ success: true, data: task });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Get recent commits from linked repositories
export const getRecentCommits = async (req: Request, res: Response) => {
    try {
        const { projectId, author, limit = 20 } = req.query;
        const userId = (req as any).user._id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const linkedRepos = project.integrations?.github?.repos || [];
        if (linkedRepos.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const githubService = getGitHubService();
        const allCommits: any[] = [];

        for (const repo of linkedRepos) {
            const [owner, repoName] = repo.fullName.split('/');
            if (!owner || !repoName) continue;

            try {
                const commits = await githubService.getCommits(
                    userId,
                    owner,
                    repoName,
                    { author: author as string, per_page: Number(limit) }
                );

                allCommits.push(...commits.map((commit: any) => ({
                    sha: commit.sha,
                    message: commit.commit.message,
                    author: {
                        name: commit.commit.author.name,
                        username: commit.author?.login,
                        avatar: commit.author?.avatar_url
                    },
                    url: commit.html_url,
                    timestamp: commit.commit.author.date,
                    repo: repo.fullName
                })));
            } catch (error) {
                console.error(`Failed to fetch commits from ${repo.fullName}:`, error);
            }
        }

        allCommits.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return res.json({
            success: true,
            data: allCommits.slice(0, Number(limit))
        });
    } catch (error: any) {
        console.error('Error fetching commits:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

