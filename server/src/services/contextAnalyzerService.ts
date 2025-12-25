import mongoose from 'mongoose';

/**
 * Context Types for different pages
 */
export type PageType = 'workspace' | 'project';

export type WorkspaceSubPage =
    | 'overview'
    | 'members'
    | 'attendance'
    | 'projects'
    | 'clients'
    | 'profile'
    | 'inbox';

export type ProjectSubPage =
    | 'overview'
    | 'info'
    | 'team'
    | 'tasks'
    | 'timeline'
    | 'progress'
    | 'workload'
    | 'reports'
    | 'documents';

export type UserRole =
    | 'owner'
    | 'admin'
    | 'manager'
    | 'project-manager'
    | 'member'
    | 'viewer'
    | 'developer'
    | 'designer'
    | 'tester'
    | 'analyst'
    | 'qa-engineer'
    | 'devops';

export interface PageContext {
    pageType: PageType;
    pageId: string;
    subPage: WorkspaceSubPage | ProjectSubPage;
    userRole: UserRole;
    userId: string;
}

export interface ContextData {
    context: PageContext;
    aggregatedData: any;
    relevantFields: string[];
    tokenEstimate: number;
}

/**
 * Context Analyzer Service
 * Detects page context and aggregates relevant data for AI processing
 */
class ContextAnalyzerService {
    /**
     * Analyze workspace context and extract relevant data
     */
    async analyzeWorkspaceContext(
        workspaceId: string,
        subPage: WorkspaceSubPage,
        userId: string,
        pageData?: any
    ): Promise<ContextData> {
        const Workspace = (await import('../models/Workspace')).default;

        // Get workspace and user's role
        const workspace = await Workspace.findById(workspaceId)
            .select('name description members settings subscription')
            .lean();

        if (!workspace) {
            throw new Error('Workspace not found');
        }

        const member = workspace.members.find(
            (m: any) => m.user.toString() === userId
        );
        const userRole = (member?.role || 'member') as UserRole;

        // Aggregate data based on sub-page
        let aggregatedData: any = {};
        let relevantFields: string[] = [];

        switch (subPage) {
            case 'overview':
                aggregatedData = await this.aggregateWorkspaceOverview(workspaceId, pageData);
                relevantFields = ['memberCount', 'activeProjects', 'recentActivity', 'attendanceRate'];
                break;

            case 'members':
                aggregatedData = await this.aggregateWorkspaceMembers(workspaceId, pageData);
                relevantFields = ['totalMembers', 'roleDistribution', 'activeMembers'];
                break;

            case 'attendance':
                aggregatedData = await this.aggregateWorkspaceAttendance(workspaceId, pageData);
                relevantFields = ['attendanceRate', 'presentToday', 'absentMembers', 'trends'];
                break;

            case 'projects':
                aggregatedData = await this.aggregateWorkspaceProjects(workspaceId, pageData);
                relevantFields = ['totalProjects', 'statusDistribution', 'atRiskProjects'];
                break;

            case 'profile':
                aggregatedData = {
                    workspaceName: workspace.name,
                    description: workspace.description,
                    memberCount: workspace.members.filter((m: any) => m.status === 'active').length,
                    subscription: workspace.subscription?.plan || 'free',
                    settings: workspace.settings
                };
                relevantFields = ['workspaceName', 'subscription', 'memberCount'];
                break;

            case 'inbox':
                aggregatedData = await this.aggregateWorkspaceInbox(workspaceId, userId, pageData);
                relevantFields = ['unreadCount', 'activeThreads', 'recentMessages'];
                break;

            default:
                aggregatedData = { workspaceName: workspace.name };
                relevantFields = ['workspaceName'];
        }

        const tokenEstimate = this.estimateTokens(aggregatedData);

        return {
            context: {
                pageType: 'workspace',
                pageId: workspaceId,
                subPage,
                userRole,
                userId
            },
            aggregatedData,
            relevantFields,
            tokenEstimate
        };
    }

