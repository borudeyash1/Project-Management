import mongoose from 'mongoose';

/**
 * Context Types for different pages
 */
export type PageType = 'workspace' | 'project';

export type WorkspaceSubPage = 'overview' | 'members' | 'attendance' | 'projects' | 'profile' | 'inbox' | 'clients' | 'design' | 'jira' | 'notion' | 'zendesk' | 'slack' | 'linear';
export type ProjectSubPage = 'overview' | 'info' | 'team' | 'tasks' | 'workload' | 'progress' | 'timeline' | 'reports' | 'documents' | 'inbox' | 'design';
export type GlobalPage = 'home' | 'projects' | 'workspace' | 'planner' | 'notifications' | 'reminders' | 'goals' | 'settings' | 'profile' | 'reports' | 'calendar' | 'notes';

export type UserRole =
    | 'owner' | 'admin' | 'manager' | 'project-manager'
    | 'member' | 'viewer' | 'developer' | 'designer'
    | 'tester' | 'analyst' | 'qa-engineer' | 'devops';

export interface PageContext {
    pageType: 'workspace' | 'project' | 'global';
    pageId?: string; // Optional for global pages
    subPage: WorkspaceSubPage | ProjectSubPage | GlobalPage;
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
    async analyzeContext(context: PageContext, data?: any): Promise<any> {
        const { pageType, pageId, subPage, userId } = context;

        let aggregatedData = {};
        let relevantFields: string[] = [];

        // Handle Global Pages (No Workspace/Project ID needed)
        if (pageType === 'global') {
            switch (subPage) {
                case 'planner':
                    aggregatedData = await this.aggregatePlannerContext(userId);
                    relevantFields = ['tasks', 'schedule', 'priorities'];
                    break;
                case 'notifications':
                    aggregatedData = await this.aggregateNotificationsContext(userId);
                    relevantFields = ['unread', 'urgent', 'updates'];
                    break;
                case 'reminders':
                    aggregatedData = await this.aggregateRemindersContext(userId);
                    relevantFields = ['upcoming', 'overdue'];
                    break;
                case 'goals':
                    aggregatedData = await this.aggregateGoalsContext(userId);
                    relevantFields = ['shortTerm', 'longTerm', 'progress'];
                    break;
                case 'settings':
                case 'profile':
                    aggregatedData = await this.aggregateProfileContext(userId);
                    relevantFields = ['preferences', 'account'];
                    break;
                case 'reports':
                    aggregatedData = await this.aggregateReportsContext(userId);
                    relevantFields = ['performance', 'activity'];
                    break;
                case 'calendar':
                    aggregatedData = await this.aggregateCalendarContext(userId);
                    relevantFields = ['upcomingEvents', 'conflicts'];
                    break;
                case 'home':
                    aggregatedData = await this.aggregateHomeContext(userId);
                    relevantFields = ['recentTasks', 'upcomingDeadlines', 'recentProjects'];
                    break;
                case 'projects':
                    aggregatedData = await this.aggregateGlobalProjectsContext(userId);
                    relevantFields = ['allProjects', 'statusSummary'];
                    break;
                case 'workspace':
                    aggregatedData = await this.aggregateGlobalWorkspaceContext(userId);
                    relevantFields = ['allWorkspaces', 'invitations'];
                    break;
                case 'notes':
                    aggregatedData = await this.aggregateNotesContext(userId);
                    relevantFields = ['recentNotes'];
                    break;
                default:
                    aggregatedData = { error: 'Unknown global context' };
            }
            return {
                context: context,
                aggregatedData,
                relevantFields,
                tokenEstimate: this.estimateTokens(aggregatedData)
            };
        }

        if (!pageId) throw new Error('Page ID required for workspace/project context');

        if (pageType === 'workspace') {
            return this.analyzeWorkspaceContext(pageId!, subPage as WorkspaceSubPage, userId, data);
        } else {
            return this.analyzeProjectContext(pageId!, subPage as ProjectSubPage, userId, data);
        }
    }

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
                aggregatedData = await this.aggregateWorkspaceOverview(workspaceId, userId, pageData);
                relevantFields = ['memberCount', 'activeProjects', 'recentActivity', 'attendanceRate', 'members', 'currentUser'];
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
     * Aggregate workspace overview data with Deep Context
     */
    private async aggregateWorkspaceOverview(workspaceId: string, userId: string, pageData?: any): Promise<any> {
        const Workspace = (await import('../models/Workspace')).default;
        const WorkspaceAttendance = (await import('../models/WorkspaceAttendance')).default;
        const Project = (await import('../models/Project')).default;

        // 1. Fetch Workspace with populated members to get full details
        const workspace = await Workspace.findById(workspaceId)
            .populate('members.user', 'firstName lastName email designation avatar')
            .lean();

        if (!workspace) {
            return { error: 'Workspace not found' };
        }

        // 2. Fetch Today's Attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextDay = new Date(today);
        nextDay.setDate(nextDay.getDate() + 1);

        const attendanceRecords = await WorkspaceAttendance.find({
            workspace: workspaceId,
            date: { $gte: today, $lt: nextDay }
        }).select('user status checkIn').lean();

        const attendanceMap = new Map();
        attendanceRecords.forEach((record: any) => {
            attendanceMap.set(record.user.toString(), record);
        });

        // 3. Process Members and identify Current User
        let currentUserProfile = null;
        const membersData = workspace.members.map((m: any) => {
            const user = m.user as any;
            if (!user) return null;

            const attRecord = attendanceMap.get(user._id.toString());
            const memberInfo = {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: m.role,
                designation: user.designation || 'N/A',
                status: m.status,
                attendance: attRecord ? attRecord.status : 'absent', // Assumption: no record = absent
                checkInTime: attRecord?.checkIn?.time ? new Date(attRecord.checkIn.time).toLocaleTimeString() : null
            };

            if (user._id.toString() === userId) {
                currentUserProfile = memberInfo;
            }

            return memberInfo;
        }).filter(Boolean);

        // 4. Fetch Active Projects Summary (Train it more!)
        const activeProjectsList = await Project.find({
            workspace: workspaceId,
            status: { $in: ['active', 'planning', 'in-progress'] }
        })
            .select('name status lead dueDate progress')
            .populate('lead', 'firstName lastName')
            .limit(10) // Limit to 10 to check token usage
            .lean();

        const projectsSummary = activeProjectsList.map((p: any) => ({
            name: p.name,
            status: p.status,
            lead: p.lead ? `${p.lead.firstName} ${p.lead.lastName}` : 'Unassigned',
            progress: p.progress,
            dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'No date'
        }));

        // 5. Calculate Stats
        const presentCount = attendanceRecords.filter((r: any) => r.status === 'present' || r.status === 'late').length;
        const wfhCount = attendanceRecords.filter((r: any) => r.status === 'work-from-home').length;
        // Simplified absent count logic based on total active members
        const activeMembersCount = membersData.length;
        const absentCount = activeMembersCount - presentCount - wfhCount;

        // 5. Use pageData for frontend-specific summaries if available, but mix with DB data
        const recentActivity = pageData?.recentActivity || [];
        const activeProjectsCount = pageData?.activeProjects || 0;

        return {
            workspaceName: workspace.name,
            description: workspace.description,
            stats: {
                totalMembers: activeMembersCount,
                attendanceRate: activeMembersCount > 0 ? Math.round(((presentCount + wfhCount) / activeMembersCount) * 100) : 0,
                activeProjects: activeProjectsCount,
                presentCount,
                wfhCount,
                absentCount
            },
            // The Deep Context Data
            members: membersData.map((m: any) => `${m.name} (${m.role}): ${m.attendance}`), // Simplified list for token efficiency, or pass full object? 
            // Better to pass structued data, the AI prompt generator handles stringification.
            detailedMembers: membersData,
            currentUser: currentUserProfile,
            projects: projectsSummary, // Added Projects
            recentActivity: recentActivity
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

    // ==================== GLOBAL CONTEXT AGGREGATORS ====================

    private async aggregatePlannerContext(userId: string): Promise<any> {
        try {
            const Task = (await import('../models/Task')).default;
            const PlannerEvent = (await import('../models/PlannerEvent')).default;
            const Reminder = (await import('../models/Reminder')).Reminder;
            const User = (await import('../models/User')).default;
            const JiraIssue = (await import('../models/JiraIssue')).default;
            const LinearIssue = (await import('../models/LinearIssue')).default;

            const now = new Date();
            const todayStart = new Date(now.setHours(0, 0, 0, 0));
            const todayEnd = new Date(now.setHours(23, 59, 59, 999));
            const weekEnd = new Date(todayStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            // Fetch all data in parallel
            const [allTasks, todayEvents, weekEvents, activeReminders, user, jiraIssues, linearIssues] = await Promise.all([
                // All pending tasks
                Task.find({
                    assignees: userId,
                    status: { $ne: 'completed' }
                })
                    .select('title status priority dueDate project')
                    .populate('project', 'name')
                    .sort({ dueDate: 1 })
                    .limit(20)
                    .lean(),

                // Today's events
                PlannerEvent.find({
                    $or: [
                        { createdBy: userId },
                        { 'participants.user': userId }
                    ],
                    start: { $gte: todayStart, $lt: todayEnd }
                })
                    .select('title start end allDay')
                    .sort({ start: 1 })
                    .lean(),

                // This week's events
                PlannerEvent.find({
                    $or: [
                        { createdBy: userId },
                        { 'participants.user': userId }
                    ],
                    start: { $gte: todayStart, $lt: weekEnd }
                })
                    .select('title start end allDay')
                    .sort({ start: 1 })
                    .lean(),

                // Active reminders
                Reminder.find({
                    createdBy: userId,
                    completed: false,
                    isActive: true,
                    dueDate: { $lte: weekEnd }
                })
                    .select('title type priority dueDate')
                    .sort({ dueDate: 1 })
                    .lean(),

                // User goals
                User.findById(userId).select('profile.goals').lean(),

                // Jira Issues (Assigned & Not Done)
                JiraIssue.find({
                    assignee: userId,
                    status: { $nin: ['Done', 'Closed', 'Resolved'] }
                })
                    .select('issueKey summary status priority')
                    .limit(10)
                    .lean(),

                // Linear Issues (Assigned & Not Completed)
                LinearIssue.find({
                    assignee: userId,
                    'state.type': { $nin: ['completed', 'canceled'] }
                })
                    .select('identifier title state priorityLabel')
                    .limit(10)
                    .lean()
            ]);

            // Categorize tasks (Local)
            const overdueTasks = allTasks.filter((t: any) =>
                t.dueDate && new Date(t.dueDate) < todayStart
            );
            const todayTasks = allTasks.filter((t: any) =>
                t.dueDate && new Date(t.dueDate) >= todayStart && new Date(t.dueDate) <= todayEnd
            );
            const weekTasks = allTasks.filter((t: any) =>
                t.dueDate && new Date(t.dueDate) > todayEnd && new Date(t.dueDate) <= weekEnd
            );

            // Slack Tasks (from local tasks)
            const slackTasks = allTasks.filter((t: any) => t.autoCreatedFrom === 'slack');

            // Categorize reminders
            const overdueReminders = activeReminders.filter((r: any) =>
                new Date(r.dueDate) < todayStart
            );

            // Calculate busy hours (simplified)
            const busyHours = todayEvents.map((e: any) => {
                const start = new Date(e.start);
                return `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')}`;
            });

            return {
                tasks: {
                    overdue: overdueTasks.map((t: any) => ({
                        title: t.title,
                        priority: t.priority,
                        due: new Date(t.dueDate).toLocaleDateString(),
                        project: t.project?.name || 'No Project'
                    })),
                    today: todayTasks.map((t: any) => ({
                        title: t.title,
                        priority: t.priority,
                        due: new Date(t.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        project: t.project?.name || 'No Project'
                    })),
                    thisWeek: weekTasks.map((t: any) => ({
                        title: t.title,
                        priority: t.priority,
                        due: new Date(t.dueDate).toLocaleDateString(),
                        project: t.project?.name || 'No Project'
                    })),
                    all: allTasks.slice(0, 10).map((t: any) => ({
                        title: t.title,
                        status: t.status,
                        priority: t.priority,
                        due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date',
                        project: t.project?.name || 'No Project'
                    }))
                },
                integrations: {
                    jira: {
                        total: jiraIssues.length,
                        issues: jiraIssues.map((i: any) => ({
                            key: i.issueKey,
                            summary: i.summary,
                            status: i.status
                        }))
                    },
                    linear: {
                        total: linearIssues.length,
                        issues: linearIssues.map((i: any) => ({
                            id: i.identifier,
                            title: i.title,
                            state: i.state?.name || 'Unknown'
                        }))
                    },
                    slack: {
                        total: slackTasks.length,
                        tasks: slackTasks.map((t: any) => t.title)
                    }
                },
                events: {
                    today: todayEvents.map((e: any) => ({
                        title: e.title,
                        start: new Date(e.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        end: e.end ? new Date(e.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                        allDay: e.allDay
                    })),
                    thisWeek: weekEvents.map((e: any) => ({
                        title: e.title,
                        start: new Date(e.start).toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
                    }))
                },
                reminders: {
                    active: activeReminders.map((r: any) => ({
                        title: r.title,
                        type: r.type,
                        priority: r.priority,
                        due: new Date(r.dueDate).toLocaleDateString()
                    })),
                    overdue: overdueReminders.map((r: any) => ({
                        title: r.title,
                        type: r.type
                    }))
                },
                goals: {
                    shortTerm: user?.profile?.goals?.shortTerm || [],
                    longTerm: user?.profile?.goals?.longTerm || []
                },
                timeAnalysis: {
                    overdueCount: overdueTasks.length,
                    todayCount: todayTasks.length,
                    weekCount: weekTasks.length,
                    busyHours: busyHours
                },
                totalPending: allTasks.length
            };
        } catch (error) {
            console.error('Error fetching planner context:', error);
            return {
                tasks: { overdue: [], today: [], thisWeek: [], all: [] },
                events: { today: [], thisWeek: [] },
                reminders: { active: [], overdue: [] },
                goals: { shortTerm: [], longTerm: [] },
                timeAnalysis: { overdueCount: 0, todayCount: 0, weekCount: 0, busyHours: [] },
                totalPending: 0
            };
        }
    }

    private async aggregateNotificationsContext(userId: string): Promise<any> {
        try {
            const Notification = (await import('../models/Notification')).default;

            const notifications = await Notification.find({
                recipient: userId,
                read: false
            })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            return {
                unreadCount: notifications.length,
                latest: notifications.map((n: any) => ({
                    type: n.type,
                    message: n.message,
                    time: new Date(n.createdAt).toLocaleTimeString()
                }))
            };
        } catch (error) {
            console.error('Error fetching notifications context:', error);
            return { unreadCount: 0, latest: [] };
        }
    }

    private async aggregateRemindersContext(userId: string): Promise<any> {
        try {
            const Task = (await import('../models/Task')).default;

            const upcoming = await Task.find({
                assignees: userId,
                dueDate: { $gte: new Date() }
            })
                .sort({ dueDate: 1 })
                .limit(5)
                .select('title dueDate priority')
                .lean();

            return {
                upcomingDeadlines: upcoming.map((t: any) => ({
                    title: t.title,
                    date: new Date(t.dueDate).toLocaleDateString(),
                    priority: t.priority
                }))
            };
        } catch (error) {
            console.error('Error fetching reminders context:', error);
            return { upcomingDeadlines: [] };
        }
    }

    private async aggregateGoalsContext(userId: string): Promise<any> {
        try {
            const User = (await import('../models/User')).default;
            const user = await User.findById(userId).select('profile.goals').lean();

            return {
                shortTerm: user?.profile?.goals?.shortTerm || [],
                longTerm: user?.profile?.goals?.longTerm || []
            };
        } catch (error) {
            return { shortTerm: [], longTerm: [] };
        }
    }

    private async aggregateProfileContext(userId: string): Promise<any> {
        try {
            const User = (await import('../models/User')).default;
            const user = await User.findById(userId).select('fullName email profile settings subscription').lean();

            return {
                name: user?.fullName,
                email: user?.email,
                plan: user?.subscription?.plan,
                preferences: user?.settings,
                profile: user?.profile
            };
        } catch (error) {
            return { name: 'Unknown User' };
        }
    }

    private async aggregateReportsContext(userId: string): Promise<any> {
        try {
            const Task = (await import('../models/Task')).default;

            // Calculate completed tasks in the last 7 days
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            const completedTasks = await Task.countDocuments({
                assignees: userId,
                status: 'completed',
                updatedAt: { $gte: lastWeek }
            });

            // Calculate pending tasks
            const pendingTasks = await Task.countDocuments({
                assignees: userId,
                status: { $ne: 'completed' }
            });

            return {
                summary: `You have completed ${completedTasks} tasks in the last week.`,
                completedCount: completedTasks,
                pendingCount: pendingTasks,
                productivityScore: completedTasks > 5 ? 'High' : 'Moderate' // Simple logic for now
            };
        } catch (error) {
            console.error('Error fetching reports context:', error);
            return { summary: "Could not generate report.", completedCount: 0 };
        }
    }

    private async aggregateHomeContext(userId: string): Promise<any> {
        try {
            const Notification = (await import('../models/Notification')).default;
            const Workspace = (await import('../models/Workspace')).default;
            const User = (await import('../models/User')).default;

            // Fetch all dashboard data in parallel
            const [tasks, projects, notifications, workspaces, user] = await Promise.all([
                this.aggregatePlannerContext(userId),
                this.aggregateGlobalProjectsContext(userId),
                // Notifications
                Notification.countDocuments({ recipient: userId, read: false }),
                // Workspaces
                Workspace.find({ 'members.user': userId })
                    .select('name memberCount')
                    .limit(5)
                    .lean(),
                // User goals
                User.findById(userId).select('profile.goals').lean()
            ]);

            // Calculate team members across all projects
            const allProjects = projects.projects || [];
            const totalTeamMembers = new Set(
                allProjects.flatMap((p: any) => p.teamMembers?.map((m: any) => m._id) || [])
            ).size;

            return {
                dashboard: {
                    taskSummary: tasks,
                    projectSummary: projects,
                    notifications: {
                        unreadCount: notifications
                    },
                    workspaces: {
                        total: workspaces.length,
                        list: workspaces.map((w: any) => ({
                            name: w.name,
                            members: w.memberCount
                        }))
                    },
                    team: {
                        totalMembers: totalTeamMembers
                    },
                    goals: {
                        shortTerm: user?.profile?.goals?.shortTerm || [],
                        longTerm: user?.profile?.goals?.longTerm || []
                    }
                }
            };
        } catch (error) {
            console.error('Error fetching home context:', error);
            return { dashboard: {} };
        }
    }

    private async aggregateGlobalProjectsContext(userId: string): Promise<any> {
        try {
            const Project = (await import('../models/Project')).default;

            // Find all projects where user is a team member
            const projects = await Project.find({
                'teamMembers.user': userId,
                status: { $ne: 'abandoned' }
            })
                .select('name status progress dueDate workspace')
                .populate('workspace', 'name')
                .limit(10)
                .lean();

            return {
                projects: projects.map((p: any) => ({
                    name: p.name,
                    status: p.status,
                    progress: p.progress,
                    workspace: p.workspace?.name,
                    dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'No date'
                }))
            };
        } catch (error) {
            console.error('Error fetching global projects:', error);
            return { projects: [] };
        }
    }

    private async aggregateGlobalWorkspaceContext(userId: string): Promise<any> {
        try {
            const Workspace = (await import('../models/Workspace')).default;

            // Find workspaces where user is a member
            const workspaces = await Workspace.find({
                'members.user': userId
            })
                .select('name memberCount subscription')
                .lean();

            return {
                workspaces: workspaces.map((w: any) => ({
                    name: w.name,
                    memberCount: w.memberCount,
                    plan: w.subscription?.plan
                }))
            };
        } catch (error) {
            console.error('Error fetching global workspaces:', error);
            return { workspaces: [] };
        }
    }

    private async aggregateNotesContext(userId: string): Promise<any> {
        try {
            const Note = (await import('../models/Note')).default;

            const recentNotes = await Note.find({ user: userId })
                .sort({ updatedAt: -1 })
                .limit(5)
                .select('title content updatedAt tags')
                .lean();

            return {
                recentNotes: recentNotes.map((n: any) => ({
                    title: n.title,
                    preview: n.content ? n.content.substring(0, 100) + '...' : '',
                    tags: n.tags,
                    date: new Date(n.updatedAt).toLocaleDateString()
                }))
            };
        } catch (error) {
            console.error('Error fetching notes context:', error);
            return { recentNotes: [] };
        }
    }
    private async aggregateCalendarContext(userId: string): Promise<any> {
        try {
            const PlannerEvent = (await import('../models/PlannerEvent')).default;

            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);

            const events = await PlannerEvent.find({
                $or: [
                    { createdBy: userId },
                    { 'participants.user': userId }
                ],
                start: { $gte: start, $lt: end }
            })
                .sort({ start: 1 })
                .lean();

            return {
                upcomingEvents: events.map((e: any) => ({
                    title: e.title,
                    start: new Date(e.start).toLocaleString(),
                    end: e.end ? new Date(e.end).toLocaleString() : 'N/A',
                    allDay: e.allDay
                })),
                totalEvents: events.length
            };
        } catch (error) {
            console.error('Error fetching calendar context:', error);
            return { upcomingEvents: [], totalEvents: 0 };
        }
    }
}

export const contextAnalyzerService = new ContextAnalyzerService();
export default contextAnalyzerService;