    /**
     * Analyze project context and extract relevant data
     */
    async analyzeProjectContext(
        projectId: string,
        subPage: ProjectSubPage,
        userId: string,
        pageData?: any
    ): Promise<ContextData> {
        const Project = (await import('../models/Project')).default;

        // Get project and user's role
        const project = await Project.findById(projectId)
            .select('name description teamMembers status priority progress budget dueDate')
            .lean();

        if (!project) {
            throw new Error('Project not found');
        }

        const member = project.teamMembers.find(
            (m: any) => m.user.toString() === userId
        );
        const userRole = (member?.role || 'member') as UserRole;

        // Aggregate data based on sub-page
        let aggregatedData: any = {};
        let relevantFields: string[] = [];

        switch (subPage) {
            case 'overview':
                aggregatedData = await this.aggregateProjectOverview(projectId, pageData);
                relevantFields = ['projectName', 'status', 'progress', 'teamSize', 'recentTasks'];
                break;

            case 'info':
                aggregatedData = {
                    projectName: project.name,
                    description: project.description,
                    status: project.status,
                    priority: project.priority,
                    budget: project.budget,
                    dueDate: project.dueDate,
                    progress: project.progress
                };
                relevantFields = ['projectName', 'status', 'priority', 'budget', 'dueDate'];
                break;

            case 'team':
                aggregatedData = await this.aggregateProjectTeam(projectId, pageData);
                relevantFields = ['teamSize', 'roleDistribution', 'activeMembers'];
                break;

            case 'tasks':
                aggregatedData = await this.aggregateProjectTasks(projectId, pageData);
                relevantFields = ['totalTasks', 'statusDistribution', 'blockedTasks', 'upcomingDeadlines'];
                break;

            case 'workload':
                aggregatedData = await this.aggregateProjectWorkload(projectId, pageData);
                relevantFields = ['teamWorkload', 'overloadedMembers', 'availableCapacity'];
                break;

            case 'progress':
                aggregatedData = await this.aggregateProjectProgress(projectId, pageData);
                relevantFields = ['completionRate', 'velocity', 'milestones', 'trends'];
                break;

            case 'timeline':
                aggregatedData = await this.aggregateProjectTimeline(projectId, pageData);
                relevantFields = ['milestones', 'upcomingDeadlines', 'delays'];
                break;

            case 'reports':
                aggregatedData = await this.aggregateProjectReports(projectId, pageData);
                relevantFields = ['performanceMetrics', 'trends', 'insights'];
                break;

            default:
                aggregatedData = { projectName: project.name, status: project.status };
                relevantFields = ['projectName', 'status'];
        }

        const tokenEstimate = this.estimateTokens(aggregatedData);

        return {
            context: {
                pageType: 'project',
                pageId: projectId,
                subPage,
                userRole,
                userId
            },
            aggregatedData,
            relevantFields,
            tokenEstimate
        };
    }

    /**
     * Aggregate workspace overview data
     */
    private async aggregateWorkspaceOverview(workspaceId: string, pageData?: any): Promise<any> {
        // Use pageData if provided (already loaded on frontend)
        if (pageData) {
            return {
                workspaceName: pageData.workspaceName,
                memberCount: pageData.memberCount || 0,
                activeProjects: pageData.activeProjects || 0,
                attendanceRate: pageData.attendanceRate || 0,
                recentActivity: pageData.recentActivity?.slice(0, 5) || []
            };
        }

        // Fallback: fetch minimal data
        const Workspace = (await import('../models/Workspace')).default;
        const workspace = await Workspace.findById(workspaceId).select('name members').lean();

        return {
            workspaceName: workspace?.name || 'Unknown',
            memberCount: workspace?.members.filter((m: any) => m.status === 'active').length || 0
        };
    }

    /**
     * Aggregate workspace members data
     */
    private async aggregateWorkspaceMembers(workspaceId: string, pageData?: any): Promise<any> {
        if (pageData?.members) {
            const members = pageData.members;
            const roleDistribution = members.reduce((acc: any, m: any) => {
                acc[m.role] = (acc[m.role] || 0) + 1;
                return acc;
            }, {});

            return {
                totalMembers: members.length,
                roleDistribution,
                activeMembers: members.filter((m: any) => m.status === 'active').length
            };
        }

        return { totalMembers: 0 };
    }

    /**
     * Aggregate workspace attendance data
     */
    private async aggregateWorkspaceAttendance(workspaceId: string, pageData?: any): Promise<any> {
        if (pageData?.attendance) {
            const attendance = pageData.attendance;
            return {
                attendanceRate: attendance.rate || 0,
                presentToday: attendance.present || 0,
                absentMembers: attendance.absent || [],
                trends: attendance.trends || 'stable'
            };
        }

        return { attendanceRate: 0 };
    }

    /**
     * Aggregate workspace projects data
     */
    private async aggregateWorkspaceProjects(workspaceId: string, pageData?: any): Promise<any> {
        if (pageData?.projects) {
            const projects = pageData.projects;
            const statusDistribution = projects.reduce((acc: any, p: any) => {
                acc[p.status] = (acc[p.status] || 0) + 1;
                return acc;
            }, {});

            const atRiskProjects = projects.filter((p: any) =>
                p.status === 'active' && p.progress < 50 && new Date(p.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            );

            return {
                totalProjects: projects.length,
                statusDistribution,
                atRiskProjects: atRiskProjects.map((p: any) => ({
                    name: p.name,
                    progress: p.progress,
                    dueDate: p.dueDate
                }))
            };
        }

        return { totalProjects: 0 };
    }

    /**
     * Aggregate workspace inbox data
     */
    private async aggregateWorkspaceInbox(workspaceId: string, userId: string, pageData?: any): Promise<any> {
        if (pageData?.threads) {
            return {
                unreadCount: pageData.unreadCount || 0,
                activeThreads: pageData.threads.length || 0,
                recentMessages: pageData.threads.slice(0, 5).map((t: any) => ({
                    from: t.from,
                    preview: t.lastMessage?.substring(0, 50)
                }))
            };
        }

        return { unreadCount: 0, activeThreads: 0 };
    }

    /**
     * Aggregate project overview data
     */
    private async aggregateProjectOverview(projectId: string, pageData?: any): Promise<any> {
        if (pageData) {
            return {
                projectName: pageData.projectName,
                status: pageData.status,
                progress: pageData.progress || 0,
                teamSize: pageData.teamSize || 0,
                recentTasks: pageData.recentTasks?.slice(0, 5) || []
            };
        }

        const Project = (await import('../models/Project')).default;
        const project = await Project.findById(projectId).select('name status progress teamMembers').lean();

        return {
            projectName: project?.name || 'Unknown',
            status: project?.status || 'unknown',
            progress: project?.progress || 0,
            teamSize: project?.teamMembers.length || 0
        };
    }

    /**
     * Aggregate project team data
     */
    private async aggregateProjectTeam(projectId: string, pageData?: any): Promise<any> {
        if (pageData?.teamMembers) {
            const members = pageData.teamMembers;
            const roleDistribution = members.reduce((acc: any, m: any) => {
                acc[m.role] = (acc[m.role] || 0) + 1;
                return acc;
            }, {});

            return {
                teamSize: members.length,
                roleDistribution,
                activeMembers: members.length
            };
        }

        return { teamSize: 0 };
    }

    /**
     * Aggregate project tasks data
     */
    private async aggregateProjectTasks(projectId: string, pageData?: any): Promise<any> {
        if (pageData?.tasks) {
            const tasks = pageData.tasks;
            const statusDistribution = tasks.reduce((acc: any, t: any) => {
                acc[t.status] = (acc[t.status] || 0) + 1;
                return acc;
            }, {});

            const blockedTasks = tasks.filter((t: any) => t.status === 'blocked');
            const upcomingDeadlines = tasks
                .filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
                .slice(0, 5);

            return {
                totalTasks: tasks.length,
                statusDistribution,
                blockedTasks: blockedTasks.map((t: any) => ({ title: t.title, reason: t.blockReason })),
                upcomingDeadlines: upcomingDeadlines.map((t: any) => ({ title: t.title, dueDate: t.dueDate }))
            };
        }

        return { totalTasks: 0 };
    }

    /**
     * Aggregate project workload data (CRITICAL for managers)
     */
    private async aggregateProjectWorkload(projectId: string, pageData?: any): Promise<any> {
        if (pageData?.workload) {
            const workload = pageData.workload;

            const overloadedMembers = workload.filter((w: any) =>
                w.assignedTasks > (w.capacity || 10)
            );

            const availableCapacity = workload.filter((w: any) =>
                w.assignedTasks < (w.capacity || 10)
            );

            return {
                teamWorkload: workload.map((w: any) => ({
                    name: w.memberName,
                    role: w.role,
                    assignedTasks: w.assignedTasks,
                    capacity: w.capacity || 10,
                    utilizationRate: ((w.assignedTasks / (w.capacity || 10)) * 100).toFixed(0)
                })),
                overloadedMembers: overloadedMembers.map((w: any) => ({
                    name: w.memberName,
                    assignedTasks: w.assignedTasks,
                    capacity: w.capacity,
                    excess: w.assignedTasks - w.capacity
                })),
                availableCapacity: availableCapacity.map((w: any) => ({
                    name: w.memberName,
                    available: w.capacity - w.assignedTasks
                }))
            };
        }

        return { teamWorkload: [] };
    }

    /**
     * Aggregate project progress data
     */
    private async aggregateProjectProgress(projectId: string, pageData?: any): Promise<any> {
        if (pageData) {
            return {
                completionRate: pageData.completionRate || 0,
                velocity: pageData.velocity || 0,
                milestones: pageData.milestones?.slice(0, 5) || [],
                trends: pageData.trends || 'stable'
            };
        }

        return { completionRate: 0 };
    }

    /**
     * Aggregate project timeline data
     */
    private async aggregateProjectTimeline(projectId: string, pageData?: any): Promise<any> {
        if (pageData?.milestones) {
            const upcomingDeadlines = pageData.milestones
                .filter((m: any) => new Date(m.dueDate) > new Date())
                .slice(0, 5);

            const delays = pageData.milestones
                .filter((m: any) => m.status === 'delayed');

            return {
                milestones: pageData.milestones.length,
                upcomingDeadlines: upcomingDeadlines.map((m: any) => ({
                    name: m.name,
                    dueDate: m.dueDate
                })),
                delays: delays.map((m: any) => ({ name: m.name, delayDays: m.delayDays }))
            };
        }

        return { milestones: 0 };
    }

    /**
     * Aggregate project reports data
     */
    private async aggregateProjectReports(projectId: string, pageData?: any): Promise<any> {
        if (pageData?.metrics) {
            return {
                performanceMetrics: pageData.metrics,
                trends: pageData.trends || {},
                insights: pageData.insights || []
            };
        }

        return { performanceMetrics: {} };
    }

    /**
     * Estimate token count for aggregated data
     */
    private estimateTokens(data: any): number {
        const jsonString = JSON.stringify(data);
        // Rough estimate: 1 token ≈ 4 characters
        return Math.ceil(jsonString.length / 4);
    }
}

export const contextAnalyzerService = new ContextAnalyzerService();
export default contextAnalyzerService;
